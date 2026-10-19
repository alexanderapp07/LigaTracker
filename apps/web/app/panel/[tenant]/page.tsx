import { Card } from "@/components/ui/card";
import { getPanelContext } from "@/lib/tenant";

export const metadata = { title: "Panel de Control" };

export default async function DashboardPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const { db, can } = await getPanelContext(slug);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  // Todas las consultas pasan por el cliente filtrado por liga.
  const [activeTournaments, matchesToday, teams, players] = await Promise.all([
    db.tournament.count({ where: { status: { in: ["Inscripcion", "En_Curso"] }, deletedAt: null } }),
    db.match.count({ where: { scheduledAt: { gte: startOfDay, lt: endOfDay }, deletedAt: null } }),
    db.team.count({ where: { deletedAt: null } }),
    db.player.count({ where: { deletedAt: null } }),
  ]);

  const kpis = [
    { label: "Torneos activos", value: activeTournaments },
    { label: "Partidos de hoy", value: matchesToday },
    { label: "Equipos registrados", value: teams },
    { label: "Jugadores", value: players },
  ];

  return (
    <>
      <h1 className="text-2xl font-semibold">Panel de Control</h1>
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <h3 className="text-xs text-muted">{k.label}</h3>
            <p className="tabular mt-2 text-2xl font-semibold">{k.value}</p>
          </Card>
        ))}
      </section>
      <Card>
        <h2 className="mb-2 text-xl font-semibold">Próximos pasos</h2>
        <p className="text-muted">
          {can("torneo:crear")
            ? "Pronto podrás crear torneos, registrar equipos y generar el calendario desde aquí."
            : "Tu rol te permite registrar resultados cuando haya partidos programados."}
        </p>
      </Card>
    </>
  );
}
