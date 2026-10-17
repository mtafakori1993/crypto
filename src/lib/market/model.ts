import { SIM } from "../config";
import { gauss, unit } from "../rng";
import { ASSETS, assetMap, USDT_IRT_REF } from "./assets";
import { PAIRS, getPair, type Pair } from "./pairs";

/**
 * Deterministic market model.
 *
 *   lnG(sym, t) = Σ a_k·sin(2πt/P_k + φ_k)  +  short-term step noise (3 s buckets)
 *
 * Every number the UI shows (ticker, 24h stats, candles, order book, trades, portfolio valuation) is derived
 * from this single continuous function of time, so all pages and API routes agree with each other and a reload
 * at the same instant produces the same chart. No external market data is used.
 */
const PERIODS_H = [0.07, 0.2, 0.7, 2.3, 7, 26, 100, 310];
const WEIGHTS = [0.03, 0.06, 0.15, 0.25, 0.4, 0.55, 0.8, 0.9];
const VOL: Record<string, number> = { BTC: 0.011, ETH: 0.015, USDT: 0.0002, BNB: 0.013, SOL: 0.022, XRP: 0.021, TON: 0.02, ADA: 0.019, DOGE: 0.027, TRX: 0.014, LTC: 0.016, AVAX: 0.021, IRT: 0.006 };
const PHASE = new Map<string, number[]>();
function phases(sym: string): number[] {
  let p = PHASE.get(sym);
  if (!p) PHASE.set(sym, (p = PERIODS_H.map((_, k) => unit("phase", sym, k) * Math.PI * 2)));
  return p;
}
export const NOISE_MS = SIM.priceTickMs;

/** Multiplicative factor around the reference price for one symbol at time t (ms). */
export function factor(sym: string, t: number, noise = true): number {
  const vol = VOL[sym] ?? 0.02;
  const ph = phases(sym);
  let s = 0;
  for (let k = 0; k < PERIODS_H.length; k++) s += vol * WEIGHTS[k] * Math.sin((2 * Math.PI * t) / (PERIODS_H[k] * 3_600_000) + ph[k]);
  if (noise) s += vol * 0.01 * gauss("noise", sym, Math.floor(t / NOISE_MS));
  return Math.exp(s);
}

export function usdtPrice(sym: string, t: number, noise = true): number {
  const a = assetMap[sym];
  return a.refPriceUsdt * factor(sym, t, noise);
}
export function usdtIrt(t: number, noise = true): number {
  return USDT_IRT_REF * factor("IRT", t, noise); // toman per 1 USDT
}
/** Last price of a pair at time t. */
export function pairPrice(pair: Pair, t: number, noise = true): number {
  const base = usdtPrice(pair.base, t, noise);
  return pair.quote === "USDT" ? base : base * usdtIrt(t, noise);
}
/** Value of 1 unit of any symbol (incl. USDT / IRT) in USDT. */
export function valueInUsdt(sym: string, t: number): number {
  if (sym === "USDT") return 1;
  if (sym === "IRT") return 1 / usdtIrt(t);
  return usdtPrice(sym, t);
}
export function toTomanRate(t: number): number {
  return usdtIrt(t);
}

export interface Ticker {
  pair: string;
  base: string;
  quote: string;
  price: number;
  open24h: number;
  change24h: number; // percent
  high24h: number;
  low24h: number;
  volumeBase: number;
  volumeQuote: number;
  bid: number;
  ask: number;
  spread: number;
}

export function roundTick(p: number, pair: Pair): number {
  const d = pair.priceDecimals;
  return Number(p.toFixed(d));
}

const tickerCache = new Map<string, Ticker>();
export function ticker(pairId: string, t: number): Ticker {
  const pair = getPair(pairId);
  if (!pair) throw new Error(`Unknown pair ${pairId}`);
  const bucket = Math.floor(t / NOISE_MS);
  const key = `${pairId}:${bucket}`;
  const hit = tickerCache.get(key);
  if (hit) return hit;
  if (tickerCache.size > 400) tickerCache.clear();
  const bt = bucket * NOISE_MS;
  const price = roundTick(pairPrice(pair, bt), pair);
  const open24h = roundTick(pairPrice(pair, bt - 86_400_000, false), pair);
  let hi = price;
  let lo = price;
  for (let i = 1; i <= 96; i++) {
    const p = pairPrice(pair, bt - i * 900_000, true);
    if (p > hi) hi = p;
    if (p < lo) lo = p;
  }
  const a = assetMap[pair.base];
  const dayPhase = 0.85 + 0.3 * (0.5 + 0.5 * Math.sin((bt / 3_600_000 / 9) * Math.PI * 2 + (unit("vol", pair.base) * 6)));
  const volUsdt = a.volumeUsdt * dayPhase * (pair.quote === "IRT" ? 0.06 : 1);
  const volumeBase = volUsdt / usdtPrice(pair.base, bt);
  const halfSpread = (pair.spreadBps / 2 / 10_000) * price;
  const bid = roundTick(price - halfSpread, pair);
  let ask = roundTick(price + halfSpread, pair);
  if (ask <= bid) ask = Number((bid + pair.tick).toFixed(pair.priceDecimals));
  const out: Ticker = {
    pair: pairId,
    base: pair.base,
    quote: pair.quote,
    price,
    open24h,
    change24h: ((price - open24h) / open24h) * 100,
    high24h: roundTick(hi, pair),
    low24h: roundTick(lo, pair),
    volumeBase,
    volumeQuote: volumeBase * price,
    bid,
    ask,
    spread: ask - bid,
  };
  tickerCache.set(key, out);
  return out;
}
export function allTickers(t: number): Ticker[] {
  return PAIRS.map((p) => ticker(p.id, t));
}
/** 24 hourly closes for sparklines (consistent with the ticker). */
export function sparkline(pairId: string, t: number, points = 24): number[] {
  const pair = getPair(pairId)!;
  const bt = Math.floor(t / NOISE_MS) * NOISE_MS;
  const out: number[] = [];
  for (let i = points - 1; i >= 0; i--) out.push(pairPrice(pair, bt - (i * 86_400_000) / (points - 1), i === 0));
  return out;
}

export const ASSET_SYMBOLS = ASSETS.map((a) => a.symbol);
export function simNow(): number {
  return SIM.fixedTime ?? Date.now();
}
