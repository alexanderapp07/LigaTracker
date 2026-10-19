import { listUserTenants, prisma } from "@ligatracker/db";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { requireSession } from "@/lib/session";

export const metadata = { title: "Mis ligas" };

export default async function MyLeaguesPage() {
  const session = await requireSession();
  const tenants = await listUserTenants(prisma, session.userId);
  return (
    <>
      <AppHeader title="Mis ligas" />
      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
        <h1 className="text-2xl font-semibold">Elige una liga</h1>
        {tenants.length === 0 ? (
          <Card>
            <p className="text-muted">Todavía no perteneces a ninguna liga. Pide al administrador que te invite.</p>
          </Card>
        ) : (
          tenants.map((t) => (
            <Link key={t.id} href={`/panel/${t.slug}`}>
              <Card className="hover:opacity-90">
                <h3 className="font-medium">{t.name}</h3>
                <p className="text-xs text-muted">/{t.slug}</p>
              </Card>
            </Link>
          ))
        )}
      </main>
    </>
  );
}
