"use client";
import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { usePriceDirection } from "@/lib/hooks";
import { formatFixed, formatPrice } from "@/lib/format";
import { NOISE_MS } from "@/lib/market/model";
import { getOrderBook } from "@/lib/market/orderbook";
import { getPair } from "@/lib/market/pairs";
import { useNow } from "@/lib/store/sim-provider";

export function OrderBookPanel({ pair, depth = 10, onPick }: { pair: string; depth?: number; onPick?: (price: number, amount?: number) => void }) {
  const now = useNow();
  const b = Math.floor(now / NOISE_MS);
  const info = getPair(pair)!;
  const book = useMemo(() => getOrderBook(pair, b * NOISE_MS, depth), [pair, b, depth]);
  const dir = usePriceDirection(book.lastPrice);
  const max = Math.max(book.asks[book.asks.length - 1].total, book.bids[book.bids.length - 1].total);
  const asks = [...book.asks].reverse();

  const Row = ({ lv, side }: { lv: (typeof book.asks)[number]; side: "ask" | "bid" }) => (
    <li>
      <button
        onClick={() => onPick?.(lv.price, lv.amount)}
        aria-label={`${side === "ask" ? "فروش" : "خرید"} با قیمت ${formatPrice(lv.price, info.priceDecimals)}`}
        className="relative grid h-[22px] w-full grid-cols-3 items-center px-3 text-xs hover:bg-raised"
      >
        <span aria-hidden className={cn("absolute inset-y-0 start-0 opacity-90", side === "ask" ? "bg-down-soft" : "bg-up-soft")} style={{ width: `${(lv.total / max) * 100}%` }} />
        <span className={cn("num relative text-start", side === "ask" ? "text-down" : "text-up")}>{formatPrice(lv.price, info.priceDecimals)}</span>
        <span className="num relative text-start">{formatFixed(lv.amount, info.amountDecimals)}</span>
        <span className="num relative text-start text-muted">{formatFixed(lv.total, Math.min(info.amountDecimals, 3))}</span>
      </button>
    </li>
  );
  return (
    <div data-testid="order-book">
      <div className="grid grid-cols-3 px-3 py-1.5 text-[11px] text-muted" aria-hidden>
        <span>قیمت ({info.quote})</span>
        <span>مقدار ({info.base})</span>
        <span>تجمعی</span>
      </div>
      <ul aria-label="سفارش‌های فروش">{asks.map((lv) => <Row key={lv.price} lv={lv} side="ask" />)}</ul>
      <div className="my-1 flex items-center justify-between border-y border-line bg-sunken px-3 py-1.5">
        <span className={cn("num text-base font-bold", dir === "up" ? "text-up" : "text-down")} data-testid="book-last">{formatPrice(book.lastPrice, info.priceDecimals)}</span>
        <span className="text-xs text-muted">
          اسپرد <span className="num">{formatPrice(book.spread, info.priceDecimals)}</span> (<span className="num">{formatFixed(book.spreadPct, 3)}٪</span>)
        </span>
      </div>
      <ul aria-label="سفارش‌های خرید">{book.bids.map((lv) => <Row key={lv.price} lv={lv} side="bid" />)}</ul>
    </div>
  );
}
