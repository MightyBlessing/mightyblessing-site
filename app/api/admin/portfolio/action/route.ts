import { NextResponse } from "next/server";
import { updateAdminPortfolioStatus } from "@/lib/admin/portfolio-admin";
import type { PortfolioStatus } from "@/lib/content";
import { getAdminSession } from "@/lib/admin/session";

type ActionBody = {
  action: "setStatus";
  slug: string;
  status: PortfolioStatus;
};

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ActionBody;

    if (body.action === "setStatus") {
      const result = await updateAdminPortfolioStatus(body.slug, body.status);
      return NextResponse.json({ ok: true, slug: result.slug });
    }

    return NextResponse.json({ error: "지원하지 않는 액션입니다." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
