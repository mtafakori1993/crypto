"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { TF_LABEL, TIMEFRAMES, type Timeframe } from "@/lib/market/candles";
import { PairHeader } from "./pair-header";
import { PriceChartLazy } from "./chart-lazy";
import { OrderBookPanel } from "./order-book";
import { RecentTradesPanel } from "./recent-trades";
import { OrderForm, type PickedLevel } from "./order-form";
import { OrdersTables } from "./history-tables";

type Tab = "chart" | "book" | "trades";

export function Terminal({ pair }: { pair: string }) {
  const [tf, setTf] = useState<Timeframe>("15m");
  const [tab, setTab] = useState<Tab>("chart");
  const [picked, setPicked] = useState<PickedLevel | null>(null);
  const tabs: [Tab, string][] = [["chart", "نمودار"], ["book", "دفتر سفارش"], ["trades", "معاملات اخیر"]];
  return (
    <div className="space-y-2 p-2 md:p-3">
      <PairHeader pair={pair} />
      <div className="term" data-tab={tab}>
        <div className="term-tabs" role="tablist" aria-label="نمای بازار">
          {tabs.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("h-11 flex-1 border-b-2 text-sm", tab === k ? "border-accent text-text" : "border-transparent text-muted")}>{l}</button>
          ))}
        </div>
        <section className="term-chart flex flex-col rounded-lg border border-line bg-surface" aria-label="نمودار قیمت">
          <div className="flex items-center gap-1 overflow-x-auto border-b border-line px-2 py-1.5 no-scrollbar" role="group" aria-label="بازه زمانی">
            {TIMEFRAMES.map((t) => (
              <button key={t} onClick={() => setTf(t)} aria-pressed={tf === t} title={TF_LABEL[t]} className={cn("h-9 min-w-10 shrink-0 rounded-md px-2.5 text-xs", tf === t ? "bg-accent-soft text-accent-strong" : "text-muted hover:text-text")}>
                <bdi dir="ltr">{t}</bdi>
              </button>
            ))}
            <span className="ms-auto hidden ps-3 text-[11px] text-muted sm:inline">داده‌های شبیه‌سازی‌شده</span>
          </div>
          <div className="flex-1 p-1" style={{ minHeight: 420 }}><PriceChartLazy pair={pair} tf={tf} height="100%" /></div>
        </section>
        <section className="term-book rounded-lg border border-line bg-surface" aria-label="دفتر سفارش">
          <h2 className="hidden border-b border-line px-3 py-2 text-sm font-bold xl:block">دفتر سفارش</h2>
          <OrderBookPanel pair={pair} depth={10} onPick={(price, amount) => setPicked({ price, amount, n: Date.now() })} />
        </section>
        <section className="term-trades rounded-lg border border-line bg-surface" aria-label="معاملات اخیر">
          <h2 className="hidden border-b border-line px-3 py-2 text-sm font-bold xl:block">معاملات اخیر</h2>
          <RecentTradesPanel pair={pair} limit={14} />
        </section>
        <div className="term-form"><OrderForm key={pair} pair={pair} picked={picked} /></div>
        <section className="term-bottom rounded-lg border border-line bg-surface" aria-label="سفارش‌ها و معاملات من">
          <OrdersTables pairFilter={undefined} />
        </section>
      </div>
    </div>
  );
}
