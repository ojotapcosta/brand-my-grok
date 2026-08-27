"use client";

import { useState } from "react";
import { formatUsd, type Spot } from "@/lib/spots";

type Props = {
  spot: Spot;
  onClose: () => void;
};

export function ClaimModal({ spot, onClose }: Props) {
  const [site, setSite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId: spot.id, siteUrl: site }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Checkout could not start.");
        setPending(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout could not start.");
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <p id="claim-title" className="text-[13px] text-ink-2">
          Spot {spot.number}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em]">{spot.title}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
          Fixed price. Enter your URL and pay — your favicon is applied to the bot&apos;s
          name and icon as soon as payment clears.
        </p>
        <p className="mt-5 text-4xl font-semibold tabular-nums tracking-[-0.03em]">
          {formatUsd(spot.priceUsd)}
        </p>
        <form className="mt-5" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="site-url">
            Site URL
          </label>
          <input
            id="site-url"
            type="url"
            required
            autoFocus
            inputMode="url"
            placeholder="https://yoursite.com"
            value={site}
            onChange={(event) => setSite(event.target.value)}
            className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] outline-none ring-ink/0 transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
          {error ? <p className="mt-3 text-[13px] text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-4 w-full rounded-full bg-ink px-4 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-60"
          >
            {pending ? "Opening Stripe…" : `Pay ${formatUsd(spot.priceUsd)} — claim this bot`}
          </button>
        </form>
        <p className="mt-3 text-center text-[12px] text-ink-2">
          Secure checkout via Stripe. This is a real charge.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2 text-[13px] text-ink-2 hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
