import type { Metadata } from "next";
import { ProjectDetail } from "@/components/redesign/ProjectDetail";
import { notFound } from "next/navigation";
import { getPortfolioBySlug, getPortfolioSlugs } from "@/lib/content";
import { HOME_HERO_POSTER_STORAGE_KEY, resolveContentMediaUrl } from "@/lib/content-media";
import { resolvePortfolioThumbnailUrl } from "@/lib/portfolio-display";
import { buildPageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { buildProjectJsonLd } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = getPortfolioSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getPortfolioBySlug(slug);
  if (!item) notFound();

  const image =
    resolvePortfolioThumbnailUrl(item.frontmatter) ||
    resolveContentMediaUrl({
      storageKey: HOME_HERO_POSTER_STORAGE_KEY,
      fallbackUrl: "/media/portfolio/home-hero-worship-poster.jpg",
    }) ||
    "/media/portfolio/home-hero-worship-poster.jpg";

  return buildPageMetadata({
    title: item.frontmatter.title,
    description: item.frontmatter.summary || item.frontmatter.our_role,
    path: `/portfolio/${slug}`,
    images: [image],
    keywords: [...(item.frontmatter.roles || []), ...(item.frontmatter.categories || []), ...(item.frontmatter.search_terms || [])],
    type: "article",
  });
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getPortfolioBySlug(slug);
  if (!item) notFound();

  const { frontmatter, content } = item;
  const structuredData = <JsonLd data={buildProjectJsonLd(slug, frontmatter)} />;
  return <>{structuredData}<ProjectDetail project={frontmatter} content={content} /></>;
}
