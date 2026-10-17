import { ASSETS, assetMap, IRT } from "./assets";

export interface Pair {
  id: string; // BTC-USDT
  base: string;
  quote: "USDT" | "IRT";
  label: string; // BTC/USDT
  priceDecimals: number;
  amountDecimals: number;
  tick: number;
  minTotal: number; // in quote units
  spreadBps: number;
}

const IRT_BASES = ["BTC", "ETH", "USDT"];

function mk(base: string, quote: "USDT" | "IRT"): Pair {
  const a = assetMap[base];
  const priceDecimals = quote === "IRT" ? 0 : a.priceDecimals;
  return {
    id: `${base}-${quote}`,
    base,
    quote,
    label: `${base}/${quote}`,
    priceDecimals,
    amountDecimals: a.amountDecimals,
    tick: 10 ** -priceDecimals * (quote === "IRT" ? 10 : 1),
    minTotal: quote === "USDT" ? 5 : 500_000,
    spreadBps: 2 + (a.symbol.charCodeAt(0) % 5),
  };
}

export const PAIRS: Pair[] = [
  ...ASSETS.filter((a) => a.symbol !== "USDT").map((a) => mk(a.symbol, "USDT")),
  ...IRT_BASES.map((b) => mk(b, "IRT")),
];
export const pairMap: Record<string, Pair> = Object.fromEntries(PAIRS.map((p) => [p.id, p]));
export const DEFAULT_PAIR = "BTC-USDT";
export const getPair = (id: string): Pair | undefined => pairMap[id.toUpperCase()];
export const quoteName = (q: string) => (q === "IRT" ? IRT.nameFa : q);
