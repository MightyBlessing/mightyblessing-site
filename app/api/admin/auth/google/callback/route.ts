import { NextResponse, type NextRequest } from "next/server";
import { createSessionToken, getSessionCookieOptions } from "@/lib/admin/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { getAdminAuthConfig, getGoogleOAuthConfig } from "@/lib/admin/env";
import { decodeOAuthState, exchangeGoogleCode, getOAuthStateCookieOptions, loginRedirect, OAUTH_STATE_COOKIE, publicOrigin } from "@/lib/admin/google-oauth";
import { adminLoginDestination } from "@/lib/admin/redirect";
import { rateLimitResponse } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.get("error")) return loginRedirect(request, "cancelled");
  const saved = decodeOAuthState(request.cookies.get(OAUTH_STATE_COOKIE)?.value);
  const code = params.get("code");
  if (!saved || !code || params.get("state") !== saved.state) return loginRedirect(request, "state");
  const config = getAdminAuthConfig();
  if (!config || !getGoogleOAuthConfig()) return loginRedirect(request, "config");
  if (rateLimitResponse("login")) return loginRedirect(request, "busy");

  try {
    const profile = await exchangeGoogleCode(request, code);
    if (!profile.emailVerified || !config.emails.includes(profile.email)) return loginRedirect(request, "not_allowed");
    const response = NextResponse.redirect(new URL(adminLoginDestination(saved.next), publicOrigin(request)));
    response.cookies.set(OAUTH_STATE_COOKIE, "", getOAuthStateCookieOptions(0));
    response.cookies.set(ADMIN_SESSION_COOKIE, await createSessionToken(profile.email, config.secret), getSessionCookieOptions());
    return response;
  } catch {
    return loginRedirect(request, "failed");
  }
}
