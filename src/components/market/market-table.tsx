"use client";
import { ArrowDownUp, Search, SearchX, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Change, EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatCompact, formatPrice } from "@/lib/format";
import { useSparkline, useTickers } from "@/lib/hooks";
import { assetMap, CATEGORY_LABEL, type AssetCategory } from "@/lib/market/assets";
import { PAIRS } from "@/lib/market/pairs";
import { useAccount } from "@/lib/store/account-store";
import { AssetIcon, PairLabel, Sparkline } from "./bits";

type SortKey = "name" | "price" | "change" | "volume";
const norm = (s: string) => s.toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک").trim();

function SparkCell({ pair, up }: { pair: string; up: boolean }) {
  const data = useSparkline(pair);
  return <Sparkline data={data} up={up} />;
}

export function MarketTable({ limit, compact, showFilters = true }: { limit?: number; compact?: boolean; showFilters?: boolean }) {
  const tickers = useTickers();
  const watch = useAccount((s) => s.account.watchlist);
  const hydrated = useAccount((s) => s.hydrated);
  const toggleWatch = useAccount((s) => s.toggleWatch);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<AssetCategory | "all" | "watch">("all");
  const [quote, setQuote] = useState<"all" | "USDT" | "IRT">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "volume", dir: -1 });

  const rows = useMemo(() => {
    const n = norm(q);
    let list = tickers.filter((t) => {
      const a = assetMap[t.base];
      if (quote !== "all" && t.quote !== quote) return false;
      if (cat === "watch") return watch.includes(t.pair);
      if (cat !== "all" && a.category !== cat) return false;
      if (!n) return true;
      return a.symbol.toLowerCase().includes(n) || norm(a.nameFa).includes(n) || a.nameEn.toLowerCase().includes(n);
    });
    const val = (t: (typeof tickers)[number]) => (sort.key === "name" ? assetMap[t.base].nameFa : sort.key === "price" ? t.price : sort.key === "change" ? t.change24h : t.volumeQuote / (t.quote === "IRT" ? 100_000 : 1));
    list = [...list].sort((a, b) => {
      const x = val(a), y = val(b);
      return (typeof x === "string" ? x.localeCompare(y as string, "fa") : (x as number) - (y as number)) * sort.dir;
    });
    return limit ? list.slice(0, limit) : list;
  }, [tickers, q, cat, quote, sort, watch, limit]);

  const th = (key: SortKey, label: string, cls = "") => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={cn("px-3 py-2 font-normal", cls)}>
      <button onClick={() => setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: key === "name" ? 1 : -1 }))} className={cn("inline-flex items-center gap-1 hover:text-text", sort.key === key && "text-text")}>
        {label}
        <ArrowDownUp size={12} aria-hidden />
      </button>
    </th>
  );
  const cats: [typeof cat, string][] = [["all", "همه"], ["watch", "نشان‌شده‌ها"], ...(["major", "layer1", "defi", "meme", "stable"] as AssetCategory[]).map((c) => [c, CATEGORY_LABEL[c]] as [AssetCategory, string])];

  return (
    <div>
      {showFilters && (
        <div className="mb-3 flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="no-scrollbar -mx-1 flex min-w-0 gap-1.5 overflow-x-auto px-1 md:flex-1" role="group" aria-label="دسته‌بندی بازار">
            {cats.map(([k, label]) => (
              <button key={k} onClick={() => setCat(k)} aria-pressed={cat === k} className={cn("h-9 shrink-0 rounded-full border px-3.5 text-[13px] transition-colors", cat === k ? "border-accent bg-accent-soft text-accent-strong" : "border-line text-muted hover:text-text")}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex min-w-0 gap-2 md:shrink-0">
            <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-line-strong bg-sunken px-3 focus-within:border-accent md:w-64 md:flex-none">
              <Search size={16} className="text-muted" aria-hidden />
              <input type="search" aria-label="جست‌وجو در بازارها" placeholder="نماد یا نام فارسی…" value={q} onChange={(e) => setQ(e.target.value)} className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none" style={{ outline: "none" }} />
            </div>
            <select aria-label="ارز مبنا" value={quote} onChange={(e) => setQuote(e.target.value as typeof quote)} className="h-10 w-28 shrink-0 rounded-md border border-line-strong bg-sunken px-2 text-sm">
              <option value="all">همه مبناها</option>
              <option value="USDT">تتر (USDT)</option>
              <option value="IRT">تومان (IRT)</option>
            </select>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[320px] text-sm">
          <caption className="sr-only">فهرست بازارها با قیمت شبیه‌سازی‌شده</caption>
          <thead className="border-b border-line text-xs text-muted">
            <tr className="text-start">
              <th scope="col" className="w-10 px-2 py-2"><span className="sr-only">نشان‌کردن</span></th>
              {th("name", "بازار", "text-start")}
              {th("price", "آخرین قیمت", "text-start")}
              {th("change", "تغییر ۲۴س", "text-start")}
              <th scope="col" className="hidden px-3 py-2 text-start font-normal md:table-cell">بیشترین / کمترین ۲۴س</th>
              {th("volume", "حجم ۲۴س", "hidden lg:table-cell text-start")}
              <th scope="col" className="hidden px-3 py-2 text-start font-normal sm:table-cell">روند</th>
              {!compact && <th scope="col" className="hidden w-24 px-3 py-2 sm:table-cell"><span className="sr-only">معامله</span></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const a = assetMap[t.base];
              const pair = PAIRS.find((p) => p.id === t.pair)!;
              const starred = hydrated && watch.includes(t.pair);
              return (
                <tr key={t.pair} className="border-b border-line last:border-0 hover:bg-raised/60">
                  <td className="px-2 py-2.5">
                    <button aria-label={starred ? `حذف ${pair.label} از نشان‌شده‌ها` : `نشان‌کردن ${pair.label}`} aria-pressed={starred} onClick={() => toggleWatch(t.pair)} className={cn("flex size-9 items-center justify-center rounded-md hover:bg-sunken", starred ? "text-warn" : "text-muted")}>
                      <Star size={16} fill={starred ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/trade/${t.pair}`} className="flex items-center gap-2.5">
                      <AssetIcon symbol={t.base} size={30} />
                      <span className="flex flex-col leading-tight">
                        <PairLabel base={t.base} quote={t.quote} />
                        <span className="text-xs text-muted">{a.nameFa}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="num px-3 py-2.5 font-medium">{formatPrice(t.price, pair.priceDecimals)}</td>
                  <td className="px-3 py-2.5"><Change value={t.change24h} /></td>
                  <td className="num hidden px-3 py-2.5 text-xs text-muted md:table-cell">
                    <div>{formatPrice(t.high24h, pair.priceDecimals)}</div>
                    <div>{formatPrice(t.low24h, pair.priceDecimals)}</div>
                  </td>
                  <td className="num hidden px-3 py-2.5 text-muted lg:table-cell">{formatCompact(t.volumeQuote)}</td>
                  <td className="hidden px-3 py-2.5 sm:table-cell"><SparkCell pair={t.pair} up={t.change24h >= 0} /></td>
                  {!compact && (
                    <td className="hidden px-3 py-2.5 sm:table-cell">
                      <ButtonLink href={`/trade/${t.pair}`} variant="subtle" size="sm">معامله</ButtonLink>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <EmptyState icon={<SearchX size={22} />} title="نتیجه‌ای پیدا نشد" hint={cat === "watch" ? "هنوز بازاری را نشان‌دار نکرده‌اید. با ستاره کنار هر بازار آن را به لیست پیگیری اضافه کنید." : "عبارت جست‌وجو یا فیلترها را تغییر دهید."} action={<button className="rounded-md border border-line-strong px-4 py-2 text-sm hover:bg-raised" onClick={() => { setQ(""); setCat("all"); setQuote("all"); }}>پاک‌کردن فیلترها</button>} />
        )}
      </div>
    </div>
  );
}
