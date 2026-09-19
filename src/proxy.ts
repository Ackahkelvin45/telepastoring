import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/pending-approval",
  "/admin/login",
  "/offline",
];

/**
 * An optimistic redirect only — it checks that a session cookie exists, not
 * that it is valid. Real authorization happens in `requireUser()` and
 * `requireAdmin()`, which every page and Server Action touching data calls.
 *
 * It deliberately never redirects *away* from a login page: a stale cookie
 * looks exactly like a live one here, and bouncing it to a protected page that
 * bounces it back is a redirect loop. The login pages check the real session.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  // Handles the `__Secure-` prefix better-auth adds over HTTPS; a hardcoded
  // cookie name would lock every production user out.
  if (!getSessionCookie(request)) {
    const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
