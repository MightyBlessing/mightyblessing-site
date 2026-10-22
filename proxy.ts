import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { verifyAdminSessionToken } from "@/lib/admin/auth";
import { getAdminAuthConfig } from "@/lib/admin/env";

function isProtectedPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

const publicAdminPaths = new Set(["/admin/login", "/api/admin/auth/google/start", "/api/admin/auth/google/callback", "/api/admin/auth/dev"]);

function isPublicAdminPath(pathname: string) {
  return publicAdminPaths.has(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Sign-in routes send the browser back to the login page, which explains missing settings itself.
  if (!getAdminAuthConfig() && pathname.startsWith("/api/admin") && !isPublicAdminPath(pathname)) {
    return NextResponse.json({ error: "관리자 인증 설정이 준비되지 않아 사용할 수 없습니다." }, { status: 503 });
  }
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  if (pathname === "/admin/login" && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  if (session) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
