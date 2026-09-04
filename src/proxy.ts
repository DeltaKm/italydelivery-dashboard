import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, ROLE_COOKIE, type Role } from "@/lib/session-constants";

// Route riservate a ruoli specifici. Tutto il resto sotto /dashboard
// richiede solo di essere autenticati (ADMIN/LOGISTICS/BUSINESS).
const ROLE_RESTRICTED: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard/users", roles: ["ADMIN"] },
  { prefix: "/dashboard/logistics", roles: ["ADMIN"] },
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value as Role | undefined;

  if (pathname.startsWith("/login")) {
    if (token && role) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!token || !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const restriction = ROLE_RESTRICTED.find((r) => pathname.startsWith(r.prefix));
  if (restriction && !restriction.roles.includes(role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
