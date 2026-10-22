import { NextResponse } from "next/server";
import { createSessionToken, getSessionCookieOptions } from "@/lib/admin/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { DEVELOPMENT_ADMIN_EMAIL, getAdminAuthConfig, isDevelopmentLoginEnabled } from "@/lib/admin/env";
import { adminLoginDestination } from "@/lib/admin/redirect";
import { requestErrorResponse, sameOrigin } from "@/lib/request-guard";

/** Local development only: signs in without Google so the admin can be checked on localhost. */
export async function POST(request: Request) {
  if (!isDevelopmentLoginEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const config = getAdminAuthConfig();
  if (!config) return NextResponse.json({ error: "관리자 인증 설정이 준비되지 않아 로그인할 수 없습니다." }, { status: 503 });
  try {
    sameOrigin(request);
  } catch (error) { return requestErrorResponse(error, "로그인 요청을 처리하지 못했습니다."); }
  const next = adminLoginDestination(new URL(request.url).searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, await createSessionToken(DEVELOPMENT_ADMIN_EMAIL, config.secret), getSessionCookieOptions());
  return response;
}
