// Estándares, Capítulo 2: píldora 10×2, texto 12px, fondo al 20 % del color.
const variants = {
  normal: "bg-muted/20 text-foreground",
  success: "bg-success/20 text-success",
  destructive: "bg-destructive/20 text-destructive",
} as const;

export function Badge({ variant = "normal", children }: { variant?: keyof typeof variants; children: React.ReactNode }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>{children}</span>;
}
