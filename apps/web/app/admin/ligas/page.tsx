import { prisma } from "@ligatracker/db";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireSuperAdmin } from "@/lib/session";
import { CreateLeagueForm } from "./create-league-form";

export const metadata = { title: "Ligas" };

const statusVariant = { Activa: "success", Prueba: "normal", Suspendida: "destructive" } as const;

export default async function AdminLeaguesPage() {
  await requireSuperAdmin();
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tournaments: true, teams: true } } },
  });

  return (
    <>
      <AppHeader title="Súper administración" href="/admin/ligas" />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <h1 className="text-2xl font-semibold">Ligas</h1>
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Nueva liga</h2>
          <CreateLeagueForm />
        </Card>
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left">
            <thead className="text-xs text-muted">
              <tr className="h-12 border-b border-muted/20">
                <th className="px-4 font-normal">Liga</th>
                <th className="px-4 font-normal">Estado</th>
                <th className="px-4 font-normal">Torneos</th>
                <th className="px-4 font-normal">Equipos</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="h-12 border-b border-muted/20 last:border-0">
                  <td className="px-4">
                    <Link href={`/panel/${t.slug}`} className="hover:text-primary">
                      {t.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted">/{t.slug}</span>
                  </td>
                  <td className="px-4">
                    <Badge variant={statusVariant[t.subscriptionStatus]}>{t.subscriptionStatus}</Badge>
                  </td>
                  <td className="tabular px-4">{t._count.tournaments}</td>
                  <td className="tabular px-4">{t._count.teams}</td>
                </tr>
              ))}
              {tenants.length === 0 ? (
                <tr className="h-12">
                  <td colSpan={4} className="px-4 text-muted">
                    Aún no hay ligas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>
      </main>
    </>
  );
}
