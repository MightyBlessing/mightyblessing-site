export const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL || "https://blog.mightyblessing.com/";

/** Public site routes; the design-system home keeps its in-page review anchors. */
export function siteNavigation(preview = false) {
  return [
    { label: "프로젝트", href: "/portfolio" },
    { label: "하는 일", href: preview ? "#capabilities" : "/capabilities", section: "capabilities" },
    { label: "소개", href: preview ? "#about" : "/about", section: "about" },
    { label: "제품", href: preview ? "#products" : "/products", section: "products" },
    { label: "프로젝트 문의", href: "/inquiry" },
    { label: "블로그", href: blogUrl, external: true },
  ];
}

export function hasPublicSiteFrame(pathname: string) {
  return ["/", "/portfolio", "/capabilities", "/about", "/products", "/services", "/inquiry", "/privacy", "/terms"].includes(pathname)
    || pathname.startsWith("/portfolio/");
}
