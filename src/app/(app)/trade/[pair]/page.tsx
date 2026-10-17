import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Terminal } from "@/components/trade/terminal";
import { getPair } from "@/lib/market/pairs";

type Props = { params: Promise<{ pair: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pair = getPair((await params).pair);
  return { title: pair ? `معامله ${pair.label}` : "بازار یافت نشد", robots: { index: false, follow: false } };
}

export default async function TradePage({ params }: Props) {
  const pair = getPair((await params).pair);
  if (!pair) notFound();
  return <Terminal pair={pair.id} />;
}
