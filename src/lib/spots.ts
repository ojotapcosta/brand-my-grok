export type SpotSize = "bot";

export type Spot = {
  id: string;
  number: number;
  title: string;
  location: string;
  size: SpotSize;
  dimensions: string;
  priceUsd: number;
};

export const SPOTS: Spot[] = Array.from({ length: 27 }, (_, index) => {
  const number = index + 1;
  const pad = String(number).padStart(2, "0");
  return {
    id: `bot-${pad}`,
    number,
    title: `Bot ${pad}`,
    location: "The bot — name and icon",
    size: "bot",
    dimensions: "Name + 32 × 32 icon",
    priceUsd: 200,
  };
});

export const TOTAL_USD = 5400;

export function getSpot(id: string): Spot | undefined {
  return SPOTS.find((spot) => spot.id === id);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const PRICE_BLURB =
  "Every open spot has a set price of $200. Every bot covers 1 month of Cursor Ultra.";
