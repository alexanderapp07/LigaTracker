import { isValidSlug, type BaseRoleName } from "@ligatracker/domain";
import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "./passwords";

export interface CreateTenantInput {
  name: string;
  slug: string;
  admin: { email: string; firstName: string; lastName: string; password: string };
}

export class TenantInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantInputError";
  }
}

export async function findBaseRole(client: PrismaClient, name: BaseRoleName) {
  const role = await client.role.findFirst({ where: { tenantId: null, name } });
  if (!role) throw new Error(`Falta el rol base "${name}". Ejecuta pnpm db:seed.`);
  return role;
}

/**
 * HU-1.1 / RF-00.1: alta de una liga con su administrador principal.
 * Si el email ya existe, se reutiliza el usuario y su contraseña no cambia.
 */
export async function createTenantWithAdmin(client: PrismaClient, input: CreateTenantInput) {
  const slug = input.slug.trim();
  if (!isValidSlug(slug)) throw new TenantInputError("El slug no es válido o está reservado");
  if (await client.tenant.findUnique({ where: { slug } })) {
    throw new TenantInputError("Ya existe una liga con ese slug");
  }
  const email = input.admin.email.trim().toLowerCase();
  const adminRole = await findBaseRole(client, "Administrador");
  const passwordHash = await hashPassword(input.admin.password);

  return client.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({ data: { name: input.name.trim(), slug } });
    const user =
      (await tx.user.findUnique({ where: { email } })) ??
      (await tx.user.create({
        data: { email, passwordHash, firstName: input.admin.firstName.trim(), lastName: input.admin.lastName.trim() },
      }));
    await tx.tenantUser.create({
      data: { tenantId: tenant.id, userId: user.id, roles: { create: { roleId: adminRole.id } } },
    });
    return { tenant, user };
  });
}
