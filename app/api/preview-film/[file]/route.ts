import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { getAllPortfolios } from "@/lib/content";
import { canReviewFilm, filmByteRange, filmFileAllowed } from "@/lib/home-film";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ file: string }> };

async function serve(request: Request, context: Context) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  const { file } = await context.params;
  if (!filmFileAllowed(file) || !canReviewFilm(getAllPortfolios())) return new Response(null, { status: 404 });
  try {
    const filename = path.join(process.cwd(), "artifacts-local/site-film", file);
    const { size } = await stat(filename);
    const range = filmByteRange(request.headers.get("range"), size);
    const headers: Record<string, string> = {
      "Content-Type": file.endsWith("mp4") ? "video/mp4" : "image/webp",
      "Accept-Ranges": "bytes", "Cache-Control": "private, no-cache", "X-Robots-Tag": "noindex",
    };
    if (range === false) return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
    headers["Content-Length"] = String(range ? range.end - range.start + 1 : size);
    if (range) headers["Content-Range"] = `bytes ${range.start}-${range.end}/${size}`;
    const body = request.method === "HEAD" ? null : Readable.toWeb(createReadStream(filename, range ?? undefined)) as ReadableStream<Uint8Array>;
    return new Response(body, { status: range ? 206 : 200, headers });
  } catch { return new Response(null, { status: 404 }); }
}
export const GET = serve;
export const HEAD = serve;
