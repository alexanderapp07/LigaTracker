import "server-only";
import { listUserTenants, prisma } from "@ligatracker/db";
import type { Session } from "./session";

/** A dónde va el usuario al entrar: súper admin, su única liga o el selector. */
export async function homePathFor(session: Session): Promise<string> {
  if (session.isSuperAdmin) return "/admin/ligas";
  const tenants = await listUserTenants(prisma, session.userId);
  return tenants.length === 1 ? `/panel/${tenants[0]!.slug}` : "/ligas";
}
