#!/usr/bin/env node
/**
 * Small, resumable OpenRouter image batch (2 images). Cost-capped; successful items are skipped on rerun.
 *   OPENROUTER_API_KEY must be in the environment (never stored in this repo), e.g.
 *   node --env-file=/path/to/other/project/.env.local scripts/generate-images.mjs [--dry-run] [--force]
 * Output: assets-src/raw (originals) -> public/media (optimised WebP); record: generated/manifest.json (model + cost, no secrets).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const API = "https://openrouter.ai/api/v1";
const MODEL = process.env.IMAGE_MODEL || "google/gemini-nano-banana-2.1";
const MAX_COST = Number(process.env.IMAGE_MAX_COST || "0.20");
const MANIFEST = path.join(ROOT, "generated/manifest.json");
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : { items: {} };
const dry = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

const STYLE = "No text, no letters, no numbers, no logos, no real cryptocurrency symbols. Restrained premium fintech aesthetic, deep navy and charcoal palette with teal accent and subtle green/red highlights, soft depth of field, clean and minimal, high quality.";
const JOBS = [
  { key: "hero-campaign", file: "hero-campaign", aspect: "16:9", width: 1600, prompt: `Abstract wide banner for a modern trading platform: translucent glass candlestick bars rising diagonally across a dark navy space, thin teal light trails, faint grid lines, gentle bokeh. ${STYLE}` },
  { key: "empty-orders", file: "empty-orders", aspect: "1:1", width: 640, prompt: `Minimal isometric 3D illustration of an empty glass ledger tray with a single soft teal glow, floating on a dark navy gradient, calm and uncluttered, centered composition with generous empty margin. ${STYLE}` },
];

const save = () => { fs.mkdirSync(path.dirname(MANIFEST), { recursive: true }); fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2)); };
const info = (await (await fetch(`${API}/models?output_modalities=image`)).json()).data.find((m) => m.id === MODEL);
if (!info) throw new Error(`Model ${MODEL} not available on OpenRouter`);
const est = Number(info.pricing.image_output) * 1290;
const todo = JOBS.filter((j) => force || manifest.items[j.key]?.status !== "ok");
console.log(`Model ${MODEL} pricing ${JSON.stringify(info.pricing)} · est $${est.toFixed(3)}/image · ${todo.length} pending · est total $${(est * todo.length).toFixed(3)}`);
if (dry || !todo.length) process.exit(0);
if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");

let spent = 0;
for (const job of todo) {
  if (spent >= MAX_COST) { console.log("cost cap reached"); break; }
  try {
    let res, json;
    for (let attempt = 1; attempt <= 5; attempt++) {
      res = await fetch(`${API}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json", "X-Title": "SHOMAAA CRYPTO assets" },
        body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: job.prompt }], modalities: ["image", "text"], image_config: { aspect_ratio: job.aspect } }),
        signal: AbortSignal.timeout(240_000),
      });
      json = await res.json();
      if (res.status !== 429 && res.status < 500) break;
      console.log(`  ${job.key}: HTTP ${res.status}, retry ${attempt}/5 in ${30 * attempt}s`);
      await new Promise((r) => setTimeout(r, 30_000 * attempt));
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json.error ?? json).slice(0, 200)}`);
    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url?.startsWith("data:image/")) throw new Error("no image in response");
    const buf = Buffer.from(url.split(",")[1], "base64");
    const meta = await sharp(buf).metadata();
    if (!meta.width || meta.width < 512) throw new Error(`image too small ${meta.width}`);
    fs.mkdirSync(path.join(ROOT, "assets-src/raw"), { recursive: true });
    fs.writeFileSync(path.join(ROOT, `assets-src/raw/${job.file}.${meta.format}`), buf);
    const out = path.join(ROOT, `public/media/${job.file}.webp`);
    await sharp(buf).resize({ width: job.width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
    const cost = json.usage?.cost ?? null;
    spent += cost ?? est;
    manifest.items[job.key] = { status: "ok", model: MODEL, cost, estimated: cost == null, bytes: fs.statSync(out).size, at: new Date().toISOString() };
    console.log(`✓ ${job.key} ${meta.width}x${meta.height} → ${(fs.statSync(out).size / 1024).toFixed(0)}KB cost=${cost ?? "n/a"}`);
  } catch (e) {
    manifest.items[job.key] = { status: "failed", model: MODEL, error: String(e.message).slice(0, 200), at: new Date().toISOString() };
    console.error(`✗ ${job.key}: ${e.message}`);
  }
  save();
}
console.log(`spent ≈ $${spent.toFixed(4)}`);
