import { expect, test } from "@playwright/test";
import { num, readAccount, ready } from "./helpers";

test.describe("portfolio", () => {
  test("totals reconcile with holdings and the API valuation", async ({ page }) => {
    await page.goto("/portfolio");
    await ready(page);
    await expect(page.getByTestId("holdings")).toBeVisible();
    const acc = await readAccount(page);
    const res = await page.request.post("/api/portfolio", { data: { account: acc } });
    const j = await res.json();
    expect(j.reconciled).toBe(true);
    const sum = j.summary.rows.reduce((s: number, r: { valueUsdt: number }) => s + r.valueUsdt, 0);
    expect(sum).toBeCloseTo(j.summary.totalUsdt, 4);
    expect(j.summary.availableUsdt + j.summary.lockedUsdt).toBeCloseTo(j.summary.totalUsdt, 4);
    const shares = j.summary.rows.reduce((s: number, r: { share: number }) => s + r.share, 0);
    expect(shares).toBeCloseTo(1, 6);
    // UI total is within a rounding step of the API total (prices tick every 3s -> compare order of magnitude)
    const ui = num(await page.getByTestId("total-value").innerText());
    expect(Math.abs(ui - j.summary.totalUsdt) / j.summary.totalUsdt).toBeLessThan(0.01);
    await expect(page.getByTestId("allocation")).toBeVisible();
    await expect(page.locator('[data-asset="BTC"]')).toBeVisible();
  });
});

test.describe("wallet simulation", () => {
  test("deposit becomes pending then completes in simulation; balances and history agree", async ({ page }) => {
    await page.goto("/wallet");
    await ready(page);
    await page.getByTestId("deposit-form").getByLabel("مقدار").fill("500");
    await page.getByTestId("deposit-submit").click();
    await expect(page.getByTestId("transfer-row").first()).toContainText("در انتظار (شبیه‌سازی)");
    expect((await readAccount(page)).balances.USDT.free).toBe(25000);
    await expect(page.getByTestId("transfer-row").first()).toContainText("تکمیل‌شده (شبیه‌سازی)", { timeout: 20_000 });
    const acc = await readAccount(page);
    expect(acc.balances.USDT.free).toBe(25500);
    expect(acc.transfers[0].id).toMatch(/^SIM-DEP-/);
    await expect(page.getByTestId("sim-deposit-id")).toContainText("SIM-DEP");
  });

  test("withdraw: insufficient balance rejected, valid withdraw deducts amount + fee", async ({ page }) => {
    await page.goto("/wallet");
    await ready(page);
    await page.getByRole("tab", { name: /برداشت/ }).click();
    const form = page.getByTestId("withdraw-form");
    await form.getByLabel("مقدار").fill("99999");
    await page.getByTestId("withdraw-submit").click();
    await expect(form.getByText(/موجودی کافی نیست/)).toBeVisible();
    await form.getByLabel("مقدار").fill("100");
    await page.getByTestId("withdraw-submit").click();
    await expect(page.getByTestId("transfer-row").first()).toContainText("برداشت");
    const acc = await readAccount(page);
    expect(acc.balances.USDT.free).toBe(24899);
    expect(acc.transfers[0].destination).toMatch(/^SIM-ADDR-/);
  });

  test("internal transfer validates the simulated account ID", async ({ page }) => {
    await page.goto("/wallet");
    await ready(page);
    await page.getByRole("tab", { name: /انتقال داخلی/ }).click();
    const form = page.getByTestId("transfer-form");
    await form.getByLabel("شناسه حساب نمونه مقصد").fill("abc");
    await form.getByLabel("مقدار").fill("10");
    await page.getByTestId("transfer-submit").click();
    await expect(form.getByText(/SIM-123456/)).toBeVisible();
    await form.getByLabel("شناسه حساب نمونه مقصد").fill("SIM-482913");
    await page.getByTestId("transfer-submit").click();
    await expect(page.getByTestId("transfer-row").first()).toContainText("انتقال داخلی");
    expect((await readAccount(page)).balances.USDT.free).toBe(24990);
  });
});

test.describe("dashboard & orders pages", () => {
  test("dashboard shows empty activity then activity after a trade", async ({ page }) => {
    await page.goto("/dashboard");
    await ready(page);
    await expect(page.getByText("فعالیتی ثبت نشده")).toBeVisible();
    await page.goto("/trade/SOL-USDT");
    await ready(page);
    await page.getByRole("tab", { name: "بازار" }).click();
    await page.getByLabel(/^مقدار/).fill("1");
    await page.getByTestId("submit-order").click();
    await page.getByTestId("confirm-order").click();
    await expect(page.getByText("سفارش بازار در شبیه‌سازی اجرا شد")).toBeVisible();
    await page.goto("/dashboard");
    await expect(page.getByTestId("activity")).toContainText("SOL/USDT");
    await page.goto("/orders");
    await page.getByRole("tab", { name: /تاریخچه معاملات/ }).click();
    await expect(page.getByTestId("trade-row")).toHaveCount(1);
  });
});
