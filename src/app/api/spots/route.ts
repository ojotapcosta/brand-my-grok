import { NextResponse } from "next/server";
import { listClaims } from "@/lib/store";
import { SPOTS, TOTAL_USD } from "@/lib/spots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const claims = await listClaims();
  const soldUsd = claims.reduce((sum, claim) => {
    const spot = SPOTS.find((row) => row.id === claim.spotId);
    return sum + (spot?.priceUsd ?? 0);
  }, 0);

  return NextResponse.json({
    claims,
    soldCount: claims.length,
    totalSpots: SPOTS.length,
    soldUsd,
    totalUsd: TOTAL_USD,
  });
}
