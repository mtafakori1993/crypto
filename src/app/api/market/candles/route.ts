import { NextResponse } from "next/server";
import { getCandles, TIMEFRAMES, type Timeframe } from "@/lib/market/candles";
import { simNow } from "@/lib/market/model";
import { getPair } from "@/lib/market/pairs";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const pair = getPair(sp.get("pair") ?? "BTC-USDT");
  const tf = (sp.get("tf") ?? "1h") as Timeframe;
  if (!pair) return NextResponse.json({ error: "جفت‌ارز نامعتبر است" }, { status: 404 });
  if (!TIMEFRAMES.includes(tf)) return NextResponse.json({ error: "بازه زمانی نامعتبر است", allowed: TIMEFRAMES }, { status: 400 });
  const limit = Math.min(500, Math.max(10, Number(sp.get("limit") ?? 240) || 240));
  return NextResponse.json({ simulated: true, pair: pair.id, tf, candles: getCandles(pair.id, tf, simNow(), limit) }, { headers: { "Cache-Control": "public, max-age=5" } });
}
