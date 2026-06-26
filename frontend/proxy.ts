import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes only reachable with a session — unauthenticated visitors go to /login.
const PROTECTED_PREFIXES = ["/dashboard", "/editor", "/templates", "/design-system"];

// Entry pages an authenticated user shouldn't sit on: once signed in, the
// dashboard is their home, so bounce them there instead of showing the
// marketing landing or the auth forms.
const AUTH_ENTRY_PATHS = ["/", "/login", "/register"];

function hasSession(request: NextRequest): boolean {
  // Better Auth names the cookie `better-auth.session_token`, gaining a
  // `__Secure-` prefix when served over HTTPS.
  return (
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = hasSession(request);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !authed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authed && AUTH_ENTRY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/editor/:path*",
    "/templates/:path*",
    "/design-system/:path*",
  ],
};
