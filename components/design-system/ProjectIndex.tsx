"use client";
/* eslint-disable @next/next/no-img-element -- Reviewed local preview images. */
import Link from "next/link";
import { useEffect, useReducer, useRef } from "react";
import { groupProjectsByYear, imageSrcSet } from "@/lib/project-presentation";
import { railPreviewReducer } from "@/lib/rail-preview";
import type { SystemProject } from "@/lib/design-system";
import { Arrow, BrandMark } from "./primitives";

export function ProjectIndex({ projects, activeSlug, onNavigate }: { projects: SystemProject[]; activeSlug?: string; onNavigate?: () => void }) {
  const fallback = projects.find((p) => p.slug === activeSlug)?.slug || projects[0]?.slug;
  const [state, dispatch] = useReducer(railPreviewReducer, { requested: fallback, shown: undefined, ready: [], failed: [] });
  const rail = useRef<HTMLElement>(null);
  const hovered = useRef<string | undefined>(undefined);
  const select = (slug?: string) => {
    if (slug) dispatch({ type: "select", slug, hasImage: Boolean(projects.find((p) => p.slug === slug)?.image) });
  };
  const shown = projects.find((p) => p.slug === state.shown);
  const requested = projects.find((p) => p.slug === state.requested);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      rail.current?.querySelectorAll<HTMLImageElement>("img[data-project]").forEach((image) => {
        if (image.complete && image.dataset.project) dispatch({ type: image.naturalWidth ? "loaded" : "error", slug: image.dataset.project });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return <aside ref={rail} className="mb-index" aria-label="프로젝트 색인" onMouseLeave={() => { hovered.current = undefined; select(rail.current?.querySelector<HTMLAnchorElement>("a[data-project]:focus")?.dataset.project || fallback); }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) select(hovered.current || fallback); }}>
    <Link href="/" className="mb-index-logo" aria-label="마이티블레싱 홈" prefetch={false}><BrandMark /></Link>
    <div className="mb-index-heading"><span>프로젝트</span><span>{projects.length}</span></div>
    <nav className="mb-index-list" aria-label="연도별 전체 프로젝트">{groupProjectsByYear(projects).map((group) => <section key={group.year} className="mb-index-year"><h3>{group.year}<span>{String(group.projects.length).padStart(2, "0")}</span></h3>{group.projects.map((project) => <Link key={project.slug} data-project={project.slug} className={`mb-index-row${state.requested === project.slug ? " is-preview" : ""}`} href={`/portfolio/${project.slug}`} prefetch={false} aria-current={activeSlug === project.slug ? "page" : undefined} onMouseEnter={() => { hovered.current = project.slug; select(project.slug); }} onFocus={() => select(project.slug)} onClick={onNavigate}><span>{project.title}</span><Arrow /></Link>)}</section>)}</nav>
    <div className="mb-index-preview" aria-hidden="true"><div className="mb-index-picture">
      {!shown && <div className="mb-index-no-photo"><span>{requested?.date}</span><strong>{requested?.title}</strong><span>{requested?.location}</span></div>}
      {projects.filter((p) => p.image).map((project) => <img key={project.slug} data-project={project.slug} data-visible={state.shown === project.slug} src={project.image} srcSet={imageSrcSet(project.image)} sizes="216px" width="512" height="342" alt="" loading="lazy" onLoad={() => dispatch({ type: "loaded", slug: project.slug })} onError={() => dispatch({ type: "error", slug: project.slug })} />)}
    </div><p>{shown?.title || requested?.roles.join(" · ") || "수행 이력"}</p></div>
    <Link href="/portfolio" className="mb-index-all" prefetch={false} onClick={onNavigate}>전체 프로젝트<Arrow /></Link>
  </aside>;
}
