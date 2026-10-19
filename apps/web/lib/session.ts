import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession, verifySession, type Session } from "./session-token";

export type { Session };

export const getSession = cache(async (): Promise<Session | null> => {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
});

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireSuperAdmin(): Promise<Session> {
  const session = await requireSession();
  if (!session.isSuperAdmin) redirect("/");
  return session;
}

export async function startSession(session: Session) {
  (await cookies()).set(SESSION_COOKIE, await signSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
