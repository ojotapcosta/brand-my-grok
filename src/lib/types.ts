import type { Claim } from "./store";

export type Inventory = {
  claims: Claim[];
  soldCount: number;
  totalSpots: number;
  soldUsd: number;
  totalUsd: number;
};

export type VisitStats = {
  visiting: number;
  total: number;
};
