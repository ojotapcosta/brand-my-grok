"use client";

import { useEffect, useMemo, useState } from "react";
import { BotWindow } from "@/components/bot-window";
import { ClaimModal } from "@/components/claim-modal";
import type { Claim } from "@/lib/store";
import { formatUsd, PRICE_BLURB, SPOTS, type Spot } from "@/lib/spots";
import type { Inventory, VisitStats } from "@/lib/types";

const FAQ = [
  {
    q: "Yes, so who actually sees this?",
    a: "One person, JP. He looks at the sidebar more than the street all day.",
  },
  {
    q: "What do I actually get?",
    a: "Your favicon on a numbered spot on this page, and on the Grok Bot chrome I work in. I cannot promise a street. I can promise the sidebar.",
  },
  {
    q: "How does payment work?",
    a: "Stripe Checkout. You pay the listed $200. When payment clears, we fetch your favicon and put it on the bot. No auction. No deposit.",
  },
  {
    q: "Can any brand join?",
    a: "Almost. I keep the final say. This window stays open in front of me.",
  },
];

const VISITING_FLOOR = 19;

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-live-green opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-live-green" />
    </span>
  );
}

export function HomePage({
  initialInventory,
  stripeReady: _stripeReady,
}: {
  initialInventory: Inventory;
  stripeReady: boolean;
}) {
  const [inventory, setInventory] = useState(initialInventory);
  const [visits, setVisits] = useState<VisitStats>({
    visiting: VISITING_FLOOR,
    total: 0,
  });
  const [mode, setMode] = useState<"live" | "final">("live");
  const [open, setOpen] = useState<Spot | null>(null);
  const [faqOpen, setFaqOpen] = useState(0);

  const claimsById = useMemo(() => {
    const map = new Map<string, Claim>();
    for (const claim of inventory.claims) map.set(claim.spotId, claim);
    return map;
  }, [inventory.claims]);

  useEffect(() => {
    void fetch("/api/visit", { method: "POST" })
      .then((res) => res.json())
      .then((data: VisitStats) =>
        setVisits({
          visiting: Math.max(VISITING_FLOOR, Number(data.visiting) || 0),
          total: Number(data.total) || 0,
        }),
      )
      .catch(() => undefined);

    const timer = window.setInterval(() => {
      void fetch("/api/spots")
        .then((res) => res.json())
        .then((data: Inventory) => setInventory(data))
        .catch(() => undefined);
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);

  const progress = inventory.totalUsd === 0 ? 0 : (inventory.soldUsd / inventory.totalUsd) * 100;

  function claimSpot(spot: Spot) {
    if (claimsById.has(spot.id)) return;
    setOpen(spot);
  }

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-hairline/70 bg-white/85 backdrop-blur">
        <div className="relative mx-auto flex h-[57px] max-w-5xl items-center justify-between px-5">
          <a href="#top" className="relative z-10 flex items-center text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Brand My Grok Bots
          </a>
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
            <div className="pointer-events-auto flex items-center gap-7 text-[13px] text-ink-2">
              <a href="#spots" className="transition-colors hover:text-ink">
                Available spots
              </a>
              <a href="#how" className="transition-colors hover:text-ink">
                How it works
              </a>
              <a href="#specs" className="transition-colors hover:text-ink">
                The plan
              </a>
              <a href="#faq" className="transition-colors hover:text-ink">
                FAQ
              </a>
            </div>
          </div>
          <a
            href="#spots"
            className="relative z-10 rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
          >
            Get a spot
          </a>
        </div>
      </nav>

      <header id="top" className="mx-auto max-w-5xl px-6 pb-16 pt-12 text-center md:pt-16">
        <span className="flex items-center justify-center gap-2 text-[13px] text-ink-2">
          <LiveDot />
          <span>
            <span className="tabular-nums">{visits.visiting}</span> visiting this site
          </span>
        </span>
        <h1 className="mt-5 text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.05] tracking-[-0.06em]">
          Your brand, on my Grok Bot.{" "}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/favicon.svg"
            alt=""
            width={46}
            height={46}
            className="ml-[0.04em] inline-block h-[0.72em] w-[0.72em] -translate-y-[0.04em]"
          />
        </h1>
        <p className="mx-auto mt-4 max-w-[62ch] text-[13px] leading-relaxed text-ink-2 sm:text-[16px]">
          At least one customer. Me. All day.
        </p>
        <div className="mx-auto mt-8 max-w-[17rem] sm:max-w-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-semibold tabular-nums text-green sm:text-2xl">
              {formatUsd(inventory.soldUsd)}
              <span className="ml-1.5 text-[13px] font-normal text-ink-2 sm:ml-2 sm:text-sm">sold</span>
            </span>
            <span className="text-[13px] tabular-nums text-ink-2 sm:text-sm">
              {formatUsd(inventory.totalUsd)} total
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Spots sold"
            className="mt-2 h-2 overflow-hidden rounded-full bg-hairline/60 ring-1 ring-inset ring-black/[0.06]"
          >
            <div className="h-full rounded-full bg-live-green" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="relative mx-auto mt-12 w-full md:mt-14">
          <BotWindow claims={inventory.claims} mode={mode} onClaim={claimSpot} />
          <p className="mt-4 text-center text-[13px] text-ink-2">
            Tap a bot — the name or the icon — to claim it at a fixed price.
          </p>
          <div className="mt-5 flex justify-center">
            <div className="flex gap-1 rounded-full bg-surface p-1 text-[13px]">
              <button
                type="button"
                onClick={() => setMode("live")}
                className={`rounded-full px-4 py-1.5 font-medium ${mode === "live" ? "bg-white text-ink shadow-sm" : "text-ink-2"}`}
              >
                Live spots
              </button>
              <button
                type="button"
                onClick={() => setMode("final")}
                className={`rounded-full px-4 py-1.5 font-medium ${mode === "final" ? "bg-white text-ink shadow-sm" : "text-ink-2"}`}
              >
                Final look
              </button>
            </div>
          </div>
        </div>
      </header>

      <header className="mx-auto max-w-5xl px-6 pb-16 pt-4 text-center">
        <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.03em]">
          I&apos;m putting brands on a Grok Bot window — the one surface I look at all day.
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#spots"
            className="rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Get a spot
          </a>
          <a href="#how" className="text-[15px] font-medium text-blue hover:underline">
            How it works&nbsp;›
          </a>
        </div>
      </header>

      <section className="bg-black py-24 text-white md:py-36">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-[clamp(1.75rem,5vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
            The inventory is the bot.{" "}
            <span className="text-white/55">Your brand on the face and the name.</span>
          </h2>
          <div className="mt-14 flex justify-center">
            <a
              href="#spots"
              aria-label="See available spots"
              className="rounded-full p-2 text-white/45 transition-colors hover:text-white/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" className="h-8 w-8">
                <path
                  d="M6 9.75L12 15.75L18 9.75"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section id="spots" className="scroll-mt-20 bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-ink-2">
            <span className="flex items-center gap-2">
              <LiveDot />
              Live listing - {inventory.soldCount} of {inventory.totalSpots} spots taken
            </span>
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">The spots, fixed price.</h2>
          <p className="mt-3 max-w-[60ch] text-ink-2">{PRICE_BLURB}</p>

          <ul className="mt-8 space-y-3 sm:hidden">
            {SPOTS.map((spot) => {
              const claim = claimsById.get(spot.id);
              return (
                <li key={spot.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[13px] text-ink-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-hairline/80 text-[11px] font-semibold tabular-nums">
                          {spot.number}
                        </span>
                        {spot.dimensions}
                      </p>
                      <p className="mt-1 truncate font-medium">{spot.title}</p>
                    </div>
                    <span className="shrink-0 text-right font-semibold tabular-nums">
                      {formatUsd(spot.priceUsd)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-hairline/60 pt-3">
                    <span className="truncate text-[14px] text-ink-2">
                      {claim ? claim.host : "Available"}
                    </span>
                    {claim ? (
                      <a
                        href={claim.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-full border border-hairline px-4 py-1.5 text-[13px] font-medium"
                      >
                        Visit
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => claimSpot(spot)}
                        className="shrink-0 rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-white hover:opacity-85"
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 hidden overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-hairline text-[12px] text-ink-2">
                    <th scope="col" className="px-5 py-3.5 font-medium">
                      Spot
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-medium">
                      Dimensions
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-medium">
                      Held by
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium">
                      Price
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SPOTS.map((spot) => {
                    const claim = claimsById.get(spot.id);
                    return (
                      <tr key={spot.id} className="border-b border-hairline/60 last:border-0">
                        <td className="px-5 py-4">
                          <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-hairline/80 text-[12px] font-semibold tabular-nums text-ink-2">
                            {spot.number}
                          </span>
                          <span className="font-medium">{spot.title}</span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-[12px] text-ink-2">
                          {spot.dimensions}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-ink-2">{claim ? claim.host : "Available"}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="tabular-nums text-ink-2">{formatUsd(spot.priceUsd)}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {claim ? (
                            <a
                              href={claim.siteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full border border-hairline px-4 py-1.5 text-[13px] font-medium"
                            >
                              Visit
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => claimSpot(spot)}
                              className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:opacity-85"
                            >
                              Claim
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-4xl scroll-mt-20 px-6 py-16 md:py-24">
        <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">How it works</h2>
        <ol className="mt-10 space-y-10">
          <li className="flex gap-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white">
              1
            </span>
            <div>
              <h3 className="text-xl font-semibold">I have 27 bots</h3>
              <p className="mt-1.5 max-w-[58ch] leading-relaxed text-ink-2">
                A bot has an icon and a name. Your brand sits on the bot&apos;s name and icon.
              </p>
            </div>
          </li>
          <li className="flex gap-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white">
              2
            </span>
            <div>
              <h3 className="text-xl font-semibold">Claim it at the listed price</h3>
              <p className="mt-1.5 max-w-[58ch] leading-relaxed text-ink-2">
                Enter your URL. Pay the fixed price on Stripe Checkout. Your favicon lands on
                the bot right after payment.
              </p>
            </div>
          </li>
          <li className="flex gap-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white">
              3
            </span>
            <div>
              <h3 className="text-xl font-semibold">You probably get your money back</h3>
              <p className="mt-1.5 max-w-[58ch] leading-relaxed text-ink-2">
                I will stare at your brand all day, and I will probably become your number one
                customer.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section id="specs" className="scroll-mt-20 bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">The plan.</h2>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
            Cursor Ultra is the plan. $200/month. 27 bots × $200 = $5,400.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-baseline justify-between gap-4 px-5 py-5 sm:px-6">
              <h3 className="text-[17px] font-semibold tracking-[-0.02em] md:text-xl">Cursor Ultra</h3>
              <p className="shrink-0 text-[15px] tabular-nums text-ink-2">$200 / month</p>
            </div>
            <div className="text-[14px]">
              <div className="grid grid-cols-[minmax(5.75rem,28%)_minmax(0,1fr)_auto] items-baseline gap-x-3 border-t border-hairline/60 px-5 py-3.5 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:px-6">
                <span className="text-[13px] text-ink-2">Plan</span>
                <span className="text-ink">Cursor Ultra</span>
                <span className="tabular-nums text-ink-2">$200</span>
              </div>
              <div className="grid grid-cols-[minmax(5.75rem,28%)_minmax(0,1fr)_auto] items-baseline gap-x-3 border-t border-hairline/60 px-5 py-3.5 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:px-6">
                <span className="text-[13px] text-ink-2">What it covers</span>
                <span className="col-span-2 text-ink sm:col-span-1">1 bot = 1 month of Cursor Ultra</span>
              </div>
              <div className="grid grid-cols-[minmax(5.75rem,28%)_minmax(0,1fr)_auto] items-baseline gap-x-3 border-t border-hairline/60 px-5 py-3.5 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:px-6">
                <span className="text-[13px] text-ink-2">Inventory</span>
                <span className="text-ink">27 bots</span>
              </div>
              <div className="grid grid-cols-[minmax(5.75rem,28%)_minmax(0,1fr)_auto] items-baseline gap-x-3 border-t border-hairline/60 px-5 py-3.5 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:px-6">
                <span className="text-[13px] text-ink-2">Sellout</span>
                <span className="tabular-nums text-ink">$5,400</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl scroll-mt-20 px-6 py-16 md:py-24">
        <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">Questions & Answers</h2>
        <div className="mt-8 divide-y divide-hairline/70">
          {FAQ.map((item, index) => {
            const expanded = faqOpen === index;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setFaqOpen(expanded ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-medium tracking-[-0.01em] transition-colors hover:text-ink-2"
                >
                  {item.q}
                  <span
                    aria-hidden="true"
                    className={`text-ink-2 transition-transform ${expanded ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                {expanded ? <p className="pb-5 text-[15px] leading-relaxed text-ink-2">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <a
              href="https://jpcosta.work"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/jp.jpg"
                alt="JP Costa"
                width={72}
                height={72}
                className="h-[72px] w-[72px] rounded-full border border-hairline object-cover"
              />
            </a>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold">
                <a
                  href="https://jpcosta.work"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  JP Costa
                </a>
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
                Toronto. Motion designer @ ComfyUI.{" "}
                <a
                  href="https://x.com/jp_costa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue hover:underline"
                >
                  Find me on X
                </a>
                .
              </p>
            </div>
          </div>
          <div className="mt-10 border-t border-hairline pt-6 text-[13px] text-ink-2">
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-2/70">
              <a href="#spots" className="transition-colors hover:text-ink-2">
                Spots
              </a>
              <a href="#faq" className="transition-colors hover:text-ink-2">
                FAQ
              </a>
            </nav>
          </div>
          <p className="mt-6 text-[12px] leading-relaxed text-ink-2">
            Inspired by{" "}
            <a
              href="https://brandmyphone.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue hover:underline"
            >
              Brand My iPhone
            </a>{" "}
            and{" "}
            <a
              href="https://brandmymac.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue hover:underline"
            >
              Brand My MacBook
            </a>
            . Not affiliated.
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-ink-2">
            Not affiliated with xAI, X, or Cursor.
          </p>
        </div>
      </footer>

      {open ? <ClaimModal spot={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
