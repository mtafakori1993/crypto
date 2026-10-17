import { SIM } from "../config";
import { amountDecimalsOf, assetMap, symbolName } from "../market/assets";
import { getOrderBook, walkBook } from "../market/orderbook";
import { ticker } from "../market/model";
import { getPair, quoteName, type Pair } from "../market/pairs";
import { formatFixed, formatNumber, roundTo } from "../format";
import { orderInputSchema, type OrderInput } from "./schemas";
import type { Account, LedgerEntry, Notification, Order, Trade } from "./types";

export type EngineResult<T = Record<never, never>> =
  | ({ ok: true; account: Account; message: string } & T)
  | { ok: false; error: string; field?: "amount" | "price" | "pair" };

const pad = (n: number) => String(n).padStart(6, "0");
const clone = (a: Account): Account => structuredClone(a);
const dec = (asset: string) => (asset === "IRT" ? 0 : 8);

function ledgerPush(acc: Account, time: number, asset: string, delta: number, reason: LedgerEntry["reason"], ref: string) {
  if (delta === 0) return;
  acc.ledger.push({ id: ++acc.seq.ledger, time, asset, delta: roundTo(delta, dec(asset)), reason, ref });
}
function notify(acc: Account, time: number, n: Omit<Notification, "id" | "time" | "read">) {
  if (n.kind === "order" && !acc.prefs.notifyOrders) return;
  if (n.kind === "wallet" && !acc.prefs.notifyWallet) return;
  acc.notifications.unshift({ id: `SIM-NTF-${pad(++acc.seq.notif)}`, time, read: false, ...n });
  if (acc.notifications.length > 50) acc.notifications.length = 50;
}
const bal = (acc: Account, asset: string) => (acc.balances[asset] ??= { free: 0, locked: 0 });

export function quoteTotal(pair: Pair, amount: number, price: number): number {
  return pair.quote === "IRT" ? Math.round(amount * price) : roundTo(amount * price, 6);
}
export function feeFor(asset: string, gross: number): number {
  const f = gross * SIM.feeRate;
  return asset === "IRT" ? Math.ceil(f) : roundTo(f, 8);
}

/** Validate shape / precision / min total without touching balances. Used by the form preview and the API. */
export function validateOrderShape(input: OrderInput, refPrice: number): { ok: true } | { ok: false; error: string; field: "amount" | "price" } {
  const pair = getPair(input.pair)!;
  const decimals = (input.amount.toString().split(".")[1] ?? "").length;
  if (decimals > pair.amountDecimals) return { ok: false, field: "amount", error: `حداکثر ${formatNumber(pair.amountDecimals, 0)} رقم اعشار برای مقدار مجاز است` };
  if (input.type === "limit") {
    const pd = (input.price!.toString().split(".")[1] ?? "").length;
    if (pd > pair.priceDecimals) return { ok: false, field: "price", error: `حداکثر ${formatNumber(pair.priceDecimals, 0)} رقم اعشار برای قیمت مجاز است` };
    if (input.price! < refPrice * 0.5 || input.price! > refPrice * 2) return { ok: false, field: "price", error: "قیمت سفارش باید بین ۵۰٪ تا ۲۰۰٪ قیمت بازار باشد" };
  }
  const price = input.type === "limit" ? input.price! : refPrice;
  const total = quoteTotal(pair, input.amount, price);
  if (total < pair.minTotal) return { ok: false, field: "amount", error: `حداقل ارزش سفارش ${formatNumber(pair.minTotal, 0)} ${quoteName(pair.quote)} است` };
  return { ok: true };
}

function applyFill(acc: Account, order: Order, execPrice: number, now: number) {
  const pair = getPair(order.pair)!;
  // release anything locked for this order, then settle from free balances
  if (order.locked > 0) {
    const lockAsset = order.side === "buy" ? pair.quote : pair.base;
    const b = bal(acc, lockAsset);
    b.locked = roundTo(b.locked - order.locked, dec(lockAsset));
    b.free = roundTo(b.free + order.locked, dec(lockAsset));
    order.locked = 0;
  }
  const total = quoteTotal(pair, order.amount, execPrice);
  const baseB = bal(acc, pair.base);
  const quoteB = bal(acc, pair.quote);
  const tradeId = `SIM-TRD-${pad(++acc.seq.trade)}`;
  let fee: number;
  let feeAsset: string;
  if (order.side === "buy") {
    fee = feeFor(pair.base, order.amount);
    feeAsset = pair.base;
    quoteB.free = roundTo(quoteB.free - total, dec(pair.quote));
    baseB.free = roundTo(baseB.free + order.amount - fee, dec(pair.base));
    ledgerPush(acc, now, pair.quote, -total, "trade", tradeId);
    ledgerPush(acc, now, pair.base, order.amount, "trade", tradeId);
    ledgerPush(acc, now, pair.base, -fee, "fee", tradeId);
  } else {
    fee = feeFor(pair.quote, total);
    feeAsset = pair.quote;
    baseB.free = roundTo(baseB.free - order.amount, dec(pair.base));
    quoteB.free = roundTo(quoteB.free + total - fee, dec(pair.quote));
    ledgerPush(acc, now, pair.base, -order.amount, "trade", tradeId);
    ledgerPush(acc, now, pair.quote, total, "trade", tradeId);
    ledgerPush(acc, now, pair.quote, -fee, "fee", tradeId);
  }
  order.status = "filled";
  order.avgPrice = execPrice;
  order.total = total;
  order.fee = fee;
  order.feeAsset = feeAsset;
  order.closedAt = now;
  const trade: Trade = { id: tradeId, orderId: order.id, pair: order.pair, side: order.side, price: execPrice, amount: order.amount, total, fee, feeAsset, time: now };
  acc.trades.unshift(trade);
  notify(acc, now, {
    kind: "order",
    title: `سفارش ${order.side === "buy" ? "خرید" : "فروش"} ${pair.label} اجرا شد (شبیه‌سازی)`,
    body: `${formatNumber(order.amount, pair.amountDecimals)} ${symbolName(pair.base)} با قیمت ${formatFixed(execPrice, pair.priceDecimals)} ${quoteName(pair.quote)}`,
  });
}

