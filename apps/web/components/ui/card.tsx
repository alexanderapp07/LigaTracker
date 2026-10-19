import type { HTMLAttributes } from "react";

// Estándares, Capítulo 3: radio 12px, padding 24px, sombra en claro y borde en oscuro.
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[12px] border border-[var(--card-border)] bg-card p-6 shadow-[var(--card-shadow)] ${className}`}
      {...props}
    />
  );
}
