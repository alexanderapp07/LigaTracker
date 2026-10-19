import type { Permission } from "./permissions";

export interface TenantAccess {
  tenantId: string;
  permissions: ReadonlySet<Permission>;
}

export function hasPermission(access: TenantAccess | null, permission: Permission): boolean {
  return access !== null && access.permissions.has(permission);
}

export class ForbiddenError extends Error {
  constructor(public readonly permission: Permission) {
    super(`Permiso requerido: ${permission}`);
    this.name = "ForbiddenError";
  }
}

export function assertPermission(
  access: TenantAccess | null,
  permission: Permission,
): asserts access is TenantAccess {
  if (!hasPermission(access, permission)) throw new ForbiddenError(permission);
}
