import { NextResponse } from "next/server";
import { getGoogleOAuthConfig } from "./env";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";
export const GOOGLE_CALLBACK_PATH = "/api/admin/auth/google/callback";
export const OAUTH_STATE_COOKIE = "mb_admin_oauth_state";
const OAUTH_STATE_MAX_AGE = 10 * 60;

/** The public origin behind the reverse proxy. Google must receive the exact callback URL registered in its console. */
export function publicOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configured ? new URL(configured).origin : new URL(request.url).origin;
}

export function googleRedirectUri(request: Request) {
  return new URL(GOOGLE_CALLBACK_PATH, publicOrigin(request)).toString();
}

export function buildGoogleAuthUrl(request: Request, state: string) {
  const config = getGoogleOAuthConfig();
  if (!config) throw new Error("Google 로그인 설정이 없습니다.");
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: googleRedirectUri(request),
    response_type: "code",
    scope: "openid email",
    state,
    access_type: "online",
    prompt: "select_account",
    hd: "mightyblessing.com",
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params}`;
}

/** The state cookie carries the CSRF state and the sanitised page to return to, separated by the first colon. */
export function encodeOAuthState(state: string, next: string) {
  return `${state}:${next}`;
}

export function decodeOAuthState(value: string | undefined) {
  const separator = value?.indexOf(":") ?? -1;
  if (!value || separator < 1) return null;
  return { state: value.slice(0, separator), next: value.slice(separator + 1) };
}

export function getOAuthStateCookieOptions(maxAge = OAUTH_STATE_MAX_AGE) {
  return {
    httpOnly: true,
    maxAge,
    path: "/api/admin/auth/google",
    // Lax still sends the cookie on Google's top-level redirect back to the callback.
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

/** Every failed step returns to the login page with a short code the page turns into a message. */
export function loginRedirect(request: Request, error: string) {
  const url = new URL("/admin/login", publicOrigin(request));
  url.searchParams.set("error", error);
  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE, "", getOAuthStateCookieOptions(0));
  return response;
}

export async function exchangeGoogleCode(request: Request, code: string) {
  const config = getGoogleOAuthConfig();
  if (!config) throw new Error("Google 로그인 설정이 없습니다.");

  const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: googleRedirectUri(request),
    }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) throw new Error(`Google 토큰 교환 실패 (${tokenResponse.status})`);
  const { access_token: accessToken } = (await tokenResponse.json()) as { access_token?: string };
  if (!accessToken) throw new Error("Google access token이 비어 있습니다.");

  const userInfoResponse = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!userInfoResponse.ok) throw new Error(`Google 사용자 정보 조회 실패 (${userInfoResponse.status})`);
  const userInfo = (await userInfoResponse.json()) as { email?: unknown; email_verified?: unknown };
  const email = typeof userInfo.email === "string" ? userInfo.email.trim().toLowerCase() : "";
  if (!email) throw new Error("Google 이메일 정보가 없습니다.");
  return { email, emailVerified: userInfo.email_verified === true || userInfo.email_verified === "true" };
}
