import type { Metadata } from "next";
import { AccountView } from "@/components/account/account-view";

export const metadata: Metadata = { title: "حساب کاربری" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-3 md:p-5">
      <h1 className="text-2xl font-bold">حساب کاربری</h1>
      <AccountView />
    </div>
  );
}
