import type { Metadata } from "next";
import { siteDescription, siteName, siteTitle, siteUrl } from "@/lib/site";

const defaultOgImagePath = "/media/portfolio/home-hero-worship-poster.jpg";

const defaultKeywords = [
  "마이티블레싱",
  "Mighty Blessing",
  "예배 기획",
  "예배 운영",
  "집회 운영",
  "교회 행사",
  "포트폴리오",
];

type MetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  images?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
};

function normalizePath(path = "/") {
  if (!path || path === "/") {
    return "/";
  }

  return `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

export function toAbsoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const normalizedPath = normalizePath(path);
  return normalizedPath === "/" ? siteUrl : `${siteUrl}${normalizedPath}`;
}

export function buildPageMetadata({
  title,
  description = siteDescription,
  path = "/",
  keywords = [],
  images = [defaultOgImagePath],
  noIndex = false,
  type = "website",
}: MetadataOptions = {}): Metadata {
  const canonical = normalizePath(path);
  const resolvedTitle = title ? `${title} | ${siteName}` : siteTitle;
  const resolvedKeywords = [...new Set([...defaultKeywords, ...keywords])];
  const resolvedImages = (images.length > 0 ? images : [defaultOgImagePath]).map((image) => ({
    url: toAbsoluteUrl(image),
    alt: resolvedTitle,
  }));

  return {
    title: resolvedTitle,
    description,
    keywords: resolvedKeywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url: toAbsoluteUrl(canonical),
      siteName,
      locale: "ko_KR",
      type,
      images: resolvedImages,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: resolvedImages.map((image) => image.url),
    },
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
