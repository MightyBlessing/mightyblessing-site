import { limitedBody, limitedJson, sameOrigin, requestErrorResponse, RequestError } from "@/lib/request-guard";
import { MAX_UPLOAD_REQUEST, validateUpload } from "@/lib/admin/upload-validation";
import { NextResponse } from "next/server";
import {
  type PortfolioEditorPayload,
  type PortfolioEditorUploads,
  saveAdminPortfolio,
} from "@/lib/admin/portfolio-admin";
import { getAdminSession } from "@/lib/admin/session";

async function toUploadedFile(value: FormDataEntryValue | null, expected: "image" | "video") {
  if (!(value instanceof File) || value.size === 0) return undefined;
  return validateUpload(value, expected);
}

async function parseMultipartRequest(request: Request) {
  const bytes = await limitedBody(request, MAX_UPLOAD_REQUEST);
  const formData = await new Response(bytes, { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
  const payloadValue = formData.get("payload");
  const actionValue = String(formData.get("action") || "update") as "create" | "update" | "publish" | "archive";

  if (typeof payloadValue !== "string") {
    throw new RequestError("저장 데이터가 올바르지 않습니다.");
  }

  let payload: PortfolioEditorPayload;
  try { payload = JSON.parse(payloadValue); } catch { throw new RequestError("저장 데이터가 올바르지 않습니다."); }
  if (!payload?.heroMedia || !Array.isArray(payload.gallery) || payload.gallery.length > 30 || payloadValue.length > 256 * 1024) throw new RequestError("미디어는 30개까지 등록할 수 있으며 편집 데이터가 올바라야 합니다.");
  const uploads: PortfolioEditorUploads = {
    heroFile: await toUploadedFile(formData.get("heroFile"), payload.heroMedia.type),
    heroPosterFile: await toUploadedFile(formData.get("heroPosterFile"), "image"),
    galleryFiles: {},
    galleryPosterFiles: {},
  };

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("galleryFile:")) {
      const id = key.replace("galleryFile:", "");
      const item = payload.gallery.find(item => item.id === id);
      if (!item) throw new RequestError("갤러리 파일 정보가 올바르지 않습니다.");
      const file = await toUploadedFile(value, item.type);
      if (file) {
        uploads.galleryFiles[id] = file;
      }
    }

    if (key.startsWith("galleryPosterFile:")) {
      const id = key.replace("galleryPosterFile:", "");
      const file = await toUploadedFile(value, "image");
      if (file) {
        uploads.galleryPosterFiles[id] = file;
      }
    }
  }

  return {
    payload,
    uploads,
    action: actionValue,
  };
}

async function parseJsonRequest(request: Request) {
  const body = (await limitedJson(request)) as {
    payload?: PortfolioEditorPayload;
    action?: "create" | "update" | "publish" | "archive";
  };

  if (!body.payload) {
    throw new RequestError("저장 데이터가 올바르지 않습니다.");
  }

  return {
    payload: body.payload,
    uploads: {
      galleryFiles: {},
      galleryPosterFiles: {},
    } satisfies PortfolioEditorUploads,
    action: (body.action || "update") as "create" | "update" | "publish" | "archive",
  };
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    sameOrigin(request);
    const contentType = request.headers.get("content-type") || "";
    const parsed = contentType.includes("application/json")
      ? await parseJsonRequest(request)
      : await parseMultipartRequest(request);

    const result = await saveAdminPortfolio(parsed.payload, parsed.uploads, parsed.action);
    return NextResponse.json({ ok: true, slug: result.slug, payload: result.payload, commitSha: result.commitSha, publication: result.publication });
  } catch (error) {
    return requestErrorResponse(error, "저장 중 오류가 발생했습니다.");
  }
}
