import { readFile } from "node:fs/promises";
import path from "node:path";
import { isReviewPhotoFile } from "@/lib/review-photos";

// Review derivatives remain outside public/ and the container build context.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  const { file } = await params;
  if (!/^[pr]\d{3,4}-(640|1280|1920)\.webp$/.test(file) && !isReviewPhotoFile(file)) return new Response(null, { status: 404 });
  try {
    const bytes = await readFile(path.join(process.cwd(), "artifacts-local/site-preview", file));
    return new Response(bytes, { headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=3600", "X-Robots-Tag": "noindex" } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
