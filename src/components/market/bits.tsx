import { cn } from "@/lib/cn";
import { assetMap, IRT } from "@/lib/market/assets";

export function AssetIcon({ symbol, size = 28 }: { symbol: string; size?: number }) {
  const hue = symbol === "IRT" ? IRT.hue : assetMap[symbol]?.hue ?? 200;
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.34, background: `linear-gradient(145deg, hsl(${hue} 62% 52%), hsl(${(hue + 30) % 360} 60% 38%))` }}
    >
      <span dir="ltr">{symbol === "IRT" ? "﷼" : symbol.slice(0, symbol.length > 3 ? 3 : symbol.length)}</span>
    </span>
  );
}

/** Pair label that never flips in RTL: BTC/USDT */
export function PairLabel({ base, quote, className }: { base: string; quote: string; className?: string }) {
  return (
    <bdi dir="ltr" className={cn("font-bold", className)}>
      {base}
      <span className="font-normal text-muted">/{quote}</span>
    </bdi>
  );
}

export function Sparkline({ data, up, width = 96, height = 32, fluid }: { data: number[]; up: boolean; width?: number; height?: number; fluid?: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * width).toFixed(1)},${(height - 2 - ((v - min) / span) * (height - 4)).toFixed(1)}`).join(" ");
  const color = up ? "var(--up)" : "var(--down)";
  return (
    <svg width={fluid ? "100%" : width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio={fluid ? "none" : undefined} aria-hidden className="shrink-0" style={{ direction: "ltr" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
