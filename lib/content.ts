import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PortfolioMediaAsset } from "./portfolio-media";

const contentDir = path.join(process.cwd(), "content");

export type PortfolioFrontmatter = {
  title: string;
  slug: string;
  date: string;
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

export function getPortfolioSlugs(): string[] {
  const dir = path.join(contentDir, "portfolio");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
}

export function getPortfolioBySlug(slug: string): { frontmatter: PortfolioFrontmatter; content: string } | null {
  const fullPath = path.join(contentDir, "portfolio", `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = data as PortfolioFrontmatter;
  const firstGalleryItem = frontmatter.gallery?.[0];

  return {
    frontmatter: {
      ...frontmatter,
      featured: Boolean(frontmatter.featured),
      thumbnail:
        frontmatter.thumbnail ||
        frontmatter.heroMedia?.poster ||
        (firstGalleryItem?.type === "image" ? firstGalleryItem.url : firstGalleryItem?.poster),
      categories: frontmatter.categories || [],
      roles: frontmatter.roles || [],
      gallery: frontmatter.gallery || [],
      search_terms: frontmatter.search_terms || [],
    },
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

export function getAllPortfolios(): PortfolioEntry[] {
  const slugs = getPortfolioSlugs();
  const items = slugs
    .map((slug) => {
      const item = getPortfolioBySlug(slug);
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
