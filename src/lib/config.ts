export const SITE = {
  name: "شوما کریپتو",
  nameEn: "SHOMAAA CRYPTO",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://crypto.shomaaa.ir",
  tagline: "رابط کاربری صرافی ارز دیجیتال",
  description:
    "شوما کریپتو؛ رابط معاملاتی مدرن ارز دیجیتال با بازار، نمودار، دفتر سفارش و پرتفوی. محیط شبیه‌سازی‌شده با موجودی و قیمت‌های فرضی.",
  developer: "تفکر پردازان",
  developerUrl: "https://tafakorpardazan.ir",
} as const;

/** Simulation constants (single source of truth for fee / limits). */
export const SIM = {
  feeRate: 0.001, // 0.1% taker/maker, charged in the received asset
  priceTickMs: 3000,
  /** Set NEXT_PUBLIC_SIM_FIXED_TIME (ms epoch) to freeze the market clock for tests. */
  fixedTime: process.env.NEXT_PUBLIC_SIM_FIXED_TIME ? Number(process.env.NEXT_PUBLIC_SIM_FIXED_TIME) : null,
  storageKey: "shomaaa-sim-account-v1",
} as const;
