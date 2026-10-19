import { describe, expect, it } from "vitest";
import { isValidSlug, slugify } from "../src";

describe("slugify", () => {
  it("quita acentos y espacios", () => {
    expect(slugify("Liga Dominical Ñuñoa ")).toBe("liga-dominical-nunoa");
  });
});

describe("isValidSlug", () => {
  it("rechaza rutas reservadas y formatos inválidos", () => {
    expect(isValidSlug("admin")).toBe(false);
    expect(isValidSlug("Liga")).toBe(false);
    expect(isValidSlug("a")).toBe(false);
    expect(isValidSlug("liga-dominical")).toBe(true);
  });
});
