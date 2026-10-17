import { NextResponse } from "next/server";
import { allTickers, simNow } from "@/lib/market/model";

export const dynamic = "force-dynamic";

export function GET() {
  const t = simNow();
  return NextResponse.json({ simulated: true, time: t, tickers: allTickers(t) }, { headers: { "Cache-Control": "public, max-age=2" } });
}
