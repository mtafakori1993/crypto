"use client";
import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { EmptyState, Modal, Skeleton, Tab, TabList, TabPanel, Tabs, Toggle, toast } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { getPair } from "@/lib/market/pairs";
import { PAIRS } from "@/lib/market/pairs";
import { useAccount } from "@/lib/store/account-store";
import { useNow } from "@/lib/store/sim-provider";

export function AccountView() {
  const hydrated = useAccount((s) => s.hydrated);
  const account = useAccount((s) => s.account);
  const setPrefs = useAccount((s) => s.setPrefs);
  const setProfile = useAccount((s) => s.setProfile);
  const toggleWatch = useAccount((s) => s.toggleWatch);
  const reset = useAccount((s) => s.resetSimulation);
  const now = useNow();
  const [name, setName] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  if (!hydrated) return <Skeleton className="h-72 w-full" />;
  const { prefs, profile } = account;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 md:px-5">
      <Tabs defaultValue="profile">
        <TabList label="تنظیمات حساب">
          <Tab value="profile">پروفایل</Tab><Tab value="security">امنیت</Tab><Tab value="notifications">اعلان‌ها</Tab><Tab value="appearance">ظاهر و ترجیحات</Tab><Tab value="watchlist">لیست پیگیری</Tab><Tab value="simulation">شبیه‌سازی</Tab>
        </TabList>
        <TabPanel value="profile" className="max-w-lg space-y-4 py-5">
          <p className="rounded-md bg-warn-soft p-3 text-[13px] text-warn">اطلاعات این صفحه کاملاً فرضی است. لطفاً نام، ایمیل یا شماره واقعی خود را وارد نکنید.</p>
          <Field label="نام نمایشی (فرضی)" value={name ?? profile.name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          <Field label="ایمیل نمونه" value={profile.email} readOnly dir="ltr" hint="ایمیل ثابت و فرضی است." />
          <Field label="شناسه حساب شبیه‌سازی" value={profile.uid} readOnly dir="ltr" />
          <Field label="سطح کاربری" value={profile.level} readOnly />
          <Button onClick={() => { setProfile({ name: (name ?? profile.name).trim() || profile.name }); toast.ok("پروفایل نمونه ذخیره شد (محلی)"); }}>ذخیره تغییرات</Button>
        </TabPanel>
        <TabPanel value="security" className="max-w-lg space-y-3 py-5">
          <p className="rounded-md bg-sunken p-3 text-[13px] leading-7 text-muted">این بخش نمایش رابط تنظیمات امنیتی است. احراز هویت در این محیط شبیه‌سازی‌شده است و امنیت واقعی ندارد؛ هیچ رمز، کد یک‌بار مصرف یا کلید API دریافت یا ذخیره نمی‌شود.</p>
          <Toggle id="sec-confirm" label="تأیید پیش از ثبت هر سفارش" checked={prefs.confirmOrders} onChange={(v) => setPrefs({ confirmOrders: v })} />
          <div className="flex items-center justify-between py-2 text-sm"><span>تأیید دو مرحله‌ای</span><span className="rounded-sm bg-raised px-2 py-0.5 text-xs text-muted">در دسترس نیست (نمایشی)</span></div>
          <div className="flex items-center justify-between py-2 text-sm"><span>نشست فعال</span><span className="text-muted">این مرورگر · نمونه</span></div>
        </TabPanel>
        <TabPanel value="notifications" className="max-w-lg py-3">
          <Toggle id="n-orders" label="اعلان اجرای سفارش‌ها" checked={prefs.notifyOrders} onChange={(v) => setPrefs({ notifyOrders: v })} />
          <Toggle id="n-wallet" label="اعلان واریز و برداشت نمونه" checked={prefs.notifyWallet} onChange={(v) => setPrefs({ notifyWallet: v })} />
          <Toggle id="n-price" label="هشدار قیمت (نمایشی)" checked={prefs.notifyPrice} onChange={(v) => setPrefs({ notifyPrice: v })} />
        </TabPanel>
        <TabPanel value="appearance" className="max-w-lg space-y-4 py-5">
          <fieldset>
            <legend className="mb-2 text-sm">تم رابط کاربری</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="تم">
              {(["dark", "light"] as const).map((t) => (
                <button key={t} role="radio" aria-checked={prefs.theme === t} onClick={() => setPrefs({ theme: t })} className={cn("h-12 rounded-md border text-sm", prefs.theme === t ? "border-accent bg-accent-soft text-accent-strong" : "border-line-strong text-muted hover:text-text")}>{t === "dark" ? "تیره" : "روشن"}</button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="def-pair" className="mb-1.5 block text-[13px] text-muted">بازار پیش‌فرض ترمینال</label>
            <select id="def-pair" value={prefs.defaultPair} onChange={(e) => setPrefs({ defaultPair: e.target.value })} className="h-11 w-full rounded-md border border-line-strong bg-sunken px-3 text-sm md:h-10">
              {PAIRS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
        </TabPanel>
        <TabPanel value="watchlist" className="max-w-lg py-4">
          {account.watchlist.length === 0 ? <EmptyState title="لیست پیگیری خالی است" hint="از صفحه بازارها بازار اضافه کنید." /> : (
            <ul>{account.watchlist.map((id) => (
              <li key={id} className="flex items-center justify-between border-b border-line py-2 last:border-0"><bdi dir="ltr" className="font-medium">{getPair(id)?.label ?? id}</bdi><button onClick={() => toggleWatch(id)} aria-label={`حذف ${id}`} className="flex size-9 items-center justify-center rounded-md text-muted hover:bg-raised hover:text-down"><Trash2 size={16} /></button></li>
            ))}</ul>
          )}
        </TabPanel>
        <TabPanel value="simulation" className="max-w-lg space-y-3 py-5">
          <p className="text-sm leading-8 text-muted">وضعیت شبیه‌سازی (موجودی‌ها، سفارش‌ها و تنظیمات) فقط در حافظه محلی همین مرورگر نگهداری می‌شود. با بازنشانی، حساب نمونه به وضعیت اولیه برمی‌گردد.</p>
          <Button variant="outline" onClick={() => setConfirmReset(true)}><RotateCcw size={16} aria-hidden /> بازنشانی حساب نمونه</Button>
        </TabPanel>
      </Tabs>
      <Modal open={confirmReset} onOpenChange={setConfirmReset} title="بازنشانی حساب نمونه؟" description="موجودی‌ها، سفارش‌ها، معاملات و تراکنش‌های نمونه به حالت اولیه برمی‌گردند." footer={<><Button variant="sell" className="flex-1" onClick={() => { reset(now); setConfirmReset(false); toast.ok("حساب نمونه بازنشانی شد"); }}>بازنشانی</Button><Button variant="outline" onClick={() => setConfirmReset(false)}>انصراف</Button></>}><span /></Modal>
    </div>
  );
}
