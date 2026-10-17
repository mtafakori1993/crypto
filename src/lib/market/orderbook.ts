import { unit } from "../rng";
import { assetMap } from "./assets";
import { ticker, usdtPrice } from "./model";
import { getPair } from "./pairs";

export interface BookLevel {
  price: number;
  amount: number;
  total: number; // cumulative base amount
}
export interface OrderBook {
  pair: string;
  bids: BookLevel[]; // best first (descending)
  asks: BookLevel[]; // best first (ascending)
  lastPrice: number;
  spread: number;
  spreadPct: number;
  time: number;
}

const BOOK_MS = 6000;

export function getOrderBook(pairId: string, now: number, depth = 14): OrderBook {
  const pair = getPair(pairId);
  if (!pair) throw new Error(`Unknown pair ${pairId}`);
  const tk = ticker(pairId, now);
  const a = assetMap[pair.base];
  const bucket = Math.floor(now / BOOK_MS);
  const typicalBase = a.volumeUsdt / usdtPrice(pair.base, now, false) / 24000 / (pair.quote === "IRT" ? 16 : 1);
  const stepTicks = Math.max(1, Math.round((tk.price * 0.00009) / pair.tick));
  const step = stepTicks * pair.tick;
  const mk = (side: "b" | "a") => {
    let cum = 0;
    const levels: BookLevel[] = [];
    for (let i = 0; i < depth; i++) {
      const price = Number((side === "b" ? tk.bid - i * step : tk.ask + i * step).toFixed(pair.priceDecimals));
      const q = typicalBase * (0.25 + 1.5 * unit("lv", pairId, side, i, bucket)) * (1 + i * 0.06);
      const amount = Number(q.toFixed(pair.amountDecimals)) || 10 ** -pair.amountDecimals;
      cum += amount;
      levels.push({ price, amount, total: Number(cum.toFixed(pair.amountDecimals + 2)) });
    }
    return levels;
  };
  const bids = mk("b");
  const asks = mk("a");
  return { pair: pairId, bids, asks, lastPrice: tk.price, spread: tk.spread, spreadPct: (tk.spread / tk.price) * 100, time: now };
}

/** Walk the book to simulate a market order. Returns null when the book cannot absorb the quantity. */
export function walkBook(book: OrderBook, side: "buy" | "sell", baseAmount: number): { avgPrice: number; total: number; filled: number } | null {
  const levels = side === "buy" ? book.asks : book.bids;
  let remaining = baseAmount;
  let cost = 0;
  for (const lv of levels) {
    const take = Math.min(remaining, lv.amount);
    cost += take * lv.price;
    remaining -= take;
    if (remaining <= 1e-12) break;
  }
  if (remaining > 1e-9) return null;
  return { avgPrice: cost / baseAmount, total: cost, filled: baseAmount };
}
