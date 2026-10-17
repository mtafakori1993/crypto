#!/usr/bin/env node
// Device-frame mockups composed from REAL screenshots (artifacts/screenshots) — no fabricated UI.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const S = (n) => `data:image/png;base64,${fs.readFileSync(path.join(ROOT, "artifacts/screenshots", n)).toString("base64")}`;
const V = (f) => fs.readFileSync(path.join(ROOT, "src/fonts", f)).toString("base64");
const css = `<style>@font-face{font-family:V;src:url(data:font/woff2;base64,${V("Vazir-Bold.woff2")}) format('woff2');font-weight:700}@font-face{font-family:VR;src:url(data:font/woff2;base64,${V("Vazir.woff2")}) format('woff2')}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(900px 500px at 80% 0%,#12394a 0%,#0a111f 60%);font-family:VR;color:#e8edf7;overflow:hidden;position:relative}
.laptop{position:absolute}.lid{background:#05080f;border:2px solid #2a3550;border-radius:18px 18px 6px 6px;padding:14px 14px 10px;box-shadow:0 40px 80px -20px #000}
.lid img{display:block;width:100%;border-radius:6px}.base{height:16px;background:linear-gradient(#2a3550,#141b2d);border-radius:0 0 22px 22px;margin:0 -40px}
.phone{position:absolute;background:#05080f;border:3px solid #2a3550;border-radius:44px;padding:10px;box-shadow:0 40px 80px -20px #000}.phone img{display:block;width:100%;border-radius:34px}
.t{position:absolute;direction:rtl;text-align:right}.t h1{font-family:V;margin:0;font-size:46px;line-height:1.5}.t h1 em{font-style:normal;color:#5ee0d3}.t p{margin:12px 0 0;color:#94a3bf;font-size:22px;line-height:1.9}
.n{display:inline-block;margin-top:18px;border:1px solid rgba(240,185,77,.5);color:#f0b94d;padding:5px 16px;border-radius:99px;font-size:17px}</style>`;
const b = await chromium.launch();
const page = await b.newPage();
const render = async (html, w, h, out) => { await page.setViewportSize({ width: w, height: h }); await page.setContent(css + html); await page.evaluate(() => document.fonts.ready); await page.screenshot({ path: path.join(ROOT, "artifacts/mockups", out) }); };
fs.mkdirSync(path.join(ROOT, "artifacts/mockups"), { recursive: true });
await render(`<div class="t" style="right:560px;top:40px;width:980px"><h1>رابط کاربری صرافی <em>ارز دیجیتال</em></h1><p>پلتفرم معاملاتی مدرن با نمودار شمعی، دفتر سفارش و پرتفوی</p><span class="n">محیط شبیه‌سازی‌شده · بدون معامله واقعی</span></div>
<div class="laptop" style="left:60px;top:250px;width:940px"><div class="lid"><img src="${S("trading-terminal.png")}"></div><div class="base"></div></div>
<div class="phone" style="left:1090px;top:130px;width:230px"><img src="${S("mobile-trading.png")}"></div>
<div class="phone" style="left:1340px;top:200px;width:230px"><img src="${S("mobile-home.png")}"></div>`, 1600, 900, "portfolio-cover.png");
await render(`<div class="laptop" style="left:200px;top:70px;width:1200px"><div class="lid"><img src="${S("markets.png")}"></div><div class="base"></div></div>`, 1600, 900, "desktop-mockup.png");
await render(`<div class="phone" style="left:140px;top:60px;width:340px"><img src="${S("mobile-home.png")}"></div><div class="phone" style="left:560px;top:60px;width:340px"><img src="${S("mobile-trading.png")}"></div><div class="t" style="right:90px;top:260px;width:560px"><h1>تجربه کامل <em>موبایل</em></h1><p>ناوبری پایین، ترمینال تب‌دار و فرم سفارش در دسترس</p></div>`, 1400, 1100, "mobile-mockup.png");
await b.close();
