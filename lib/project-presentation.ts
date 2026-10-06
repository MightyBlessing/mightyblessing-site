import type { PortfolioEntry, PortfolioFrontmatter } from "./content";
import { reviewPhotoSrcSet } from "./review-photos";

export type ProjectLink = {
  slug: string;
  title: string;
  year: string;
  date: string;
  location: string;
  image: string;
  alt: string;
};

export function homeProjectTitle({ title, year }: Pick<ProjectLink, "title" | "year">) {
  const suffix = title.match(/\s+(\d{4}|\d{2})$/);
  return /^\d{4}$/.test(year) && suffix && (suffix[1] === year || suffix[1] === year.slice(-2))
    ? title.slice(0, suffix.index)
    : title;
}

export function projectDisplayDate(project: Pick<PortfolioFrontmatter, "date" | "displayDate">) {
  return (project.displayDate?.trim() || project.date).replaceAll("-", ".");
}

export function projectArchiveDate(project: Pick<PortfolioFrontmatter, "date" | "displayDate">) {
  const date = projectDisplayDate(project);
  if (/^\d{4}\.\d{2}\.\d{2}(?:–\d{2})?$/.test(date)) return date.slice(5);
  if (/^\d{4}\.\d{2}$/.test(date)) return `${date.slice(5)}월`;
  return /^\d{4}$/.test(date) ? "" : date;
}

export function toProjectLink({ slug, frontmatter: project }: PortfolioEntry): ProjectLink {
  return {
    slug,
    title: project.shortTitle || project.title,
    year: (project.displayDate || project.date).slice(0, 4),
    date: projectDisplayDate(project),
    location: project.location || "",
    image: project.heroMedia?.poster || project.heroMedia?.url || project.thumbnail || "",
    alt: project.heroMedia?.alt || project.title,
  };
}

export function imageSrcSet(url: string) {
  return /^\/api\/preview-media\/[pr]\d{3,4}-1920\.webp$/.test(url)
    ? [640, 1280, 1920].map((width) => `${url.replace("-1920", `-${width}`)} ${width}w`).join(", ")
    : reviewPhotoSrcSet(url);
}

export function selectHomeProjects(projects: PortfolioEntry[]) {
  const current = selectIndexProjects(projects);
  const curated = current.filter(({ frontmatter }) => frontmatter.homeOrder !== undefined);
  return [...(curated.length ? curated : current)]
    .filter((project) => Boolean(toProjectLink(project).image))
    .sort((a, b) => (a.frontmatter.homeOrder ?? 99) - (b.frontmatter.homeOrder ?? 99))
    .slice(0, 4);
}

// Publication filtering happens in getAllPortfolios. Selection never promotes drafts
// or pads the list with duplicate events when fewer public records are available.
export function selectFeaturedRailProjects(projects: PortfolioEntry[]) {
  const current = selectIndexProjects(projects);
  const curated = current.filter(({ frontmatter }) => frontmatter.railOrder !== undefined);
  return [...(curated.length ? curated : current)]
    .sort((a, b) => (a.frontmatter.railOrder ?? 99) - (b.frontmatter.railOrder ?? 99))
    .slice(0, 8).map((entry) => {
      const project = toProjectLink(entry);
      // P043 is matched to this event in home-hero-photos.json and the private
      // selection manifest. Only enrich an already selected local review record.
      if (process.env.NODE_ENV === "development" && !project.image && project.slug === "welove-reconciliation-2026") {
        return { ...project, image: "/api/preview-media/p043-1920.webp" };
      }
      return project;
    });
}

// The v2 register has one record per event. Legacy overview URLs remain available,
// but must not duplicate these events in the index. Production retains its legacy
// index until the reviewed v2 records are published.
export function selectIndexProjects(projects: PortfolioEntry[]) {
  const current = projects.filter(({ frontmatter }) => frontmatter.schemaVersion === 2);
  return [...(current.length ? current : projects)].sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}

export function selectRailProjects(projects: PortfolioEntry[]) {
  return selectIndexProjects(projects).map(toProjectLink);
}

export function groupProjectsByYear<T extends { year: string }>(projects: T[]) {
  const years = [...new Set(projects.map(({ year }) => year))].sort((a, b) => b.localeCompare(a));
  return years.map((year) => ({ year, projects: projects.filter((project) => project.year === year) }));
}
