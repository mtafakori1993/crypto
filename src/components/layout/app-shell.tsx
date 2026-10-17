"use client";
import { Bell, CandlestickChart, Home, LayoutDashboard, LineChart, ListOrdered, LogOut, PieChart, UserRound, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Tip } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import { useAccount } from "@/lib/store/account-store";
import { useNow } from "@/lib/store/sim-provider";
import { GlobalSearch } from "./global-search";
import { SimStrip } from "./sim-notice";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/markets", label: "بازارها", icon: LineChart },
  { href: "/trade/BTC-USDT", match: "/trade", label: "معامله", icon: CandlestickChart },
  { href: "/portfolio", label: "پرتفوی", icon: PieChart },
  { href: "/wallet", label: "کیف پول", icon: Wallet },
  { href: "/orders", label: "سفارش‌ها", icon: ListOrdered },
  { href: "/account", label: "حساب کاربری", icon: UserRound },
];
const MOBILE = [
  { href: "/dashboard", label: "خانه", icon: Home },
  { href: "/markets", label: "بازارها", icon: LineChart },
  { href: "/trade/BTC-USDT", match: "/trade", label: "معامله", icon: CandlestickChart },
  { href: "/portfolio", label: "دارایی‌ها", icon: PieChart },
  { href: "/account", label: "حساب", icon: UserRound },
];

const isActive = (path: string, item: { href: string; match?: string }) => path === item.href || path.startsWith((item.match ?? item.href) + "/") || path === (item.match ?? item.href);

function Notifications() {
  const [open, setOpen] = useState(false);
  const hydrated = useAccount((s) => s.hydrated);
  const list = useAccount((s) => s.account.notifications);
  const mark = useAccount((s) => s.markNotificationsRead);
  const now = useNow();
  const unread = hydrated ? list.filter((n) => !n.read).length : 0;
  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}>
      <button aria-label={`اعلان‌ها${unread ? ` (${unread} خوانده‌نشده)` : ""}`} aria-expanded={open} onClick={() => { setOpen((o) => !o); }} className="relative flex size-10 items-center justify-center rounded-md text-muted hover:bg-raised hover:text-text">
        <Bell size={18} />
        {unread > 0 && <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-down" aria-hidden />}
      </button>
      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-[min(92vw,340px)] overflow-hidden rounded-lg border border-line-strong bg-surface shadow-pop" role="dialog" aria-label="اعلان‌ها">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="text-sm font-bold">اعلان‌ها</span>
            <button onClick={mark} className="text-xs text-accent-strong hover:underline">علامت‌گذاری همه به‌عنوان خوانده‌شده</button>
          </div>
          <ul className="scroll-thin max-h-80 overflow-y-auto">
            {list.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">اعلانی وجود ندارد</li>}
            {list.map((n) => (
              <li key={n.id} className={cn("border-b border-line px-4 py-3 last:border-0", !n.read && "bg-accent-soft")}>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-0.5 text-[13px] text-muted">{n.body}</p>
                <p className="mt-1 text-xs text-muted/80">{formatRelative(n.time, now)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const profile = useAccount((s) => s.account.profile);
  const setSession = useAccount((s) => s.setSession);
  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}>
      <button aria-label="منوی کاربر" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-strong hover:brightness-125">
        {profile.name.slice(0, 1)}
      </button>
      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-line-strong bg-surface shadow-pop">
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-bold">{profile.name}</p>
            <p dir="ltr" className="text-start text-xs text-muted">{profile.email}</p>
            <p className="mt-1 text-xs text-muted">حساب نمونه · <bdi dir="ltr">{profile.uid}</bdi></p>
          </div>
          <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-raised"><UserRound size={16} /> پروفایل و تنظیمات</Link>
          <Link href="/simulation" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-raised"><Bell size={16} /> درباره محیط شبیه‌سازی</Link>
          <Link href="/" onClick={() => { setSession(false); setOpen(false); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-down hover:bg-raised"><LogOut size={16} /> خروج از جلسه نمونه</Link>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex min-h-dvh flex-col">
      <SimStrip />
      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col border-e border-line bg-surface lg:flex xl:w-56" aria-label="ناوبری اصلی">
          <Link href="/" className="flex h-16 items-center justify-center border-b border-line px-3 xl:justify-start" aria-label="صفحه اصلی شوما کریپتو">
            <Logo compact className="xl:hidden" />
            <Logo className="max-xl:hidden" />
          </Link>
          <nav className="flex flex-1 flex-col gap-1 p-2">
            {NAV.map((item) => {
              const active = isActive(path, item);
              const Icon = item.icon;
              return (
                <Tip key={item.href} label={item.label}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex h-11 items-center justify-center gap-3 rounded-md px-3 text-sm transition-colors xl:justify-start", active ? "bg-accent-soft text-accent-strong" : "text-muted hover:bg-raised hover:text-text")}>
                    <Icon size={19} aria-hidden />
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="sr-only xl:hidden">{item.label}</span>
                  </Link>
                </Tip>
              );
            })}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur md:h-16 md:px-5">
            <Link href="/" className="lg:hidden" aria-label="صفحه اصلی"><Logo compact /></Link>
            <GlobalSearch className="min-w-0 flex-1 md:max-w-sm" />
            <div className="ms-auto flex items-center gap-1">
              <ThemeToggle />
              <Notifications />
              <UserMenu />
            </div>
          </header>
          <main id="main" className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
        </div>
      </div>
      <nav aria-label="ناوبری موبایل" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {MOBILE.map((item) => {
          const active = isActive(path, item);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex h-14 flex-col items-center justify-center gap-0.5 text-[11px]", active ? "text-accent-strong" : "text-muted")}>
              <Icon size={20} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
