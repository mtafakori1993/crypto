import { BarChart3, BookOpen, Layers, LockKeyhole, PieChart, SlidersHorizontal, Wallet, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { HeroCard } from "@/components/home/hero-card";
import { MarketTable } from "@/components/market/market-table";
import { Movers } from "@/components/market/movers";
import { TickerStrip } from "@/components/market/ticker-strip";
import { ButtonLink } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} | رابط معاملاتی مدرن ارز دیجیتال` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

const FEATURES = [
  { icon: BarChart3, title: "ترمینال معاملاتی حرفه‌ای", text: "نمودار شمعی با بازه‌های ۱ دقیقه تا ۱ روز، دفتر سفارش با عمق تجمعی و فهرست معاملات اخیر در یک صفحه." },
  { icon: SlidersHorizontal, title: "سفارش بازار و حدی", text: "پیش‌نمایش کارمزد و مجموع، مرحله تأیید و وضعیت‌های روشن: اجراشده، در انتظار یا لغوشده." },
  { icon: PieChart, title: "پرتفوی و تخصیص دارایی", text: "ارزش کل به تتر و تومان، نمودار سهم هر دارایی و تفکیک موجودی آزاد و قفل‌شده." },
  { icon: Wallet, title: "کیف پول شبیه‌سازی‌شده", text: "واریز، برداشت و انتقال داخلی با شناسه‌های نمونه؛ بدون نشانی واقعی و بدون تراکنش زنجیره‌ای." },
  { icon: Layers, title: "بازارها و لیست پیگیری", text: "جست‌وجو با نماد یا نام فارسی، دسته‌بندی، مرتب‌سازی و نشان‌کردن بازارهای موردعلاقه." },
  { icon: LockKeyhole, title: "طراحی امنیت‌محور", text: "تأیید صریح پیش از ثبت سفارش، نمایش شفاف کارمزد و عدم دریافت هرگونه رمز یا اطلاعات هویتی واقعی." },
];

const FAQ = [
  ["آیا قیمت‌ها واقعی هستند؟", "خیر. تمام قیمت‌ها، نمودارها و دفتر سفارش‌ها توسط یک مدل داده شبیه‌سازی‌شده تولید می‌شوند و هیچ اتصالی به بازار واقعی ندارند."],
  ["آیا با این پلتفرم می‌توان معامله واقعی انجام داد؟", "خیر. موجودی‌ها فرضی‌اند، سفارش‌ها فقط در شبیه‌سازی اجرا می‌شوند و هیچ پولی واریز یا برداشت نمی‌شود."],
  ["اطلاعات حساب من کجا ذخیره می‌شود؟", "وضعیت حساب نمونه (موجودی فرضی، سفارش‌ها و تنظیمات) فقط در حافظه محلی مرورگر شما نگه‌داری می‌شود و به‌عنوان دفتر کل امن در نظر گرفته نمی‌شود."],
  ["آیا باید رمز عبور یا مدرک هویتی وارد کنم؟", "خیر. ورود از طریق جلسه نمونه انجام می‌شود. لطفاً هیچ رمز، کد یک‌بار مصرف، کلید API یا مدرک واقعی وارد نکنید."],
  ["سفارش حدی چه زمانی اجرا می‌شود؟", "سفارش حدی در وضعیت «در انتظار» می‌ماند و فقط زمانی اجرا می‌شود که قیمت شبیه‌سازی‌شده بازار به قیمت شما برسد. تا آن زمان موجودی مربوطه قفل می‌شود."],
  ["کارمزد معاملات چگونه محاسبه می‌شود؟", "در این شبیه‌سازی کارمزد ثابت ۰٫۱٪ از دارایی دریافتی کسر می‌شود و قبل از تأیید نهایی در پیش‌نمایش سفارش نمایش داده می‌شود."],
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(900px 380px at 85% -10%, var(--accent-soft), transparent 70%)" }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="min-w-0">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
              <span className="size-1.5 rounded-full bg-up" aria-hidden /> بازار شبیه‌سازی‌شده با ۱۴ جفت‌ارز
            </p>
            <h1 className="text-balance text-3xl font-bold leading-[1.45] md:text-5xl md:leading-[1.4]">
              بازار ارز دیجیتال را <span className="text-accent-strong">دقیق، سریع و شفاف</span> تجربه کنید
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-8 text-muted md:text-lg">
              ترمینال معاملاتی با نمودار شمعی، دفتر سفارش و پرتفوی یکپارچه. همه‌چیز در یک محیط فارسی و راست‌چین، با موجودی فرضی و بدون ریسک مالی.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/dashboard" size="lg">ورود به داشبورد <ArrowLeft size={18} aria-hidden /></ButtonLink>
              <ButtonLink href="/markets" size="lg" variant="outline">مشاهده بازارها</ButtonLink>
            </div>
            <p className="mt-4 text-xs text-muted">برای شروع نیازی به ثبت رمز عبور یا اطلاعات واقعی نیست؛ جلسه نمونه با یک کلیک آماده است.</p>
          </div>
          <HeroCard />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8" aria-label="قیمت‌های شاخص">
        <TickerStrip />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8" aria-labelledby="movers-h">
        <h2 id="movers-h" className="mb-4 text-xl font-bold">نوسان‌گیرهای بازار</h2>
        <Movers />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8" aria-labelledby="pairs-h">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="pairs-h" className="text-xl font-bold">جفت‌ارزهای محبوب</h2>
          <ButtonLink href="/markets" variant="ghost" size="sm">همه بازارها <ArrowLeft size={14} aria-hidden /></ButtonLink>
        </div>
        <MarketTable limit={8} compact showFilters={false} />
      </section>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12" aria-labelledby="feat-h">
        <h2 id="feat-h" className="text-2xl font-bold">همه چیزی که یک رابط معاملاتی لازم دارد</h2>
        <p className="mt-2 max-w-2xl text-muted">از نمودار تا کیف پول؛ هر بخش با داده‌ی مشترک و منسجم کار می‌کند تا قیمت‌ها، موجودی‌ها و سفارش‌ها در همه صفحات یکسان باشند.</p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="rounded-lg border border-line bg-surface p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-strong"><f.icon size={20} aria-hidden /></span>
                <h3 className="font-bold">{f.title}</h3>
              </div>
              <p className="mt-1.5 text-sm leading-7 text-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-bold">ابزارهای معاملاتی در یک نگاه</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
              <li className="flex gap-3"><BookOpen className="mt-1 shrink-0 text-accent-strong" size={18} aria-hidden /> <span><b className="text-text">دفتر سفارش زنده:</b> سطوح خرید و فروش با عمق تجمعی و اسپرد.</span></li>
              <li className="flex gap-3"><BarChart3 className="mt-1 shrink-0 text-accent-strong" size={18} aria-hidden /> <span><b className="text-text">نمودار شمعی:</b> کراس‌هیر، محور قیمت و بازه‌های زمانی مختلف.</span></li>
              <li className="flex gap-3"><SlidersHorizontal className="mt-1 shrink-0 text-accent-strong" size={18} aria-hidden /> <span><b className="text-text">فرم سفارش:</b> درصدهای سریع، پیش‌نمایش و تأیید دو مرحله‌ای.</span></li>
            </ul>
            <ButtonLink href="/trade/BTC-USDT" className="mt-6">ورود به ترمینال</ButtonLink>
          </div>
          <div className="overflow-hidden rounded-xl border border-line-strong shadow-pop">
            <Image src="/media/terminal-preview.webp" alt="نمای ترمینال معاملاتی شوما کریپتو با نمودار شمعی، دفتر سفارش و فرم سفارش" width={1440} height={900} className="h-auto w-full" sizes="(min-width:1024px) 720px, 100vw" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="steps-h">
        <h2 id="steps-h" className="mb-6 text-2xl font-bold">شروع در سه گام</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[["۱", "ورود به جلسه نمونه", "بدون رمز و اطلاعات واقعی؛ حساب نمونه با موجودی فرضی ساخته می‌شود."], ["۲", "انتخاب بازار", "بازار موردنظر را جست‌وجو کنید، به لیست پیگیری اضافه کنید و ترمینال را باز کنید."], ["۳", "ثبت سفارش شبیه‌سازی‌شده", "سفارش بازار یا حدی بگذارید و اثر آن را در پرتفوی و تاریخچه ببینید."]].map(([n, t, d]) => (
            <li key={n} className="rounded-lg border border-line bg-surface p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink">{n}</span>
                <h3 className="font-bold">{t}</h3>
              </div>
              <p className="mt-1 text-sm leading-7 text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-12" aria-labelledby="faq-h">
        <h2 id="faq-h" className="mb-6 text-2xl font-bold">پرسش‌های متداول</h2>
        <div className="divide-y divide-line rounded-lg border border-line bg-surface">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <span aria-hidden className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-8 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-xl border border-line-strong bg-surface p-7 md:flex-row md:items-center" style={{ background: "linear-gradient(135deg, var(--surface), var(--accent-soft))" }}>
          <div>
            <h2 className="text-xl font-bold md:text-2xl">ترمینال را همین حالا امتحان کنید</h2>
            <p className="mt-1 text-sm text-muted">موجودی فرضی، بدون ریسک؛ فقط برای آشنایی با رابط کاربری.</p>
          </div>
          <ButtonLink href="/dashboard" size="lg">ورود به داشبورد</ButtonLink>
        </div>
      </section>
    </>
  );
}
