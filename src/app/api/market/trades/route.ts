import { NextResponse } from "next/server";
import { simNow } from "@/lib/market/model";
import { getPair } from "@/lib/market/pairs";
import { getRecentTrades } from "@/lib/market/trades";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const pair = getPair(new URL(req.url).searchParams.get("pair") ?? "BTC-USDT");
  if (!pair) return NextResponse.json({ error: "جفت‌ارز نامعتبر است" }, { status: 404 });
  return NextResponse.json({ simulated: true, pair: pair.id, trades: getRecentTrades(pair.id, simNow(), 40) }, { headers: { "Cache-Control": "public, max-age=2" } });
}
