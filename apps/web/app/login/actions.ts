"use server";

import { prisma, verifyPassword } from "@ligatracker/db";
import { redirect } from "next/navigation";
import { z } from "zod";
import { homePathFor } from "@/lib/home";
import { endSession, startSession } from "@/lib/session";

export interface LoginState {
  error?: string;
  // React reinicia el formulario tras cada envío; se devuelve el email para no perderlo.
  email?: string;
}

const schema = z.object({
  email: z.email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1),
  next: z.string().optional(),
});

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  const submittedEmail = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: "Escribe un email y una contraseña válidos", email: submittedEmail };

  const { email, password, next } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await verifyPassword(password, user?.passwordHash);
  if (!user || !ok) return { error: "Email o contraseña incorrectos", email: submittedEmail };

  const session = { userId: user.id, isSuperAdmin: user.isSuperAdmin };
  await startSession(session);
  // Solo rutas internas, para no abrir una redirección a otro sitio.
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : null;
  redirect(safeNext ?? (await homePathFor(session)));
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
