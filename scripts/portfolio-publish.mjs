#!/usr/bin/env node
/**
 * Registers SHOMAAA CRYPTO as linked Persian + English "tp_project" entries on tafakorpardazan.ir (WordPress REST API).
 * Credentials come from the environment only (never committed):
 *   PORTFOLIO_USER=… PORTFOLIO_APP_PASSWORD="xxxx xxxx …" node scripts/portfolio-publish.mjs [--publish]
 * Idempotent (media reused by slug, projects updated by slug). Default status: draft.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SITE = process.env.PORTFOLIO_SITE ?? "https://tafakorpardazan.ir";
const AUTH = "Basic " + Buffer.from(`${process.env.PORTFOLIO_USER}:${process.env.PORTFOLIO_APP_PASSWORD}`).toString("base64");
const STATUS = process.argv.includes("--publish") ? "publish" : "draft";
if (!process.env.PORTFOLIO_USER || !process.env.PORTFOLIO_APP_PASSWORD) { console.error("PORTFOLIO_USER / PORTFOLIO_APP_PASSWORD required"); process.exit(1); }

async function api(p, init = {}, tries = 4) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(`${SITE}/wp-json${p}`, { ...init, headers: { Authorization: AUTH, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(120_000) });
      const text = await r.text();
      const json = text ? JSON.parse(text.slice(Math.min(...["{", "["].map((c) => text.indexOf(c)).filter((x) => x >= 0)))) : null;
      if (!r.ok) throw Object.assign(new Error(`${r.status} ${json?.message ?? ""}`), { status: r.status });
      return json;
    } catch (e) { last = e; if (e.status && e.status < 500) break; await new Promise((r) => setTimeout(r, 2000 * i)); }
  }
  throw last;
}
const post = (p, o) => api(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(o) });

const images = [
  { src: "artifacts/mockups/portfolio-cover.png", name: "shomaaa-crypto-cover", alt: { fa: "ماکاپ رابط صرافی ارز دیجیتال شوما کریپتو روی لپ‌تاپ و موبایل", en: "SHOMAAA CRYPTO exchange interface mockup on laptop and phones" }, w: 1600 },
  { src: "artifacts/screenshots/desktop-home.png", name: "shomaaa-crypto-home", alt: { fa: "صفحه اصلی شوما کریپتو", en: "SHOMAAA CRYPTO landing page" }, w: 1440 },
  { src: "artifacts/screenshots/markets.png", name: "shomaaa-crypto-markets", alt: { fa: "صفحه بازارها با جست‌وجو، مرتب‌سازی و لیست پیگیری", en: "Markets explorer with search, sorting and watchlist" }, w: 1440 },
  { src: "artifacts/screenshots/trading-terminal.png", name: "shomaaa-crypto-terminal", alt: { fa: "ترمینال معاملاتی با نمودار شمعی، دفتر سفارش و فرم سفارش", en: "Trading terminal with candlestick chart, order book and order form" }, w: 1440 },
  { src: "artifacts/screenshots/portfolio-dashboard.png", name: "shomaaa-crypto-portfolio", alt: { fa: "پرتفوی و تخصیص دارایی", en: "Portfolio and asset allocation" }, w: 1440 },
  { src: "artifacts/screenshots/asset-management.png", name: "shomaaa-crypto-wallet", alt: { fa: "کیف پول: واریز، برداشت و انتقال شبیه‌سازی‌شده", en: "Wallet: simulated deposit, withdrawal and transfer" }, w: 1440 },
  { src: "artifacts/screenshots/order-history.png", name: "shomaaa-crypto-orders", alt: { fa: "سفارش‌ها و تاریخچه معاملات", en: "Orders and trade history" }, w: 1440 },
  { src: "artifacts/mockups/mobile-mockup.png", name: "shomaaa-crypto-mobile", alt: { fa: "نسخه موبایل صفحه اصلی و ترمینال", en: "Mobile home and trading terminal" }, w: 1400 },
];
async function uploadImage(img) {
  const found = await api(`/wp/v2/media?search=${img.name}&per_page=20&_fields=id,source_url,slug`);
  const hit = found.find((m) => m.slug === img.name);
  if (hit) return hit;
  const buf = await sharp(path.join(ROOT, img.src)).resize({ width: img.w, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
  const media = await api("/wp/v2/media", { method: "POST", headers: { "Content-Type": "image/webp", "Content-Disposition": `attachment; filename="${img.name}.webp"` }, body: buf });
  await post(`/wp/v2/media/${media.id}`, { alt_text: img.alt.fa, title: img.alt.fa });
  return { id: media.id, source_url: media.source_url };
}
const media = {};
for (const img of images) { media[img.name] = await uploadImage(img); console.log("media", img.name, media[img.name].id); }
const byName = Object.fromEntries(images.map((i) => [i.name, i]));
const fig = (n, lang) => `<figure style="margin:0"><img src="${media[n].source_url}" alt="${byName[n].alt[lang]}" loading="lazy" style="width:100%;height:auto;display:block;border-radius:18px;border:1px solid rgba(150,170,200,.18);box-shadow:0 18px 40px -18px rgba(0,0,0,.7)"/></figure>`;
const btn = (label) => `<!-- wp:html -->\n<p style="margin-block:24px"><a href="https://crypto.shomaaa.ir" target="_blank" rel="noopener" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#22c7b8;color:#04201d;font-weight:700;text-decoration:none">${label}</a></p>\n<!-- /wp:html -->`;
const h = (t) => `<!-- wp:heading -->\n<h2>${t}</h2>\n<!-- /wp:heading -->`;
const p = (t) => `<!-- wp:paragraph -->\n<p>${t}</p>\n<!-- /wp:paragraph -->`;
const ul = (items) => `<!-- wp:list -->\n<ul class="wp-block-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>\n<!-- /wp:list -->`;
const shots = (names, lang) => `<!-- wp:html -->\n<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-block:24px">${names.map((n) => fig(n, lang)).join("")}</div>\n<!-- /wp:html -->`;

const CONTENT = {
  fa: [
    btn("مشاهده پروژه: crypto.shomaaa.ir"),
    p("«شوما کریپتو» (SHOMAAA CRYPTO) یک <strong>رابط کاربری شبیه‌سازی‌شده</strong> برای یک صرافی ارز دیجیتال است: ترمینال معاملاتی، بازارها، پرتفوی، کیف پول و تنظیمات حساب، با موتور داده نمونه (Mock) و بدون هیچ معامله، نگهداری دارایی یا پرداخت واقعی."),
    shots(["shomaaa-crypto-cover"], "fa"),
    h("اهداف محصول"),
    ul(["طراحی یک پلتفرم معاملاتی فارسی و راست‌چین با ظاهر و رفتار یک محصول مالی حرفه‌ای", "تراکم اطلاعات مناسب برای معامله‌گر: نمودار، دفتر سفارش، معاملات اخیر و فرم سفارش در یک نگاه", "داده‌های منسجم: قیمت‌ها، موجودی‌ها و سفارش‌ها در تمام صفحات یکسان و قابل مطابقت", "صداقت در نمایش: محیط شبیه‌سازی‌شده با موجودی فرضی، بدون ادعای معامله یا نگهداری واقعی"]),
    h("رویکرد طراحی"),
    p("هویت بصری اصلی (نشان شش‌ضلعی با شمع‌های قیمتی، پالت سرمه‌ای/فیروزه‌ای، سبز و قرمز برای تغییرات) از ابتدا طراحی شد. سیستم طراحی با الهام از نظم Adobe Spectrum و به‌صورت سفارشی پیاده شد: شبکه ۴ پیکسلی، توکن‌های رنگ برای تم تیره و روشن، حلقه فوکوس ۲ پیکسلی و دیالوگ‌ها و تب‌های دسترس‌پذیر (بسته Spectrum نصب نشده است). فونت وزیر به‌صورت محلی بارگذاری می‌شود."),
    shots(["shomaaa-crypto-home", "shomaaa-crypto-markets", "shomaaa-crypto-terminal"], "fa"),
    h("قابلیت‌ها"),
    ul(["ترمینال معاملاتی: نمودار شمعی (۱ دقیقه تا ۱ روز) با کراس‌هیر، دفتر سفارش با عمق تجمعی و اسپرد، معاملات اخیر", "فرم سفارش بازار و حدی با پیش‌نمایش کارمزد، مرحله تأیید و وضعیت‌های روشن؛ سفارش حدی تا عبور قیمت شبیه‌سازی‌شده «در انتظار» می‌ماند و موجودی آن قفل می‌شود", "بازارها: ۱۴ جفت‌ارز، جست‌وجو با نماد یا نام فارسی، دسته‌بندی، مرتب‌سازی و لیست پیگیری", "پرتفوی: ارزش کل به تتر و تومان، نمودار تخصیص و تطبیق موجودی با دفتر ثبت تراکنش‌ها", "کیف پول: واریز، برداشت و انتقال داخلی نمونه با شناسه‌های SIM (بدون نشانی واقعی و بدون تراکنش زنجیره‌ای)", "حساب: ورود نمونه بدون رمز عبور، تنظیمات اعلان، تم، امنیت (نمایشی) و بازنشانی شبیه‌سازی"]),
    shots(["shomaaa-crypto-portfolio", "shomaaa-crypto-wallet", "shomaaa-crypto-orders"], "fa"),
    h("معماری فنی"),
    p("یک برنامه Next.js 16 (App Router، خروجی standalone) با React 19 و TypeScript سخت‌گیر، Tailwind CSS 4 و نمودار lightweight-charts که فقط در صفحات معاملاتی و به‌صورت lazy بارگذاری می‌شود. موتور داده یک تابع قطعی از زمان است (بدون Math.random): تیکر، آمار ۲۴ ساعته، شمع‌ها، دفتر سفارش، معاملات و ارزش‌گذاری پرتفوی همگی از آن مشتق می‌شوند. موتور حساب (سفارش، قفل موجودی، کارمزد ۰٫۱٪، دفتر کل) به‌صورت توابع خالص نوشته شده و از طریق route handlerها و یک رابط سرویس قابل جایگزینی با بک‌اند واقعی است. وضعیت حساب نمونه فقط در localStorage مرورگر نگه‌داری می‌شود و به‌عنوان دفتر کل امن در نظر گرفته نشده است."),
    h("واکنش‌گرایی، دسترس‌پذیری و کارایی"),
    ul(["بدون سرریز افقی از ۳۲۰ تا ۱۹۲۰ پیکسل (تست خودکار)؛ ناوبری پایین و ترمینال تب‌دار در موبایل", "فوکوس قابل‌مشاهده، برچسب برای همه ورودی‌ها، دیالوگ با تله فوکوس و بستن با Esc، تم تیره و روشن", "به‌روزرسانی قیمت هر ۳ ثانیه و فقط وقتی تب فعال است؛ بدون وابستگی به API بازار", "۱۲ تست واحد (موتور و مدل داده) و ۴۶ تست انتها‌به‌انتها با Playwright"]),
    h("استقرار"),
    p("استقرار دستی روی k3s تفکر پردازان (Traefik و گواهی Let’s Encrypt)، یک پاد کوچک بدون پایگاه‌داده؛ مخزن در GitLab داخلی و بدون CI/CD."),
    h("شفافیت درباره شبیه‌سازی"),
    p("این پروژه یک رابط شبیه‌سازی‌شده با موتور داده نمونه است. قیمت‌ها، حجم‌ها، موجودی‌ها و سفارش‌ها فرضی‌اند؛ معامله واقعی، نقدینگی، کاربر، نگهداری دارایی، واریز یا برداشت واقعی وجود ندارد و هیچ ادعایی درباره مجوز یا ذخایر مطرح نشده است."),
    h("مشخصات"),
    ul(["وب‌سایت: <a href=\"https://crypto.shomaaa.ir\" target=\"_blank\" rel=\"noopener\">https://crypto.shomaaa.ir</a>", "زبان: فارسی (راست‌چین) · طراحی: واکنش‌گرا", "طراحی و توسعه: تفکر پردازان — <a href=\"https://tafakorpardazan.ir\">tafakorpardazan.ir</a>"]),
    shots(["shomaaa-crypto-mobile"], "fa"),
    btn("مشاهده پروژه"),
  ].join("\n\n"),
  en: [
    btn("View the project: crypto.shomaaa.ir"),
    p("SHOMAAA CRYPTO is a <strong>simulated cryptocurrency exchange interface</strong>: trading terminal, markets, portfolio, wallet and account settings, powered by a mock-data engine, with no real trading, custody or payments."),
    shots(["shomaaa-crypto-cover"], "en"),
    h("Product objectives"),
    ul(["A Persian, right-to-left trading platform that looks and behaves like a professional financial product", "Information density for traders: chart, order book, recent trades and order form at a glance", "Coherent data: prices, balances and orders agree on every page and reconcile with a ledger", "Honest presentation: a simulated environment with fictional balances and no claim of real trading or custody"]),
    h("Design approach"),
    p("The identity (a hexagon mark with price candles, a navy/teal palette, green and red for change) was designed from scratch. The design system follows the discipline of Adobe Spectrum as a compatible custom implementation: a 4px grid, colour tokens for dark and light themes, a 2px focus ring, and accessible dialogs and tabs. Spectrum packages are not installed. The Vazir font is bundled locally."),
    shots(["shomaaa-crypto-home", "shomaaa-crypto-markets", "shomaaa-crypto-terminal"], "en"),
    h("Features"),
    ul(["Terminal: candlestick chart (1m–1d) with crosshair, order book with cumulative depth and spread, recent trades", "Market and limit orders with fee preview and a confirmation step; a limit order stays pending (funds locked) until the simulated price crosses it", "Markets: 14 pairs, search by symbol or Persian name, categories, sorting and a watchlist", "Portfolio: total value in USDT and toman, allocation chart, ledger reconciliation", "Wallet: simulated deposit, withdrawal and internal transfer with SIM identifiers (no real addresses, no on-chain transactions)", "Account: password-less demo session, notification, theme and security (illustrative) settings, simulation reset"]),
    shots(["shomaaa-crypto-portfolio", "shomaaa-crypto-wallet", "shomaaa-crypto-orders"], "en"),
    h("Technical architecture"),
    p("A single Next.js 16 application (App Router, standalone output) with React 19, strict TypeScript, Tailwind CSS 4 and lightweight-charts, lazy-loaded on trading pages only. The market engine is a deterministic function of time (no Math.random): tickers, 24h stats, candles, order book, trades and portfolio valuation all derive from it. The account engine (orders, fund locking, 0.1% fee, ledger) is written as pure functions exposed through route handlers behind a service interface that a real backend could replace. Simulation state lives in the browser’s localStorage only and is not treated as a secure ledger."),
    h("Responsive design, accessibility and performance"),
    ul(["No horizontal overflow from 320px to 1920px (automated); bottom navigation and a tabbed terminal on mobile", "Visible focus, labelled inputs, dialogs with focus trap and Esc to close, dark and light themes", "Prices refresh every 3 seconds and only while the tab is visible; no third-party market API", "12 unit tests (engine and market model) and 46 Playwright end-to-end tests"]),
    h("Deployment"),
    p("Manually deployed on Tafakor Pardazan’s k3s cluster (Traefik, Let’s Encrypt): one small stateless pod and no database. The repository is on the internal GitLab, with no CI/CD."),
    h("Simulation disclosure"),
    p("This is a simulated interface with a mock-data engine. Prices, volumes, balances and orders are fictional; there is no real trading, liquidity, users, custody, deposits or withdrawals, and no claim of licensing or reserves."),
    h("Project details"),
    ul(["Website: <a href=\"https://crypto.shomaaa.ir\" target=\"_blank\" rel=\"noopener\">https://crypto.shomaaa.ir</a>", "Language: Persian (RTL) · Design: responsive", "Designed and developed by Tafakor Pardazan — <a href=\"https://tafakorpardazan.ir/en/home/\">tafakorpardazan.ir</a>"]),
    shots(["shomaaa-crypto-mobile"], "en"),
    btn("View the project"),
  ].join("\n\n"),
};
const TECH = { fa: [218, 202, 204, 214, 210, 208, 375, 339], en: [295, 249, 257, 289, 255, 245, 392, 348] };
const META = {
  fa: { title: "رابط کاربری صرافی ارز دیجیتال؛ پلتفرم معاملاتی مدرن", slug: "crypto-exchange-ui", cat: [269], excerpt: "رابط شبیه‌سازی‌شده یک صرافی ارز دیجیتال با ترمینال معاملاتی، بازارها، پرتفوی و کیف پول؛ فارسی و راست‌چین، با موتور داده نمونه و بدون معامله یا نگهداری دارایی واقعی." },
  en: { title: "Modern Cryptocurrency Exchange Interface", slug: "modern-cryptocurrency-exchange-interface", cat: [224], excerpt: "A simulated cryptocurrency exchange interface with a trading terminal, markets, portfolio and wallet: Persian RTL, mock-data engine, no real trading or custody." },
};
const ids = {};
for (const lang of ["fa", "en"]) {
  const m = META[lang];
  const body = { title: m.title, slug: m.slug, status: STATUS, excerpt: m.excerpt, content: CONTENT[lang], featured_media: media["shomaaa-crypto-cover"].id, tp_project_category: m.cat, tp_technology: TECH[lang] };
  const existing = await api(`/wp/v2/tp_project?slug=${m.slug}&status=any&context=edit&_fields=id`);
  const res = existing.length ? await post(`/wp/v2/tp_project/${existing[0].id}`, body) : await post(`/wp/v2/tp_project?lang=${lang}`, body);
  ids[lang] = res.id;
  console.log(lang, res.id, res.status, res.link);
}
await post("/tp/v1/translations", { kind: "post", translations: ids });
for (const lang of ["fa", "en"]) console.log("final", lang, JSON.stringify(await api(`/wp/v2/tp_project/${ids[lang]}?context=edit&_fields=id,status,link,lang`)));
