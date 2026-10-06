import { createHash } from "crypto";
import { RequestError } from "@/lib/request-guard";
export function contentRevision(base64: string | null) {
  return base64 === null ? null : createHash("sha256").update(Buffer.from(base64, "base64")).digest("hex");
}
export class EditConflict extends RequestError {
  constructor() { super("다른 작업에서 내용이 변경되었습니다. 현재 입력을 복사해 보관한 뒤 편집 화면을 다시 열어 주세요.", 409); }
}
export async function checkExpectedFiles(expected: Record<string, string | null> | undefined, read: (path: string) => Promise<string | null>) {
  for (const [path, revision] of Object.entries(expected || {})) {
    if (contentRevision(await read(path)) !== revision) throw new EditConflict();
  }
}
