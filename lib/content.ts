import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PortfolioMediaAsset } from "./portfolio-media";

const contentDir = path.join(process.cwd(), "content");

export type PortfolioStatus = "draft" | "published" | "archived";

export type PortfolioFrontmatter = {
  title: string;
  slug: string;
  date: string;
  status?: PortfolioStatus;
  featured?: boolean;
  featured_order?: number;
  location?: string;
  partner?: string;
  summary: string;
  roles: string[];
  categories: string[];
  thumbnail?: string;
  heroMedia?: PortfolioMediaAsset;
  search_terms?: string[];
  goals?: string;
  scope?: string;
  our_role?: string;
  process?: string;
  metrics?: { label: string; value: string }[];
  testimonials?: { name: string; role: string; text: string }[];
  gallery?: PortfolioMediaAsset[];
  related_cases?: string[];
};

export type PortfolioEntry = { frontmatter: PortfolioFrontmatter; slug: string };

export type BlogFrontmatter = {
  title: string;
  slug: string;
  date: string;
  category: string;
  tags: string[];
  summary: string;
  thumbnail?: string;
};

function shouldIncludePortfolio(status: PortfolioStatus, includeUnpublished?: boolean) {
  return includeUnpublished || status === "published";
}

export function normalizePortfolioFrontmatter(frontmatter: Partial<PortfolioFrontmatter>): PortfolioFrontmatter {
  const firstGalleryItem = frontmatter.gallery?.[0];

  return {
    title: frontmatter.title || "",
    slug: frontmatter.slug || "",
    date: frontmatter.date || "",
    status: frontmatter.status || "published",
    featured: Boolean(frontmatter.featured),
    featured_order: frontmatter.featured_order,
    location: frontmatter.location,
    partner: frontmatter.partner,
    summary: frontmatter.summary || "",
    roles: frontmatter.roles || [],
    categories: frontmatter.categories || [],
    thumbnail:
      frontmatter.thumbnail ||
      frontmatter.heroMedia?.poster ||
      (firstGalleryItem?.type === "image" ? firstGalleryItem.url : firstGalleryItem?.poster),
    heroMedia: frontmatter.heroMedia,
    search_terms: frontmatter.search_terms || [],
    goals: frontmatter.goals,
    scope: frontmatter.scope,
    our_role: frontmatter.our_role,
    process: frontmatter.process,
    metrics: frontmatter.metrics || [],
    testimonials: frontmatter.testimonials || [],
    gallery: frontmatter.gallery || [],
    related_cases: frontmatter.related_cases || [],
  };
}

export function getPortfolioSlugs(options: { includeUnpublished?: boolean } = {}): string[] {
  const dir = path.join(contentDir, "portfolio");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .filter((slug) => {
      const item = getPortfolioBySlug(slug, options);
      return Boolean(item);
    });
}

export function getPortfolioBySlug(
  slug: string,
  options: { includeUnpublished?: boolean } = {},
): { frontmatter: PortfolioFrontmatter; content: string } | null {
  const fullPath = path.join(contentDir, "portfolio", `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = normalizePortfolioFrontmatter(data as Partial<PortfolioFrontmatter>);

  if (!shouldIncludePortfolio(frontmatter.status || "published", options.includeUnpublished)) {
    return null;
  }

  return {
    frontmatter,
    content,
  };
}

function sortByDateDesc(items: PortfolioEntry[]) {
  return [...items].sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

function sortFeatured(items: PortfolioEntry[]) {
  return [...items].sort((a, b) => {
    const orderA = a.frontmatter.featured_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.frontmatter.featured_order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
  });
}

export function getAllPortfolios(options: { includeUnpublished?: boolean } = {}): PortfolioEntry[] {
  const slugs = getPortfolioSlugs(options);
  const items = slugs
    .map((slug) => {
      const item = getPortfolioBySlug(slug, options);
      if (!item) return null;
      return { frontmatter: item.frontmatter, slug };
    })
    .filter((x): x is PortfolioEntry => x !== null);

  return sortByDateDesc(items);
}

export function getFeaturedPortfolios(limit = 3): PortfolioEntry[] {
  const all = getAllPortfolios();
  const featured = sortFeatured(all.filter(({ frontmatter }) => frontmatter.featured));

  if (featured.length >= limit) {
    return featured.slice(0, limit);
  }

  const fallback = all.filter((item) => !featured.some((featuredItem) => featuredItem.slug === item.slug));
  return [...featured, ...fallback].slice(0, limit);
}

export function getPortfolioCategories(): string[] {
  const categories = new Set<string>();

  for (const { frontmatter } of getAllPortfolios()) {
    for (const category of frontmatter.categories || []) {
      categories.add(category);
    }
  }

  return [...categories].sort((a, b) => a.localeCompare(b, "ko"));
}

function normalizeSearchValue(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function filterPortfolios({
  query = "",
  category = "",
}: {
  query?: string;
  category?: string;
} = {}): PortfolioEntry[] {
  const normalizedQuery = normalizeSearchValue(query);
  const normalizedCategory = normalizeSearchValue(category);

  return getAllPortfolios().filter(({ frontmatter }) => {
    const matchesCategory =
      !normalizedCategory ||
      (frontmatter.categories || []).some((item) => normalizeSearchValue(item) === normalizedCategory);

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = normalizeSearchValue(
      [
        frontmatter.title,
        ...(frontmatter.roles || []),
        ...(frontmatter.categories || []),
        ...(frontmatter.search_terms || []),
      ].join(" "),
    );

    return haystack.includes(normalizedQuery);
  });
}

export function searchPortfolios(query: string): PortfolioEntry[] {
  return filterPortfolios({ query });
}

export function getRelatedPortfolios(slug: string, limit = 2): PortfolioEntry[] {
  const current = getPortfolioBySlug(slug);
  if (!current) return [];

  const preferred = (current.frontmatter.related_cases || [])
    .map((relatedSlug) => {
      const item = getPortfolioBySlug(relatedSlug);
      if (!item) return null;
      return { slug: relatedSlug, frontmatter: item.frontmatter };
    })
    .filter((item): item is PortfolioEntry => item !== null);

  if (preferred.length > 0) {
    return preferred.slice(0, limit);
  }

  return getAllPortfolios()
    .filter((item) => item.slug !== slug)
    .slice(0, limit);
}

export function getBlogSlugs(): string[] {
  const dir = path.join(contentDir, "blog");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
}

export function getBlogBySlug(slug: string): { frontmatter: BlogFrontmatter; content: string } | null {
  const fullPath = path.join(contentDir, "blog", `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data as BlogFrontmatter, content };
}

export function getAllBlogs(): { frontmatter: BlogFrontmatter; slug: string }[] {
  const slugs = getBlogSlugs();
  return slugs
    .map((slug) => {
      const item = getBlogBySlug(slug);
      if (!item) return null;
      return { frontmatter: item.frontmatter, slug };
    })
    .filter((x): x is { frontmatter: BlogFrontmatter; slug: string } => x !== null)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}
