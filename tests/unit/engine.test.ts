import { describe, expect, it } from "vitest";
import { createInitialAccount, reconcile, summarize } from "@/lib/engine/account";
import { cancelOrder, matchOpenOrders, placeOrder } from "@/lib/engine/orders";
import { requestTransfer, settleTransfers } from "@/lib/engine/transfers";
import { getCandles } from "@/lib/market/candles";
import { allTickers, ticker } from "@/lib/market/model";
import { getOrderBook } from "@/lib/market/orderbook";
import { PAIRS } from "@/lib/market/pairs";
import { formatFixed, parseAmount } from "@/lib/format";

const T = Date.UTC(2026, 9, 17, 10, 0, 0);

describe("market model", () => {
  it("is deterministic for the same instant", () => {
    expect(ticker("BTC-USDT", T)).toEqual(ticker("BTC-USDT", T));
    expect(getCandles("ETH-USDT", "1h", T, 50)).toEqual(getCandles("ETH-USDT", "1h", T, 50));
  });
  it("keeps candles consistent with the ticker and the book", () => {
    for (const p of PAIRS) {
      const tk = ticker(p.id, T);
      const c = getCandles(p.id, "5m", T, 20);
      expect(c[c.length - 1].close).toBeCloseTo(tk.price, p.priceDecimals);
      const b = getOrderBook(p.id, T);
      expect(b.asks[0].price).toBeGreaterThan(b.bids[0].price);
      expect(tk.high24h).toBeGreaterThanOrEqual(tk.low24h);
      for (const k of c) {
        expect(k.high).toBeGreaterThanOrEqual(Math.max(k.open, k.close) - 1e-9);
        expect(k.low).toBeLessThanOrEqual(Math.min(k.open, k.close) + 1e-9);
      }
    }
  });
  it("keeps 24h changes plausible", () => {
    for (const t of allTickers(T)) expect(Math.abs(t.change24h)).toBeLessThan(15);
  });
});

describe("order engine", () => {
  it("executes a market buy and reconciles the ledger", () => {
    const acc = createInitialAccount(T);
    const before = acc.balances.USDT.free;
    const r = placeOrder(acc, { pair: "BTC-USDT", side: "buy", type: "market", amount: 0.01 }, T);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.order.status).toBe("filled");
    expect(r.account.balances.USDT.free).toBeCloseTo(before - r.order.total!, 4);
    expect(r.account.balances.BTC.free).toBeCloseTo(0.4215 + 0.01 * 0.999, 8);
    expect(reconcile(r.account)).toEqual([]);
    expect(r.account.trades).toHaveLength(1);
  });
  it("rejects insufficient balance and unknown pairs", () => {
    const acc = createInitialAccount(T);
    const r = placeOrder(acc, { pair: "BTC-USDT", side: "buy", type: "market", amount: 5 }, T);
    expect(r.ok).toBe(false);
    expect(placeOrder(acc, { pair: "FOO-USDT", side: "buy", type: "market", amount: 1 }, T).ok).toBe(false);
    expect(placeOrder(acc, { pair: "BTC-USDT", side: "sell", type: "limit", amount: 0.01 }, T).ok).toBe(false);
  });
  it("places a pending limit order, locks funds, fills only when crossed, and can be cancelled", () => {
    const acc = createInitialAccount(T);
    const tk = ticker("ETH-USDT", T);
    const px = Number((tk.bid * 0.97).toFixed(2));
    const r = placeOrder(acc, { pair: "ETH-USDT", side: "buy", type: "limit", amount: 1, price: px }, T);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.order.status).toBe("open");
    expect(r.account.balances.USDT.locked).toBeCloseTo(px, 4);
    const m = matchOpenOrders(r.account, T);
    expect(m.filled).toHaveLength(0);
    const c = cancelOrder(r.account, r.order.id, T);
    expect(c.ok).toBe(true);
    if (c.ok) {
      expect(c.account.balances.USDT.locked).toBe(0);
      expect(c.account.balances.USDT.free).toBeCloseTo(25000, 6);
      expect(reconcile(c.account)).toEqual([]);
    }
  });
  it("fills a marketable limit order immediately at the ask or better", () => {
    const acc = createInitialAccount(T);
    const tk = ticker("SOL-USDT", T);
    const r = placeOrder(acc, { pair: "SOL-USDT", side: "buy", type: "limit", amount: 1, price: Number((tk.ask * 1.01).toFixed(2)) }, T);
    expect(r.ok && r.order.status).toBe("filled");
    if (r.ok) expect(r.order.avgPrice).toBe(tk.ask);
  });
  it("sell in IRT market reconciles", () => {
    const r = placeOrder(createInitialAccount(T), { pair: "BTC-IRT", side: "sell", type: "market", amount: 0.01 }, T);
    expect(r.ok).toBe(true);
    if (r.ok) expect(reconcile(r.account)).toEqual([]);
  });
});

describe("transfers", () => {
  it("deposit is pending then completed in simulation", () => {
    const acc = createInitialAccount(T);
    const r = requestTransfer(acc, { kind: "deposit", asset: "USDT", amount: 100, network: "TRC20" }, T);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.transfer.status).toBe("pending");
    expect(r.account.balances.USDT.free).toBe(25000);
    const s = settleTransfers(r.account, T + 7000);
    expect(s.account.balances.USDT.free).toBe(25100);
    expect(reconcile(s.account)).toEqual([]);
  });
  it("withdraw deducts amount + fee and rejects overdraw", () => {
    const acc = createInitialAccount(T);
    const r = requestTransfer(acc, { kind: "withdraw", asset: "USDT", amount: 100, network: "TRC20", destination: "SIM-ADDR-001" }, T);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.account.balances.USDT.free).toBe(24899);
      expect(reconcile(r.account)).toEqual([]);
    }
    expect(requestTransfer(acc, { kind: "withdraw", asset: "USDT", amount: 99999, network: "TRC20", destination: "SIM-ADDR-001" }, T).ok).toBe(false);
  });
  it("valuation sums holdings", () => {
    const s = summarize(createInitialAccount(T), T);
    expect(s.rows.reduce((a, r) => a + r.share, 0)).toBeCloseTo(1, 6);
    expect(s.totalUsdt).toBeGreaterThan(0);
  });
});

describe("format", () => {
  it("parses Persian digits and formats with Persian numerals", () => {
    expect(parseAmount("۱٬۲۳۴٫۵")).toBe(1234.5);
    expect(parseAmount("abc")).toBeNaN();
    expect(formatFixed(1234.5, 2)).toBe("۱٬۲۳۴٫۵۰");
  });
});
