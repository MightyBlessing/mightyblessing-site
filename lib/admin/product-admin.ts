import { randomUUID } from "crypto";
import sharp from "sharp";
import { getAdminRepository, type AdminRepository } from "./repository";
import { contentRevision, EditConflict } from "./revision";
import { validateUpload } from "./upload-validation";
import { RequestError } from "@/lib/request-guard";
import { isProductId, type ProductContent, type ProductEditorValue } from "@/lib/product-content-types";

export async function getAdminProduct(id: string, repository = getAdminRepository()): Promise<ProductEditorValue> {
  if (!isProductId(id)) throw new RequestError("제품을 찾을 수 없습니다.", 404);
  const encoded = await repository.readFile(`content/products/${id}.json`);
  if (!encoded) throw new RequestError("제품 데이터를 찾을 수 없습니다. 최신 콘텐츠 배포 상태를 확인해 주세요.", 404);
  const data = JSON.parse(Buffer.from(encoded, "base64").toString("utf8")) as ProductContent;
  return { ...data, id, revision: contentRevision(encoded)! };
}

export async function saveAdminProduct(input: unknown, file: File | undefined, repository: AdminRepository = getAdminRepository()) {
  if (!input || typeof input !== "object") throw new RequestError("편집 데이터가 올바르지 않습니다.");
  const p = input as Record<string, unknown>;
  if (!isProductId(p.id) || typeof p.removeScreen !== "boolean") throw new RequestError("제품 정보가 올바르지 않습니다.");
  for (const [key, maximum] of Object.entries({ description: 300, detail: 3000, alt: 500, caption: 500 })) {
    if (typeof p[key] !== "string" || (p[key] as string).length > maximum) throw new RequestError("문구 형식 또는 길이를 확인해 주세요.");
  }
  if (!(p.description as string).trim() || !(p.detail as string).trim()) throw new RequestError("한 줄 소개와 상세 설명을 입력해 주세요.");
  if (typeof p.revision !== "string" || !p.revision) throw new RequestError("편집 화면을 다시 열어 주세요.", 428);
  if (file && p.removeScreen) throw new RequestError("화면 숨김을 해제한 뒤 이미지를 올려 주세요.");
  repository.assertWritable?.();
  const current = await getAdminProduct(p.id, repository);
  if (current.revision !== p.revision) throw new EditConflict();
  if ((file || (current.screen && !p.removeScreen)) && !(p.alt as string).trim()) throw new RequestError("화면의 대체 텍스트를 입력해 주세요.");

  const upserts: { path: string; contentBase64: string }[] = [];
  let screen = current.screen;
  if (file) {
    const validated = await validateUpload(file, "image");
    const metadata = await sharp(Buffer.from(validated.contentBase64, "base64")).metadata();
    const extension = validated.name.toLowerCase().split(".").pop();
    const src = `/media/products/uploads/${p.id}-${randomUUID()}.${extension}`;
    // Commit content and immutable media together; old files remain valid for deployed pages and rollback.
    upserts.push({ path: `public${src}`, contentBase64: validated.contentBase64 });
    const rotated = [5, 6, 7, 8].includes(metadata.orientation || 1);
    screen = { src, width: (rotated ? metadata.height : metadata.width)!, height: (rotated ? metadata.width : metadata.height)!, alt: "", caption: "" };
  }
  const data: ProductContent = {
    description: (p.description as string).trim(), detail: (p.detail as string).trim(),
    screenHidden: p.removeScreen,
    screen: screen ? { ...screen, alt: (p.alt as string).trim(), caption: (p.caption as string).trim() } : null,
  };
  const encoded = Buffer.from(JSON.stringify(data, null, 2) + "\n").toString("base64");
  const filePath = `content/products/${p.id}.json`;
  upserts.push({ path: filePath, contentBase64: encoded });
  let receipt;
  try {
    receipt = await repository.commitChanges({ message: `admin: update product ${p.id}`, expectedFiles: { [filePath]: p.revision }, upserts, deletes: [] });
  } catch (error) {
    if (error instanceof EditConflict) throw error;
    throw new Error("저장 결과를 확인하지 못했습니다. 입력을 보관하고 편집 화면을 다시 열어 상태를 확인해 주세요.");
  }
  return { value: { ...data, id: p.id, revision: contentRevision(encoded)! }, commitSha: receipt?.commitSha, publication: "deployment-required" as const };
}
