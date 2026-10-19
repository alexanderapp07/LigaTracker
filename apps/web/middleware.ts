import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/session-token";

// Primera barrera: sin sesión válida no se entra al panel. Los permisos por
// liga se validan en el servidor (lib/tenant.ts), no aquí.
export async function middleware(request: NextRequest) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*", "/ligas"],
};
