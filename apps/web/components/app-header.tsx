import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader({ title, href = "/" }: { title: string; href?: string }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-muted/20 px-4 py-3 sm:px-6">
      <Link href={href} className="font-semibold">
        <span className="text-primary">LIGA</span> TRACKER <span className="font-normal text-muted">· {title}</span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action={logoutAction}>
          <button type="submit" className="px-2 py-1.5 text-xs text-muted hover:opacity-90">
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
