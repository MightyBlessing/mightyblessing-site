import { MetadataRoute } from "next";
import { getAllPortfolios } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Only published records belong in discovery feeds, including in local previews.
  const portfolios = getAllPortfolios().filter(({ frontmatter }) => frontmatter.status === "published");
  // No lastModified until actual content-update dates are stored. Build time is not one.

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/portfolio`, changeFrequency: "weekly", priority: 0.9 },
    ...["capabilities", "about", "products"].map(path => ({ url: `${siteUrl}/${path}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${siteUrl}/inquiry`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const portfolioEntries: MetadataRoute.Sitemap = portfolios.map(({ slug }) => ({
    url: `${siteUrl}/portfolio/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...portfolioEntries];
}
