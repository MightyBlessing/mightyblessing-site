import sharp from "sharp";
import { RequestError } from "@/lib/request-guard";

export const MAX_UPLOAD_REQUEST = 32 * 1024 * 1024;
const imageExtensions = new Map([["jpg", "jpeg"], ["jpeg", "jpeg"], ["png", "png"], ["webp", "webp"]]);

export async function validateUpload(file: File, expected: "image" | "video") {
  const extension = file.name.toLowerCase().split(".").pop() || "";
  const maximum = (expected === "video" ? 24 : 8) * 1024 * 1024;
  if (file.size > maximum) throw new RequestError(`${expected === "video" ? "영상은 24" : "이미지는 8"}MB 이하로 올려 주세요.`, 413);
  if (!file.size) throw new RequestError("빈 파일은 올릴 수 없습니다.");
  if (expected === "image" ? !imageExtensions.has(extension) : extension !== "mp4") {
    throw new RequestError("이미지는 JPG·PNG·WebP, 영상은 MP4만 사용할 수 있습니다.", 415);
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (expected === "image") {
    try {
      const input = sharp(bytes, { limitInputPixels: 40_000_000, failOn: "warning" });
      const metadata = await input.metadata();
      if (metadata.format !== imageExtensions.get(extension) || (metadata.pages || 1) > 1) throw new Error("format");
      await input.resize(1, 1).toBuffer();
    } catch { throw new RequestError("이미지 내용과 확장자를 확인해 주세요. 손상되거나 너무 큰 이미지는 사용할 수 없습니다.", 415); }
  } else {
    const boxSize = bytes.length >= 24 ? bytes.readUInt32BE(0) : 0;
    const brands = boxSize >= 20 && boxSize <= Math.min(bytes.length, 1024) ? bytes.subarray(8, boxSize).toString("ascii") : "";
    if (bytes.subarray(4, 8).toString() !== "ftyp" || !/(isom|iso[2-9]|mp4[12]|avc1)/.test(brands)) {
      throw new RequestError("MP4 파일 형식이 올바르지 않습니다.", 415);
    }
  }
  return { name: file.name, contentBase64: bytes.toString("base64") };
}
