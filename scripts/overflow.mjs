// Dev helper: lists elements that stick out of the viewport. usage: node scripts/overflow.mjs <url> <width>
import { chromium } from "@playwright/test";
const [,, url, w = "320"] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
const out = await p.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width && (r.right > vw + 1 || r.left < -1)) bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} L${Math.round(r.left)} R${Math.round(r.right)}`);
  }
  return { vw, sw: document.documentElement.scrollWidth, bad: bad.slice(0, 12) };
});
console.log(JSON.stringify(out, null, 1));
await b.close();
