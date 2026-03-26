import { NextResponse } from "next/server";
import { createSessionToken, getSessionCookieOptions } from "@/lib/admin/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { getAdminCredentials, getAdminSessionSecret } from "@/lib/admin/env";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  let id = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    id = body.id || "";
    password = body.password || "";
  } else {
    const formData = await request.formData();
    id = String(formData.get("id") || "");
    password = String(formData.get("password") || "");
  }

  const credentials = getAdminCredentials();
  if (id !== credentials.id || password !== credentials.password) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const token = await createSessionToken(id, getAdminSessionSecret());
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, getSessionCookieOptions());
  return response;
}

