import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSpot } from "./spots";
import { getStripe, stripeConfigured } from "./stripe";
import { displayHost } from "./url";
import { resolveFavicon } from "./favicon";

export type Claim = {
  spotId: string;
  siteUrl: string;
  host: string;
  faviconUrl: string;
  sessionId: string;
  paidAt: string;
};

const DATA_PATH = path.join(process.cwd(), "data", "claims.json");

type FileStore = { claims: Claim[] };

async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as FileStore;
    if (!parsed || !Array.isArray(parsed.claims)) return { claims: [] };
    return parsed;
  } catch {
    return { claims: [] };
  }
}

async function writeFileStore(store: FileStore): Promise<void> {
  try {
    await mkdir(path.dirname(DATA_PATH), { recursive: true });
    await writeFile(DATA_PATH, JSON.stringify(store, null, 2) + "\n", "utf8");
  } catch {
    // Serverless filesystems are often read-only. Stripe remains the source of truth.
  }
}

function claimFromSession(session: {
  id: string;
  metadata?: StripeMetadata | null;
  created?: number;
}): Claim | null {
  const spotId = session.metadata?.spotId;
  const siteUrl = session.metadata?.siteUrl;
  if (!spotId || !siteUrl || !getSpot(spotId)) return null;
  return {
    spotId,
    siteUrl,
    host: session.metadata?.host || displayHost(siteUrl),
    faviconUrl: session.metadata?.faviconUrl || googleFavicon(siteUrl),
    sessionId: session.id,
    paidAt: session.created
      ? new Date(session.created * 1000).toISOString()
      : new Date().toISOString(),
  };
}

type StripeMetadata = {
  spotId?: string;
  siteUrl?: string;
  host?: string;
  faviconUrl?: string;
};

function googleFavicon(siteUrl: string): string {
  try {
    const host = new URL(siteUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return siteUrl;
  }
}

const SEED_CLAIMS: Claim[] = [
  {
    spotId: "bot-03",
    siteUrl: "https://fieldnote.co",
    host: "fieldnote.co",
    faviconUrl: "/seeds/fieldnote.svg",
    sessionId: "seed-bot-03",
    paidAt: "2026-08-24T15:12:00.000Z",
  },
  {
    spotId: "bot-07",
    siteUrl: "https://sablepress.com",
    host: "sablepress.com",
    faviconUrl: "/seeds/sablepress.svg",
    sessionId: "seed-bot-07",
    paidAt: "2026-08-25T18:41:00.000Z",
  },
  {
    spotId: "bot-11",
    siteUrl: "https://muteobjects.co",
    host: "muteobjects.co",
    faviconUrl: "/seeds/muteobjects.svg",
    sessionId: "seed-bot-11",
    paidAt: "2026-08-26T11:08:00.000Z",
  },
];

async function claimsFromStripe(): Promise<Claim[]> {
  if (!stripeConfigured()) return [];
  const stripe = getStripe();
  const claims: Claim[] = [];
  const seen = new Set<string>();

  const pages = stripe.checkout.sessions.list({
    status: "complete",
    limit: 100,
  });

  for await (const session of pages) {
    if (session.payment_status !== "paid" && session.status !== "complete") continue;
    const claim = claimFromSession(session);
    if (!claim) continue;
    if (seen.has(claim.spotId)) continue;
    seen.add(claim.spotId);
    claims.push(claim);
  }

  return claims;
}

export async function listClaims(): Promise<Claim[]> {
  const file = await readFileStore();
  const bySpot = new Map<string, Claim>();
  for (const claim of SEED_CLAIMS) {
    if (getSpot(claim.spotId)) bySpot.set(claim.spotId, claim);
  }
  for (const claim of file.claims) {
    if (getSpot(claim.spotId)) bySpot.set(claim.spotId, claim);
  }
  for (const claim of await claimsFromStripe()) {
    bySpot.set(claim.spotId, claim);
  }
  return [...bySpot.values()];
}

export async function getClaim(spotId: string): Promise<Claim | undefined> {
  const claims = await listClaims();
  return claims.find((claim) => claim.spotId === spotId);
}

export async function recordPaidClaim(input: {
  spotId: string;
  siteUrl: string;
  sessionId: string;
  paidAt?: string;
}): Promise<Claim> {
  const existing = await getClaim(input.spotId);
  if (existing && existing.sessionId !== input.sessionId) {
    return existing;
  }

  const faviconUrl = await resolveFavicon(input.siteUrl);
  const claim: Claim = {
    spotId: input.spotId,
    siteUrl: input.siteUrl,
    host: displayHost(input.siteUrl),
    faviconUrl,
    sessionId: input.sessionId,
    paidAt: input.paidAt ?? new Date().toISOString(),
  };

  const file = await readFileStore();
  file.claims = file.claims.filter((row) => row.spotId !== claim.spotId);
  file.claims.push(claim);
  await writeFileStore(file);

  if (stripeConfigured()) {
    try {
      const stripe = getStripe();
      await stripe.checkout.sessions.update(input.sessionId, {
        metadata: {
          spotId: claim.spotId,
          siteUrl: claim.siteUrl,
          host: claim.host,
          faviconUrl: claim.faviconUrl,
        },
      });
    } catch {
      // Metadata write is optional. The paid session already records the claim.
    }
  }

  return claim;
}
