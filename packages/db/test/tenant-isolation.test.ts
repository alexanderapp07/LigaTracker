import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTenantWithAdmin, forTenant, getTenantContext, seedPermissionsAndRoles, TenantScopeError } from "../src";
import { db, resetData } from "./helpers";

async function setupTwoLeagues() {
  await seedPermissionsAndRoles(db);
  const a = await createTenantWithAdmin(db, {
    name: "Liga A",
    slug: "liga-a",
    admin: { email: "a@test.dev", firstName: "Ana", lastName: "A", password: "clave-segura-a" },
  });
  const b = await createTenantWithAdmin(db, {
    name: "Liga B",
    slug: "liga-b",
    admin: { email: "b@test.dev", firstName: "Beto", lastName: "B", password: "clave-segura-b" },
  });
  const teamB = await db.team.create({
    data: { tenantId: b.tenant.id, name: "Equipo B", primaryColor: "#ff0000", createdBy: b.user.id },
  });
  return { a, b, teamB };
}

beforeEach(resetData);
afterAll(() => db.$disconnect());

describe("forTenant", () => {
  it("solo lista datos de su liga", async () => {
    const { a } = await setupTwoLeagues();
    const dbA = forTenant(db, a.tenant.id);

    await dbA.team.create({
      data: { tenantId: a.tenant.id, name: "Equipo A", primaryColor: "#00ff00", createdBy: a.user.id },
    });

    const teams = await dbA.team.findMany();
    expect(teams.map((t) => t.name)).toEqual(["Equipo A"]);
    expect(await dbA.team.count()).toBe(1);
  });

  it("no encuentra, modifica ni borra registros de otra liga", async () => {
    const { a, teamB } = await setupTwoLeagues();
    const dbA = forTenant(db, a.tenant.id);

    expect(await dbA.team.findUnique({ where: { id: teamB.id } })).toBeNull();
    expect(await dbA.team.findFirst({ where: { name: "Equipo B" } })).toBeNull();
    await expect(dbA.team.update({ where: { id: teamB.id }, data: { name: "Hackeado" } })).rejects.toThrow();
    expect((await dbA.team.updateMany({ data: { name: "Hackeado" } })).count).toBe(0);
    expect((await dbA.team.deleteMany()).count).toBe(0);
    expect((await db.team.findUniqueOrThrow({ where: { id: teamB.id } })).name).toBe("Equipo B");
  });

  it("rechaza escribir con el tenantId de otra liga", async () => {
    const { a, b } = await setupTwoLeagues();
    const dbA = forTenant(db, a.tenant.id);

    await expect(
      dbA.team.create({
        data: { tenantId: b.tenant.id, name: "Intruso", primaryColor: "#000", createdBy: a.user.id },
      }),
    ).rejects.toBeInstanceOf(TenantScopeError);
  });

  it("rechaza conectar un registro a otra liga con relaciones anidadas", async () => {
    const { a, b } = await setupTwoLeagues();
    const dbA = forTenant(db, a.tenant.id);

    const venue = await dbA.venue.create({ data: { tenantId: a.tenant.id, name: "Complejo Norte" } });
    const pitch = await dbA.pitch.create({
      data: { name: "Cancha 1", tenant: { connect: { id: a.tenant.id } }, venue: { connect: { id: venue.id } } },
    });
    expect(pitch.tenantId).toBe(a.tenant.id);

    await expect(
      dbA.pitch.create({
        data: { name: "Cancha 2", tenant: { connect: { id: b.tenant.id } }, venue: { connect: { id: venue.id } } },
      }),
    ).rejects.toBeInstanceOf(TenantScopeError);
  });

  it("rechaza mover un registro a otra liga", async () => {
    const { a, b } = await setupTwoLeagues();
    const dbA = forTenant(db, a.tenant.id);
    const team = await dbA.team.create({
      data: { tenantId: a.tenant.id, name: "Equipo A", primaryColor: "#00ff00", createdBy: a.user.id },
    });

    await expect(
      dbA.team.update({ where: { id: team.id }, data: { tenantId: b.tenant.id } }),
    ).rejects.toBeInstanceOf(TenantScopeError);
  });
});

describe("getTenantContext", () => {
  it("da los claims del rol al miembro y nada a quien no lo es", async () => {
    const { a, b } = await setupTwoLeagues();

    const ctx = await getTenantContext(db, a.user.id, "liga-a");
    expect(ctx?.access.permissions.has("torneo:crear")).toBe(true);

    expect(await getTenantContext(db, a.user.id, "liga-b")).toBeNull();
    expect(await getTenantContext(db, b.user.id, "no-existe")).toBeNull();
  });

  it("el delegado de mesa solo recibe permisos de partido", async () => {
    const { a } = await setupTwoLeagues();
    const delegateRole = await db.role.findFirstOrThrow({ where: { tenantId: null, name: "Delegado de mesa" } });
    const user = await db.user.create({
      data: { email: "d@test.dev", passwordHash: "x", firstName: "Dani", lastName: "D" },
    });
    await db.tenantUser.create({
      data: { tenantId: a.tenant.id, userId: user.id, roles: { create: { roleId: delegateRole.id } } },
    });

    const ctx = await getTenantContext(db, user.id, "liga-a");
    expect(ctx?.access.permissions.has("partido:registrar-gol")).toBe(true);
    expect(ctx?.access.permissions.has("torneo:crear")).toBe(false);
  });
});
