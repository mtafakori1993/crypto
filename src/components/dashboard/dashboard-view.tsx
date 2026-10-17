"use client";
import { ArrowLeft, Star, X } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { AssetIcon, PairLabel } from "@/components/market/bits";
import { Movers } from "@/components/market/movers";
import { Stat, usePortfolio } from "@/components/portfolio/portfolio-view";
import { Badge, Change, EmptyState, Skeleton } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatDateTime, formatFixed, formatPrice, formatToman, formatUsd, formatRelative } from "@/lib/format";
import { useTickers } from "@/lib/hooks";
import { amountDecimalsOf, symbolName } from "@/lib/market/assets";
import { getPair, quoteName } from "@/lib/market/pairs";
import { useAccount } from "@/lib/store/account-store";
import { useNow } from "@/lib/store/sim-provider";

export function DashboardView() {
  const { summary: s, hydrated, account } = usePortfolio();
  const tickers = useTickers();
  const toggleWatch = useAccount((a) => a.toggleWatch);
  const now = useNow();
  const activity = useMemo(() => {
    const items = [
      ...account.trades.map((t) => ({ id: t.id, time: t.time, kind: "trade" as const, t })),
      ...account.transfers.map((x) => ({ id: x.id, time: x.createdAt, kind: "transfer" as const, x })),
    ].sort((a, b) => b.time - a.time);
    return items.slice(0, 8);
  }, [account.trades, account.transfers]);
  const openOrders = account.orders.filter((o) => o.status === "open").length;

  if (!hydrated) return <div className="space-y-4"><Skeleton className="h-28 w-full" /><Skeleton className="h-60 w-full" /></div>;
  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-4" aria-label="خلاصه حساب">
        <div className="md:col-span-2"><Stat label="ارزش کل دارایی‌ها (فرضی)" value={formatUsd(s.totalUsdt)} sub={formatToman(s.totalToman)} big testid="total-value" /></div>
        <Stat label="قابل استفاده" value={formatUsd(s.availableUsdt)} />
        <Stat label="سفارش‌های باز" value={formatFixed(openOrders, 0)} sub={`قفل‌شده: ${formatUsd(s.lockedUsdt)}`} />
      </section>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/trade/BTC-USDT">معامله</ButtonLink>
        <ButtonLink href="/wallet" variant="outline">واریز / برداشت نمونه</ButtonLink>
        <ButtonLink href="/portfolio" variant="outline">پرتفوی</ButtonLink>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <section className="rounded-lg border border-line bg-surface" aria-labelledby="wl-h">
          <h2 id="wl-h" className="flex items-center gap-2 whitespace-nowrap border-b border-line px-4 py-3 font-bold"><Star size={16} aria-hidden className="text-warn" /> لیست پیگیری</h2>
          {account.watchlist.length === 0 ? <EmptyState title="لیست پیگیری خالی است" hint="در صفحه بازارها با ستاره، بازارهای موردنظر را اضافه کنید." action={<ButtonLink href="/markets" size="sm" variant="outline">رفتن به بازارها</ButtonLink>} /> : (
            <ul data-testid="watchlist">
              {account.watchlist.map((id) => { const t = tickers.find((x) => x.pair === id); const p = getPair(id); if (!t || !p) return null; return (
                <li key={id} className="flex items-center border-b border-line last:border-0">
                  <Link href={`/trade/${id}`} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 hover:bg-raised sm:gap-3 sm:px-4">
                    <AssetIcon symbol={p.base} size={28} /><PairLabel base={p.base} quote={p.quote} className="flex-1 text-sm" />
                    <span className="num text-sm">{formatPrice(t.price, p.priceDecimals)}</span><Change value={t.change24h} className="w-14 text-end text-xs sm:w-16" />
                  </Link>
                  <button onClick={() => toggleWatch(id)} aria-label={`حذف ${p.label} از لیست پیگیری`} className="me-2 flex size-9 items-center justify-center rounded-md text-muted hover:bg-raised hover:text-down"><X size={15} /></button>
                </li>); })}
            </ul>
          )}
        </section>
        <section className="rounded-lg border border-line bg-surface" aria-labelledby="bal-h">
          <div className="flex items-center justify-between border-b border-line px-4 py-3"><h2 id="bal-h" className="font-bold">موجودی دارایی‌ها</h2><Link href="/portfolio" className="inline-flex items-center gap-1 text-xs text-accent-strong">همه <ArrowLeft size={12} aria-hidden /></Link></div>
          <ul>
            {s.rows.slice(0, 6).map((r) => (
              <li key={r.asset} className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-0">
                <AssetIcon symbol={r.asset} size={28} /><span className="flex-1 text-sm">{symbolName(r.asset)}</span>
                <span className="text-end leading-tight"><span className="num block text-sm">{formatFixed(r.total, amountDecimalsOf(r.asset))}</span><span className="num block text-xs text-muted">{formatUsd(r.valueUsdt)}</span></span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="rounded-lg border border-line bg-surface" aria-labelledby="act-h">
        <h2 id="act-h" className="border-b border-line px-4 py-3 font-bold">فعالیت‌های اخیر (شبیه‌سازی)</h2>
        {activity.length === 0 ? <EmptyState title="فعالیتی ثبت نشده" hint="پس از اولین سفارش یا واریز نمونه، فعالیت‌ها اینجا نمایش داده می‌شوند." /> : (
          <ul data-testid="activity">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-sm last:border-0">
                {a.kind === "trade" ? (
                  <>
                    <Badge tone={a.t.side === "buy" ? "up" : "down"}>{a.t.side === "buy" ? "خرید" : "فروش"}</Badge>
                    <bdi dir="ltr" className="font-medium">{getPair(a.t.pair)?.label}</bdi>
                    <span className="num text-muted">{formatFixed(a.t.amount, getPair(a.t.pair)?.amountDecimals ?? 4)} @ {formatPrice(a.t.price, getPair(a.t.pair)?.priceDecimals)}</span>
                  </>
                ) : (
                  <>
                    <Badge tone="accent">{a.x.kind === "deposit" ? "واریز" : a.x.kind === "withdraw" ? "برداشت" : "انتقال"}</Badge>
                    <span className="num">{formatFixed(a.x.amount, amountDecimalsOf(a.x.asset))} {a.x.asset === "IRT" ? quoteName("IRT") : a.x.asset}</span>
                    <Badge tone={a.x.status === "completed" ? "up" : "warn"}>{a.x.status === "completed" ? "تکمیل‌شده" : "در انتظار"}</Badge>
                  </>
                )}
                <span className={cn("ms-auto text-xs text-muted")} title={formatDateTime(a.time)}>{formatRelative(a.time, now)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="mv-h"><h2 id="mv-h" className="mb-3 font-bold">نوسان‌گیرهای بازار</h2><Movers /></section>
    </div>
  );
}
