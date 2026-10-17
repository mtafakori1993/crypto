import { expect, test } from "@playwright/test";
import { readAccount, ready } from "./helpers";

test.describe("account & preferences", () => {
  test("theme switch persists across reloads (no flash: attribute set before paint)", async ({ page }) => {
    await page.goto("/account");
    await ready(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: "تغییر به حالت روشن" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(241, 244, 249)");
  });

  test("profile, notification preferences, demo login/register and reset", async ({ page }) => {
    await page.goto("/register");
    await ready(page);
    await page.getByLabel("نام نمایشی (فرضی)").fill("معامله‌گر آزمون");
    await page.getByRole("button", { name: "ساخت حساب و ورود" }).click();
    await expect(page.getByText("برای ادامه، آگاهی")).toBeVisible();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "ساخت حساب و ورود" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    expect((await readAccount(page)).profile.name).toBe("معامله‌گر آزمون");
    await page.goto("/account");
    await page.getByRole("tab", { name: "اعلان‌ها" }).click();
    await page.getByRole("switch", { name: "اعلان اجرای سفارش‌ها" }).click();
    expect((await readAccount(page)).prefs.notifyOrders).toBe(false);
    await page.getByRole("tab", { name: "شبیه‌سازی" }).click();
    await page.getByRole("button", { name: "بازنشانی حساب نمونه" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "بازنشانی" }).click();
    expect((await readAccount(page)).prefs.notifyOrders).toBe(true);
  });

  test("login page offers a demo session only (no password inputs) and forgot-password is informational", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await page.getByTestId("demo-login").click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/forgot-password");
    await page.getByRole("button", { name: "ثبت درخواست نمونه" }).click();
    await expect(page.getByRole("status")).toContainText("ایمیلی ارسال نشد");
  });

  test("notifications menu lists items and marks them read", async ({ page }) => {
    await page.goto("/dashboard");
    await ready(page);
    await page.getByRole("button", { name: /اعلان‌ها/ }).click();
    await expect(page.getByRole("dialog", { name: "اعلان‌ها" })).toContainText("خوش آمدید");
    await page.getByRole("button", { name: /علامت‌گذاری همه/ }).click();
    await expect(page.getByRole("button", { name: "اعلان‌ها", exact: true })).toBeVisible();
  });

  test("simulation disclosure page", async ({ page }) => {
    await page.goto("/simulation");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("شبیه‌سازی");
    await expect(page.getByText("اتصال به هیچ صرافی")).toBeVisible();
  });
});
