"use client";
import { useState } from "react";
import { PriceChartLazy } from "@/components/trade/chart-lazy";
import { ButtonLink } from "@/components/ui/button";
import { Change } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { formatCompact, formatFixed, formatPrice } from "@/lib/format";
import { useTickers } from "@/lib/hooks";
import { assetMap, CATEGORY_LABEL } from "@/lib/market/assets";
import { TIMEFRAMES, type Timeframe } from "@/lib/market/candles";
import { PAIRS } from "@/lib/market/pairs";
import { useAccount } from "@/lib/store/account-store";
import { AssetIcon, PairLabel } from "./bits";

export function AssetDetail({ symbol }: { symbol: string }) {
  const a = assetMap[symbol];
  const tickers = useTickers();
  const hydrated = useAccount((s) => s.hydrated);
  const holding = useAccount((s) => s.account.balances[symbol]);
  const pairs = PAIRS.filter((p) => p.base === symbol);
  const primary = pairs.find((p) => p.quote === "USDT") ?? pairs[0];
  const [tf, setTf] = useState<Timeframe>("1h");
  const t = primary ? tickers.find((x) => x.pair === primary.id) : undefined;
  return (
    <>
      <header className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-surface p-4">
        <AssetIcon symbol={symbol} size={48} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{a.nameFa} <bdi dir="ltr" className="text-base font-normal text-muted">{a.symbol}</bdi></h1>
          <p className="text-sm text-muted">{a.nameEn} · {CATEGORY_LABEL[a.category]}</p>
        </div>
        {t && primary && (
          <div className="text-end leading-tight"><div className="num text-2xl font-bold">{formatPrice(t.price, primary.priceDecimals)}</div><Change value={t.change24h} /></div>
        )}
        {primary && <ButtonLink href={`/trade/${primary.id}`} size="lg">معامله {symbol}</ButtonLink>}
      </header>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <section className="rounded-lg border border-line bg-surface" aria-label="نمودار">
          {primary ? (
            <>
              <div className="flex gap-1 border-b border-line px-2 py-1.5" role="group" aria-label="بازه زمانی">
                {TIMEFRAMES.map((x) => (
                  <button key={x} onClick={() => setTf(x)} aria-pressed={tf === x} className={cn("h-9 min-w-10 rounded-md px-2.5 text-xs", tf === x ? "bg-accent-soft text-accent-strong" : "text-muted hover:text-text")}><bdi dir="ltr">{x}</bdi></button>
                ))}
              </div>
              <div className="p-1"><PriceChartLazy pair={primary.id} tf={tf} height={380} /></div>
            </>
          ) : (
            <p className="p-8 text-center text-muted">برای این دارایی بازار معاملاتی تعریف نشده است.</p>
          )}
        </section>
        <div className="space-y-4">
          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="mb-2 font-bold">درباره {a.nameFa}</h2>
            <p className="text-sm leading-8 text-muted">{a.descriptionFa}</p>
          </section>
          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="mb-2 font-bold">بازارهای {a.symbol}</h2>
            {pairs.length === 0 ? <p className="text-sm text-muted">بازاری ندارد.</p> : (
              <ul className="divide-y divide-line">
                {pairs.map((p) => { const x = tickers.find((y) => y.pair === p.id)!; return (
                  <li key={p.id}><a href={`/trade/${p.id}`} className="flex items-center justify-between py-2.5 text-sm"><PairLabel base={p.base} quote={p.quote} /><span className="num">{formatPrice(x.price, p.priceDecimals)}</span><Change value={x.change24h} className="text-xs" /></a></li>
                ); })}
              </ul>
            )}
          </section>
          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="mb-2 font-bold">موجودی شما (فرضی)</h2>
            <p className="num text-lg font-bold">{hydrated ? `${formatFixed((holding?.free ?? 0) + (holding?.locked ?? 0), a.amountDecimals)} ${a.symbol}` : "…"}</p>
            {t && <p className="mt-1 text-xs text-muted">حجم ۲۴ ساعته شبیه‌سازی‌شده: <span className="num">{formatCompact(t.volumeQuote)}</span></p>}
          </section>
        </div>
      </div>
    </>
  );
}
