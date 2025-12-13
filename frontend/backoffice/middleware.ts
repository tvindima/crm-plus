import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const STAFF_COOKIE = "crmplus_staff_session";
const LOGIN_PATH = "/backoffice/login";
const ALLOWED_ROLES = new Set(["staff", "admin", "leader"]);

async function verifyStaffToken(token: string) {
  const secret = process.env.CRMPLUS_AUTH_SECRET;
  if (!secret) {
    throw new Error("CRMPLUS_AUTH_SECRET missing");
  }
  const encoder = new TextEncoder();
  const { payload } = await jwtVerify(token, encoder.encode(secret));
  const role = payload.role as string | undefined;
  if (!role || !ALLOWED_ROLES.has(role)) {
    throw new Error("Role not allowed");
  }
  return payload;
}

export async function middleware(req: NextRequest) {
  if (process.env.BACKOFFICE_GUARD_DISABLED === "true") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  if (pathname.startsWith(LOGIN_PATH)) {
    return NextResponse.next();
  }

  const token =
    req.cookies.get(STAFF_COOKIE)?.value ||
    req.headers.get("authorization")?.replace(/bearer /i, "").trim();

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/backoffice/errors/forbidden";
    return NextResponse.rewrite(url);
  }

  try {
    await verifyStaffToken(token);
    return NextResponse.next();
  } catch (err) {
    const url = req.nextUrl.clone();
    url.pathname = "/backoffice/errors/forbidden";
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: ["/backoffice/((?!login).*)"],
};

// Export para testes unitários
export const __test = { verifyStaffToken };
