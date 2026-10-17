"use client";
import { ClipboardList } from "lucide-react";
import { Badge, EmptyState, Skeleton, Tab, TabList, TabPanel, Tabs, toast } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatDateTime, formatFixed, formatPrice } from "@/lib/format";
import { getPair, quoteName } from "@/lib/market/pairs";
import { httpExchangeService } from "@/lib/services/exchange-service";
import { useAccount } from "@/lib/store/account-store";
import { useNow } from "@/lib/store/sim-provider";
import type { Order } from "@/lib/engine/types";

const STATUS: Record<Order["status"], [string, "warn" | "up" | "neutral"]> = { open: ["در انتظار", "warn"], filled: ["اجراشده", "up"], cancelled: ["لغوشده", "neutral"] };

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th scope="col" className={cn("whitespace-nowrap px-3 py-2 text-start font-normal", className)}>{children}</th>;
}
function Wrap({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="w-full min-w-[640px] text-[13px]">
        <caption className="sr-only">{label}</caption>
        {children}
      </table>
    </div>
  );
}

export function OrdersTables({ pairFilter, defaultTab = "open" }: { pairFilter?: string; defaultTab?: "open" | "history" | "trades" }) {
  const hydrated = useAccount((s) => s.hydrated);
  const account = useAccount((s) => s.account);
  const commit = useAccount((s) => s.commit);
  const now = useNow();
  const f = <T extends { pair: string }>(l: T[]) => (pairFilter ? l.filter((x) => x.pair === pairFilter) : l);
  const open = f(account.orders.filter((o) => o.status === "open"));
  const history = f(account.orders.filter((o) => o.status !== "open"));
  const trades = f(account.trades);

  const cancel = async (id: string) => {
    const r = await httpExchangeService.cancelOrder(account, id, now);
    if (r.ok) { commit(r.account); toast.ok(r.message); } else toast.error(r.error);
  };

  if (!hydrated) return <div className="space-y-2 p-4"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-2/3" /></div>;
  const empty = (t: string, h: string) => <EmptyState icon={<ClipboardList size={22} />} title={t} hint={h} />;

  return (
    <Tabs defaultValue={defaultTab}>
      <TabList label="سفارش‌ها و معاملات">
        <Tab value="open">سفارش‌های باز ({formatFixed(open.length, 0)})</Tab>
        <Tab value="history">تاریخچه سفارش‌ها</Tab>
        <Tab value="trades">تاریخچه معاملات</Tab>
      </TabList>
      <TabPanel value="open" data-testid="open-orders">
        {open.length === 0 ? empty("سفارش بازی ندارید", "سفارش حدی ثبت‌شده‌ای که هنوز اجرا نشده باشد اینجا نمایش داده می‌شود.") : (
          <Wrap label="سفارش‌های باز">
            <thead className="text-xs text-muted"><tr><Th>زمان</Th><Th>بازار</Th><Th>جهت</Th><Th>قیمت</Th><Th>مقدار</Th><Th>قفل‌شده</Th><Th>وضعیت</Th><Th><span className="sr-only">عملیات</span></Th></tr></thead>
            <tbody>
              {open.map((o) => { const p = getPair(o.pair)!; return (
                <tr key={o.id} className="border-t border-line" data-testid="open-order-row">
                  <td className="num px-3 py-2 text-muted">{formatDateTime(o.createdAt)}</td>
                  <td className="px-3 py-2"><bdi dir="ltr" className="font-medium">{p.label}</bdi></td>
                  <td className={cn("px-3 py-2 font-medium", o.side === "buy" ? "text-up" : "text-down")}>{o.side === "buy" ? "خرید" : "فروش"}</td>
                  <td className="num px-3 py-2">{formatPrice(o.price!, p.priceDecimals)}</td>
                  <td className="num px-3 py-2">{formatFixed(o.amount, p.amountDecimals)}</td>
                  <td className="num px-3 py-2 text-muted">{formatFixed(o.locked, o.side === "buy" && p.quote === "IRT" ? 0 : 4)} {o.side === "buy" ? quoteName(p.quote) : p.base}</td>
                  <td className="px-3 py-2"><Badge tone="warn">در انتظار</Badge></td>
                  <td className="px-3 py-2"><Button size="sm" variant="outline" onClick={() => cancel(o.id)} aria-label={`لغو سفارش ${o.id}`}>لغو</Button></td>
                </tr>); })}
            </tbody>
          </Wrap>
        )}
      </TabPanel>
      <TabPanel value="history" data-testid="order-history">
        {history.length === 0 ? empty("تاریخچه‌ای وجود ندارد", "سفارش‌های اجراشده و لغوشده پس از ثبت اینجا ثبت می‌شوند.") : (
          <Wrap label="تاریخچه سفارش‌ها">
            <thead className="text-xs text-muted"><tr><Th>زمان</Th><Th>شناسه</Th><Th>بازار</Th><Th>جهت</Th><Th>نوع</Th><Th>قیمت</Th><Th>مقدار</Th><Th>مجموع</Th><Th>وضعیت</Th></tr></thead>
            <tbody>
              {history.map((o) => { const p = getPair(o.pair)!; const [label, tone] = STATUS[o.status]; return (
                <tr key={o.id} className="border-t border-line" data-testid="history-row">
                  <td className="num px-3 py-2 text-muted">{formatDateTime(o.createdAt)}</td>
                  <td className="px-3 py-2 text-xs text-muted"><bdi dir="ltr">{o.id}</bdi></td>
                  <td className="px-3 py-2"><bdi dir="ltr" className="font-medium">{p.label}</bdi></td>
                  <td className={cn("px-3 py-2 font-medium", o.side === "buy" ? "text-up" : "text-down")}>{o.side === "buy" ? "خرید" : "فروش"}</td>
                  <td className="px-3 py-2">{o.type === "market" ? "بازار" : "حدی"}</td>
                  <td className="num px-3 py-2">{formatPrice(o.avgPrice ?? o.price!, p.priceDecimals)}</td>
                  <td className="num px-3 py-2">{formatFixed(o.amount, p.amountDecimals)}</td>
                  <td className="num px-3 py-2">{o.total ? `${formatFixed(o.total, p.quote === "IRT" ? 0 : 2)} ${quoteName(p.quote)}` : "—"}</td>
                  <td className="px-3 py-2"><Badge tone={tone}>{label}</Badge></td>
                </tr>); })}
            </tbody>
          </Wrap>
        )}
      </TabPanel>
      <TabPanel value="trades" data-testid="trade-history">
        {trades.length === 0 ? empty("معامله‌ای ثبت نشده", "پس از اجرای اولین سفارش (در شبیه‌سازی) معاملات شما اینجا فهرست می‌شود.") : (
          <Wrap label="تاریخچه معاملات">
            <thead className="text-xs text-muted"><tr><Th>زمان</Th><Th>شناسه</Th><Th>بازار</Th><Th>جهت</Th><Th>قیمت</Th><Th>مقدار</Th><Th>مجموع</Th><Th>کارمزد</Th></tr></thead>
            <tbody>
              {trades.map((t) => { const p = getPair(t.pair)!; return (
                <tr key={t.id} className="border-t border-line" data-testid="trade-row">
                  <td className="num px-3 py-2 text-muted">{formatDateTime(t.time)}</td>
                  <td className="px-3 py-2 text-xs text-muted"><bdi dir="ltr">{t.id}</bdi></td>
                  <td className="px-3 py-2"><bdi dir="ltr" className="font-medium">{p.label}</bdi></td>
                  <td className={cn("px-3 py-2 font-medium", t.side === "buy" ? "text-up" : "text-down")}>{t.side === "buy" ? "خرید" : "فروش"}</td>
                  <td className="num px-3 py-2">{formatPrice(t.price, p.priceDecimals)}</td>
                  <td className="num px-3 py-2">{formatFixed(t.amount, p.amountDecimals)}</td>
                  <td className="num px-3 py-2">{formatFixed(t.total, p.quote === "IRT" ? 0 : 2)} {quoteName(p.quote)}</td>
                  <td className="num px-3 py-2 text-muted">{formatFixed(t.fee, t.feeAsset === "IRT" ? 0 : 6)} {t.feeAsset === "IRT" ? "تومان" : t.feeAsset}</td>
                </tr>); })}
            </tbody>
          </Wrap>
        )}
      </TabPanel>
    </Tabs>
  );
}
