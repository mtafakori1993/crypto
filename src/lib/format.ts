const nf = (min: number, max: number) => new Intl.NumberFormat("fa-IR", { minimumFractionDigits: min, maximumFractionDigits: max });
const cache = new Map<string, Intl.NumberFormat>();
function fmt(min: number, max: number) {
  const k = `${min}:${max}`;
  let f = cache.get(k);
  if (!f) cache.set(k, (f = nf(min, max)));
  return f;
}

/** Fixed-decimals Persian number: formatFixed(1234.5, 2) -> ۱٬۲۳۴٫۵۰ */
export function formatFixed(n: number, decimals = 2): string {
  return fmt(decimals, decimals).format(Number.isFinite(n) ? n : 0);
}
/** Up-to-N decimals, trims trailing zeros. */
export function formatNumber(n: number, maxDecimals = 2): string {
  return fmt(0, maxDecimals).format(Number.isFinite(n) ? n : 0);
}
/** Price with precision derived from magnitude when no explicit decimals are given. */
export function formatPrice(n: number, decimals?: number): string {
  const d = decimals ?? (n >= 1000 ? 2 : n >= 1 ? 3 : 5);
  return fmt(d, d).format(Number.isFinite(n) ? n : 0);
}
export function formatPercent(n: number, withSign = true): string {
  const v = Math.abs(n) < 0.005 ? 0 : n;
  const s = fmt(2, 2).format(Math.abs(v));
  const sign = !withSign || v === 0 ? "" : v > 0 ? "+" : "−";
  return `${sign}${s}٪`;
}
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${fmt(0, 2).format(n / 1e9)} میلیارد`;
  if (abs >= 1e6) return `${fmt(0, 2).format(n / 1e6)} میلیون`;
  if (abs >= 1e3) return `${fmt(0, 1).format(n / 1e3)} هزار`;
  return fmt(0, 2).format(n);
}
export function formatUsd(n: number): string {
  return `${fmt(2, 2).format(n)} $`;
}
export function formatToman(n: number): string {
  return `${fmt(0, 0).format(Math.round(n))} تومان`;
}
const tz = "Asia/Tehran";
const timeF = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: tz });
const dateTimeF = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz });
const dateF = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric", timeZone: tz });
export const formatTime = (ms: number) => timeF.format(new Date(ms));
export const formatDateTime = (ms: number) => dateTimeF.format(new Date(ms));
export const formatDate = (ms: number) => dateF.format(new Date(ms));
export function formatRelative(ms: number, now: number): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 5) return "هم‌اکنون";
  if (s < 60) return `${fmt(0, 0).format(s)} ثانیه پیش`;
  const m = Math.round(s / 60);
  if (m < 60) return `${fmt(0, 0).format(m)} دقیقه پیش`;
  const h = Math.round(m / 60);
  if (h < 24) return `${fmt(0, 0).format(h)} ساعت پیش`;
  return `${fmt(0, 0).format(Math.round(h / 24))} روز پیش`;
}
/** Parse user-typed amounts: accepts Persian/Arabic digits and separators. */
export function parseAmount(input: string): number {
  const map: Record<string, string> = { "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9", "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9", "٫": ".", "،": "", "٬": "", ",": "", "/": "." };
  const s = input.trim().replace(/[۰-۹٠-٩٫٬،,/]/g, (c) => map[c] ?? c);
  if (!/^\d*\.?\d*$/.test(s) || s === "" || s === ".") return NaN;
  return Number(s);
}
/** Round down (never round a balance up). */
export function floorTo(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.floor(n * f + 1e-9) / f;
}
export function roundTo(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

/** Programmatic value for a text input: Persian digits, no grouping, so parseAmount() can read it back. */
export function toInputValue(n: number, maxDecimals = 8): string {
  return new Intl.NumberFormat("fa-IR", { useGrouping: false, maximumFractionDigits: maxDecimals }).format(n);
}
