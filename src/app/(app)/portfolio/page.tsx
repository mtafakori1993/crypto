import type { Metadata } from "next";
import { PortfolioView } from "@/components/portfolio/portfolio-view";

export const metadata: Metadata = { title: "پرتفوی" };

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 p-3 md:p-5">
      <h1 className="text-2xl font-bold">پرتفوی</h1>
      <PortfolioView />
    </div>
  );
}
