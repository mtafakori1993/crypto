export type AssetCategory = "major" | "defi" | "layer1" | "meme" | "stable" | "fiat";

export interface Asset {
  symbol: string;
  nameFa: string;
  nameEn: string;
  category: AssetCategory;
  /** Fixture reference price in USDT (fictional; the market model oscillates around it). */
  refPriceUsdt: number;
  /** Amount decimals for orders/balances. */
  amountDecimals: number;
  /** Displayed price decimals vs USDT. */
  priceDecimals: number;
  /** Fixture 24h base volume in USDT. */
  volumeUsdt: number;
  hue: number;
  networks: string[];
  withdrawFee: number;
  minWithdraw: number;
  descriptionFa: string;
}

export const CATEGORY_LABEL: Record<AssetCategory, string> = {
  major: "شاخص",
  layer1: "لایه یک",
  defi: "دیفای",
  meme: "میم",
  stable: "استیبل‌کوین",
  fiat: "ریالی",
};

export const ASSETS: Asset[] = [
  { symbol: "BTC", nameFa: "بیت‌کوین", nameEn: "Bitcoin", category: "major", refPriceUsdt: 96420, amountDecimals: 6, priceDecimals: 2, volumeUsdt: 1_840_000_000, hue: 32, networks: ["BTC"], withdrawFee: 0.0002, minWithdraw: 0.001, descriptionFa: "نخستین و بزرگ‌ترین ارز دیجیتال بر پایه بلاک‌چین اثبات کار؛ در این محیط به‌عنوان دارایی مرجع بازار شبیه‌سازی‌شده استفاده می‌شود." },
  { symbol: "ETH", nameFa: "اتریوم", nameEn: "Ethereum", category: "layer1", refPriceUsdt: 3412, amountDecimals: 5, priceDecimals: 2, volumeUsdt: 920_000_000, hue: 228, networks: ["ERC20"], withdrawFee: 0.003, minWithdraw: 0.01, descriptionFa: "پلتفرم قراردادهای هوشمند و بستر بخش بزرگی از برنامه‌های غیرمتمرکز و توکن‌ها." },
  { symbol: "USDT", nameFa: "تتر", nameEn: "Tether", category: "stable", refPriceUsdt: 1, amountDecimals: 2, priceDecimals: 4, volumeUsdt: 2_300_000_000, hue: 160, networks: ["TRC20", "ERC20"], withdrawFee: 1, minWithdraw: 10, descriptionFa: "استیبل‌کوینی که ارزش آن به دلار آمریکا گره خورده است؛ واحد مبنای بیشتر بازارهای این رابط." },
  { symbol: "BNB", nameFa: "بایننس‌کوین", nameEn: "BNB", category: "layer1", refPriceUsdt: 702, amountDecimals: 4, priceDecimals: 2, volumeUsdt: 210_000_000, hue: 45, networks: ["BEP20"], withdrawFee: 0.0005, minWithdraw: 0.01, descriptionFa: "توکن بومی زنجیره BNB با کاربرد در کارمزد و اکوسیستم دیفای." },
  { symbol: "SOL", nameFa: "سولانا", nameEn: "Solana", category: "layer1", refPriceUsdt: 188, amountDecimals: 3, priceDecimals: 2, volumeUsdt: 380_000_000, hue: 275, networks: ["SOL"], withdrawFee: 0.01, minWithdraw: 0.05, descriptionFa: "بلاک‌چین لایه یک با تمرکز بر سرعت و کارمزد پایین." },
  { symbol: "XRP", nameFa: "ریپل", nameEn: "XRP", category: "major", refPriceUsdt: 2.31, amountDecimals: 1, priceDecimals: 4, volumeUsdt: 260_000_000, hue: 205, networks: ["XRP"], withdrawFee: 0.25, minWithdraw: 10, descriptionFa: "دارایی دیجیتال طراحی‌شده برای تسویه سریع و کم‌هزینه پرداخت‌های فرامرزی." },
  { symbol: "TON", nameFa: "تون‌کوین", nameEn: "Toncoin", category: "layer1", refPriceUsdt: 5.62, amountDecimals: 2, priceDecimals: 4, volumeUsdt: 84_000_000, hue: 200, networks: ["TON"], withdrawFee: 0.05, minWithdraw: 1, descriptionFa: "ارز بومی شبکه TON با تمرکز بر برنامه‌های مرتبط با پیام‌رسان‌ها." },
  { symbol: "ADA", nameFa: "کاردانو", nameEn: "Cardano", category: "layer1", refPriceUsdt: 0.912, amountDecimals: 1, priceDecimals: 4, volumeUsdt: 74_000_000, hue: 215, networks: ["ADA"], withdrawFee: 1, minWithdraw: 5, descriptionFa: "پلتفرم اثبات سهام با رویکرد پژوهشی در طراحی پروتکل." },
  { symbol: "DOGE", nameFa: "دوج‌کوین", nameEn: "Dogecoin", category: "meme", refPriceUsdt: 0.287, amountDecimals: 0, priceDecimals: 5, volumeUsdt: 190_000_000, hue: 48, networks: ["DOGE"], withdrawFee: 4, minWithdraw: 20, descriptionFa: "نخستین ارز میم‌محور؛ نمونه‌ای از دارایی‌های پرنوسان." },
  { symbol: "TRX", nameFa: "ترون", nameEn: "TRON", category: "layer1", refPriceUsdt: 0.254, amountDecimals: 1, priceDecimals: 5, volumeUsdt: 120_000_000, hue: 358, networks: ["TRC20"], withdrawFee: 1, minWithdraw: 10, descriptionFa: "شبکه‌ای پرکاربرد برای انتقال تتر با کارمزد پایین." },
  { symbol: "LTC", nameFa: "لایت‌کوین", nameEn: "Litecoin", category: "major", refPriceUsdt: 118.4, amountDecimals: 4, priceDecimals: 2, volumeUsdt: 52_000_000, hue: 220, networks: ["LTC"], withdrawFee: 0.001, minWithdraw: 0.01, descriptionFa: "یکی از قدیمی‌ترین ارزهای دیجیتال با زمان تأیید کوتاه‌تر از بیت‌کوین." },
  { symbol: "AVAX", nameFa: "آوالانچ", nameEn: "Avalanche", category: "defi", refPriceUsdt: 41.7, amountDecimals: 3, priceDecimals: 3, volumeUsdt: 96_000_000, hue: 350, networks: ["AVAXC"], withdrawFee: 0.01, minWithdraw: 0.1, descriptionFa: "پلتفرم قراردادهای هوشمند با شبکه‌های فرعی قابل‌تنظیم." },
];

export const IRT = { symbol: "IRT", nameFa: "تومان", nameEn: "Toman", amountDecimals: 0, hue: 190 } as const;

/** USDT/IRT fixture reference (toman per USDT). Fictional. */
export const USDT_IRT_REF = 101_250;

export const assetMap: Record<string, Asset> = Object.fromEntries(ASSETS.map((a) => [a.symbol, a]));
export const getAsset = (s: string): Asset | undefined => assetMap[s];
export const symbolName = (s: string): string => (s === "IRT" ? IRT.nameFa : assetMap[s]?.nameFa ?? s);
export const amountDecimalsOf = (s: string): number => (s === "IRT" ? 0 : assetMap[s]?.amountDecimals ?? 2);
