import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.TEST_PORT ?? 3471);
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 1,
  workers: 2,
  reporter: [["list"]],
  use: { baseURL, trace: "retain-on-failure", locale: "fa-IR", timezoneId: "Asia/Tehran" },
  // Production build is served by `next start` (build first: npm run build). Skipped when BASE_URL targets a remote site.
  webServer: process.env.BASE_URL ? undefined : { command: `npx next start -p ${port}`, url: `${baseURL}/api/health`, reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, testIgnore: /mobile/ },
    { name: "mobile", use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } }, testMatch: /mobile/ },
  ],
});
