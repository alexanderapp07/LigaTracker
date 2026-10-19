import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <Card className="max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-semibold">No encontrado</h1>
        <p className="mb-4 text-muted">La página no existe o no tienes acceso a ella.</p>
        <Link href="/" className="text-primary">
          Volver al inicio
        </Link>
      </Card>
    </main>
  );
}
