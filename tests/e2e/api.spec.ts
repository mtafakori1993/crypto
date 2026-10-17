import { expect, test } from "@playwright/test";

test.describe("mock API routes", () => {
  test("health", async ({ request }) => {
    const r = await request.get("/api/health");
    expect(r.status()).toBe(200);
    expect((await r.json()).ok).toBe(true);
  });
  test("tickers, orderbook, candles and trades are mutually consistent", async ({ request }) => {
    const t = await (await request.get("/api/market/tickers")).json();
    expect(t.tickers.length).toBeGreaterThanOrEqual(12);
    const book = await (await request.get("/api/market/orderbook?pair=ETH-USDT&depth=5")).json();
    expect(book.bids).toHaveLength(5);
    expect(book.asks[0].price).toBeGreaterThan(book.bids[0].price);
    expect(Math.abs(book.lastPrice - t.tickers.find((x: { pair: string }) => x.pair === "ETH-USDT").price) / book.lastPrice).toBeLessThan(0.01);
    const c = await (await request.get("/api/market/candles?pair=ETH-USDT&tf=5m&limit=50")).json();
    expect(c.candles).toHaveLength(50);
    for (const k of c.candles) expect(k.high).toBeGreaterThanOrEqual(Math.max(k.open, k.close));
    const tr = await (await request.get("/api/market/trades?pair=ETH-USDT")).json();
    expect(tr.trades.length).toBeGreaterThan(5);
  });
  test("errors: unknown pair 404, bad timeframe 400, invalid order body 400/422", async ({ request }) => {
    expect((await request.get("/api/market/orderbook?pair=FOO-USDT")).status()).toBe(404);
    expect((await request.get("/api/market/candles?pair=BTC-USDT&tf=7m")).status()).toBe(400);
    expect((await request.post("/api/orders", { data: "not json", headers: { "content-type": "text/plain" } })).status()).toBe(400);
    expect((await request.post("/api/orders", { data: { action: "place", account: {}, input: {}, simTime: Date.now() } })).status()).toBe(400);
  });
  test("assets and account summary", async ({ request }) => {
    const a = await (await request.get("/api/assets")).json();
    expect(a.assets.map((x: { symbol: string }) => x.symbol)).toEqual(expect.arrayContaining(["BTC", "ETH", "USDT", "TON", "AVAX", "IRT"]));
    const s = await (await request.get("/api/account/summary")).json();
    expect(s.simulated).toBe(true);
    expect(s.totals.totalUsdt).toBeGreaterThan(0);
  });
  test("order API rejects simulated clock far from server clock", async ({ request }) => {
    const acc = (await (await request.get("/api/portfolio")).json()).reconciled;
    expect(acc).toBe(true);
    const r = await request.post("/api/orders", { data: { action: "cancel", account: { version: 1, balances: {}, orders: [], trades: [], transfers: [], ledger: [], notifications: [], watchlist: [], profile: { uid: "x" }, prefs: {}, seq: {} }, orderId: "x", simTime: 1 } });
    expect(r.status()).toBe(400);
  });
});
