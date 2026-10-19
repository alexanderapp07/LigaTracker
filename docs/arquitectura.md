# LIGA TRACKER: estructura del repositorio (MVP)

Stack elegido: **TypeScript de punta a punta**. Next.js (App Router) para el panel, el portal público y la API, con Prisma + PostgreSQL. Todo vive en un monorepo con Turborepo y pnpm. NestJS se separará en `apps/api` cuando llegue Flutter u otro cliente externo.

## Árbol propuesto

```
ligatracker/
├── apps/
│   └── web/                      # Next.js: panel, portal público y API
│       ├── app/
│       │   ├── login/  ligas/             # inicio de sesión y selector de liga
│       │   ├── panel/[tenant]/            # panel de la liga (requiere sesión)
│       │   │   ├── torneos/[torneo]/{equipos,calendario,partidos,tabla,sanciones}/
│       │   │   ├── equipos/  jugadores/  sedes/
│       │   ├── admin/ligas/               # alta de ligas (solo isSuperAdmin)
│       │   ├── [tenant]/[torneo]/         # portal público: tabla, jornadas, goleadores
│       │   │   └── opengraph-image.tsx     # vista previa para WhatsApp
│       │   └── api/                       # route handlers (uploads, healthcheck)
│       ├── lib/
│       │   ├── session.ts         # cookie JWT firmada → { userId, isSuperAdmin }
│       │   └── tenant.ts          # getPanelContext / requirePermission + cliente filtrado
│       ├── public/manifest.json   # PWA
│       └── Dockerfile             # multi-stage, output: "standalone"
├── packages/
│   ├── db/
│   │   ├── prisma/schema.prisma
│   │   ├── prisma/migrations/0001_init/migration.sql
│   │   ├── src/tenant-extension.ts  # filtra y valida tenantId en todas las queries
│   │   └── src/seed.ts            # permisos, roles base, liga demo
│   ├── domain/                    # lógica pura, sin Next ni Prisma; tests con Vitest
│   │   ├── permissions.ts         # catálogo de claims y roles base
│   │   ├── fixture.ts             # round robin (método del círculo) + espejo + bye
│   │   ├── standings.ts           # tabla + desempates (DG, GF, duelo directo)
│   │   ├── scorers.ts             # goleadores, valla menos vencida
│   │   ├── sanctions.ts           # suspensiones automáticas por tarjetas
│   │   └── scheduling.ts          # detección de choques de cancha/horario
│   └── (ui, config)               # se extraerán de apps/web cuando haya un segundo cliente
├── docker-compose.yml             # postgres + web (+ caddy en producción)
├── .github/workflows/ci.yml       # lint, typecheck, test, build, migrate deploy
├── turbo.json
└── pnpm-workspace.yaml
```

**Reglas de dependencia:** `domain` no importa nada del proyecto, `db` solo importa Prisma y `web` usa ambos. Cuando llegue `apps/api` (NestJS), reutilizará `domain` y `db` sin cambios.

## Multitenencia en el MVP

1. La sesión (JWT HS256 en cookie httpOnly, 8 h) guarda solo `userId` e `isSuperAdmin`. La liga sale de la URL (`/panel/{slug}`) y los claims se leen de la base en cada petición, así un cambio de rol aplica al instante.
2. `lib/tenant.ts` crea un cliente con `forTenant(prisma, tenantId)`. Esa extensión agrega `where: { tenantId }` a lecturas, actualizaciones y borrados, y fija `data.tenantId` en las altas. El código de páginas nunca usa el cliente sin filtrar.
3. Cada acción verifica `requirePermission("<claim>")`. Se comparan claims, no nombres de rol (tal como pide tu documento).
4. Un test de integración crea dos ligas y comprueba que ninguna consulta de la liga A devuelve datos de la B.
5. **Más adelante (v1.3):** RLS en PostgreSQL con `SET app.tenant_id` por transacción. El schema ya tiene `tenant_id` en todas las tablas, así que solo hay que añadir políticas.

## Claims iniciales (seed)

| Claim | Administrador | Delegado de mesa |
|-------|:-:|:-:|
| `torneo:crear`, `torneo:editar` | ✔ | |
| `equipo:gestionar`, `jugador:gestionar` | ✔ | |
| `sede:gestionar` | ✔ | |
| `calendario:generar`, `partido:programar` | ✔ | |
| `partido:registrar-resultado`, `partido:registrar-gol`, `partido:registrar-tarjeta` | ✔ | ✔ |
| `sancion:gestionar` | ✔ | |

## Cambios del schema respecto a tu DBML

- `tenant_id` en todas las tablas con datos de una liga (pitches, squads, rounds, matches, goles, tarjetas, sanciones, reglas, inscripciones).
- `updated_by` y `deleted_by` ahora son opcionales.
- `tenant_user_roles`: un usuario puede tener varios roles en la misma liga.
- `users.is_super_admin` (RF-00.0). `tenants`: `logo_url`, contacto y estado como enum.
- `tournaments`: `slug` e `is_public` para el portal.
- `tournament_rules`: puntos por resultado, goles de W.O., tamaño mínimo y máximo de plantilla, ida y vuelta, y orden de desempates.
- `teams`: el representante puede ser solo un contacto (nombre, teléfonos, email) sin cuenta.
- `players`: foto y documento opcionales al crear. La foto se exige al cerrar la inscripción.
- `matches`: `winner_team_id`, `notes` y CHECK local ≠ visitante (en la migración SQL).
- `match_goals`: se quitó `team_id` (redundante) y se añadió `assist_squad_id`.
- `player_suspensions`: `match_card_id` opcional y nueva tabla `suspension_served`, que registra en qué partidos se cumplió la sanción en lugar de un contador.
- **Fuera del MVP** (se agregan en su versión): premios, checklists, árbitros, sustituciones, finanzas y transacciones, planes de suscripción.

## Estado

- Sprint 1 implementado: login, sesión, súper admin que crea ligas, panel por liga con filtro por `tenantId` y tests de aislamiento.
- El componente de UI vive en `apps/web/components/ui` hasta que haga falta compartirlo.
