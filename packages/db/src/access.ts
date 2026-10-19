import { ALL_PERMISSIONS, type Permission, type TenantAccess } from "@ligatracker/domain";
import type { PrismaClient, Tenant } from "@prisma/client";

export interface TenantContext {
  tenant: Tenant;
  access: TenantAccess;
}

/**
 * Resuelve la liga por slug y los claims del usuario dentro de ella.
 * Devuelve null si la liga no existe o el usuario no es miembro activo.
 * Los súper administradores tienen todos los permisos en cualquier liga.
 */
export async function getTenantContext(
  client: PrismaClient,
  userId: string,
  tenantSlug: string,
): Promise<TenantContext | null> {
  const tenant = await client.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return null;

  const user = await client.user.findUnique({ where: { id: userId }, select: { isSuperAdmin: true } });
  if (!user) return null;
  if (user.isSuperAdmin) {
    return { tenant, access: { tenantId: tenant.id, permissions: new Set(ALL_PERMISSIONS) } };
  }

  const membership = await client.tenantUser.findUnique({
    where: { tenantId_userId: { tenantId: tenant.id, userId } },
    include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
  });
  if (!membership?.isActive) return null;

  const permissions = new Set<Permission>();
  for (const { role } of membership.roles) {
    for (const { permission } of role.permissions) permissions.add(permission.code as Permission);
  }
  return { tenant, access: { tenantId: tenant.id, permissions } };
}

/** Ligas a las que el usuario puede entrar, para el selector tras el login. */
export async function listUserTenants(client: PrismaClient, userId: string) {
  const user = await client.user.findUnique({ where: { id: userId }, select: { isSuperAdmin: true } });
  if (user?.isSuperAdmin) return client.tenant.findMany({ orderBy: { name: "asc" } });
  return client.tenant.findMany({
    where: { memberships: { some: { userId, isActive: true } } },
    orderBy: { name: "asc" },
  });
}
