"use server";

import { createTenantWithAdmin, prisma, TenantInputError } from "@ligatracker/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/session";

export interface CreateLeagueState {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  created?: { name: string; slug: string };
  // React reinicia el formulario tras cada envío; se devuelven los valores si hubo error.
  values?: Partial<Record<string, string>>;
}

const schema = z.object({
  name: z.string().trim().min(3, "Mínimo 3 caracteres"),
  slug: z.string().trim().min(3, "Mínimo 3 caracteres"),
  adminFirstName: z.string().trim().min(1, "Obligatorio"),
  adminLastName: z.string().trim().min(1, "Obligatorio"),
  adminEmail: z.email("Email no válido"),
  adminPassword: z.string().min(8, "Mínimo 8 caracteres"),
});

// HU-1.1 / RF-00.1
export async function createLeagueAction(_prev: CreateLeagueState, formData: FormData): Promise<CreateLeagueState> {
  await requireSuperAdmin();
  const raw = Object.fromEntries(formData);
  const { adminPassword: _omit, ...values } = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, String(v)]),
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { fieldErrors, values };
  }
  const d = parsed.data;
  try {
    const { tenant } = await createTenantWithAdmin(prisma, {
      name: d.name,
      slug: d.slug,
      admin: { email: d.adminEmail, firstName: d.adminFirstName, lastName: d.adminLastName, password: d.adminPassword },
    });
    revalidatePath("/admin/ligas");
    return { created: { name: tenant.name, slug: tenant.slug } };
  } catch (e) {
    if (e instanceof TenantInputError) return { fieldErrors: { slug: e.message }, values };
    throw e;
  }
}