export function placeOrder(account: Account, raw: unknown, now: number): EngineResult<{ order: Order }> {
  const parsed = orderInputSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: (issue.path[0] as "amount" | "price" | "pair") ?? undefined };
  }
  const input = parsed.data;
  const pair = getPair(input.pair)!;
  const tk = ticker(pair.id, now);
  const shape = validateOrderShape(input, tk.price);
  if (!shape.ok) return shape;

  const acc = clone(account);
  const order: Order = {
    id: `SIM-ORD-${pad(++acc.seq.order)}`,
    pair: pair.id,
    side: input.side,
    type: input.type,
    status: "open",
    amount: input.amount,
    price: input.type === "limit" ? input.price! : null,
    avgPrice: null,
    total: null,
    fee: 0,
    feeAsset: input.side === "buy" ? pair.base : pair.quote,
    createdAt: now,
    closedAt: null,
    locked: 0,
  };

  let execPrice: number | null = null;
  if (input.type === "market") {
    const book = getOrderBook(pair.id, now, 14);
    const walked = walkBook(book, input.side, input.amount);
    if (!walked) return { ok: false, field: "amount", error: "عمق دفتر سفارش برای این مقدار کافی نیست؛ مقدار را کاهش دهید" };
    execPrice = Number(walked.avgPrice.toFixed(pair.priceDecimals + 2));
  } else if (input.side === "buy" && input.price! >= tk.ask) execPrice = Math.min(input.price!, tk.ask);
  else if (input.side === "sell" && input.price! <= tk.bid) execPrice = Math.max(input.price!, tk.bid);

  // funds check (against free balance, for the worst-case price)
  const checkPrice = execPrice ?? input.price!;
  const needTotal = quoteTotal(pair, input.amount, checkPrice);
  if (input.side === "buy") {
    const need = needTotal;
    if (bal(acc, pair.quote).free + 1e-9 < need) return { ok: false, field: "amount", error: `موجودی ${symbolName(pair.quote)} کافی نیست (نیاز: ${formatFixed(need, amountDecimalsOf(pair.quote))})` };
  } else if (bal(acc, pair.base).free + 1e-9 < input.amount) {
    return { ok: false, field: "amount", error: `موجودی ${symbolName(pair.base)} کافی نیست` };
  }

  acc.orders.unshift(order);
  if (execPrice !== null) {
    applyFill(acc, order, execPrice, now);
    return { ok: true, account: acc, order, message: input.type === "market" ? "سفارش بازار در شبیه‌سازی اجرا شد" : "سفارش حدی هم‌قیمت بازار بود و بلافاصله در شبیه‌سازی اجرا شد" };
  }
  // pending limit order: lock funds
  const lockAsset = input.side === "buy" ? pair.quote : pair.base;
  const lockAmt = input.side === "buy" ? needTotal : input.amount;
  const b = bal(acc, lockAsset);
  b.free = roundTo(b.free - lockAmt, dec(lockAsset));
  b.locked = roundTo(b.locked + lockAmt, dec(lockAsset));
  order.locked = lockAmt;
  notify(acc, now, { kind: "order", title: `سفارش حدی ${pair.label} ثبت شد`, body: "سفارش در انتظار رسیدن قیمت شبیه‌سازی به قیمت شما است؛ هنوز اجرا نشده است." });
  return { ok: true, account: acc, order, message: "سفارش حدی ثبت شد و در انتظار اجراست (اجرا نشده)" };
}

export function cancelOrder(account: Account, orderId: string, now: number): EngineResult {
  const idx = account.orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return { ok: false, error: "سفارش پیدا نشد" };
  if (account.orders[idx].status !== "open") return { ok: false, error: "فقط سفارش باز قابل لغو است" };
  const acc = clone(account);
  const o = acc.orders[idx];
  const pair = getPair(o.pair)!;
  const lockAsset = o.side === "buy" ? pair.quote : pair.base;
  const b = bal(acc, lockAsset);
  b.locked = roundTo(b.locked - o.locked, dec(lockAsset));
  b.free = roundTo(b.free + o.locked, dec(lockAsset));
  o.locked = 0;
  o.status = "cancelled";
  o.closedAt = now;
  return { ok: true, account: acc, message: "سفارش لغو شد و موجودی آزاد شد" };
}

/** Simulated matching event: fills open limit orders whose price is crossed by the simulated book. */
export function matchOpenOrders(account: Account, now: number): { account: Account; filled: Order[] } {
  const open = account.orders.filter((o) => o.status === "open");
  if (!open.length) return { account, filled: [] };
  let acc: Account | null = null;
  const filled: Order[] = [];
  for (const o of open) {
    const tk = ticker(o.pair, now);
    let px: number | null = null;
    if (o.side === "buy" && tk.ask <= o.price!) px = Math.min(o.price!, tk.ask);
    else if (o.side === "sell" && tk.bid >= o.price!) px = Math.max(o.price!, tk.bid);
    if (px === null) continue;
    acc ??= clone(account);
    const target = acc.orders.find((x) => x.id === o.id)!;
    applyFill(acc, target, px, now);
    filled.push(target);
  }
  return { account: acc ?? account, filled };
}

export { assetMap };
