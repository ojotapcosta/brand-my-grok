"use client";

import type { Claim } from "@/lib/store";
import { formatUsd, SPOTS, type Spot } from "@/lib/spots";

type MockBrand = {
  name: string;
  host: string;
  siteUrl: string;
  faviconUrl: string;
};

function brand(name: string, host: string): MockBrand {
  return {
    name,
    host,
    siteUrl: `https://www.${host}`,
    faviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`,
  };
}

const MOCK_BRANDS: Record<string, MockBrand> = {
  "bot-03": brand("McDonald's", "mcdonalds.com"),
  "bot-05": brand("Nike", "nike.com"),
  "bot-07": brand("Disney", "disney.com"),
  "bot-09": brand("Spotify", "spotify.com"),
  "bot-11": brand("Crocs", "crocs.com"),
  "bot-14": brand("IKEA", "ikea.com"),
  "bot-16": brand("Nouns DAO", "nouns.wtf"),
  "bot-21": brand("LEGO", "lego.com"),
};

const SNIPPETS = [
  "Still here.",
  "On the list.",
  "Window open.",
  "Later.",
  "No new mail.",
  "Seen.",
  "Working.",
  "Quiet.",
  "In a bit.",
  "Noted.",
  "Same as yesterday.",
  "Leave it.",
  "Got it.",
  "Not yet.",
  "Hold.",
  "Fine.",
  "After this.",
  "Already open.",
  "Keep it.",
  "Yes.",
  "One more.",
  "That's it.",
  "Next.",
  "Done.",
  "Wait.",
  "Read it.",
  "Again.",
];

const BUBBLES: { side: "left" | "right"; text: string }[] = [
  { side: "right", text: "Can you draft a short recap of the last thread?" },
  { side: "left", text: "On it. I'll pull the last notes." },
  { side: "right", text: "Keep it to two paragraphs." },
  { side: "left", text: "Draft is ready. Want me to drop it in the thread?" },
  { side: "right", text: "Hold — I'll read it first." },
  { side: "left", text: "Left it unsent." },
  { side: "right", text: "Also check the inbox." },
  { side: "left", text: "Three unread. Nothing urgent." },
];

type Props = {
  claims: Claim[];
  mode: "live" | "final";
  onClaim: (spot: Spot) => void;
};

function claimFor(claims: Claim[], id: string) {
  return claims.find((claim) => claim.spotId === id);
}

function redactedName(n: number) {
  return "*".repeat(6 + (n * 3) % 5);
}

function EmptyFace() {
  return (
    <span className="relative flex h-full w-full items-center justify-center">
      <span className="h-[22px] w-[22px] rounded-full border border-ink/25" />
      <span className="absolute h-1.5 w-1.5 rounded-full bg-ink/40" />
    </span>
  );
}

function BotUnit({
  spot,
  claim,
  mock,
  mode,
  selected,
  onClaim,
}: {
  spot: Spot;
  claim?: Claim;
  mock?: MockBrand;
  mode: "live" | "final";
  selected: boolean;
  onClaim: (spot: Spot) => void;
}) {
  const sold = Boolean(claim);
  const painted = mode === "final" && Boolean(mock) && !sold;
  const claimable = !sold && !painted;
  const branded = Boolean((sold && claim) || (painted && mock));

  const displayName = sold && claim
    ? claim.host
    : painted && mock
      ? mock.name
      : redactedName(spot.number);

  const caption = sold
    ? "on this bot"
    : painted && mock
      ? mock.host
      : SNIPPETS[(spot.number - 1) % SNIPPETS.length];

  const favicon = sold && claim ? claim.faviconUrl : painted && mock ? mock.faviconUrl : null;
  const href = sold && claim ? claim.siteUrl : painted && mock ? mock.siteUrl : null;

  const avatar = (
    <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
      {favicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={favicon} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <EmptyFace />
      )}
    </span>
  );

  const copy = (
    <span className="min-w-0 flex-1 text-left">
      <span
        className={`block truncate text-[13px] font-medium text-ink ${
          claimable ? "group-hover:underline group-hover:decoration-ink/40" : ""
        }`}
      >
        {displayName}
      </span>
      <span className="block truncate text-[11px] text-ink-2">{caption}</span>
    </span>
  );

  const rowClass = `group flex w-full items-center gap-2.5 px-3 py-2 text-left ${
    selected ? "bg-black/[0.05]" : "hover:bg-black/[0.03]"
  }`;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={rowClass}
        aria-label={`${displayName}, on this bot`}
      >
        {avatar}
        {copy}
      </a>
    );
  }

  if (claimable) {
    return (
      <button
        type="button"
        onClick={() => onClaim(spot)}
        className={rowClass}
        aria-label={`${spot.title}. Available for ${formatUsd(spot.priceUsd)}. Claim this bot.`}
      >
        {avatar}
        {copy}
      </button>
    );
  }

  return (
    <div className={rowClass} data-branded={branded ? "true" : undefined}>
      {avatar}
      {copy}
    </div>
  );
}

export function BotWindow({ claims, mode, onClaim }: Props) {
  return (
    <div className="mx-auto w-full max-w-[860px]">
      <div className="overflow-hidden rounded-[22px] bg-[#f7f7f8] shadow-[0_40px_90px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.08)]">
        <div className="relative flex h-11 items-center border-b border-black/[0.06] bg-[#efeff1] px-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <p className="pointer-events-none absolute inset-x-0 text-center text-[12px] font-medium text-ink">
            Brand My Grok Bots
          </p>
        </div>

        <div className="grid min-h-[480px] grid-cols-1 sm:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="max-h-[520px] overflow-y-auto border-b border-black/[0.06] bg-[#f3f3f5] sm:border-b-0 sm:border-r">
            <ul>
              {SPOTS.map((spot, index) => (
                <li key={spot.id}>
                  <BotUnit
                    spot={spot}
                    claim={claimFor(claims, spot.id)}
                    mock={MOCK_BRANDS[spot.id]}
                    mode={mode}
                    selected={index === 0}
                    onClaim={onClaim}
                  />
                </li>
              ))}
            </ul>
          </aside>

          <section className="flex min-h-[380px] max-h-[520px] flex-col bg-[#fafafa]">
            <div className="border-b border-black/[0.06] px-4 py-3">
              <p className="truncate text-[14px] font-semibold text-ink">
                {mode === "final" ? "********" : redactedName(1)}
              </p>
              <p className="text-[11px] text-ink-2">Online</p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-[13px] leading-relaxed text-ink">
              <p className="text-[11px] text-ink-2/70">Today</p>
              {BUBBLES.map((bubble) => (
                <div
                  key={bubble.text}
                  className={
                    bubble.side === "right"
                      ? "ml-auto max-w-[32ch] rounded-2xl rounded-tr-md bg-[#e7e7ea] px-3.5 py-2.5 text-ink"
                      : "max-w-[36ch] rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-ink shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
                  }
                >
                  {bubble.text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-black/[0.06] px-3 py-3">
              <div className="flex h-10 flex-1 items-center rounded-full bg-white px-4 text-[13px] text-ink-2 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
                Message
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white">
                ↑
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
