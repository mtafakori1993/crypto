import { unit } from "../rng";
import { assetMap } from "./assets";
import { NOISE_MS, pairPrice, usdtPrice } from "./model";
import { getPair } from "./pairs";

export interface PublicTrade {
  id: string;
  time: number; // ms
  price: number;
  amount: number;
  side: "buy" | "sell";
}

export function getRecentTrades(pairId: string, now: number, limit = 40): PublicTrade[] {
  const pair = getPair(pairId);
  if (!pair) throw new Error(`Unknown pair ${pairId}`);
  const a = assetMap[pair.base];
  const typ = a.volumeUsdt / usdtPrice(pair.base, now, false) / 60000 / (pair.quote === "IRT" ? 16 : 1);
  const lastSlot = Math.floor(now / NOISE_MS);
  const out: PublicTrade[] = [];
  for (let j = 0; out.length < limit && j < limit * 4; j++) {
    const slot = lastSlot - j;
    const n = unit("tc", pairId, slot);
    const count = n < 0.3 ? 0 : n < 0.75 ? 1 : 2;
    for (let c = 0; c < count; c++) {
      const time = slot * NOISE_MS + Math.floor(unit("tt", pairId, slot, c) * NOISE_MS);
      if (time > now) continue;
      const jitter = (unit("tp", pairId, slot, c) - 0.5) * 0.0003;
      const price = Number((pairPrice(pair, time, true) * (1 + jitter)).toFixed(pair.priceDecimals));
      const amount = Number((typ * (0.05 + 3 * unit("tq", pairId, slot, c) ** 3)).toFixed(pair.amountDecimals)) || 10 ** -pair.amountDecimals;
      out.push({ id: `${pairId}-${slot}-${c}`, time, price, amount, side: unit("ts", pairId, slot, c) > 0.5 ? "buy" : "sell" });
    }
  }
  return out.sort((x, y) => y.time - x.time).slice(0, limit);
}
