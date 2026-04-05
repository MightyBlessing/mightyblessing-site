import { NextResponse } from "next/server";
import {
  type PortfolioEditorPayload,
  type PortfolioEditorUploads,
  saveAdminPortfolio,
} from "@/lib/admin/portfolio-admin";
import { getAdminSession } from "@/lib/admin/session";

async function toUploadedFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return undefined;
  }

  return {
    name: value.name,
    contentBase64: Buffer.from(await value.arrayBuffer()).toString("base64"),
  };
}

async function parseMultipartRequest(request: Request) {
  const formData = await request.formData();
  const payloadValue = formData.get("payload");
  const actionValue = String(formData.get("action") || "update") as "create" | "update" | "publish" | "archive";

  if (typeof payloadValue !== "string") {
    throw new Error("저장 데이터가 올바르지 않습니다.");
  }

  const payload = JSON.parse(payloadValue) as PortfolioEditorPayload;
  const uploads: PortfolioEditorUploads = {
    heroFile: await toUploadedFile(formData.get("heroFile")),
    heroPosterFile: await toUploadedFile(formData.get("heroPosterFile")),
    galleryFiles: {},
    galleryPosterFiles: {},
  };

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("galleryFile:")) {
      const id = key.replace("galleryFile:", "");
      const file = await toUploadedFile(value);
      if (file) {
        uploads.galleryFiles[id] = file;
      }
    }

    if (key.startsWith("galleryPosterFile:")) {
      const id = key.replace("galleryPosterFile:", "");
      const file = await toUploadedFile(value);
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
  const body = (await request.json()) as {
    payload?: PortfolioEditorPayload;
    action?: "create" | "update" | "publish" | "archive";
  };

  if (!body.payload) {
    throw new Error("저장 데이터가 올바르지 않습니다.");
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
    const contentType = request.headers.get("content-type") || "";
    const parsed = contentType.includes("application/json")
      ? await parseJsonRequest(request)
      : await parseMultipartRequest(request);

    const result = await saveAdminPortfolio(parsed.payload, parsed.uploads, parsed.action);
    return NextResponse.json({ ok: true, slug: result.slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
