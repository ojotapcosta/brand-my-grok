import { NextResponse } from "next/server";
import { getSpot } from "@/lib/spots";
import { getStripe } from "@/lib/stripe";
import { recordPaidClaim } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const paid =
      session.payment_status === "paid" || session.status === "complete";
    const spotId = session.metadata?.spotId;
    const siteUrl = session.metadata?.siteUrl;
    if (paid && spotId && siteUrl && getSpot(spotId)) {
      await recordPaidClaim({
        spotId,
        siteUrl,
        sessionId: session.id,
        paidAt: new Date(event.created * 1000).toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}
