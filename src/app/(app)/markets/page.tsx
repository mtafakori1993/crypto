import type { Metadata } from "next";
import { MarketTable } from "@/components/market/market-table";
import { TickerStrip } from "@/components/market/ticker-strip";

export const metadata: Metadata = {
  title: "بازارها",
  description: "فهرست بازارهای شبیه‌سازی‌شده ارز دیجیتال با قیمت، تغییر ۲۴ ساعته، بیشترین و کمترین قیمت و حجم معاملات.",
  alternates: { canonical: "/markets" },
  robots: { index: true, follow: true },
};

export default function MarketsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 p-3 md:p-5">
      <div>
        <h1 className="text-2xl font-bold">بازارها</h1>
        <p className="mt-1 text-sm text-muted">قیمت‌ها از مدل داده شبیه‌سازی‌شده می‌آیند و قیمت لحظه‌ای بازار واقعی نیستند.</p>
      </div>
      <TickerStrip pairs={["BTC-USDT", "ETH-USDT", "SOL-USDT", "TON-USDT"]} />
      <MarketTable />
    </div>
  );
}
