import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin/session";
import { saveAdminProduct } from "@/lib/admin/product-admin";
import { limitedBody, sameOrigin, RequestError, requestErrorResponse } from "@/lib/request-guard";

export async function POST(request: Request) {
  if (!await getAdminSession()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    sameOrigin(request);
    const bytes = await limitedBody(request, 9 * 1024 * 1024);
    let form: FormData;
    try {
      form = await new Response(bytes, { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
    } catch { throw new RequestError("업로드 형식이 올바르지 않습니다."); }
    const raw = form.get("payload");
    if (typeof raw !== "string" || raw.length > 16_384) throw new RequestError("편집 데이터가 올바르지 않습니다.");
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch { throw new RequestError("편집 데이터가 올바르지 않습니다."); }
    const file = form.get("screen");
    if (file !== null && !(file instanceof File)) throw new RequestError("이미지 파일이 올바르지 않습니다.");
    const result = await saveAdminProduct(payload, file instanceof File && file.size ? file : undefined);
    revalidatePath("/");
    revalidatePath("/products");
    return Response.json({ ok: true, ...result });
  } catch (error) { return requestErrorResponse(error, "제품 저장에 실패했습니다."); }
}
