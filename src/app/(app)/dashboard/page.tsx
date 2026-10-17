import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = { title: "داشبورد" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 p-3 md:p-5">
      <div><h1 className="text-2xl font-bold">داشبورد</h1><p className="mt-1 text-sm text-muted">نمای کلی حساب نمونه شما؛ همه مقادیر فرضی هستند.</p></div>
      <DashboardView />
    </div>
  );
}
