import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetDetail } from "@/components/market/asset-detail";
import { assetMap } from "@/lib/market/assets";

type Props = { params: Promise<{ symbol: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = assetMap[(await params).symbol.toUpperCase()];
  if (!a) return { title: "دارایی یافت نشد" };
  return { title: `${a.nameFa} (${a.symbol})`, description: `قیمت شبیه‌سازی‌شده، نمودار و بازارهای ${a.nameFa} در شوما کریپتو.`, alternates: { canonical: `/markets/${a.symbol}` }, robots: { index: true, follow: true } };
}

export default async function AssetPage({ params }: Props) {
  const asset = assetMap[(await params).symbol.toUpperCase()];
  if (!asset) notFound();
  return (
    <div className="mx-auto max-w-7xl space-y-4 p-3 md:p-5">
      <Link href="/markets" className="inline-flex items-center gap-1 text-sm text-muted hover:text-text">همه بازارها <ArrowLeft size={14} aria-hidden /></Link>
      <AssetDetail symbol={asset.symbol} />
    </div>
  );
}
