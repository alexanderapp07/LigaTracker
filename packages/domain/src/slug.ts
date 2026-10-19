// Segmentos que ya usa la app y no pueden ser el slug de una liga.
export const RESERVED_SLUGS = new Set(["admin", "api", "login", "logout", "ligas", "panel", "_next"]);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isValidSlug(slug: string): boolean {
  return slug.length >= 3 && slug.length <= 48 && SLUG_PATTERN.test(slug) && !RESERVED_SLUGS.has(slug);
}
