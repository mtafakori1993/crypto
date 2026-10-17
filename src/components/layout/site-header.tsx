import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";
import { MobileMenu } from "./mobile-menu";

export const SITE_NAV = [
  { href: "/markets", label: "بازارها" },
  { href: "/trade/BTC-USDT", label: "معامله" },
  { href: "/#features", label: "امکانات" },
  { href: "/#faq", label: "پرسش‌های متداول" },
  { href: "/simulation", label: "درباره شبیه‌سازی" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link href="/" aria-label="صفحه اصلی شوما کریپتو"><Logo /></Link>
        <nav aria-label="ناوبری اصلی" className="ms-6 hidden items-center gap-1 xl:flex">
          {SITE_NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 text-sm text-muted hover:bg-raised hover:text-text">{n.label}</Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <GlobalSearch className="hidden w-64 xl:block" />
          <ThemeToggle />
          <ButtonLink href="/login" variant="ghost" size="sm" className="max-sm:hidden">ورود</ButtonLink>
          <ButtonLink href="/register" variant="outline" size="sm" className="max-sm:hidden">ثبت‌نام</ButtonLink>
          <ButtonLink href="/dashboard" size="sm" className="max-md:hidden">ورود به داشبورد</ButtonLink>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
