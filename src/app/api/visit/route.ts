import { NextResponse } from "next/server";

export const runtime = "nodejs";

let visiting = 19;
let total = 3942;

export async function GET() {
  return NextResponse.json({
    visiting: Math.max(19, visiting),
    total: Math.max(3942, total),
  });
}

export async function POST() {
  visiting += 1;
  total += 1;
  return NextResponse.json({
    visiting: Math.max(19, visiting),
    total: Math.max(3942, total),
  });
}
