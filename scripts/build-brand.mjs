#!/usr/bin/env node
// Generates the logo set, favicon/app icons and the social sharing image. Fonts are embedded from src/fonts; rendering uses Playwright.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const b64 = (f) => fs.readFileSync(path.join(ROOT, "src/fonts", f)).toString("base64");
const vazirBold = b64("Vazir-Bold.woff2");
const vazir = b64("Vazir.woff2");
fs.mkdirSync(path.join(ROOT, "public/brand"), { recursive: true });

const mark = (ink = "#e8edf7") => `<path d="M20 2.5 35.2 11.2v17.6L20 37.5 4.8 28.8V11.2L20 2.5Z" fill="none" stroke="#22c7b8" stroke-width="2" stroke-linejoin="round"/><path d="M13 13v14M20 10v12M27 9v12" stroke="#5ee0d3" stroke-width="1.6" stroke-linecap="round"/><rect x="10.8" y="17" width="4.4" height="7" rx="1" fill="#2cc38b"/><rect x="17.8" y="14" width="4.4" height="6.5" rx="1" fill="#f2596b"/><rect x="24.8" y="12" width="4.4" height="6" rx="1" fill="#2cc38b"/>`;
const css = `@font-face{font-family:V;src:url(data:font/woff2;base64,${vazirBold}) format('woff2');font-weight:700}@font-face{font-family:VR;src:url(data:font/woff2;base64,${vazir}) format('woff2');font-weight:400}`;
const wordmark = (ink, sub) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 48" width="270" height="48" role="img" aria-label="SHOMAAA CRYPTO — شوما کریپتو"><title>SHOMAAA CRYPTO — شوما کریپتو</title><style>${css}</style><g transform="translate(0 3) scale(1.05)">${mark()}</g><text x="52" y="24" font-family="V,Tahoma,sans-serif" font-weight="700" font-size="19" letter-spacing="3.4" fill="${ink}">SHOMAAA</text><text x="52" y="41" font-family="VR,Tahoma,sans-serif" font-size="11" fill="${sub}"><tspan letter-spacing="4">CRYPTO</tspan> · شوما کریپتو</text></svg>`;
fs.writeFileSync(path.join(ROOT, "public/brand/logo-dark-bg.svg"), wordmark("#e8edf7", "#94a3bf"));
fs.writeFileSync(path.join(ROOT, "public/brand/logo-light-bg.svg"), wordmark("#0e1a30", "#52627f"));
fs.writeFileSync(path.join(ROOT, "public/brand/symbol.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="160" height="160">${mark()}</svg>`);
fs.writeFileSync(path.join(ROOT, "src/app/icon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#0a111f"/><g transform="translate(4 4)">${mark()}</g></svg>`);

const browser = await chromium.launch();
const page = await browser.newPage();
const shot = async (html, w, h, out) => {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out });
};
const tile = `<body style="margin:0;background:#0a111f;display:grid;place-items:center;width:512px;height:512px"><svg viewBox="0 0 40 40" width="340">${mark()}</svg></body>`;
await shot(tile, 512, 512, path.join(ROOT, "public/brand/icon-512.png"));
fs.copyFileSync(path.join(ROOT, "public/brand/icon-512.png"), path.join(ROOT, "src/app/apple-icon.png"));

const heroPath = path.join(ROOT, "public/media/hero-campaign.webp");
const hero = fs.existsSync(heroPath) ? `url(data:image/webp;base64,${fs.readFileSync(heroPath).toString("base64")})` : "none";
const og = `<style>${css}body{margin:0;width:1200px;height:630px;background:#0a111f ${hero} center/cover;display:flex;direction:rtl;overflow:hidden;font-family:V;color:#e8edf7;position:relative}
.shade{position:absolute;inset:0;background:linear-gradient(270deg,rgba(10,17,31,.96) 0%,rgba(10,17,31,.88) 52%,rgba(10,17,31,.35) 100%)}
.c{position:relative;padding:70px 76px;display:flex;flex-direction:column;justify-content:center;gap:22px;width:760px}
h1{margin:0;font-size:58px;line-height:1.5}h1 em{font-style:normal;color:#5ee0d3}p{margin:0;font-family:VR;font-size:26px;line-height:1.9;color:#94a3bf}
.b{display:flex;align-items:center;gap:16px;direction:ltr;justify-content:flex-end}.b span{font-size:30px;letter-spacing:6px}
.n{font-family:VR;font-size:20px;color:#f0b94d;border:1px solid rgba(240,185,77,.5);padding:6px 16px;border-radius:999px;align-self:flex-start}</style>
<div class="shade"></div><div class="c"><div class="b"><span>SHOMAAA CRYPTO</span><svg viewBox="0 0 40 40" width="64" height="64">${mark()}</svg></div>
<h1>رابط معاملاتی <em>مدرن</em> ارز دیجیتال</h1><p>نمودار شمعی، دفتر سفارش و پرتفوی یکپارچه با داده‌های شبیه‌سازی‌شده</p><div class="n">محیط شبیه‌سازی‌شده · بدون معامله واقعی</div></div>`;
await shot(og, 1200, 630, path.join(ROOT, "src/app/opengraph-image.png"));
await browser.close();
console.log("brand assets written");
