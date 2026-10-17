"use client";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { AssetIcon } from "@/components/market/bits";
import { ASSETS } from "@/lib/market/assets";
import { cn } from "@/lib/cn";

const norm = (s: string) => s.toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک").trim();

export function GlobalSearch({ className }: { className?: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const results = useMemo(() => {
    const n = norm(q);
    if (!n) return [];
    return ASSETS.filter((a) => a.symbol.toLowerCase().includes(n) || norm(a.nameFa).includes(n) || a.nameEn.toLowerCase().includes(n)).slice(0, 6);
  }, [q]);
  const go = (symbol: string) => {
    setOpen(false);
    setQ("");
    router.push(`/markets/${symbol}`);
  };
  return (
    <div ref={box} className={cn("relative", className)} onBlur={(e) => !box.current?.contains(e.relatedTarget as Node) && setOpen(false)}>
      <div className="flex h-10 items-center gap-2 rounded-md border border-line-strong bg-sunken px-3 focus-within:border-accent">
        <Search size={16} className="shrink-0 text-muted" aria-hidden />
        <input
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={id}
          aria-label="جست‌وجوی دارایی"
          placeholder="جست‌وجوی ارز (BTC، بیت‌کوین…)"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Enter" && results[active]) go(results[active].symbol);
            if (e.key === "Escape") setOpen(false);
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70"
          style={{ outline: "none" }}
        />
      </div>
      {open && q && (
        <ul id={id} role="listbox" className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-md border border-line-strong bg-surface shadow-pop">
          {results.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-muted">نتیجه‌ای برای «{q}» پیدا نشد</li>
          ) : (
            results.map((a, i) => (
              <li key={a.symbol} role="option" aria-selected={i === active}>
                <Link href={`/markets/${a.symbol}`} onClick={() => go(a.symbol)} onMouseEnter={() => setActive(i)} className={cn("flex items-center gap-3 px-3 py-2.5 text-sm", i === active && "bg-raised")}>
                  <AssetIcon symbol={a.symbol} size={26} />
                  <span className="font-medium">{a.nameFa}</span>
                  <bdi dir="ltr" className="text-muted">{a.symbol}</bdi>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
