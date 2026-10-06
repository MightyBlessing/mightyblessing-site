import { limitedBody, limitedJson, sameOrigin, rateLimitResponse, requestErrorResponse } from "@/lib/request-guard";
import { NextResponse } from "next/server";
import { createSessionToken, getSessionCookieOptions } from "@/lib/admin/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { getAdminAuthConfig } from "@/lib/admin/env";

export async function POST(request: Request) {
  const config = getAdminAuthConfig();
  if (!config) {
    return NextResponse.json({ error: "관리자 인증 설정이 준비되지 않아 로그인할 수 없습니다." }, { status: 503 });
  }
  try {
    sameOrigin(request);
    const limited = rateLimitResponse("login");
    if (limited) return limited;
    const contentType = request.headers.get("content-type") || "";

    let id = "";
    let password = "";

    if (contentType.includes("application/json")) {
      const body = await limitedJson(request, 4096);
      id = typeof body?.id === "string" ? body.id : "";
      password = typeof body?.password === "string" ? body.password : "";
    } else {
      const formData = new URLSearchParams(new TextDecoder().decode(await limitedBody(request, 4096)));
      id = String(formData.get("id") || "");
      password = String(formData.get("password") || "");
    }

    if (id !== config.id || password !== config.password) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const token = await createSessionToken(id, config.secret);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, getSessionCookieOptions());
    return response;
  } catch (error) { return requestErrorResponse(error, "로그인 요청을 처리하지 못했습니다."); }
}
