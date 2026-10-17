"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { toast } from "@/components/ui/misc";
import { useAccount } from "@/lib/store/account-store";
import { useNow } from "@/lib/store/sim-provider";

function Shell({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10 md:py-16">
      <div className="rounded-xl border border-line-strong bg-surface p-6 shadow-pop">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm leading-7 text-muted">{lead}</p>
        <div className="mt-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}
const Warn = () => (
  <p className="rounded-md bg-warn-soft p-3 text-[13px] leading-7 text-warn">این ورود شبیه‌سازی‌شده است. رمز عبور، کد یک‌بار مصرف، کلید API یا هر اطلاعات هویتی واقعی را وارد نکنید؛ چنین فیلدهایی اصلاً دریافت نمی‌شوند.</p>
);

export function LoginForm() {
  const router = useRouter();
  const setSession = useAccount((s) => s.setSession);
  const profile = useAccount((s) => s.account.profile);
  return (
    <Shell title="ورود به حساب نمونه" lead="برای استفاده از رابط، وارد جلسه نمونه شوید؛ نیازی به رمز عبور نیست.">
      <Warn />
      <Field label="حساب نمونه" value={profile.email} readOnly dir="ltr" hint="حساب فرضی با موجودی فرضی" />
      <Button size="lg" className="w-full" data-testid="demo-login" onClick={() => { setSession(true); router.push("/dashboard"); }}>ورود با حساب نمونه</Button>
      <p className="text-center text-sm text-muted">حساب جدید می‌خواهید؟ <Link href="/register" className="text-accent-strong hover:underline">ساخت حساب نمونه</Link> · <Link href="/forgot-password" className="text-accent-strong hover:underline">بازیابی رمز</Link></p>
    </Shell>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const setProfile = useAccount((s) => s.setProfile);
  const setSession = useAccount((s) => s.setSession);
  const reset = useAccount((s) => s.resetSimulation);
  const now = useNow();
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <Shell title="ساخت حساب نمونه" lead="یک نام نمایشی فرضی انتخاب کنید تا حساب شبیه‌سازی با موجودی فرضی ساخته شود.">
      <Warn />
      <form noValidate className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        if (name.trim().length < 2) return setErr("نام نمایشی حداقل ۲ نویسه باشد");
        if (!agree) return setErr("برای ادامه، آگاهی از شبیه‌سازی بودن محیط را تأیید کنید");
        reset(now); setProfile({ name: name.trim() }); setSession(true); toast.ok("حساب نمونه ساخته شد"); router.push("/dashboard");
      }}>
        <Field label="نام نمایشی (فرضی)" value={name} maxLength={40} onChange={(e) => { setName(e.target.value); setErr(null); }} placeholder="مثلاً: معامله‌گر نمونه" error={err && !agree && name.trim().length >= 2 ? null : err && name.trim().length < 2 ? err : null} />
        <label className="flex items-start gap-2 text-sm leading-7"><input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErr(null); }} className="mt-2 size-4 accent-[var(--accent)]" /> می‌دانم این محیط شبیه‌سازی‌شده است و موجودی و معاملات آن واقعی نیستند.</label>
        {err && agree === false && name.trim().length >= 2 && <p role="alert" className="text-[13px] text-down">{err}</p>}
        <Button type="submit" size="lg" className="w-full">ساخت حساب و ورود</Button>
      </form>
    </Shell>
  );
}

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  return (
    <Shell title="بازیابی رمز عبور" lead="در این نسخه نمایشی هیچ ایمیلی ارسال نمی‌شود و رمز عبوری هم وجود ندارد.">
      {sent ? (
        <div role="status" className="rounded-md bg-up-soft p-3 text-sm leading-7 text-up">درخواست نمونه ثبت شد. چون این یک شبیه‌سازی است، ایمیلی ارسال نشد؛ برای ادامه از «ورود با حساب نمونه» استفاده کنید.</div>
      ) : (
        <form noValidate className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <Field label="ایمیل نمونه" type="email" dir="ltr" defaultValue="demo@shomaaa.example" hint="لطفاً ایمیل واقعی خود را وارد نکنید؛ این مقدار ذخیره یا ارسال نمی‌شود." />
          <Button type="submit" size="lg" className="w-full">ثبت درخواست نمونه</Button>
        </form>
      )}
      <p className="text-center text-sm"><Link href="/login" className="text-accent-strong hover:underline">بازگشت به ورود</Link></p>
    </Shell>
  );
}
