import { expect, test } from "@playwright/test";
import { ready } from "./helpers";

test.describe("mobile experience", () => {
  test("bottom navigation replaces sidebar and navigates", async ({ page }) => {
    await page.goto("/dashboard");
    await ready(page);
    await expect(page.getByRole("navigation", { name: "ناوبری موبایل" })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "ناوبری اصلی" })).toBeHidden();
    await page.getByRole("navigation", { name: "ناوبری موبایل" }).getByRole("link", { name: "بازارها" }).click();
    await expect(page).toHaveURL(/\/markets/);
    // touch targets
    const box = await page.getByRole("navigation", { name: "ناوبری موبایل" }).getByRole("link").first().boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("mobile terminal: chart / order book / trades via tabs, order form reachable", async ({ page }) => {
    await page.goto("/trade/BTC-USDT");
    await ready(page);
    await expect(page.getByTestId("price-chart")).toBeVisible();
    await expect(page.getByTestId("order-book")).toBeHidden();
    await page.getByRole("tab", { name: "دفتر سفارش" }).click();
    await expect(page.getByTestId("order-book")).toBeVisible();
    await page.getByRole("tab", { name: "معاملات اخیر" }).click();
    await expect(page.getByTestId("recent-trades")).toBeVisible();
    await expect(page.getByTestId("order-form")).toBeVisible();
    await page.getByRole("tab", { name: "بازار" }).click();
    await page.getByLabel(/^مقدار/).fill("0.01");
    await page.getByTestId("submit-order").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByTestId("confirm-order").click();
    await expect(page.getByText("سفارش بازار در شبیه‌سازی اجرا شد")).toBeVisible();
  });

  test("landing mobile menu opens and links work", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "باز کردن منو" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "بازارها" }).click();
    await expect(page).toHaveURL(/\/markets/);
  });
});

