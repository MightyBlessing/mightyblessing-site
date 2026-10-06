/** Small single-process limits. Multi-instance deployments also need a shared edge limit. */
export class RequestError extends Error {
  constructor(message: string, public readonly status = 400) { super(message); }
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const normalize = (value: string) => {
    try {
      const url = new URL(value);
      if (process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) url.hostname = "localhost";
      return url.origin;
    } catch { return ""; }
  };
  const allowed = new Set([normalize(request.url)]);
  // Use configured public origin behind a reverse proxy, never a caller-supplied forwarded host.
  if (process.env.NEXT_PUBLIC_SITE_URL) allowed.add(normalize(process.env.NEXT_PUBLIC_SITE_URL));
  if ((origin && (!normalize(origin) || !allowed.has(normalize(origin)))) || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new RequestError("다른 사이트에서 보낸 요청은 처리할 수 없습니다.", 403);
  }
}

export async function limitedBody(request: Request, maximum: number) {
  const declared = Number(request.headers.get("content-length"));
  if (declared > maximum) throw new RequestError("요청 용량이 너무 큽니다.", 413);
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maximum) {
        await reader.cancel();
        throw new RequestError("요청 용량이 너무 큽니다.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

export async function limitedJson(request: Request, maximum = 256 * 1024) {
  const bytes = await limitedBody(request, maximum);
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new RequestError("요청 형식이 올바르지 않습니다."); }
}

export function createRateLimit() {
  const entries = new Map<string, { count: number; until: number }>();
  return (key: string, limit: number, windowMs: number, now = Date.now()) => {
    for (const [name, value] of entries) if (value.until <= now) entries.delete(name);
    const value = entries.get(key) || { count: 0, until: now + windowMs };
    // The application uses fixed keys; keep this helper bounded for future callers.
    if (!entries.has(key) && entries.size >= 1024) return Math.ceil(windowMs / 1000);
    entries.set(key, value);
    if (value.count >= limit) return Math.max(1, Math.ceil((value.until - now) / 1000));
    value.count++;
    return 0;
  };
}
const consume = createRateLimit();
export function rateLimitResponse(scope: "login" | "inquiry") {
  // Untrusted forwarded-IP headers cannot create extra quota. Conservative shared limit.
  const retry = consume(scope, scope === "login" ? 30 : 20, 10 * 60 * 1000);
  return retry ? Response.json({ error: `요청이 많습니다. ${retry}초 후 다시 시도해 주세요.` }, {
    status: 429, headers: { "Retry-After": String(retry), "Cache-Control": "no-store" },
  }) : null;
}
export function requestErrorResponse(error: unknown, fallback: string) {
  return Response.json({ error: error instanceof Error ? error.message : fallback }, {
    status: error instanceof RequestError ? error.status : 500,
  });
}
