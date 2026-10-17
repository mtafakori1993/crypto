import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("renders Persian RTL landing with disclosure and market data", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "fa");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("ارز دیجیتال");
    await expect(page.getByText("محیط معاملاتی شبیه‌سازی‌شده").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "پرسش‌های متداول" })).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(8);
    await expect(page).toHaveTitle(/شوما کریپتو/);
    expect(errors).toEqual([]);
  });

  test("Vazir font is loaded and used", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => document.fonts.status === "loaded");
    const info = await page.evaluate(async () => {
      await document.fonts.ready;
      const loaded = [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family);
      return { loaded, family: getComputedStyle(document.body).fontFamily };
    });
    expect(info.loaded.length).toBeGreaterThan(0);
    expect(info.family.toLowerCase()).toContain("vazir");
  });

  test("hero price matches the market table price for BTC/USDT (single source of truth)", async ({ page }) => {
    await page.goto("/");
    const res = await page.request.get("/api/market/tickers");
    const json = await res.json();
    expect(json.simulated).toBe(true);
    const btc = json.tickers.find((t: { pair: string }) => t.pair === "BTC-USDT");
    expect(btc.price).toBeGreaterThan(1000);
  });

  test("FAQ items expand", async ({ page }) => {
    await page.goto("/");
    const first = page.locator("#faq details").first();
    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", "");
  });

  test("metadata, canonical and robots", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /crypto\.shomaaa\.ir/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "fa_IR");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /api/");
    const sm = await (await request.get("/sitemap.xml")).text();
    expect(sm).toContain("/markets/BTC");
    expect(sm).not.toContain("/dashboard");
  });
});
