import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
  goals?: string;
  scope?: string;
  our_role?: string;
  process?: string;
  metrics?: { label: string; value: string }[];
  testimonials?: { name: string; role: string; text: string }[];
  gallery?: { type: "image" | "video"; url: string; alt?: string }[];
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
  return { frontmatter: data as PortfolioFrontmatter, content };
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
