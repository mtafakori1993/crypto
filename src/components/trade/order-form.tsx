"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal, toast } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { feeFor, placeOrder, quoteTotal } from "@/lib/engine/orders";
import { floorTo, formatFixed, formatNumber, formatPrice, parseAmount, toInputValue } from "@/lib/format";
import { useTicker } from "@/lib/hooks";
import { symbolName } from "@/lib/market/assets";
import { getOrderBook, walkBook } from "@/lib/market/orderbook";
import { getPair, quoteName } from "@/lib/market/pairs";
import { SIM } from "@/lib/config";
import { httpExchangeService } from "@/lib/services/exchange-service";
import { useAccount } from "@/lib/store/account-store";
import { useNow } from "@/lib/store/sim-provider";
import type { OrderType, Side } from "@/lib/engine/types";

export interface PickedLevel { price: number; amount?: number; n: number }

export function OrderForm({ pair, picked }: { pair: string; picked: PickedLevel | null }) {
  const info = getPair(pair)!;
  const tk = useTicker(pair);
  const now = useNow();
  const account = useAccount((s) => s.account);
  const hydrated = useAccount((s) => s.hydrated);
  const commit = useAccount((s) => s.commit);
  const [side, setSide] = useState<Side>("buy");
  const [type, setType] = useState<OrderType>("limit");
  const [priceStr, setPriceStr] = useState(() => toInputValue(tk.bid));
  const [amountStr, setAmountStr] = useState("");
  const [totalStr, setTotalStr] = useState("");
  const [touched, setTouched] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<{ field?: string; text: string } | null>(null);

  // an order-book click (new `picked.n`) pre-fills a limit order — derived during render, no effect
  const [seenPick, setSeenPick] = useState(0);
  if (picked && picked.n !== seenPick) {
    setSeenPick(picked.n);
    setType("limit");
    setPriceStr(toInputValue(picked.price));
    if (picked.amount) { setAmountStr(toInputValue(picked.amount)); setTotalStr(""); }
    setServerError(null);
  }
  const selectType = (t: OrderType) => {
    setType(t);
    setServerError(null);
    if (t === "limit" && priceStr === "") setPriceStr(toInputValue(side === "buy" ? tk.bid : tk.ask));
  };

  const balBase = hydrated ? account.balances[info.base]?.free ?? 0 : 0;
  const balQuote = hydrated ? account.balances[info.quote]?.free ?? 0 : 0;
  const available = side === "buy" ? balQuote : balBase;
  const amount = parseAmount(amountStr);
  const limitPrice = parseAmount(priceStr);
  const book = useMemo(() => getOrderBook(pair, Math.floor(now / SIM.priceTickMs) * SIM.priceTickMs, 14), [pair, now]);

  // preview
  const preview = useMemo(() => {
    if (!(amount > 0)) return null;
    if (type === "market") {
      const w = walkBook(book, side, amount);
      if (!w) return { noDepth: true as const };
      const total = quoteTotal(info, amount, w.avgPrice);
      return { price: w.avgPrice, total, fee: side === "buy" ? feeFor(info.base, amount) : feeFor(info.quote, total), noDepth: false as const, immediate: true };
    }
    if (!(limitPrice > 0)) return null;
    const total = quoteTotal(info, amount, limitPrice);
    const immediate = side === "buy" ? limitPrice >= tk.ask : limitPrice <= tk.bid;
    return { price: limitPrice, total, fee: side === "buy" ? feeFor(info.base, amount) : feeFor(info.quote, total), noDepth: false as const, immediate };
  }, [amount, limitPrice, type, side, book, info, tk.ask, tk.bid]);

  const input = { pair, side, type, amount, ...(type === "limit" ? { price: limitPrice } : {}) };
  const dry = useMemo(() => {
    if (!hydrated || !(amount > 0)) return null;
    if (type === "limit" && !(limitPrice > 0)) return { ok: false as const, error: "قیمت را وارد کنید", field: "price" as const };
    const r = placeOrder(account, input, now);
    return r.ok ? ({ ok: true as const }) : r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, hydrated, amount, limitPrice, type, side, pair, now]);

  const amountError = touched ? (Number.isNaN(amount) && amountStr !== "" ? "عدد معتبر وارد کنید" : amountStr === "" ? "مقدار را وارد کنید" : dry && !dry.ok && dry.field !== "price" ? dry.error : serverError?.field === "amount" ? serverError.text : null) : null;
  const priceError = touched && type === "limit" ? (Number.isNaN(limitPrice) ? "قیمت معتبر وارد کنید" : dry && !dry.ok && dry.field === "price" ? dry.error : serverError?.field === "price" ? serverError.text : null) : null;

  const setPct = (pct: number) => {
    const px = type === "market" ? (side === "buy" ? tk.ask : tk.bid) : limitPrice > 0 ? limitPrice : tk.price;
    const raw = side === "buy" ? (available * pct) / px : available * pct;
    const a = floorTo(raw, info.amountDecimals);
    setAmountStr(a > 0 ? toInputValue(a) : "");
    setTotalStr("");
    setTouched(true);
  };
  const onTotal = (v: string) => {
    setTotalStr(v);
    const tot = parseAmount(v);
    const px = type === "market" ? tk.price : limitPrice;
    if (tot > 0 && px > 0) setAmountStr(toInputValue(floorTo(tot / px, info.amountDecimals)));
    else if (v === "") setAmountStr("");
  };
  const shownTotal = totalStr !== "" ? totalStr : preview && !preview.noDepth ? String(preview.total) : "";

  const submit = async () => {
    setBusy(true);
    setServerError(null);
    try {
      const res = await httpExchangeService.placeOrder(account, input, now);
      if (res.ok) {
        commit(res.account);
        toast.ok(res.message);
        setAmountStr(""); setTotalStr(""); setTouched(false); setConfirm(false);
      } else {
        setServerError({ field: res.field, text: res.error });
        toast.error(res.error);
        setConfirm(false);
      }
    } catch {
      toast.error("ارتباط با سرویس شبیه‌سازی برقرار نشد؛ دوباره تلاش کنید");
    } finally {
      setBusy(false);
    }
  };
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!(amount > 0) || (dry && !dry.ok) || (type === "limit" && !(limitPrice > 0))) return;
    if (account.prefs.confirmOrders) setConfirm(true);
    else void submit();
  };

  const isBuy = side === "buy";
  const receiveAsset = isBuy ? info.base : info.quote;
  const receive = preview && !preview.noDepth ? (isBuy ? amount - preview.fee : preview.total - preview.fee) : 0;

  return (
    <section aria-label="ثبت سفارش" className="rounded-lg border border-line bg-surface" data-testid="order-form">
      <div role="tablist" aria-label="جهت سفارش" className="grid grid-cols-2 gap-1 p-1.5">
        {(["buy", "sell"] as const).map((s) => (
          <button key={s} role="tab" aria-selected={side === s} onClick={() => { setSide(s); setTouched(false); setServerError(null); }} className={cn("h-11 rounded-md text-sm font-bold transition-colors", side === s ? (s === "buy" ? "bg-up text-white" : "bg-down text-white") : "bg-sunken text-muted hover:text-text")}>
            {s === "buy" ? "خرید" : "فروش"}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-3 p-3 pt-1.5">
        <div role="tablist" aria-label="نوع سفارش" className="flex gap-4 border-b border-line text-sm">
          {(["limit", "market"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={type === t} onClick={() => selectType(t)} className={cn("h-10 border-b-2 px-1", type === t ? "border-accent text-text" : "border-transparent text-muted")}>
              {t === "limit" ? "حدی" : "بازار"}
            </button>
          ))}
        </div>
        <p className="flex items-center justify-between text-[13px]">
          <span className="text-muted">موجودی قابل استفاده</span>
          <span className="num font-medium" data-testid="available-balance">{hydrated ? `${formatFixed(available, info.amountDecimals > 0 && !isBuy ? info.amountDecimals : info.quote === "IRT" ? 0 : 2)} ${isBuy ? quoteName(info.quote) : info.base}` : "…"}</span>
        </p>
        {type === "limit" ? (
          <Field label="قیمت" numeric value={priceStr} onChange={(e) => { setPriceStr(e.target.value); setTotalStr(""); }} suffix={quoteName(info.quote)} error={priceError} name="price" />
        ) : (
          <Field label="قیمت" disabled value="بازار (بهترین قیمت دفتر سفارش)" readOnly suffix="" />
        )}
        <Field label={`مقدار (${symbolName(info.base)})`} numeric name="amount" value={amountStr} onChange={(e) => { setAmountStr(e.target.value); setTotalStr(""); }} onBlur={() => setTouched(true)} suffix={info.base} error={amountError} />
        <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="درصد موجودی">
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <button key={p} type="button" onClick={() => setPct(p)} className="h-9 rounded-md border border-line bg-sunken text-xs text-muted hover:border-line-strong hover:text-text">
              {formatNumber(p * 100, 0)}٪
            </button>
          ))}
        </div>
        <Field label="مجموع" numeric name="total" value={shownTotal === "" ? "" : totalStr !== "" ? totalStr : toInputValue(Number(shownTotal), info.quote === "IRT" ? 0 : 2)} onChange={(e) => onTotal(e.target.value)} suffix={quoteName(info.quote)} />
        <dl className="space-y-1 rounded-md bg-sunken px-3 py-2 text-[13px]" aria-label="پیش‌نمایش سفارش">
          {preview?.noDepth ? (
            <p className="text-down" role="alert">عمق دفتر سفارش برای این مقدار کافی نیست.</p>
          ) : preview ? (
            <>
              <Row k={type === "market" ? "قیمت میانگین اجرا (شبیه‌سازی)" : "قیمت"} v={`${formatPrice(preview.price, info.priceDecimals)} ${quoteName(info.quote)}`} />
              <Row k={`کارمزد (${formatNumber(SIM.feeRate * 100, 2)}٪)`} v={`${formatFixed(preview.fee, isBuy ? info.amountDecimals : info.quote === "IRT" ? 0 : 4)} ${isBuy ? info.base : quoteName(info.quote)}`} />
              <Row k="دریافت خالص" v={`${formatFixed(receive, isBuy ? info.amountDecimals : info.quote === "IRT" ? 0 : 2)} ${receiveAsset === "IRT" ? "تومان" : receiveAsset}`} strong />
              {type === "limit" && <p className={cn("pt-1 text-xs", preview.immediate ? "text-warn" : "text-muted")}>{preview.immediate ? "این سفارش هم‌قیمت بازار است و بلافاصله در شبیه‌سازی اجرا می‌شود." : "سفارش در انتظار می‌ماند و تا رسیدن قیمت اجرا نمی‌شود؛ موجودی قفل می‌شود."}</p>}
            </>
          ) : (
            <p className="text-muted">برای دیدن کارمزد و مجموع، مقدار را وارد کنید.</p>
          )}
        </dl>
        <Button type="submit" variant={isBuy ? "buy" : "sell"} size="lg" className="w-full" disabled={busy || !hydrated} data-testid="submit-order">
          {isBuy ? "خرید" : "فروش"} {info.base} {type === "market" ? "(بازار)" : "(حدی)"}
        </Button>
        <p className="text-center text-[11px] text-muted max-sm:text-[10.5px] sm:whitespace-nowrap">سفارش فقط در محیط شبیه‌سازی ثبت می‌شود.</p>
      </form>
      <Modal
        open={confirm}
        onOpenChange={setConfirm}
        title={`تأیید سفارش ${isBuy ? "خرید" : "فروش"} ${info.label}`}
        description="این سفارش شبیه‌سازی‌شده است و هیچ معامله واقعی انجام نمی‌شود."
        footer={
          <>
            <Button variant={isBuy ? "buy" : "sell"} className="flex-1" onClick={submit} disabled={busy} data-testid="confirm-order">{busy ? "در حال ثبت…" : "تأیید و ثبت"}</Button>
            <Button variant="outline" onClick={() => setConfirm(false)}>بازگشت</Button>
          </>
        }
      >
        {preview && !preview.noDepth && (
          <dl className="space-y-2 text-sm" data-testid="confirm-summary">
            <Row k="نوع" v={type === "market" ? "بازار" : "حدی"} />
            <Row k="مقدار" v={`${formatFixed(amount, info.amountDecimals)} ${info.base}`} />
            <Row k={type === "market" ? "قیمت میانگین اجرا (شبیه‌سازی)" : "قیمت"} v={`${formatPrice(preview.price, info.priceDecimals)} ${quoteName(info.quote)}`} />
            <Row k="مجموع" v={`${formatFixed(preview.total, info.quote === "IRT" ? 0 : 2)} ${quoteName(info.quote)}`} />
            <Row k="کارمزد" v={`${formatFixed(preview.fee, isBuy ? info.amountDecimals : info.quote === "IRT" ? 0 : 4)} ${isBuy ? info.base : quoteName(info.quote)}`} />
            <Row k="دریافت خالص" v={`${formatFixed(receive, isBuy ? info.amountDecimals : info.quote === "IRT" ? 0 : 2)} ${receiveAsset === "IRT" ? "تومان" : receiveAsset}`} strong />
            {type === "limit" && !preview.immediate && <p className="rounded-md bg-warn-soft p-2 text-xs text-warn">سفارش حدی «در انتظار» ثبت می‌شود و تا رسیدن قیمت به مقدار تعیین‌شده اجرا نخواهد شد.</p>}
          </dl>
        )}
      </Modal>
    </section>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className={cn("num", strong && "font-bold")}>{v}</dd>
    </div>
  );
}
