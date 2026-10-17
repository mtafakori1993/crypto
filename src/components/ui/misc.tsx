"use client";
import { Dialog as RDialog, Switch as RSwitch, Tabs as RTabs, Tooltip as RTooltip } from "radix-ui";
import { Check, CircleAlert, Info, X } from "lucide-react";
import { create } from "zustand";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "up" | "down" | "warn" | "accent"; className?: string }) {
  const tones = { neutral: "bg-raised text-muted border-line", up: "bg-up-soft text-up border-transparent", down: "bg-down-soft text-down border-transparent", warn: "bg-warn-soft text-warn border-transparent", accent: "bg-accent-soft text-accent-strong border-transparent" };
  return <span className={cn("inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs leading-5", tones[tone], className)}>{children}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function EmptyState({ title, hint, action, icon }: { title: string; hint?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent-strong" aria-hidden>
        {icon ?? <Info size={22} />}
      </div>
      <p className="text-base font-medium">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "خطا در بارگذاری", hint, onRetry }: { title?: string; hint?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <CircleAlert className="text-down" size={28} aria-hidden />
      <p className="font-medium">{title}</p>
      {hint && <p className="text-sm text-muted">{hint}</p>}
      {onRetry && (
        <button onClick={onRetry} className="mt-1 rounded-md border border-line-strong px-4 py-2 text-sm hover:bg-raised">
          تلاش دوباره
        </button>
      )}
    </div>
  );
}

/** Signed percentage, green / red, never colour-only (sign is part of the text). */
export function Change({ value, className }: { value: number; className?: string }) {
  const tone = value > 0.004 ? "text-up" : value < -0.004 ? "text-down" : "text-muted";
  return <span className={cn("num font-medium", tone, className)}>{formatPercent(value)}</span>;
}

/* ---------- Tooltip ---------- */
export function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <RTooltip.Provider delayDuration={250}>
      <RTooltip.Root>
        <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content sideOffset={6} className="z-[80] rounded-md border border-line-strong bg-raised px-2.5 py-1.5 text-xs text-text shadow-pop">
            {label}
            <RTooltip.Arrow className="fill-line-strong" />
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  );
}

/* ---------- Dialog ---------- */
export function Modal({ open, onOpenChange, title, description, children, footer }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]" />
        <RDialog.Content className="fixed inset-x-0 bottom-0 z-[61] max-h-[92dvh] overflow-y-auto rounded-t-lg border border-line-strong bg-surface p-5 shadow-pop md:inset-auto md:left-1/2 md:top-1/2 md:w-[min(92vw,460px)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <RDialog.Title className="text-lg font-bold">{title}</RDialog.Title>
              {description ? (
                <RDialog.Description className="mt-1 text-sm text-muted">{description}</RDialog.Description>
              ) : (
                <RDialog.Description className="sr-only">{title}</RDialog.Description>
              )}
            </div>
            <RDialog.Close aria-label="بستن" className="flex size-9 items-center justify-center rounded-md text-muted hover:bg-raised hover:text-text">
              <X size={18} />
            </RDialog.Close>
          </div>
          {children}
          {footer && <div className="mt-5 flex gap-2">{footer}</div>}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

/* ---------- Tabs ---------- */
export const Tabs = RTabs.Root;
export function TabList({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <RTabs.List aria-label={label} className={cn("no-scrollbar flex gap-1 overflow-x-auto border-b border-line", className)}>
      {children}
    </RTabs.List>
  );
}
export function Tab({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  return (
    <RTabs.Trigger
      value={value}
      className={cn("relative h-11 shrink-0 px-3.5 text-sm text-muted transition-colors hover:text-text data-[state=active]:text-text data-[state=active]:after:absolute data-[state=active]:after:inset-x-2 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:rounded data-[state=active]:after:bg-accent", className)}
    >
      {children}
    </RTabs.Trigger>
  );
}
export const TabPanel = RTabs.Content;

/* ---------- Switch ---------- */
export function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <RSwitch.Root id={id} checked={checked} onCheckedChange={onChange} className="relative h-6 w-11 shrink-0 rounded-full bg-line-strong transition-colors data-[state=checked]:bg-accent">
        <RSwitch.Thumb className="block size-5 translate-x-[-2px] rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[-22px]" style={{ marginInlineStart: 0 }} />
      </RSwitch.Root>
    </div>
  );
}

/* ---------- Toasts ---------- */
interface ToastItem { id: number; text: string; tone: "ok" | "error" | "info" }
const useToasts = create<{ items: ToastItem[]; push: (text: string, tone?: ToastItem["tone"]) => void; drop: (id: number) => void }>((set) => ({
  items: [],
  push: (text, tone = "info") => set((s) => ({ items: [...s.items.slice(-3), { id: Date.now() + Math.random(), text, tone }] })),
  drop: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));
export const toast = {
  ok: (t: string) => useToasts.getState().push(t, "ok"),
  error: (t: string) => useToasts.getState().push(t, "error"),
  info: (t: string) => useToasts.getState().push(t, "info"),
};
export function Toaster() {
  const items = useToasts((s) => s.items);
  const drop = useToasts((s) => s.drop);
  useEffect(() => {
    if (!items.length) return;
    const timers = items.map((i) => setTimeout(() => drop(i.id), 5000));
    return () => timers.forEach(clearTimeout);
  }, [items, drop]);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 lg:bottom-6">
      {items.map((i) => (
        <div key={i.id} role={i.tone === "error" ? "alert" : "status"} className={cn("pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-md border bg-surface px-4 py-3 text-sm shadow-pop", i.tone === "ok" ? "border-up/50" : i.tone === "error" ? "border-down/60" : "border-line-strong")}>
          {i.tone === "ok" ? <Check className="mt-0.5 shrink-0 text-up" size={18} /> : i.tone === "error" ? <CircleAlert className="mt-0.5 shrink-0 text-down" size={18} /> : <Info className="mt-0.5 shrink-0 text-info" size={18} />}
          <span className="flex-1">{i.text}</span>
          <button onClick={() => drop(i.id)} aria-label="بستن اعلان" className="text-muted hover:text-text">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
