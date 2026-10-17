import { expect, test } from "@playwright/test";
import { ready } from "./helpers";

test.describe("keyboard & a11y basics", () => {
  test("skip link, labelled inputs and dialog focus trap", async ({ page }) => {
    await page.goto("/trade/BTC-USDT");
    await ready(page);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "پرش به محتوای اصلی" })).toBeFocused();
    const unlabeled = await page.evaluate(() => [...document.querySelectorAll("input,select")].filter((el) => { const i = el as HTMLInputElement; return !i.labels?.length && !i.getAttribute("aria-label"); }).length);
    expect(unlabeled).toBe(0);
    await page.getByRole("tab", { name: "بازار" }).click();
    await page.getByLabel(/^مقدار/).fill("0.01");
    await page.getByTestId("submit-order").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
