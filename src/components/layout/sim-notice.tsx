import Link from "next/link";
import { ShieldAlert } from "lucide-react";

/** Concise, always-visible disclosure. Simulated data is never presented as real. */
export function SimStrip() {
  return (
    <div className="flex min-h-7 items-center justify-center gap-2 border-b border-line bg-warn-soft px-3 py-1 text-center text-xs text-warn">
      <ShieldAlert size={14} aria-hidden className="shrink-0" />
      <span>
        محیط معاملاتی شبیه‌سازی‌شده: قیمت‌ها و موجودی‌ها فرضی‌اند و هیچ تراکنش واقعی انجام نمی‌شود.{" "}
        <Link href="/simulation" className="underline underline-offset-2 hover:text-text">
          توضیحات
        </Link>
      </span>
    </div>
  );
}
