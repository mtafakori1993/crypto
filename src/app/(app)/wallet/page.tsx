import type { Metadata } from "next";
import { WalletView } from "@/components/wallet/wallet-view";

export const metadata: Metadata = { title: "کیف پول" };

export default function WalletPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-3 md:p-5">
      <h1 className="text-2xl font-bold">کیف پول</h1>
      <WalletView />
    </div>
  );
}
