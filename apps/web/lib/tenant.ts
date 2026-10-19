import "server-only";
import { forTenant, getTenantContext, prisma } from "@ligatracker/db";
import { assertPermission, hasPermission, type Permission } from "@ligatracker/domain";
import { notFound } from "next/navigation";
import { cache } from "react";
import { requireSession } from "./session";

/**
 * Contexto del panel de una liga: la liga, los claims del usuario en ella y un
 * cliente de base de datos que solo ve los datos de esa liga.
 * Si el usuario no pertenece a la liga se responde 404 (no se revela que existe).
 */
export const getPanelContext = cache(async (tenantSlug: string) => {
  const session = await requireSession();
  const ctx = await getTenantContext(prisma, session.userId, tenantSlug);
  if (!ctx) notFound();
  return {
    session,
    tenant: ctx.tenant,
    access: ctx.access,
    db: forTenant(prisma, ctx.tenant.id),
    can: (permission: Permission) => hasPermission(ctx.access, permission),
  };
});

/** Para server actions: corta con ForbiddenError si falta el claim. */
export async function requirePermission(tenantSlug: string, permission: Permission) {
  const ctx = await getPanelContext(tenantSlug);
  assertPermission(ctx.access, permission);
  return ctx;
}
