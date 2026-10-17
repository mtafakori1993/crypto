import type { Metadata } from "next";
import { PAIRS } from "@/lib/market/pairs";
import { formatNumber } from "@/lib/format";
import { SIM } from "@/lib/config";

export const metadata: Metadata = {
  title: "درباره محیط شبیه‌سازی",
  description: "شوما کریپتو یک رابط معاملاتی شبیه‌سازی‌شده است: چه چیزهایی شبیه‌سازی می‌شود، چه چیزهایی وجود ندارد و داده‌ها چگونه نگهداری می‌شوند.",
  alternates: { canonical: "/simulation" },
};

export default function SimulationPage() {
  const blocks: [string, string[]][] = [
    ["چه چیزی شبیه‌سازی می‌شود", [`قیمت‌ها، نمودار شمعی، دفتر سفارش و معاملات اخیر ${formatNumber(PAIRS.length, 0)} جفت‌ارز توسط یک مدل ریاضی قطعی تولید می‌شوند؛ بنابراین همه صفحات و API‌ها اعداد یکسان نشان می‌دهند.`, "موجودی‌ها فرضی‌اند و سفارش‌های بازار و حدی با قواعد ساده و شفاف (کارمزد ثابت ۰٫۱٪، اجرای حدی هنگام عبور قیمت شبیه‌سازی‌شده) پردازش می‌شوند.", "واریز، برداشت و انتقال داخلی فقط رکوردهای محلی با شناسه‌های SIM- هستند."]],
    ["چه چیزهایی وجود ندارد", ["اتصال به هیچ صرافی، بازار یا شبکه بلاک‌چین واقعی.", "نگهداری دارایی (custody)، درگاه پرداخت، تأیید واریز واقعی یا اجرای برداشت بیرونی.", "مجوز، تأیید نهادهای ناظر، ذخایر تأییدشده یا هرگونه ادعای عملیاتی درباره یک صرافی واقعی."]],
    ["داده‌های شما", ["وضعیت حساب نمونه فقط در localStorage همین مرورگر ذخیره می‌شود و دفتر کل امن نیست.", "هیچ رمز عبور، کد یک‌بار مصرف، کلید API یا مدرک هویتی دریافت نمی‌شود؛ لطفاً چنین اطلاعاتی را وارد نکنید.", "با «بازنشانی حساب نمونه» در تنظیمات می‌توانید همه چیز را به حالت اولیه برگردانید."]],
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">درباره محیط شبیه‌سازی</h1>
      <p className="mt-3 leading-8 text-muted">شوما کریپتو یک پروژه نمایشی از رابط کاربری یک صرافی ارز دیجیتال است که توسط {`تفکر پردازان`} طراحی و پیاده‌سازی شده است. همه‌چیز در آن شبیه‌سازی‌شده است.</p>
      {blocks.map(([h, items]) => (
        <section key={h} className="mt-8">
          <h2 className="mb-3 text-xl font-bold">{h}</h2>
          <ul className="list-disc space-y-2 ps-6 leading-8 text-muted marker:text-accent">{items.map((i) => <li key={i}>{i}</li>)}</ul>
        </section>
      ))}
      <section className="mt-8 rounded-lg border border-line bg-surface p-5 text-sm leading-8 text-muted">
        <h2 className="mb-1 text-base font-bold text-text">قواعد فنی شبیه‌سازی</h2>
        کارمزد: <b className="text-text">{formatNumber(SIM.feeRate * 100, 2)}٪</b> از دارایی دریافتی · به‌روزرسانی قیمت هر {formatNumber(SIM.priceTickMs / 1000, 0)} ثانیه و فقط وقتی تب فعال است · سفارش حدی تا عبور قیمت شبیه‌سازی‌شده «در انتظار» می‌ماند.
      </section>
    </div>
  );
}
