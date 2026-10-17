import { cn } from "@/lib/cn";

/** Original mark: rounded hexagon holding three candlesticks (rise, pullback, rise). */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className={className}>
      <path d="M20 2.5 35.2 11.2v17.6L20 37.5 4.8 28.8V11.2L20 2.5Z" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 13v14M20 10v12M27 9v12" stroke="var(--accent-strong)" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="10.8" y="17" width="4.4" height="7" rx="1" fill="var(--up)" />
      <rect x="17.8" y="14" width="4.4" height="6.5" rx="1" fill="var(--down)" />
      <rect x="24.8" y="12" width="4.4" height="6" rx="1" fill="var(--up)" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} aria-label="شوما کریپتو">
      <LogoMark />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span dir="ltr" className="text-[15px] font-bold tracking-[0.18em]">
            SHOMAAA
          </span>
          <span className="mt-1 text-[11px] text-muted max-[420px]:hidden">
            <span dir="ltr" className="tracking-[0.3em]">CRYPTO</span> · شوما کریپتو
          </span>
        </span>
      )}
    </span>
  );
}
