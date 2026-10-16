/** Login destinations are limited to the admin pages this app actually serves. */
export function adminLoginDestination(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return "/admin";
  try {
    const url = new URL(value, "https://admin.invalid");
    const pathname = decodeURIComponent(url.pathname);
    if (url.origin !== "https://admin.invalid" || !/^\/admin(?:\/portfolio\/[a-zA-Z0-9가-힣-]+|\/products(?:\/(?:grapetree|live-text|twoline))?)?\/?$/.test(pathname)) return "/admin";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/admin";
  }
}
