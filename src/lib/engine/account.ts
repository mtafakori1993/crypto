import { ASSETS } from "../market/assets";
import { valueInUsdt, toTomanRate } from "../market/model";
import type { Account, LedgerEntry } from "./types";

export const INITIAL_BALANCES: Record<string, number> = {
  IRT: 150_000_000,
  USDT: 25_000,
  BTC: 0.4215,
  ETH: 4.82,
  SOL: 62,
  BNB: 7.5,
  XRP: 3200,
  TON: 410,
  DOGE: 15000,
};

export function createInitialAccount(now: number): Account {
  const balances: Account["balances"] = { IRT: { free: 0, locked: 0 } };
  for (const a of ASSETS) balances[a.symbol] = { free: 0, locked: 0 };
  const ledger: LedgerEntry[] = [];
  let id = 0;
  for (const [asset, amount] of Object.entries(INITIAL_BALANCES)) {
    balances[asset].free = amount;
    ledger.push({ id: ++id, time: now, asset, delta: amount, reason: "initial", ref: "SIM-INIT" });
  }
  return {
    version: 1,
    profile: { name: "کاربر نمونه", email: "demo@shomaaa.example", uid: "SIM-204816", level: "سطح ۲ (نمونه)" },
    prefs: { theme: "dark", notifyOrders: true, notifyWallet: true, notifyPrice: false, confirmOrders: true, defaultPair: "BTC-USDT", compactTables: false },
    session: false,
    balances,
    orders: [],
    trades: [],
    transfers: [],
    ledger,
    notifications: [
      { id: "SIM-NTF-000001", time: now - 3_600_000, title: "به شوما کریپتو خوش آمدید", body: "حساب نمونه شما با موجودی فرضی آماده است. هیچ معامله‌ای واقعی نیست.", kind: "system", read: false },
      { id: "SIM-NTF-000002", time: now - 7_200_000, title: "یادآوری امنیتی", body: "هرگز رمز عبور، کد یک‌بار مصرف یا کلید API واقعی خود را در این محیط وارد نکنید.", kind: "system", read: false },
    ],
    watchlist: ["BTC-USDT", "ETH-USDT", "SOL-USDT", "TON-USDT"],
    seq: { order: 0, trade: 0, transfer: 0, ledger: id, notif: 2 },
  };
}

export interface HoldingRow {
  asset: string;
  free: number;
  locked: number;
  total: number;
  valueUsdt: number;
  valueToman: number;
  share: number; // 0..1
}
export interface PortfolioSummary {
  totalUsdt: number;
  totalToman: number;
  availableUsdt: number;
  lockedUsdt: number;
  rows: HoldingRow[];
  usdtIrt: number;
}

export function summarize(acc: Account, t: number): PortfolioSummary {
  const rate = toTomanRate(t);
  const rows: HoldingRow[] = [];
  let total = 0;
  let locked = 0;
  for (const [asset, b] of Object.entries(acc.balances)) {
    const sum = b.free + b.locked;
    if (sum <= 0) continue;
    const unit = valueInUsdt(asset, t);
    const v = sum * unit;
    total += v;
    locked += b.locked * unit;
    rows.push({ asset, free: b.free, locked: b.locked, total: sum, valueUsdt: v, valueToman: v * rate, share: 0 });
  }
  rows.forEach((r) => (r.share = total ? r.valueUsdt / total : 0));
  rows.sort((a, b) => b.valueUsdt - a.valueUsdt);
  return { totalUsdt: total, totalToman: total * rate, availableUsdt: total - locked, lockedUsdt: locked, rows, usdtIrt: rate };
}

/** Reconciliation: balances must equal the sum of the ledger per asset. Returns mismatches (empty = OK). */
export function reconcile(acc: Account): { asset: string; balance: number; ledger: number }[] {
  const sums: Record<string, number> = {};
  for (const e of acc.ledger) sums[e.asset] = (sums[e.asset] ?? 0) + e.delta;
  const bad: { asset: string; balance: number; ledger: number }[] = [];
  for (const [asset, b] of Object.entries(acc.balances)) {
    const bal = b.free + b.locked;
    const led = sums[asset] ?? 0;
    // pending withdrawals are already deducted from balances and ledger together
    if (Math.abs(bal - led) > 1e-7 * Math.max(1, Math.abs(bal))) bad.push({ asset, balance: bal, ledger: led });
  }
  return bad;
}
