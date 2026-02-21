import { MetadataRoute } from "next";
import { getPortfolioSlugs } from "@/lib/content";
import { getBlogSlugs } from "@/lib/content";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mightyblessing.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const portfolioSlugs = getPortfolioSlugs();
  const blogSlugs = getBlogSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/portfolio`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/inquiry`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const portfolioEntries: MetadataRoute.Sitemap = portfolioSlugs.map((slug) => ({
    url: `${baseUrl}/portfolio/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...portfolioEntries, ...blogEntries];
}
