import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "buy" | "sell" | "outline" | "ghost" | "subtle";
const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-strong disabled:opacity-50",
  buy: "bg-up text-white hover:brightness-110 disabled:opacity-50",
  sell: "bg-down text-white hover:brightness-110 disabled:opacity-50",
  outline: "border border-line-strong text-text hover:bg-raised disabled:opacity-50",
  ghost: "text-muted hover:text-text hover:bg-raised disabled:opacity-50",
  subtle: "bg-raised text-text hover:bg-sunken border border-line disabled:opacity-50",
};
const sizes = { sm: "h-9 px-3 text-[13px]", md: "h-11 px-4 text-sm md:h-10", lg: "h-12 px-6 text-base" };

type Common = { variant?: ButtonVariant; size?: keyof typeof sizes; className?: string; children?: ReactNode };
const base = "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed";

export function Button({ variant = "primary", size = "md", className, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...rest} className={cn(base, variants[variant], sizes[size], className)} />;
}
export function ButtonLink({ variant = "primary", size = "md", className, href, children, ...rest }: Common & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} {...rest} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
