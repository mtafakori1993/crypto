"use client";
import { ChevronDown, Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AssetIcon, PairLabel } from "@/components/market/bits";
import { Change, Modal } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { formatCompact, formatPrice } from "@/lib/format";
import { usePriceDirection, useTicker, useTickers } from "@/lib/hooks";
import { assetMap } from "@/lib/market/assets";
import { PAIRS, getPair } from "@/lib/market/pairs";
import { useAccount } from "@/lib/store/account-store";

function PairPicker({ current, open, onOpenChange }: { current: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const tickers = useTickers();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return tickers.filter((t) => !n || t.pair.toLowerCase().includes(n) || assetMap[t.base].nameFa.includes(n));
  }, [tickers, q]);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="انتخاب بازار">
      <div className="mb-3 flex h-10 items-center gap-2 rounded-md border border-line-strong bg-sunken px-3 focus-within:border-accent">
        <Search size={16} className="text-muted" aria-hidden />
        <input autoFocus type="search" aria-label="جست‌وجوی بازار" placeholder="BTC، اتریوم…" value={q} onChange={(e) => setQ(e.target.value)} className="h-full flex-1 bg-transparent text-sm outline-none" style={{ outline: "none" }} />
      </div>
      <ul className="scroll-thin max-h-[50dvh] overflow-y-auto">
        {list.length === 0 && <li className="py-8 text-center text-sm text-muted">بازاری پیدا نشد</li>}
        {list.map((t) => (
          <li key={t.pair}>
            <button onClick={() => { onOpenChange(false); router.push(`/trade/${t.pair}`); }} aria-current={t.pair === current} className={cn("flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-start hover:bg-raised", t.pair === current && "bg-accent-soft")}>
              <AssetIcon symbol={t.base} size={28} />
              <span className="flex-1 leading-tight"><PairLabel base={t.base} quote={t.quote} className="text-sm" /><span className="block text-xs text-muted">{assetMap[t.base].nameFa}</span></span>
              <span className="text-end leading-tight"><span className="num block text-sm">{formatPrice(t.price, getPair(t.pair)!.priceDecimals)}</span><Change value={t.change24h} className="text-xs" /></span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

export function PairHeader({ pair }: { pair: string }) {
  const info = getPair(pair)!;
  const t = useTicker(pair);
  const [open, setOpen] = useState(false);
  const dir = usePriceDirection(t.price);
  const starred = useAccount((s) => s.hydrated && s.account.watchlist.includes(pair));
  const toggle = useAccount((s) => s.toggleWatch);
  const p = (v: number) => formatPrice(v, info.priceDecimals);
  const stat = (label: string, value: string) => (
    <div className="shrink-0"><dt className="text-[11px] text-muted">{label}</dt><dd className="num text-[13px] font-medium">{value}</dd></div>
  );
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-line bg-surface px-4 py-3" data-testid="pair-header">
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`بازار ${info.label}؛ تغییر بازار`} className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-raised">
          <AssetIcon symbol={info.base} size={34} />
          <span className="text-start leading-tight"><PairLabel base={info.base} quote={info.quote} className="text-lg" /><span className="block text-xs text-muted">{assetMap[info.base].nameFa}</span></span>
          <ChevronDown size={16} className="text-muted" aria-hidden />
        </button>
        <button onClick={() => toggle(pair)} aria-pressed={starred} aria-label={starred ? "حذف از نشان‌شده‌ها" : "افزودن به نشان‌شده‌ها"} className={cn("flex size-10 items-center justify-center rounded-md hover:bg-raised", starred ? "text-warn" : "text-muted")}>
          <Star size={18} fill={starred ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="leading-tight">
        <div className={cn("num text-2xl font-bold", dir === "up" ? "text-up" : "text-down")} data-testid="header-price">{p(t.price)}</div>
        <Change value={t.change24h} className="text-xs" />
      </div>
      <dl className="no-scrollbar flex min-w-0 flex-1 gap-6 overflow-x-auto sm:flex-none">
        {stat("بیشترین ۲۴س", p(t.high24h))}
        {stat("کمترین ۲۴س", p(t.low24h))}
        {stat(`حجم ۲۴س (${info.base})`, formatCompact(t.volumeBase))}
        {stat(`حجم ۲۴س (${info.quote})`, formatCompact(t.volumeQuote))}
      </dl>
      <PairPicker current={pair} open={open} onOpenChange={setOpen} />
    </header>
  );
}
export { PAIRS };
