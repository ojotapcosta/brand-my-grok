import { NextResponse } from "next/server";
import { getSpot } from "@/lib/spots";
import { siteUrl } from "@/lib/site";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { getClaim } from "@/lib/store";
import { displayHost, parsePublicHttpUrl } from "@/lib/url";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: { spotId?: string; siteUrl?: string };
  try {
    body = (await request.json()) as { spotId?: string; siteUrl?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const spot = body.spotId ? getSpot(body.spotId) : undefined;
  if (!spot) {
    return NextResponse.json({ error: "Unknown spot." }, { status: 400 });
  }

  const sold = await getClaim(spot.id);
  if (sold) {
    return NextResponse.json({ error: "That spot is already taken." }, { status: 409 });
  }

  let publicUrl: URL;
  try {
    publicUrl = parsePublicHttpUrl(body.siteUrl ?? "");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Enter a real site URL." },
      { status: 400 },
    );
  }

  const origin = siteUrl(request);
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "en",
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?canceled=1#spots`,
    client_reference_id: spot.id,
    metadata: {
      spotId: spot.id,
      siteUrl: publicUrl.toString(),
      host: displayHost(publicUrl.toString()),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: spot.priceUsd * 100,
          product_data: {
            name: `Brand My Grok Bot — ${spot.title}`,
            description: `${spot.location}. Favicon is applied automatically after payment.`,
          },
        },
      },
    ],
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
  }

  return NextResponse.json({ url: session.url, id: session.id });
}
