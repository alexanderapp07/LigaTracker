import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold">
          <span className="text-primary">LIGA</span> TRACKER
        </h1>
        <p className="mb-6 text-xs text-muted">Inicia sesión para administrar tu liga.</p>
        <LoginForm next={next} />
      </Card>
      <ThemeToggle />
    </main>
  );
}
