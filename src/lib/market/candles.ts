import { gauss, unit } from "../rng";
import { NOISE_MS, pairPrice } from "./model";
import { getPair } from "./pairs";

export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];
export const TF_MS: Record<Timeframe, number> = { "1m": 60_000, "5m": 300_000, "15m": 900_000, "1h": 3_600_000, "4h": 14_400_000, "1d": 86_400_000 };
export const TF_LABEL: Record<Timeframe, string> = { "1m": "۱ دقیقه", "5m": "۵ دقیقه", "15m": "۱۵ دقیقه", "1h": "۱ ساعت", "4h": "۴ ساعت", "1d": "۱ روز" };

export interface Candle {
  time: number; // unix seconds (UTC) of candle open
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * OHLCV candles derived from the same continuous price function as the ticker.
 * Candle k covers [k·tf, (k+1)·tf); the final candle is still "forming" and closes at the current price.
 */
export function getCandles(pairId: string, tf: Timeframe, now: number, count = 240): Candle[] {
  const pair = getPair(pairId);
  if (!pair) throw new Error(`Unknown pair ${pairId}`);
  const ms = TF_MS[tf];
  const nowBucket = Math.floor(now / NOISE_MS) * NOISE_MS;
  const lastIdx = Math.floor(nowBucket / ms);
  const samples = 8;
  const out: Candle[] = [];
  const dp = pair.priceDecimals + (pair.quote === "IRT" ? 0 : 0);
  const r = (x: number) => Number(x.toFixed(dp));
  for (let idx = lastIdx - count + 1; idx <= lastIdx; idx++) {
    const t0 = idx * ms;
    const t1 = idx === lastIdx ? nowBucket : t0 + ms;
    let hi = -Infinity;
    let lo = Infinity;
    const open = pairPrice(pair, t0, true);
    const close = idx === lastIdx ? pairPrice(pair, nowBucket, true) : pairPrice(pair, t1 - 1, true);
    for (let s = 0; s <= samples; s++) {
      const p = pairPrice(pair, t0 + ((t1 - t0) * s) / samples, true);
      if (p > hi) hi = p;
      if (p < lo) lo = p;
    }
    const body = Math.max(open, close);
    const bottom = Math.min(open, close);
    const wick = (v: number, k: string) => Math.abs(gauss("wick", pairId, tf, idx, k)) * 0.0006 * v;
    hi = Math.max(hi, body + wick(body, "h"));
    lo = Math.min(lo, bottom - wick(bottom, "l"));
    const frac = (t1 - t0) / ms;
    const volume = (0.4 + unit("cv", pairId, tf, idx) * 1.2) * (ms / 3_600_000) ** 0.9 * 0.35 * frac * (1 + Math.abs(close - open) / open * 80);
    out.push({ time: Math.floor(t0 / 1000), open: r(open), high: r(hi), low: r(lo), close: r(close), volume: Number(volume.toFixed(4)) });
  }
  return out;
}
