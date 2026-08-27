import Link from "next/link";
import { getSpot } from "@/lib/spots";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { recordPaidClaim } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  let host = "your site";
  let title = "your spot";

  if (sessionId && stripeConfigured()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const spotId = session.metadata?.spotId;
      const siteUrl = session.metadata?.siteUrl;
      const paid = session.payment_status === "paid" || session.status === "complete";
      if (paid && spotId && siteUrl) {
        const claim = await recordPaidClaim({
          spotId,
          siteUrl,
          sessionId: session.id,
        });
        host = claim.host;
        title = getSpot(spotId)?.title ?? title;
      }
    } catch {
      // The webhook still paints the spot if this retrieve fails.
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-20 text-center">
      <p className="text-[13px] text-ink-2">Payment received.</p>
      <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.08] tracking-[-0.05em]">
        {host} is on {title}.
      </h1>
      <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
        Stripe charged the listed USD price. The webhook fetches the favicon and places it on the
        bot. If it is not there yet, wait a few seconds and refresh.
      </p>
      <Link
        href="/#spots"
        className="mx-auto mt-8 rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-white hover:opacity-85"
      >
        See the window
      </Link>
    </main>
  );
}
