"use client";
import { CheckCircle2 } from "lucide-react";
import { AssetIcon } from "@/components/market/bits";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { reconcile, summarize } from "@/lib/engine/account";
import { formatFixed, formatPercent, formatToman, formatUsd } from "@/lib/format";
import { amountDecimalsOf, symbolName } from "@/lib/market/assets";
import { NOISE_MS } from "@/lib/market/model";
import { useAccount } from "@/lib/store/account-store";
import { useNow } from "@/lib/store/sim-provider";
import { useMemo } from "react";
import { AllocationDonut } from "./allocation";

export function usePortfolio() {
  const account = useAccount((s) => s.account);
  const hydrated = useAccount((s) => s.hydrated);
  const now = useNow();
  const b = Math.floor(now / NOISE_MS);
  const summary = useMemo(() => summarize(account, b * NOISE_MS), [account, b]);
  const bad = useMemo(() => reconcile(account), [account]);
  return { summary, hydrated, reconciled: bad.length === 0, account };
}

export function PortfolioView() {
  const { summary: s, hydrated, reconciled } = usePortfolio();
  if (!hydrated) return <div className="space-y-4"><Skeleton className="h-28 w-full" /><Skeleton className="h-64 w-full" /></div>;
  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-3" aria-label="خلاصه پرتفوی">
        <Stat label="ارزش کل دارایی‌ها (فرضی)" value={formatUsd(s.totalUsdt)} sub={formatToman(s.totalToman)} testid="total-value" big />
        <Stat label="قابل استفاده" value={formatUsd(s.availableUsdt)} sub={formatToman(s.availableUsdt * s.usdtIrt)} />
        <Stat label="قفل‌شده در سفارش‌ها" value={formatUsd(s.lockedUsdt)} sub={formatToman(s.lockedUsdt * s.usdtIrt)} testid="locked-value" />
      </section>
      <p className="flex items-center gap-2 text-xs text-muted"><CheckCircle2 size={14} className={reconciled ? "text-up" : "text-down"} aria-hidden /> {reconciled ? "موجودی‌ها با دفتر ثبت تراکنش‌های شبیه‌سازی تطبیق دارند." : "اختلاف بین موجودی و دفتر ثبت شبیه‌سازی یافت شد."} · نرخ تبدیل شبیه‌سازی: <span className="num">{formatToman(s.usdtIrt)}</span> به‌ازای هر تتر</p>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-line bg-surface p-5" aria-labelledby="alloc-h">
          <h2 id="alloc-h" className="mb-4 font-bold">تخصیص دارایی</h2>
          {s.rows.length ? <AllocationDonut rows={s.rows} /> : <EmptyState title="دارایی ندارید" hint="با واریز نمونه یا خرید در ترمینال شروع کنید." action={<ButtonLink href="/wallet" size="sm">واریز نمونه</ButtonLink>} />}
        </section>
        <section className="overflow-hidden rounded-lg border border-line bg-surface" aria-labelledby="hold-h">
          <h2 id="hold-h" className="border-b border-line px-5 py-3 font-bold">دارایی‌ها</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-[13px]" data-testid="holdings">
              <caption className="sr-only">موجودی هر دارایی</caption>
              <thead className="text-xs text-muted"><tr>{["دارایی", "آزاد", "قفل‌شده", "مجموع", "ارزش (تتر)", "ارزش (تومان)", "سهم"].map((h) => <th key={h} scope="col" className="px-4 py-2 text-start font-normal">{h}</th>)}</tr></thead>
              <tbody>
                {s.rows.map((r) => { const d = amountDecimalsOf(r.asset); return (
                  <tr key={r.asset} className="border-t border-line" data-asset={r.asset}>
                    <td className="px-4 py-2.5"><span className="flex items-center gap-2"><AssetIcon symbol={r.asset} size={26} /><span className="leading-tight"><span className="block font-medium">{symbolName(r.asset)}</span><bdi dir="ltr" className="text-xs text-muted">{r.asset}</bdi></span></span></td>
                    <td className="num px-4 py-2.5">{formatFixed(r.free, d)}</td>
                    <td className="num px-4 py-2.5 text-muted">{formatFixed(r.locked, d)}</td>
                    <td className="num px-4 py-2.5 font-medium">{formatFixed(r.total, d)}</td>
                    <td className="num px-4 py-2.5">{formatFixed(r.valueUsdt, 2)}</td>
                    <td className="num px-4 py-2.5 text-muted">{formatFixed(r.valueToman, 0)}</td>
                    <td className="num px-4 py-2.5 text-muted">{formatPercent(r.share * 100, false)}</td>
                  </tr>); })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export function Stat({ label, value, sub, big, testid }: { label: string; value: string; sub?: string; big?: boolean; testid?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-[13px] text-muted">{label}</p>
      <p className={`num mt-1 font-bold ${big ? "text-3xl" : "text-xl"}`} data-testid={testid}>{value}</p>
      {sub && <p className="num mt-0.5 text-[13px] text-muted">{sub}</p>}
    </div>
  );
}
