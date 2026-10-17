import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

// Account-specific application screens are not for search indexing.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
