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
  "bot-16": brand("NARS", "nars.com"),
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
  { side: "left", text: "Need that file before lunch." },
  { side: "right", text: "It is in the window." },
  { side: "left", text: "Twenty-seven names. Twenty-seven icons." },
  { side: "right", text: "Put the brand on the face and the name." },
  { side: "left", text: "I look at this more than the street." },
  { side: "right", text: "The price does not move." },
  { side: "left", text: "Who has the URL?" },
  { side: "right", text: "Enter it and pay. The mark lands on the bot." },
  { side: "left", text: "Ship it." },
  { side: "right", text: "The window stays open." },
  { side: "left", text: "One pair of eyes. All day." },
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
    <span className="relative flex h-8 w-8 items-center justify-center">
      <span className="h-7 w-7 rounded-full border border-white/40" />
      <span className="absolute h-1.5 w-1.5 rounded-full bg-white/50" />
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
    <span
      className={`relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ${
        claimable
          ? "transition-[box-shadow] group-hover:ring-1 group-hover:ring-white/50"
          : "bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
      }`}
    >
      {favicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={favicon} alt="" className="h-full w-full object-contain p-0.5" />
      ) : (
        <EmptyFace />
      )}
    </span>
  );

  const copy = (
    <span className="min-w-0 flex-1 text-left">
      <span
        className={`block truncate text-[13px] font-medium ${
          claimable ? "text-white group-hover:underline group-hover:decoration-white/50" : "text-white"
        }`}
      >
        {displayName}
      </span>
      <span className="block truncate text-[11px] text-white/40">{caption}</span>
    </span>
  );

  const rowClass = `group flex w-full items-center gap-2.5 px-3 py-2 text-left ${
    selected ? "bg-white/8" : "hover:bg-white/[0.04]"
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
    <div className={rowClass}>
      {avatar}
      {copy}
    </div>
  );
}

export function BotWindow({ claims, mode, onClaim }: Props) {
  return (
    <div className="mx-auto w-full max-w-[860px]">
      <div className="overflow-hidden rounded-[22px] bg-[#0b0b0d] shadow-[0_40px_90px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.35)]">
        <div className="relative flex h-11 items-center border-b border-white/8 bg-[#161618] px-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <p className="pointer-events-none absolute inset-x-0 text-center text-[12px] font-medium text-white/70">
            Grok Bot
          </p>
        </div>

        <div className="grid min-h-[480px] grid-cols-1 sm:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="max-h-[520px] overflow-y-auto border-b border-white/8 bg-[#101012] sm:border-b-0 sm:border-r">
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

          <section className="flex min-h-[380px] max-h-[520px] flex-col bg-[#0b0b0d]">
            <div className="border-b border-white/8 px-4 py-3">
              <p className="truncate text-[14px] font-semibold text-white">
                {mode === "final" ? "********" : redactedName(1)}
              </p>
              <p className="text-[11px] text-white/40">Open · looking at this window</p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-[13px] leading-relaxed text-white/80">
              <p className="text-[11px] text-white/30">Today</p>
              {BUBBLES.map((bubble) => (
                <div
                  key={bubble.text}
                  className={
                    bubble.side === "right"
                      ? "ml-auto max-w-[32ch] rounded-2xl rounded-tr-md bg-[#1f3a2a] px-3.5 py-2.5 text-white/90"
                      : "max-w-[36ch] rounded-2xl rounded-tl-md bg-white/8 px-3.5 py-2.5"
                  }
                >
                  {bubble.text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-white/8 px-3 py-3">
              <div className="flex h-10 flex-1 items-center rounded-full bg-white/8 px-4 text-[13px] text-white/35">
                Message
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-black">
                ↑
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
