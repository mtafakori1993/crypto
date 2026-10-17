import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
  suffix?: ReactNode;
  numeric?: boolean;
}
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, error, hint, suffix, numeric, className, id, ...rest }, ref) {
  const gen = useId();
  const fid = id ?? gen;
  const msg = error ? `${fid}-err` : hint ? `${fid}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={fid} className="mb-1.5 block text-[13px] text-muted">
        {label}
      </label>
      <div className={cn("flex h-11 items-center rounded-md border bg-sunken transition-colors focus-within:border-accent md:h-10", error ? "border-down" : "border-line-strong")}>
        <input
          ref={ref}
          id={fid}
          aria-invalid={!!error}
          aria-describedby={msg}
          inputMode={numeric ? "decimal" : undefined}
          autoComplete="off"
          className={cn("h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted/70", numeric && "num")}
          style={{ outline: "none" }}
          {...rest}
        />
        {suffix && <span className="shrink-0 px-3 text-[13px] text-muted">{suffix}</span>}
      </div>
      {error ? (
        <p id={`${fid}-err`} role="alert" className="mt-1 text-[13px] text-down">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fid}-hint`} className="mt-1 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export function SelectField({ label, children, className, ...rest }: { label: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] text-muted">
        {label}
      </label>
      <select id={id} {...rest} className="h-11 w-full rounded-md border border-line-strong bg-sunken px-3 text-sm focus:border-accent md:h-10">
        {children}
      </select>
    </div>
  );
}
