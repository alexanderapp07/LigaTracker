# LIGA TRACKER

Documentación del producto y del alcance: docs/plan-mvp.md y docs/arquitectura.md. Interfaz y textos en español.

- Datos de una liga: usar siempre el cliente `db` de `getPanelContext()` (apps/web/lib/tenant.ts), nunca `prisma` directo. En `create` pasa `tenantId` explícito (o `tenant: { connect }` si usas relaciones anidadas); la extensión lo valida.
- Autorización por claims (`packages/domain/src/permissions.ts`), no por nombre de rol.
- Lógica de negocio pura en `packages/domain`, con tests en Vitest.
- Estilos: tokens de Estándares en apps/web/app/globals.css; números en tablas con la clase `tabular`.
- Los tests de integración vacían la base de `TEST_DATABASE_URL` (debe terminar en `_test`). No uses `prisma migrate reset`.
- Antes de subir: `pnpm typecheck && pnpm test && pnpm build`.
