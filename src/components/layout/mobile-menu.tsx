"use client";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/ui/misc";
import { GlobalSearch } from "./global-search";

const LINKS = [
  { href: "/markets", label: "بازارها" },
  { href: "/trade/BTC-USDT", label: "معامله" },
  { href: "/dashboard", label: "داشبورد" },
  { href: "/#features", label: "امکانات" },
  { href: "/#faq", label: "پرسش‌های متداول" },
  { href: "/simulation", label: "درباره شبیه‌سازی" },
  { href: "/login", label: "ورود" },
  { href: "/register", label: "ثبت‌نام" },
];
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button aria-label="باز کردن منو" onClick={() => setOpen(true)} className="flex size-10 items-center justify-center rounded-md text-muted hover:bg-raised xl:hidden">
        <Menu size={20} />
      </button>
      <Modal open={open} onOpenChange={setOpen} title="منو">
        <GlobalSearch className="mb-3" />
        <nav className="flex flex-col" aria-label="منوی موبایل">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex h-12 items-center border-b border-line text-base last:border-0">{l.label}</Link>
          ))}
        </nav>
      </Modal>
    </>
  );
}
