import { NextResponse } from "next/server";
import { simNow } from "@/lib/market/model";
import { getOrderBook } from "@/lib/market/orderbook";
import { getPair } from "@/lib/market/pairs";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const pair = getPair(sp.get("pair") ?? "BTC-USDT");
  if (!pair) return NextResponse.json({ error: "جفت‌ارز نامعتبر است" }, { status: 404 });
  const depth = Math.min(30, Math.max(1, Number(sp.get("depth") ?? 14) || 14));
  return NextResponse.json({ simulated: true, ...getOrderBook(pair.id, simNow(), depth) }, { headers: { "Cache-Control": "public, max-age=2" } });
}
