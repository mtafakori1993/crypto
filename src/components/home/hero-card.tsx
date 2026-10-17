"use client";
import Link from "next/link";
import { Change } from "@/components/ui/misc";
import { PairLabel, Sparkline } from "@/components/market/bits";
import { formatPrice } from "@/lib/format";
import { useSparkline, useTicker } from "@/lib/hooks";

export function HeroCard() {
  const t = useTicker("BTC-USDT");
  const spark = useSparkline("BTC-USDT");
  return (
    <Link href="/trade/BTC-USDT" className="block rounded-xl border border-line-strong bg-surface p-5 shadow-pop transition-colors hover:border-accent" aria-label="ورود به ترمینال بیت‌کوین">
      <div className="flex items-center justify-between">
        <PairLabel base="BTC" quote="USDT" className="text-lg" />
        <Change value={t.change24h} />
      </div>
      <div className="num mt-2 text-4xl font-bold tracking-tight">{formatPrice(t.price, 2)}</div>
      <p className="mt-1 text-xs text-muted">قیمت شبیه‌سازی‌شده · نه قیمت لحظه‌ای بازار</p>
      <div className="mt-4 overflow-hidden rounded-md bg-sunken p-3">
        <Sparkline data={spark} up={t.change24h >= 0} width={360} height={110} fluid />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div><dt className="text-muted">بالاترین ۲۴س</dt><dd className="num mt-0.5 font-medium">{formatPrice(t.high24h, 2)}</dd></div>
        <div><dt className="text-muted">پایین‌ترین ۲۴س</dt><dd className="num mt-0.5 font-medium">{formatPrice(t.low24h, 2)}</dd></div>
        <div><dt className="text-muted">اسپرد</dt><dd className="num mt-0.5 font-medium">{formatPrice(t.spread, 2)}</dd></div>
      </dl>
    </Link>
  );
}
