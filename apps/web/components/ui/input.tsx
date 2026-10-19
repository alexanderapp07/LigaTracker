import type { InputHTMLAttributes } from "react";

// Estándares, Capítulo 2: alto 40px, padding 12×8, borde muted, foco primary, error destructive.
export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`h-10 rounded-[6px] border bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary ${error ? "border-destructive" : "border-muted"} ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
