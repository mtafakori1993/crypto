import { expect, test } from "@playwright/test";

const WIDTHS = [320, 375, 390, 768, 1024, 1440, 1920];
const ROUTES = ["/", "/markets", "/trade/BTC-USDT", "/dashboard", "/portfolio", "/wallet", "/orders", "/account", "/login", "/simulation"];

test.describe("responsive layout", () => {
  for (const w of WIDTHS) {
    test(`no horizontal page overflow at ${w}px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      for (const r of ROUTES) {
        await page.goto(r);
        await page.waitForLoadState("networkidle");
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${r} @${w}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

