import { BASE_ROLES, PERMISSIONS } from "@ligatracker/domain";
import type { PrismaClient } from "@prisma/client";

/** Sincroniza el catálogo de permisos y los roles base. Es idempotente. */
export async function seedPermissionsAndRoles(client: PrismaClient) {
  for (const [code, description] of Object.entries(PERMISSIONS)) {
    await client.permission.upsert({ where: { code }, update: { description }, create: { code, description } });
  }
  const permissions = await client.permission.findMany();
  const idByCode = new Map(permissions.map((p) => [p.code, p.id]));

  for (const [name, codes] of Object.entries(BASE_ROLES)) {
    const role =
      (await client.role.findFirst({ where: { tenantId: null, name } })) ??
      (await client.role.create({ data: { name } }));
    await client.rolePermission.deleteMany({ where: { roleId: role.id } });
    await client.rolePermission.createMany({
      data: codes.map((code) => ({ roleId: role.id, permissionId: idByCode.get(code)! })),
    });
  }
}
