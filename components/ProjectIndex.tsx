import Link from "next/link";
import { groupProjectsByYear, homeProjectTitle, type ProjectLink } from "@/lib/project-presentation";

/** One complete, year-grouped index for desktop and mobile, including text-only work. */
export function ProjectIndex({ projects, activeSlug, onNavigate, headingLevel = 2 }: {
  projects: ProjectLink[];
  activeSlug?: string;
  onNavigate?: () => void;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return groupProjectsByYear(projects).map(group => <section className="site-index-year" key={group.year} aria-label={`${group.year}년 프로젝트`}>
    <Heading className="site-index-year-label">{group.year}</Heading>
    {group.projects.map(project => <Link key={project.slug} className="site-index-link" href={`/portfolio/${project.slug}`} onClick={onNavigate} aria-current={activeSlug === project.slug ? "page" : undefined}>
      <span>{homeProjectTitle(project)}</span><span aria-hidden="true">↗</span>
    </Link>)}
  </section>);
}
