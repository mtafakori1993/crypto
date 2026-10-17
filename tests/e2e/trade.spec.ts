import { expect, test, type Page } from "@playwright/test";
import { num, readAccount, ready } from "./helpers";

async function openTerminal(page: Page, pair = "BTC-USDT") {
  await page.goto(`/trade/${pair}`);
  await ready(page);
  await expect(page.getByTestId("available-balance")).not.toHaveText("…");
}

test.describe("trading terminal", () => {
  test("renders chart, order book (bids+asks, spread), recent trades and header stats", async ({ page }) => {
    await openTerminal(page);
    await expect(page.getByTestId("price-chart")).toHaveAttribute("data-ready", "true");
    await expect(page.getByTestId("price-chart").locator("canvas").first()).toBeVisible();
    const asks = page.getByRole("list", { name: "سفارش‌های فروش" }).locator("li");
    const bids = page.getByRole("list", { name: "سفارش‌های خرید" }).locator("li");
    await expect(asks).toHaveCount(10);
    await expect(bids).toHaveCount(10);
    await expect(page.getByTestId("order-book")).toContainText("اسپرد");
    await expect(page.getByTestId("recent-trades").locator("li").first()).toBeVisible();
    await expect(page.getByTestId("pair-header")).toContainText("BTC");
    // best ask is above best bid
    const bestAsk = num(await asks.last().locator("span").nth(1).innerText());
    const bestBid = num(await bids.first().locator("span").nth(1).innerText());
    expect(bestAsk).toBeGreaterThan(bestBid);
  });

  test("timeframes switch without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await openTerminal(page);
    for (const tf of ["1m", "5m", "1h", "4h", "1d"]) {
      await page.getByRole("button", { name: tf, exact: true }).click();
      await expect(page.getByRole("button", { name: tf, exact: true })).toHaveAttribute("aria-pressed", "true");
    }
    expect(errors).toEqual([]);
  });

  test("market order validation: empty and insufficient balance", async ({ page }) => {
    await openTerminal(page);
    await page.getByRole("tab", { name: "بازار" }).click();
    await page.getByTestId("submit-order").click();
    await expect(page.getByRole("alert").filter({ hasText: "مقدار را وارد کنید" })).toBeVisible();
    await page.getByLabel(/^مقدار/).fill("5");
    await page.getByLabel(/^مقدار/).blur();
    await expect(page.getByText(/موجودی .* کافی نیست/)).toBeVisible();
    await page.getByLabel(/^مقدار/).fill("0.0000001");
    await expect(page.getByText(/حداکثر ۶ رقم اعشار|حداقل ارزش سفارش/)).toBeVisible();
  });

  test("market buy with confirmation updates balances, history and trades coherently", async ({ page }) => {
    await openTerminal(page);
    const before = await readAccount(page);
    await page.getByRole("tab", { name: "بازار" }).click();
    await page.getByLabel(/^مقدار/).fill("0.01");
    await expect(page.getByLabel("پیش‌نمایش سفارش")).toContainText("کارمزد");
    await page.getByTestId("submit-order").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("شبیه‌سازی‌شده است");
    await expect(page.getByTestId("confirm-summary")).toContainText("دریافت خالص");
    await page.getByTestId("confirm-order").click();
    await expect(page.getByText("سفارش بازار در شبیه‌سازی اجرا شد")).toBeVisible();
    const after = await readAccount(page);
    expect(after.orders).toHaveLength(1);
    expect(after.orders[0].status).toBe("filled");
    expect(after.trades).toHaveLength(1);
    expect(after.balances.USDT.free).toBeCloseTo(before.balances.USDT.free - after.trades[0].total, 3);
    expect(after.balances.BTC.free).toBeCloseTo(before.balances.BTC.free + 0.01 * 0.999, 7);
    // ledger reconciles with balances
    const sums: Record<string, number> = {};
    for (const e of after.ledger) sums[e.asset] = (sums[e.asset] ?? 0) + e.delta;
    for (const [a, b] of Object.entries(after.balances) as [string, { free: number; locked: number }][]) expect(sums[a] ?? 0).toBeCloseTo(b.free + b.locked, 6);
    await page.getByRole("tab", { name: /تاریخچه معاملات/ }).click();
    await expect(page.getByTestId("trade-row")).toHaveCount(1);
    await page.getByRole("tab", { name: "تاریخچه سفارش‌ها" }).click();
    await expect(page.getByTestId("history-row")).toContainText("اجراشده");
  });

  test("sell tab: market sell works and limit sell above market stays pending", async ({ page }) => {
    await openTerminal(page);
    await page.getByRole("tab", { name: "فروش" }).click();
    await page.getByRole("tab", { name: "بازار" }).click();
    await page.getByLabel(/^مقدار/).fill("0.01");
    await page.getByTestId("submit-order").click();
    await page.getByTestId("confirm-order").click();
    await expect(page.getByText("سفارش بازار در شبیه‌سازی اجرا شد")).toBeVisible();
    const acc = await readAccount(page);
    expect(acc.orders[0].side).toBe("sell");
    expect(acc.balances.BTC.free).toBeCloseTo(0.4215 - 0.01, 7);
  });

  test("limit buy below market is pending (not claimed as executed), locks funds, then can be cancelled", async ({ page }) => {
    await openTerminal(page);
    const tickers = (await (await page.request.get("/api/market/tickers")).json()).tickers;
    const bid = tickers.find((t: { pair: string }) => t.pair === "BTC-USDT").bid as number;
    const price = Math.round(bid * 0.95);
    await page.getByLabel(/^قیمت/).fill(String(price));
    await page.getByLabel(/^مقدار/).fill("0.02");
    await expect(page.getByLabel("پیش‌نمایش سفارش")).toContainText("در انتظار می‌ماند");
    await page.getByTestId("submit-order").click();
    await expect(page.getByTestId("confirm-summary")).toContainText("در انتظار");
    await page.getByTestId("confirm-order").click();
    await expect(page.getByText(/اجرا نشده/)).toBeVisible();
    await expect(page.getByTestId("open-order-row")).toHaveCount(1);
    await expect(page.getByTestId("open-order-row")).toContainText("در انتظار");
    const acc = await readAccount(page);
    expect(acc.balances.USDT.locked).toBeCloseTo(price * 0.02, 3);
    expect(acc.trades).toHaveLength(0);
    await page.getByRole("button", { name: /^لغو سفارش/ }).click();
    await expect(page.getByTestId("open-order-row")).toHaveCount(0);
    const acc2 = await readAccount(page);
    expect(acc2.balances.USDT.locked).toBe(0);
    expect(acc2.balances.USDT.free).toBeCloseTo(25000, 3);
  });

  test("marketable limit order executes immediately at ask or better", async ({ page }) => {
    await openTerminal(page);
    const tickers = (await (await page.request.get("/api/market/tickers")).json()).tickers;
    const ask = tickers.find((t: { pair: string }) => t.pair === "BTC-USDT").ask as number;
    await page.getByLabel(/^قیمت/).fill(String(Math.round(ask * 1.01)));
    await page.getByLabel(/^مقدار/).fill("0.01");
    await expect(page.getByLabel("پیش‌نمایش سفارش")).toContainText("بلافاصله");
    await page.getByTestId("submit-order").click();
    await page.getByTestId("confirm-order").click();
    await expect(page.getByText(/بلافاصله در شبیه‌سازی اجرا شد/)).toBeVisible();
    const acc = await readAccount(page);
    expect(acc.orders[0].status).toBe("filled");
    expect(acc.orders[0].avgPrice).toBeLessThanOrEqual(Math.round(ask * 1.01));
  });

  test("clicking an order-book level fills the limit price; percent buttons size the order", async ({ page }) => {
    await openTerminal(page);
    const level = page.getByRole("list", { name: "سفارش‌های فروش" }).locator("li").last().locator("button");
    const priceText = await level.locator("span").nth(1).innerText();
    await level.click();
    await expect(page.getByLabel(/^قیمت/)).toHaveValue(/./);
    expect(num(await page.getByLabel(/^قیمت/).inputValue())).toBeCloseTo(num(priceText), 1);
    await page.getByRole("button", { name: "۲۵٪" }).click();
    expect(num(await page.getByLabel(/^مقدار/).inputValue())).toBeGreaterThan(0);
  });

  test("IRT market works too and state persists after reload", async ({ page }) => {
    await openTerminal(page, "ETH-IRT");
    await page.getByRole("tab", { name: "بازار" }).click();
    await page.getByLabel(/^مقدار/).fill("0.2");
    await page.getByTestId("submit-order").click();
    await page.getByTestId("confirm-order").click();
    await expect(page.getByText("سفارش بازار در شبیه‌سازی اجرا شد")).toBeVisible();
    await page.reload();
    await ready(page);
    await page.getByRole("tab", { name: /تاریخچه معاملات/ }).click();
    await expect(page.getByTestId("trade-row")).toHaveCount(1);
  });

  test("confirmation can be disabled in settings and orders then submit directly", async ({ page }) => {
    await page.goto("/account");
    await ready(page);
    await page.getByRole("tab", { name: "امنیت" }).click();
    await page.getByRole("switch", { name: "تأیید پیش از ثبت هر سفارش" }).click();
    await openTerminal(page);
    await page.getByRole("tab", { name: "بازار" }).click();
    await page.getByLabel(/^مقدار/).fill("0.01");
    await page.getByTestId("submit-order").click();
    await expect(page.getByText("سفارش بازار در شبیه‌سازی اجرا شد")).toBeVisible();
  });
});
