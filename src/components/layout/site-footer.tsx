import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SITE } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted">
            رابط کاربری معاملاتی ارز دیجیتال با داده‌های شبیه‌سازی‌شده. این محیط صرافی واقعی نیست، نگهداری دارایی ندارد و هیچ معامله یا تراکنش واقعی انجام نمی‌دهد.
          </p>
        </div>
        <FooterCol title="محصول" links={[["/markets", "بازارها"], ["/trade/BTC-USDT", "ترمینال معاملاتی"], ["/portfolio", "پرتفوی"], ["/wallet", "کیف پول"]]} />
        <FooterCol title="حساب" links={[["/login", "ورود"], ["/register", "ثبت‌نام"], ["/forgot-password", "بازیابی رمز عبور"], ["/account", "تنظیمات"]]} />
        <FooterCol title="اطلاعات" links={[["/simulation", "درباره شبیه‌سازی"], ["/#faq", "پرسش‌های متداول"], ["/#features", "امکانات"]]} />
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            طراحی و توسعه: <a href={SITE.developerUrl} target="_blank" rel="noopener" className="text-accent-strong hover:underline">{SITE.developer}</a>
          </p>
          <p>قیمت‌ها، موجودی‌ها و سفارش‌ها در این سایت فرضی و شبیه‌سازی‌شده‌اند؛ سرمایه‌گذاری یا معامله واقعی انجام نمی‌شود.</p>
        </div>
      </div>
    </footer>
  );
}
function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold">{title}</h2>
      <ul className="space-y-2 text-sm text-muted">
        {links.map(([h, l]) => (
          <li key={h}><Link href={h} className="hover:text-text">{l}</Link></li>
        ))}
      </ul>
    </div>
  );
}
