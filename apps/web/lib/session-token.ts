import { jwtVerify, SignJWT } from "jose";

// Este módulo no importa nada de Node para poder usarse en el middleware (Edge).

export const SESSION_COOKIE = "lt_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export interface Session {
  userId: string;
  isSuperAdmin: boolean;
}

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET debe tener al menos 32 caracteres");
  return new TextEncoder().encode(secret);
}

export async function signSession(session: Session): Promise<string> {
  return new SignJWT({ sa: session.isSuperAdmin })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    return { userId: payload.sub, isSuperAdmin: payload.sa === true };
  } catch {
    return null;
  }
}
