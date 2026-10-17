import { expect, type Page } from "@playwright/test";

const FA = "۰۱۲۳۴۵۶۷۸۹";
/** Persian text -> number (handles ٬ grouping and ٫ decimal separators, − sign). */
export function num(text: string): number {
  const t = text
    .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
    .replace(/[٬,،\s]/g, "")
    .replace(/٫/g, ".")
    .replace(/−/g, "-");
  const m = t.match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : NaN;
}
export async function ready(page: Page) {
  // account store hydrates from localStorage after mount
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await page.waitForFunction(() => !!localStorage.getItem("shomaaa-sim-account-v1"));
}
export async function readAccount(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("shomaaa-sim-account-v1") ?? "null"));
}
