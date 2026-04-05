import { MetadataRoute } from "next";
import { getPortfolioSlugs } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const portfolioSlugs = getPortfolioSlugs();
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/portfolio`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/services`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/inquiry`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];

  const portfolioEntries: MetadataRoute.Sitemap = portfolioSlugs.map((slug) => ({
    url: `${siteUrl}/portfolio/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...portfolioEntries];
}
