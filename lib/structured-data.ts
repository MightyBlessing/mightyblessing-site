import type { PortfolioFrontmatter } from "@/lib/content";
import { capabilities } from "@/lib/company-content";
import { toAbsoluteUrl } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

// JSON is embedded in a script element, so CMS text must not close the element.
export function serializeJsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildCapabilitiesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": capabilities.map(item => ({
      "@type": "Service",
      "@id": `${toAbsoluteUrl("/capabilities")}#${item.id}`,
      url: `${toAbsoluteUrl("/capabilities")}#${item.id}`,
      name: item.title,
      description: item.scope,
      serviceType: item.title,
      provider: { "@id": `${siteUrl}/#organization` },
    })),
  };
}

export function buildProjectJsonLd(slug: string, project: PortfolioFrontmatter) {
  if (project.status !== "published") return null;
  const url = toAbsoluteUrl(`/portfolio/${slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        // This is a record of our work, not an upcoming event or ticket offer.
        "@type": "CreativeWork",
        "@id": `${url}#project`,
        url,
        name: project.title,
        description: project.summary || project.our_role,
        inLanguage: "ko-KR",
        creator: { "@id": `${siteUrl}/#organization` },
        mainEntityOfPage: url,
        // The event date is not the page's publication or modification date.
        about: project.roles.map(name => ({ "@type": "Thing", name })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "프로젝트", item: toAbsoluteUrl("/portfolio") },
          { "@type": "ListItem", position: 3, name: project.title, item: url },
        ],
      },
    ],
  };
}
