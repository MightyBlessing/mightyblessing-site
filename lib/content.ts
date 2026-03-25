import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PortfolioMediaAsset } from "./portfolio-media";

const contentDir = path.join(process.cwd(), "content");

export type PortfolioFrontmatter = {
  title: string;
  slug: string;
  date: string;
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
      thumbnail:
        frontmatter.thumbnail ||
        frontmatter.heroMedia?.poster ||
        (firstGalleryItem?.type === "image" ? firstGalleryItem.url : firstGalleryItem?.poster),
      gallery: frontmatter.gallery || [],
      search_terms: frontmatter.search_terms || [],
    },
    content,
  };
}

export function getAllPortfolios(): { frontmatter: PortfolioFrontmatter; slug: string }[] {
  const slugs = getPortfolioSlugs();
  return slugs
    .map((slug) => {
      const item = getPortfolioBySlug(slug);
      if (!item) return null;
      return { frontmatter: item.frontmatter, slug };
    })
    .filter((x): x is { frontmatter: PortfolioFrontmatter; slug: string } => x !== null)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

function normalizeSearchValue(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function searchPortfolios(query: string): { frontmatter: PortfolioFrontmatter; slug: string }[] {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return getAllPortfolios();

  return getAllPortfolios().filter(({ frontmatter }) => {
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
