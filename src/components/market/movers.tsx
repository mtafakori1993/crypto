"use client";
import Link from "next/link";
import { Change } from "@/components/ui/misc";
import { formatCompact, formatPrice } from "@/lib/format";
import { useTickers } from "@/lib/hooks";
import { assetMap } from "@/lib/market/assets";
import { PAIRS } from "@/lib/market/pairs";
import { AssetIcon, PairLabel } from "./bits";

export function Movers() {
  const tickers = useTickers().filter((t) => t.quote === "USDT" && t.base !== "USDT");
  const sets = [
    { title: "بیشترین رشد ۲۴ ساعت", list: [...tickers].sort((a, b) => b.change24h - a.change24h).slice(0, 4) },
    { title: "بیشترین افت ۲۴ ساعت", list: [...tickers].sort((a, b) => a.change24h - b.change24h).slice(0, 4) },
    { title: "بیشترین حجم معاملات", list: [...tickers].sort((a, b) => b.volumeQuote - a.volumeQuote).slice(0, 4), volume: true },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {sets.map((s) => (
        <section key={s.title} className="rounded-lg border border-line bg-surface p-4" aria-label={s.title}>
          <h3 className="mb-2 text-sm font-bold">{s.title}</h3>
          <ul>
            {s.list.map((t) => {
              const pair = PAIRS.find((p) => p.id === t.pair)!;
              return (
                <li key={t.pair}>
                  <Link href={`/trade/${t.pair}`} className="flex items-center gap-3 rounded-md px-1 py-2 hover:bg-raised">
                    <AssetIcon symbol={t.base} size={28} />
                    <span className="flex-1 leading-tight">
                      <PairLabel base={t.base} quote={t.quote} className="text-[13px]" />
                      <span className="block text-xs text-muted">{assetMap[t.base].nameFa}</span>
                    </span>
                    <span className="text-end leading-tight">
                      <span className="num block text-[13px]">{formatPrice(t.price, pair.priceDecimals)}</span>
                      {s.volume ? <span className="num block text-xs text-muted">{formatCompact(t.volumeQuote)}</span> : <Change value={t.change24h} className="text-xs" />}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
