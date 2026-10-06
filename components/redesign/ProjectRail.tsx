"use client";
/* eslint-disable @next/next/no-img-element -- Explicit responsive sources and supplied SVG brand. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useReducer, useRef } from "react";
import { groupProjectsByYear, imageSrcSet, type ProjectLink } from "@/lib/project-presentation";
import { HomeProjectIndexRow } from "./HomeProjectIndexRow";
import { railPreviewReducer } from "@/lib/rail-preview";
import { siteNavigation } from "@/lib/site-navigation";
import { useHomeLocation } from "./useHomeLocation";

type ProjectRailProps = { projects: ProjectLink[]; activeSlug?: string; previewSlug?: string; selected?: boolean };

export function ProjectRail({ selected = false, ...props }: ProjectRailProps) {
  if (!selected) return <ArchiveProjectRail {...props} />;
  return <HomeProjectRail projects={props.projects} />;
}

function HomeProjectRail({ projects }: Pick<ProjectRailProps, "projects">) {
  const preview = usePathname() === "/design-system";
  const location = useHomeLocation();
  const links = siteNavigation(preview);
  return <aside className="project-rail selected-rail" aria-label="프로젝트 색인">
    <Link href="#home-content" className="home-rail-brand" aria-label="마이티블레싱 홈" aria-current={location === "home" ? "location" : undefined}><span className="home-brand-mark" aria-hidden="true" /></Link>
    <nav className="home-company-nav" aria-label="회사 탐색">
      {links.filter((link) => link.section).map((link) => <Link key={link.href} href={link.href} aria-current={location === link.section ? "location" : undefined}>{link.label}</Link>)}
    </nav>
    <div className="rail-topline"><span>SELECTED WORK</span></div>
    <nav className="home-project-index" aria-label="주요 프로젝트">
      {projects.map((project) => <HomeProjectIndexRow key={project.slug} project={project} />)}
    </nav>
    <nav className="home-rail-actions" aria-label="프로젝트 탐색과 문의">
      <Link href={links[0].href} className="rail-all">전체 프로젝트 보기 <span aria-hidden="true">→</span></Link>
      <Link href={links[4].href} className="home-rail-contact">{links[4].label} <span aria-hidden="true">↗</span></Link>
    </nav>
  </aside>;
}

function ArchiveProjectRail({ projects, activeSlug, previewSlug }: Omit<ProjectRailProps, "selected">) {
  const fallback = projects.find((project) => project.slug === (activeSlug || previewSlug))?.slug || projects[0]?.slug;
  const [state, dispatch] = useReducer(railPreviewReducer, { requested: fallback, shown: undefined, ready: [], failed: [] });
  const rail = useRef<HTMLElement>(null);
  const hovered = useRef<string | undefined>(undefined);
  const shown = projects.find((project) => project.slug === state.shown);
  const requested = projects.find((project) => project.slug === state.requested);
  const select = (slug?: string) => { if (slug) dispatch({ type: "select", slug, hasImage: Boolean(projects.find((project) => project.slug === slug)?.image) }); };

  useEffect(() => {
    // Include images that finished before hydration; hidden mobile images stay lazy.
    const frame = requestAnimationFrame(() => {
      rail.current?.querySelectorAll<HTMLImageElement>("img[data-slug]").forEach((img) => {
        if (img.complete && img.dataset.slug) dispatch({ type: img.naturalWidth ? "loaded" : "error", slug: img.dataset.slug });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <aside ref={rail} className="project-rail" aria-label="프로젝트 색인" onMouseLeave={() => {
      hovered.current = undefined;
      select(rail.current?.querySelector<HTMLAnchorElement>(".rail-link:focus")?.dataset.slug || fallback);
    }} onBlurCapture={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) select(hovered.current || fallback);
    }}>
      <div className="rail-topline"><span>PROJECT INDEX</span><span>{projects.length} PROJECTS</span></div>
      <nav className="rail-index" aria-label="전체 프로젝트">
        {groupProjectsByYear(projects).map((group) => <section className="rail-year-group" key={group.year} aria-label={`${group.year}년 프로젝트`}>
          <h2>{group.year}<span>{String(group.projects.length).padStart(2, "0")}</span></h2>
          {group.projects.map((project) => (
          <Link key={project.slug} data-slug={project.slug} href={`/portfolio/${project.slug}`} className={state.requested === project.slug ? "rail-link is-preview" : "rail-link"} onMouseEnter={() => { hovered.current = project.slug; select(project.slug); }} onFocus={() => select(project.slug)} aria-current={activeSlug === project.slug ? "page" : undefined}>
            <span>{project.title}</span>
          </Link>
        ))}</section>)}
      </nav>
      <div className="rail-bottom">
      {projects.length > 0 && <div className="rail-preview" aria-hidden="true">
        <div className="rail-preview-frame">
          {!shown && <div className="rail-preview-placeholder"><span>{requested?.date}</span><strong>{requested?.title}</strong><span>{requested?.location}</span></div>}
          {projects.filter((project) => project.image).map((project) => <img key={project.slug} data-slug={project.slug} data-visible={state.shown === project.slug} src={project.image} srcSet={imageSrcSet(project.image)} sizes="210px" alt="" width={420} height={280} loading="lazy" onLoad={() => dispatch({ type: "loaded", slug: project.slug })} onError={() => dispatch({ type: "error", slug: project.slug })} />)}
        </div>
        <p>{shown ? shown.title : "프로젝트의 수행 내용 보기 ↗"}</p>
      </div>}
      <Link href="/portfolio" className="rail-all">전체 프로젝트 보기 <span aria-hidden="true">→</span></Link>
      </div>
    </aside>
  );
}
