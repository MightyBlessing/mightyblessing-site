import { getAdminSession } from "@/lib/admin/session";
import { getAdminRepository } from "@/lib/admin/repository";
import { getAdminProduct } from "@/lib/admin/product-admin";
import { RequestError, requestErrorResponse } from "@/lib/request-guard";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const repository = getAdminRepository();
    const { screen } = await getAdminProduct(id, repository);
    if (!screen || !/^\/media\/products\/(?:uploads\/)?[a-zA-Z0-9-]+\.(?:jpe?g|png|webp)$/.test(screen.src)) throw new RequestError("화면 이미지를 찾을 수 없습니다.", 404);
    const encoded = await repository.readFile(`public${screen.src}`);
    if (!encoded) throw new RequestError("화면 이미지를 찾을 수 없습니다.", 404);
    const extension = screen.src.split(".").pop();
    return new Response(Buffer.from(encoded, "base64"), { headers: {
      "Content-Type": `image/${extension === "jpg" ? "jpeg" : extension}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) { return requestErrorResponse(error, "화면 이미지를 불러오지 못했습니다."); }
}
