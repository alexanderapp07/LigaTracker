import { describe, expect, it } from "vitest";
import { assertPermission, BASE_ROLES, ForbiddenError, hasPermission, type Permission } from "../src";

const access = (perms: Permission[]) => ({ tenantId: "t1", permissions: new Set(perms) });

describe("hasPermission", () => {
  it("permite solo los claims presentes", () => {
    const a = access(["partido:registrar-gol"]);
    expect(hasPermission(a, "partido:registrar-gol")).toBe(true);
    expect(hasPermission(a, "torneo:crear")).toBe(false);
  });

  it("niega todo sin acceso a la liga", () => {
    expect(hasPermission(null, "partido:registrar-gol")).toBe(false);
  });

  it("assertPermission lanza ForbiddenError", () => {
    expect(() => assertPermission(access([]), "torneo:crear")).toThrow(ForbiddenError);
  });
});

describe("BASE_ROLES", () => {
  it("el delegado de mesa no puede crear torneos", () => {
    expect(BASE_ROLES["Delegado de mesa"]).not.toContain("torneo:crear");
  });
});
