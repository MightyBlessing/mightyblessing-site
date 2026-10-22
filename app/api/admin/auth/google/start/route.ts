import { NextResponse } from "next/server";
import { getAdminAuthConfig, getGoogleOAuthConfig } from "@/lib/admin/env";
import { buildGoogleAuthUrl, encodeOAuthState, getOAuthStateCookieOptions, loginRedirect, OAUTH_STATE_COOKIE } from "@/lib/admin/google-oauth";
import { adminLoginDestination } from "@/lib/admin/redirect";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getAdminAuthConfig() || !getGoogleOAuthConfig()) return loginRedirect(request, "config");
  const next = adminLoginDestination(new URL(request.url).searchParams.get("next"));
  const state = crypto.randomUUID();
  const response = NextResponse.redirect(buildGoogleAuthUrl(request, state));
  response.cookies.set(OAUTH_STATE_COOKIE, encodeOAuthState(state, next), getOAuthStateCookieOptions());
  return response;
}
