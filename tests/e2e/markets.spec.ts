import { expect, test } from "@playwright/test";
import { ready } from "./helpers";

test.describe("market explorer", () => {
  test("search by Persian name and symbol, empty state and clear", async ({ page }) => {
    await page.goto("/markets");
    await ready(page);
    const rows = page.locator("tbody tr");
    const total = await rows.count();
    expect(total).toBeGreaterThanOrEqual(12);
    await page.getByLabel("جست‌وجو در بازارها").fill("اتریوم");
    await expect(rows).toHaveCount(2); // ETH/USDT + ETH/IRT
    await page.getByLabel("جست‌وجو در بازارها").fill("sol");
    await expect(rows).toHaveCount(1);
    await page.getByLabel("جست‌وجو در بازارها").fill("zzzz");
    await expect(page.getByText("نتیجه‌ای پیدا نشد")).toBeVisible();
    await page.getByRole("button", { name: "پاک‌کردن فیلترها" }).click();
    await expect(rows).toHaveCount(total);
  });

  test("sorting toggles aria-sort and reorders by 24h change", async ({ page }) => {
    await page.goto("/markets");
    await page.getByRole("button", { name: /تغییر ۲۴س/ }).click();
    const th = page.getByRole("columnheader", { name: /تغییر ۲۴س/ });
    await expect(th).toHaveAttribute("aria-sort", "descending");
    const read = async () => (await page.locator("tbody tr td:nth-child(4)").allTextContents()).map((t) => Number(t.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/٫/g, ".").replace(/−/g, "-").replace(/[^\d.\-]/g, "")));
    const desc = await read();
    expect([...desc].sort((a, b) => b - a)).toEqual(desc);
    await page.getByRole("button", { name: /تغییر ۲۴س/ }).click();
    const asc = await read();
    expect([...asc].sort((a, b) => a - b)).toEqual(asc);
  });

  test("category filter and quote filter", async ({ page }) => {
    await page.goto("/markets");
    await page.getByRole("button", { name: "میم" }).click();
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page.getByRole("button", { name: "همه", exact: true }).click();
    await page.getByLabel("ارز مبنا").selectOption("IRT");
    await expect(page.locator("tbody tr")).toHaveCount(3);
  });

  test("watchlist: add, appears on dashboard, remove; navigation to trade", async ({ page }) => {
    await page.goto("/markets");
    await ready(page);
    const star = page.getByRole("button", { name: "نشان‌کردن XRP/USDT" });
    await star.click();
    await expect(page.getByRole("button", { name: "حذف XRP/USDT از نشان‌شده‌ها" })).toBeVisible();
    await page.getByRole("button", { name: "نشان‌شده‌ها", exact: true }).click();
    await expect(page.locator("tbody tr")).toHaveCount(5);
    await page.goto("/dashboard");
    await expect(page.getByTestId("watchlist").getByText("XRP").first()).toBeVisible();
    await page.getByRole("button", { name: "حذف XRP/USDT از لیست پیگیری" }).click();
    await expect(page.getByTestId("watchlist").getByText("XRP")).toHaveCount(0);
    await page.goto("/markets");
    await page.locator("tbody tr").first().getByRole("link").first().click();
    await expect(page).toHaveURL(/\/trade\/[A-Z]+-[A-Z]+/);
  });

  test("asset detail page and 404s", async ({ page }) => {
    const ok = await page.goto("/markets/BTC");
    expect(ok?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("بیت‌کوین");
    await expect(page.getByTestId("price-chart")).toHaveAttribute("data-ready", "true");
    expect((await page.goto("/markets/FOO"))?.status()).toBe(404);
    expect((await page.goto("/trade/FOO-USDT"))?.status()).toBe(404);
  });
});
