/* eslint-disable @next/next/no-img-element -- Existing responsive public/review media sources. */
import Link from "next/link";
import { toSystemProject } from "@/lib/design-system";
import { getAllPortfolios } from "@/lib/content";
import { imageSrcSet, selectHomeProjects } from "@/lib/project-presentation";

export function ProjectSuggestions() {
  const projects = selectHomeProjects(getAllPortfolios()).slice(0, 2).map(toSystemProject);
  if (!projects.length) return null;
  return <section className="company-projects"><div className="company-section-heading"><h2>함께한 프로젝트</h2><Link href="/portfolio">전체 프로젝트 →</Link></div><div className="company-project-grid">{projects.map(project => <article key={project.slug}>{project.image && <Link href={`/portfolio/${project.slug}`} className="company-project-image" aria-label={`${project.title} 프로젝트 보기`}><img src={project.image} srcSet={imageSrcSet(project.image)} sizes="(min-width:1024px) 480px, 90vw" width={960} height={640} loading="lazy" alt="" /></Link>}<h3><Link href={`/portfolio/${project.slug}`}>{project.title}</Link></h3><p>{project.roles.slice(0, 3).join(" · ")}</p></article>)}</div></section>;
}
