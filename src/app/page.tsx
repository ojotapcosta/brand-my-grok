import { HomePage } from "@/components/home-page";
import { listClaims } from "@/lib/store";
import { SPOTS, TOTAL_USD } from "@/lib/spots";
import { stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function Page() {
  const claims = await listClaims();
  const soldUsd = claims.reduce((sum, claim) => {
    const spot = SPOTS.find((row) => row.id === claim.spotId);
    return sum + (spot?.priceUsd ?? 0);
  }, 0);

  return (
    <HomePage
      stripeReady={stripeConfigured()}
      initialInventory={{
        claims,
        soldCount: claims.length,
        totalSpots: SPOTS.length,
        soldUsd,
        totalUsd: TOTAL_USD,
      }}
    />
  );
}
