# LIGA TRACKER

SaaS multiliga para organizar torneos de fútbol amateur: equipos y plantillas, fixture automático, resultados, sanciones, tablas y un portal público para compartir.

- Plan y alcance del MVP: [docs/plan-mvp.md](docs/plan-mvp.md)
- Arquitectura y estructura del repositorio: [docs/arquitectura.md](docs/arquitectura.md)

## Stack

Monorepo TypeScript (pnpm + Turborepo): **Next.js 15** (panel, portal y API) · **Prisma 6 + PostgreSQL 16** · Tailwind CSS 4 · Vitest · Docker.

```
apps/web          Next.js
packages/db       schema Prisma, migraciones, filtro por liga, seed
packages/domain   lógica pura (permisos, slugs; luego fixture, tabla, sanciones)
```

## Puesta en marcha

Requisitos: Node 22, pnpm 10 (`corepack enable`) y Docker.

```bash
cp .env.example .env            # y ajusta AUTH_SECRET y la clave del súper admin
docker compose up -d db         # PostgreSQL con las bases ligatracker y ligatracker_test
pnpm install
pnpm db:generate
pnpm db:deploy                  # aplica las migraciones
pnpm db:seed                    # permisos, roles base y súper administrador
pnpm dev                        # http://localhost:3000
```

Entra con el súper administrador del `.env`, crea una liga en **/admin/ligas** y luego inicia sesión con su administrador.

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm typecheck` | Verifica tipos en todo el monorepo |
| `pnpm test` | Tests unitarios y de integración (necesita `TEST_DATABASE_URL`, cuyo nombre debe terminar en `_test`) |
| `pnpm build` | Build de producción |
| `pnpm db:migrate` | Crea una migración nueva a partir del schema |
| `docker compose --profile app up --build` | Levanta la imagen de producción con su base |

## Reglas del proyecto

- **Toda consulta a datos de una liga pasa por el cliente de `getPanelContext()`** (`apps/web/lib/tenant.ts`), que filtra por `tenantId`. No uses `prisma` directo para esos modelos.
- Las acciones validan **claims** (`requirePermission(slug, "partido:registrar-gol")`), nunca nombres de rol.
- Las credenciales van en variables de entorno; nunca en el código.
