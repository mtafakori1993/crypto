import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <p className="num text-6xl font-bold text-accent-strong">۴۰۴</p>
        <h1 className="text-2xl font-bold">صفحه موردنظر پیدا نشد</h1>
        <p className="max-w-md text-muted">آدرس را بررسی کنید یا به بازارها برگردید.</p>
        <div className="flex gap-2"><ButtonLink href="/markets">بازارها</ButtonLink><ButtonLink href="/" variant="outline">صفحه اصلی</ButtonLink></div>
        <Link href="/simulation" className="text-sm text-muted hover:text-text">درباره محیط شبیه‌سازی</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
