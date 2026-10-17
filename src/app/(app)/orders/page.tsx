import type { Metadata } from "next";
import { OrdersTables } from "@/components/trade/history-tables";

export const metadata: Metadata = { title: "سفارش‌ها و معاملات" };

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 p-3 md:p-5">
      <div>
        <h1 className="text-2xl font-bold">سفارش‌ها و معاملات</h1>
        <p className="mt-1 text-sm text-muted">سفارش‌های باز، تاریخچه سفارش‌ها و معاملات شبیه‌سازی‌شده شما.</p>
      </div>
      <div className="rounded-lg border border-line bg-surface"><OrdersTables /></div>
    </div>
  );
}
