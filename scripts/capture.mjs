#!/usr/bin/env node
// Real screenshots from the running app (BASE_URL, default http://localhost:3472). Performs only simulated actions.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = process.env.BASE_URL ?? "http://localhost:3472";
const OUT = path.join(ROOT, "artifacts/screenshots");
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "fa-IR", timezoneId: "Asia/Tehran", deviceScaleFactor: 1 });
const p = await ctx.newPage();
const go = async (u) => { await p.goto(BASE + u, { waitUntil: "networkidle" }); await p.waitForTimeout(1200); };
const shot = (n, o = {}) => p.screenshot({ path: path.join(OUT, n + ".png"), ...o });

await go("/"); await shot("desktop-home"); await shot("desktop-home-full", { fullPage: true });
await go("/markets"); await shot("markets");

// populate simulated activity
await go("/trade/BTC-USDT");
await p.getByRole("tab", { name: "بازار" }).click();
await p.getByLabel(/^مقدار/).fill("0.05");
await p.getByTestId("submit-order").click(); await p.getByTestId("confirm-order").click(); await p.waitForTimeout(600);
await p.getByRole("tab", { name: "حدی" }).click();
const bid = (await (await p.request.get(BASE + "/api/market/tickers")).json()).tickers.find((t) => t.pair === "BTC-USDT").bid;
await p.getByLabel(/^قیمت/).fill(String(Math.round(bid * 0.97)));
await p.getByLabel(/^مقدار/).fill("0.1");
await p.getByTestId("submit-order").click(); await p.getByTestId("confirm-order").click(); await p.waitForTimeout(1500);
await go("/trade/ETH-USDT"); // keep state
await go("/trade/BTC-USDT");
await shot("trading-terminal");
await sharp(path.join(OUT, "trading-terminal.png")).webp({ quality: 82 }).toFile(path.join(ROOT, "public/media/terminal-preview.webp"));
await p.getByRole("tab", { name: "بازار" }).click();
await go("/portfolio"); await shot("portfolio-dashboard");
await go("/dashboard"); await shot("dashboard");
await go("/wallet");
await p.getByTestId("deposit-form").getByLabel("مقدار").fill("1500");
await p.getByTestId("deposit-submit").click(); await p.waitForTimeout(7500);
await shot("asset-management", { fullPage: true });
await go("/orders"); await shot("order-history");

const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "fa-IR", timezoneId: "Asia/Tehran" });
const mp = await m.newPage();
await mp.goto(BASE + "/", { waitUntil: "networkidle" }); await mp.waitForTimeout(1000);
await mp.screenshot({ path: path.join(OUT, "mobile-home.png") });
await mp.goto(BASE + "/trade/BTC-USDT", { waitUntil: "networkidle" }); await mp.waitForTimeout(1500);
await mp.screenshot({ path: path.join(OUT, "mobile-trading.png") });
await b.close();
for (const f of fs.readdirSync(OUT)) { const md = await sharp(path.join(OUT, f)).metadata(); console.log(f, md.width + "x" + md.height); }
