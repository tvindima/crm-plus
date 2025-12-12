import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Simple guard for all /backoffice routes.
// Expects a staff session cookie (placeholder name). Replace with real auth when available.
const STAFF_COOKIE = "crmplus_staff_session";

export function middleware(req: NextRequest) {
  // Allow explicit bypass in non-prod environments if needed
  if (process.env.BACKOFFICE_GUARD_DISABLED === "true") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  const isProtected = ["/backoffice/:path*"].some((pattern) => pathname.startsWith(pattern.replace("/:path*", "")));

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasStaffCookie = Boolean(req.cookies.get(STAFF_COOKIE)?.value);
  if (hasStaffCookie) {
    return NextResponse.next();
  }

  // Not authenticated: rewrite to forbidden page inside backoffice.
  const url = req.nextUrl.clone();
  url.pathname = "/backoffice/errors/forbidden";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
