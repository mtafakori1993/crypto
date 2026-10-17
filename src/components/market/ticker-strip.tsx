"use client";
import Link from "next/link";
import { Change } from "@/components/ui/misc";
import { formatPrice } from "@/lib/format";
import { useTickers } from "@/lib/hooks";
import { PAIRS } from "@/lib/market/pairs";
import { PairLabel } from "./bits";

export function TickerStrip({ pairs = ["BTC-USDT", "ETH-USDT", "SOL-USDT", "BNB-USDT"] }: { pairs?: string[] }) {
  const tickers = useTickers();
  return (
    <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {pairs.map((id) => {
        const t = tickers.find((x) => x.pair === id)!;
        const pair = PAIRS.find((p) => p.id === id)!;
        return (
          <li key={id}>
            <Link href={`/trade/${id}`} className="block rounded-lg border border-line bg-surface p-3 transition-colors hover:border-line-strong">
              <div className="flex items-center justify-between text-[13px]"><PairLabel base={t.base} quote={t.quote} /><Change value={t.change24h} className="text-xs" /></div>
              <div className="num mt-1 text-lg font-bold">{formatPrice(t.price, pair.priceDecimals)}</div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
