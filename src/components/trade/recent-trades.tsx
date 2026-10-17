"use client";
import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { formatFixed, formatPrice, formatTime } from "@/lib/format";
import { NOISE_MS } from "@/lib/market/model";
import { getPair } from "@/lib/market/pairs";
import { getRecentTrades } from "@/lib/market/trades";
import { useNow } from "@/lib/store/sim-provider";

export function RecentTradesPanel({ pair, limit = 16 }: { pair: string; limit?: number }) {
  const now = useNow();
  const b = Math.floor(now / NOISE_MS);
  const info = getPair(pair)!;
  const trades = useMemo(() => getRecentTrades(pair, b * NOISE_MS, limit), [pair, b, limit]);
  return (
    <div data-testid="recent-trades">
      <div className="grid grid-cols-3 px-3 py-1.5 text-[11px] text-muted" aria-hidden>
        <span>قیمت ({info.quote})</span>
        <span>مقدار ({info.base})</span>
        <span>زمان</span>
      </div>
      <ul>
        {trades.map((t) => (
          <li key={t.id} className="grid h-[22px] grid-cols-3 items-center px-3 text-xs">
            <span className={cn("num text-start", t.side === "buy" ? "text-up" : "text-down")}>{formatPrice(t.price, info.priceDecimals)}</span>
            <span className="num text-start">{formatFixed(t.amount, info.amountDecimals)}</span>
            <span className="num text-start text-muted">{formatTime(t.time)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
