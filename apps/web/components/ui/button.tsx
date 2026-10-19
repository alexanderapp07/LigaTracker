import type { ButtonHTMLAttributes } from "react";

// Estándares, Capítulo 2: padding 16×8, radio 6px, hover 90 %, deshabilitado 50 %.
const variants = {
  primary: "bg-primary text-white",
  secondary: "border border-muted bg-transparent text-foreground",
  destructive: "bg-destructive text-white",
} as const;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-[6px] px-4 py-2 text-sm hover:opacity-90 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
