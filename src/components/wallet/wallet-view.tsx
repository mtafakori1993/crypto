"use client";
import { ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, SelectField } from "@/components/ui/field";
import { Badge, EmptyState, Skeleton, Tab, TabList, TabPanel, Tabs, toast } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { SAVED_DESTINATIONS, DEPOSIT_DELAY_MS, withdrawFee } from "@/lib/engine/transfers";
import { formatDateTime, formatFixed, parseAmount, toInputValue } from "@/lib/format";
import { ASSETS, amountDecimalsOf, assetMap, symbolName } from "@/lib/market/assets";
import { httpExchangeService } from "@/lib/services/exchange-service";
import { useAccount } from "@/lib/store/account-store";
import { useNow } from "@/lib/store/sim-provider";
import type { Transfer } from "@/lib/engine/types";

type Kind = "deposit" | "withdraw" | "transfer";
const KIND_LABEL: Record<Transfer["kind"], string> = { deposit: "واریز", withdraw: "برداشت", transfer: "انتقال داخلی" };

function TransferForm({ kind }: { kind: Kind }) {
  const account = useAccount((s) => s.account);
  const hydrated = useAccount((s) => s.hydrated);
  const commit = useAccount((s) => s.commit);
  const now = useNow();
  const assetList = kind === "withdraw" ? ASSETS.map((a) => a.symbol) : ["IRT", ...ASSETS.map((a) => a.symbol)];
  const [asset, setAsset] = useState(kind === "withdraw" ? "USDT" : kind === "deposit" ? "USDT" : "USDT");
  const [networkChoice, setNetwork] = useState("");
  const [dest, setDest] = useState(kind === "withdraw" ? SAVED_DESTINATIONS[0].id : "");
  const [amountStr, setAmountStr] = useState("");
  const [error, setError] = useState<{ field: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const nets = asset === "IRT" ? ["درگاه شبیه‌سازی"] : assetMap[asset]?.networks ?? [];
  const network = nets.includes(networkChoice) ? networkChoice : nets[0] ?? "";
  const free = hydrated ? account.balances[asset]?.free ?? 0 : 0;
  const d = amountDecimalsOf(asset);
  const fee = kind === "withdraw" ? withdrawFee(asset) : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(amountStr);
    if (!(amount > 0)) return setError({ field: "amount", text: "مقدار معتبر وارد کنید" });
    if (kind === "transfer" && !/^SIM-\d{6}$/.test(dest)) return setError({ field: "dest", text: "شناسه حساب نمونه باید به شکل SIM-123456 باشد" });
    setBusy(true);
    setError(null);
    const input = kind === "deposit" ? { kind, asset, amount, network } : kind === "withdraw" ? { kind, asset, amount, network, destination: dest } : { kind, asset, amount, destination: dest };
    try {
      const r = await httpExchangeService.requestTransfer(account, input, now);
      if (r.ok) { commit(r.account); toast.ok(r.message); setAmountStr(""); }
      else { setError({ field: r.field ?? "amount", text: r.error }); toast.error(r.error); }
    } catch { toast.error("ارتباط با سرویس شبیه‌سازی برقرار نشد"); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-xl gap-4 py-5" data-testid={`${kind}-form`}>
      <div className="flex items-start gap-2 rounded-md bg-warn-soft p-3 text-[13px] leading-6 text-warn"><Info size={16} className="mt-1 shrink-0" aria-hidden />
        {kind === "deposit" && "واریز نمونه: هیچ پولی دریافت نمی‌شود. پس از ثبت، موجودی فرضی شما بعد از چند ثانیه در شبیه‌سازی افزایش می‌یابد."}
        {kind === "withdraw" && "برداشت نمونه: هیچ تراکنش زنجیره‌ای ارسال نمی‌شود. مقصدها شناسه‌های فرضی هستند، نه نشانی کیف پول واقعی."}
        {kind === "transfer" && "انتقال داخلی نمونه: مقصد یک شناسه فرضی (مثلاً SIM-482913) است و حساب واقعی وجود ندارد."}
      </div>
      <SelectField label="دارایی" value={asset} onChange={(e) => { setAsset(e.target.value); setError(null); }}>
        {assetList.map((a) => <option key={a} value={a}>{symbolName(a)} ({a})</option>)}
      </SelectField>
      {kind !== "transfer" && <SelectField label="شبکه" value={network} onChange={(e) => setNetwork(e.target.value)}>{nets.map((n) => <option key={n} value={n}>{n}</option>)}</SelectField>}
      {kind === "deposit" && (
        <div className="rounded-md border border-dashed border-line-strong p-3 text-[13px]">
          <p className="text-muted">شناسه واریز شبیه‌سازی (نشانی واقعی نیست)</p>
          <p dir="ltr" className="mt-1 select-all break-all text-start font-mono text-sm" data-testid="sim-deposit-id">SIM-DEP-{asset}-{(network || "NET").replace(/\W/g, "")}-0001</p>
        </div>
      )}
      {kind === "withdraw" && (
        <SelectField label="مقصد نمونه" value={dest} onChange={(e) => setDest(e.target.value)}>
          {SAVED_DESTINATIONS.map((x) => <option key={x.id} value={x.id}>{x.label} — {x.id}</option>)}
        </SelectField>
      )}
      {kind === "transfer" && <Field label="شناسه حساب نمونه مقصد" dir="ltr" placeholder="SIM-482913" value={dest} onChange={(e) => setDest(e.target.value.toUpperCase())} error={error?.field === "dest" ? error.text : null} />}
      <div>
        <Field label="مقدار" numeric value={amountStr} onChange={(e) => setAmountStr(e.target.value)} suffix={asset === "IRT" ? "تومان" : asset} error={error?.field === "amount" ? error.text : null} hint={kind !== "deposit" ? `موجودی آزاد: ${formatFixed(free, d)}${fee ? ` · کارمزد شبکه: ${formatFixed(fee, d)} ${asset}` : ""}` : `تکمیل شبیه‌سازی پس از حدود ${formatFixed(DEPOSIT_DELAY_MS / 1000, 0)} ثانیه`} name="amount" />
        {kind !== "deposit" && <button type="button" onClick={() => setAmountStr(toInputValue(Math.max(0, kind === "withdraw" ? free - fee : free)))} className="mt-1 text-xs text-accent-strong hover:underline">حداکثر</button>}
      </div>
      <Button type="submit" size="lg" disabled={busy || !hydrated} data-testid={`${kind}-submit`}>{kind === "deposit" ? "ثبت واریز نمونه" : kind === "withdraw" ? "ثبت برداشت نمونه" : "ثبت انتقال نمونه"}</Button>
    </form>
  );
}

export function WalletView() {
  const hydrated = useAccount((s) => s.hydrated);
  const transfers = useAccount((s) => s.account.transfers);
  const balances = useAccount((s) => s.account.balances);
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-line bg-surface">
        <Tabs defaultValue="deposit" className="px-3 md:px-5">
          <TabList label="عملیات کیف پول">
            <Tab value="deposit"><span className="inline-flex items-center gap-2"><ArrowDownToLine size={15} aria-hidden /> واریز</span></Tab>
            <Tab value="withdraw"><span className="inline-flex items-center gap-2"><ArrowUpFromLine size={15} aria-hidden /> برداشت</span></Tab>
            <Tab value="transfer"><span className="inline-flex items-center gap-2"><ArrowLeftRight size={15} aria-hidden /> انتقال داخلی</span></Tab>
          </TabList>
          <TabPanel value="deposit"><TransferForm kind="deposit" /></TabPanel>
          <TabPanel value="withdraw"><TransferForm kind="withdraw" /></TabPanel>
          <TabPanel value="transfer"><TransferForm kind="transfer" /></TabPanel>
        </Tabs>
      </section>
      <section className="overflow-hidden rounded-lg border border-line bg-surface" aria-labelledby="tx-h">
        <h2 id="tx-h" className="border-b border-line px-5 py-3 font-bold">تاریخچه واریز، برداشت و انتقال (شبیه‌سازی)</h2>
        {!hydrated ? <div className="p-4"><Skeleton className="h-16 w-full" /></div> : transfers.length === 0 ? <EmptyState title="تراکنشی ثبت نشده" hint="واریز، برداشت یا انتقال نمونه‌ای انجام دهید تا اینجا نمایش داده شود." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-[13px]" data-testid="transfer-history">
              <caption className="sr-only">تاریخچه تراکنش‌های کیف پول شبیه‌سازی‌شده</caption>
              <thead className="text-xs text-muted"><tr>{["زمان", "شناسه شبیه‌سازی", "نوع", "دارایی", "مقدار", "کارمزد", "وضعیت"].map((h) => <th key={h} scope="col" className="px-4 py-2 text-start font-normal">{h}</th>)}</tr></thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id} className="border-t border-line" data-testid="transfer-row">
                    <td className="num px-4 py-2 text-muted">{formatDateTime(t.createdAt)}</td>
                    <td className="px-4 py-2 text-xs text-muted"><bdi dir="ltr">{t.id}</bdi></td>
                    <td className={cn("px-4 py-2 font-medium")}>{KIND_LABEL[t.kind]}</td>
                    <td className="px-4 py-2"><bdi dir="ltr">{t.asset}</bdi></td>
                    <td className="num px-4 py-2">{formatFixed(t.amount, amountDecimalsOf(t.asset))}</td>
                    <td className="num px-4 py-2 text-muted">{t.fee ? formatFixed(t.fee, amountDecimalsOf(t.asset)) : "—"}</td>
                    <td className="px-4 py-2">{t.status === "pending" ? <Badge tone="warn">در انتظار (شبیه‌سازی)</Badge> : <Badge tone="up">تکمیل‌شده (شبیه‌سازی)</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="text-xs text-muted">موجودی IRT (تومان): <span className="num">{hydrated ? formatFixed(balances.IRT?.free ?? 0, 0) : "…"}</span> · همه رکوردها محلی و شبیه‌سازی‌شده‌اند؛ هیچ تراکنش زنجیره‌ای یا بانکی انجام نمی‌شود.</p>
    </div>
  );
}
