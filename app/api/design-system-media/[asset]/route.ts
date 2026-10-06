import { readFile } from "node:fs/promises";
import path from "node:path";

const assets = new Set(["grapetree.webp", "livetext.webp", "livetext-approval.webp", "production.webp", "registration.webp", "live-text-field.webp"]);

export async function GET(_request: Request, { params }: { params: Promise<{ asset: string }> }) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  const { asset } = await params;
  if (!assets.has(asset)) return new Response(null, { status: 404 });
  try {
    const bytes = await readFile(path.join(process.cwd(), "artifacts-local/design-system", asset));
    return new Response(bytes, { headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=3600", "X-Robots-Tag": "noindex" } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
