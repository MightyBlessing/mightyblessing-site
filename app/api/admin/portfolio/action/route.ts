import { limitedJson, sameOrigin, requestErrorResponse } from "@/lib/request-guard";
import { NextResponse } from "next/server";
import { updateAdminPortfolioStatus } from "@/lib/admin/portfolio-admin";
import type { PortfolioStatus } from "@/lib/content";
import { getAdminSession } from "@/lib/admin/session";

type ActionBody = {
  action: "setStatus";
  slug: string;
  status: PortfolioStatus;
  revision?: string;
};

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    sameOrigin(request);
    const body = (await limitedJson(request, 4096)) as ActionBody;

    if (body.action === "setStatus") {
      const result = await updateAdminPortfolioStatus(body.slug, body.status, body.revision);
      return NextResponse.json({ ok: true, slug: result.slug, revision: result.payload.revision, commitSha: result.commitSha, publication: result.publication });
    }

    return NextResponse.json({ error: "지원하지 않는 액션입니다." }, { status: 400 });
  } catch (error) {
    return requestErrorResponse(error, "처리 중 오류가 발생했습니다.");
  }
}
