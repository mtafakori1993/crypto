"use client";
import { assetMap, IRT, symbolName } from "@/lib/market/assets";
import { formatPercent } from "@/lib/format";
import type { HoldingRow } from "@/lib/engine/account";

export const holdingColor = (symbol: string, i = 0) => `hsl(${symbol === "IRT" ? IRT.hue : assetMap[symbol]?.hue ?? 200} 62% ${i % 2 ? 50 : 56}%)`;

export function AllocationDonut({ rows }: { rows: HoldingRow[] }) {
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  const top = rows.slice(0, 6);
  const other = rows.slice(6).reduce((s, r) => s + r.share, 0);
  const slices = [...top.map((r, i) => ({ key: r.asset, label: symbolName(r.asset), share: r.share, color: holdingColor(r.asset, i) })), ...(other > 0 ? [{ key: "other", label: "سایر", share: other, color: "var(--line-strong)" }] : [])];
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row" data-testid="allocation">
      <svg viewBox="0 0 140 140" width="168" height="168" role="img" aria-label={`تخصیص دارایی: ${slices.map((s) => `${s.label} ${formatPercent(s.share * 100, false)}`).join("، ")}`} className="shrink-0 -rotate-90">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--sunken)" strokeWidth="18" />
        {slices.map((s) => {
          const len = s.share * C;
          const el = <circle key={s.key} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth="18" strokeDasharray={`${Math.max(len - 1.5, 0)} ${C}`} strokeDashoffset={-acc} />;
          acc += len;
          return el;
        })}
      </svg>
      <ul className="w-full flex-1 space-y-2 text-sm">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-sm" style={{ background: s.color }} aria-hidden />
            <span className="flex-1">{s.label}</span>
            <span className="num text-muted">{formatPercent(s.share * 100, false)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
