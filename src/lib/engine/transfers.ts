import { amountDecimalsOf, assetMap, symbolName } from "../market/assets";
import { valueInUsdt } from "../market/model";
import { formatFixed, roundTo } from "../format";
import { transferInputSchema } from "./schemas";
import type { Account, Transfer } from "./types";
import type { EngineResult } from "./orders";

const pad = (n: number) => String(n).padStart(6, "0");
const dec = (a: string) => (a === "IRT" ? 0 : 8);
export const DEPOSIT_DELAY_MS = 6000;
export const WITHDRAW_DELAY_MS = 8000;
export const MAX_DEPOSIT_USDT = 100_000;
export const SAVED_DESTINATIONS = [
  { id: "SIM-ADDR-001", label: "کیف پول نمونه ۱" },
  { id: "SIM-ADDR-002", label: "کیف پول نمونه ۲" },
  { id: "SIM-ADDR-003", label: "کیف پول نمونه ۳" },
];

export function withdrawFee(asset: string): number {
  return assetMap[asset]?.withdrawFee ?? 0;
}

export function requestTransfer(account: Account, raw: unknown, now: number): EngineResult<{ transfer: Transfer }> {
  const parsed = transferInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message, field: "amount" };
  const input = parsed.data;
  const d = amountDecimalsOf(input.asset);
  if ((input.amount.toString().split(".")[1] ?? "").length > d) return { ok: false, field: "amount", error: `حداکثر ${d} رقم اعشار مجاز است` };
  const acc = structuredClone(account);
  const b = (acc.balances[input.asset] ??= { free: 0, locked: 0 });
  const id = (prefix: string) => `SIM-${prefix}-${pad(++acc.seq.transfer)}`;
  const push = (asset: string, delta: number, reason: "deposit" | "withdraw" | "withdraw_fee" | "transfer", ref: string) =>
    acc.ledger.push({ id: ++acc.seq.ledger, time: now, asset, delta: roundTo(delta, dec(asset)), reason, ref });

  if (input.kind === "deposit") {
    if (input.amount * valueInUsdt(input.asset, now) > MAX_DEPOSIT_USDT) return { ok: false, field: "amount", error: "سقف هر درخواست واریز نمونه ۱۰۰٬۰۰۰ تتر (یا معادل) است" };
    const t: Transfer = { id: id("DEP"), kind: "deposit", asset: input.asset, amount: input.amount, fee: 0, network: input.network, destination: null, status: "pending", createdAt: now, settleAt: now + DEPOSIT_DELAY_MS, completedAt: null };
    acc.transfers.unshift(t);
    return { ok: true, account: acc, transfer: t, message: "درخواست واریز نمونه ثبت شد؛ پس از چند ثانیه در شبیه‌سازی تکمیل می‌شود" };
  }
  if (input.kind === "withdraw") {
    const a = assetMap[input.asset];
    if (!a.networks.includes(input.network)) return { ok: false, error: "شبکه نامعتبر است" };
    if (input.amount < a.minWithdraw) return { ok: false, field: "amount", error: `حداقل برداشت ${formatFixed(a.minWithdraw, d)} ${input.asset} است` };
    const fee = a.withdrawFee;
    if (b.free + 1e-9 < input.amount + fee) return { ok: false, field: "amount", error: `موجودی کافی نیست (مقدار + کارمزد ${formatFixed(fee, d)} ${input.asset})` };
    b.free = roundTo(b.free - input.amount - fee, dec(input.asset));
    const t: Transfer = { id: id("WDR"), kind: "withdraw", asset: input.asset, amount: input.amount, fee, network: input.network, destination: input.destination, status: "pending", createdAt: now, settleAt: now + WITHDRAW_DELAY_MS, completedAt: null };
    push(input.asset, -input.amount, "withdraw", t.id);
    push(input.asset, -fee, "withdraw_fee", t.id);
    acc.transfers.unshift(t);
    return { ok: true, account: acc, transfer: t, message: "درخواست برداشت نمونه ثبت شد؛ هیچ تراکنش زنجیره‌ای ارسال نمی‌شود" };
  }
  // internal transfer
  if (input.destination === acc.profile.uid) return { ok: false, field: "amount", error: "انتقال به حساب خودتان ممکن نیست" };
  if (b.free + 1e-9 < input.amount) return { ok: false, field: "amount", error: `موجودی ${symbolName(input.asset)} کافی نیست` };
  b.free = roundTo(b.free - input.amount, dec(input.asset));
  const t: Transfer = { id: id("TRF"), kind: "transfer", asset: input.asset, amount: input.amount, fee: 0, network: null, destination: input.destination, status: "completed", createdAt: now, settleAt: now, completedAt: now };
  push(input.asset, -input.amount, "transfer", t.id);
  acc.transfers.unshift(t);
  return { ok: true, account: acc, transfer: t, message: "انتقال داخلی نمونه ثبت شد" };
}

/** Completes pending deposits/withdrawals whose simulated delay has elapsed. */
export function settleTransfers(account: Account, now: number): { account: Account; settled: Transfer[] } {
  if (!account.transfers.some((t) => t.status === "pending" && t.settleAt <= now)) return { account, settled: [] };
  const acc = structuredClone(account);
  const settled: Transfer[] = [];
  for (const t of acc.transfers) {
    if (t.status !== "pending" || t.settleAt > now) continue;
    t.status = "completed";
    t.completedAt = now;
    if (t.kind === "deposit") {
      const b = (acc.balances[t.asset] ??= { free: 0, locked: 0 });
      b.free = roundTo(b.free + t.amount, dec(t.asset));
      acc.ledger.push({ id: ++acc.seq.ledger, time: now, asset: t.asset, delta: t.amount, reason: "deposit", ref: t.id });
    }
    if (acc.prefs.notifyWallet)
      acc.notifications.unshift({
        id: `SIM-NTF-${pad(++acc.seq.notif)}`, time: now, read: false, kind: "wallet",
        title: t.kind === "deposit" ? "واریز نمونه تکمیل شد" : "برداشت نمونه تکمیل شد",
        body: `${formatFixed(t.amount, amountDecimalsOf(t.asset))} ${symbolName(t.asset)} — ${t.id} (شبیه‌سازی؛ بدون تراکنش واقعی)`,
      });
    settled.push(t);
  }
  return { account: acc, settled };
}
