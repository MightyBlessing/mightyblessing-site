"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { type ProjectLink } from "@/lib/project-presentation";
import { hasPublicSiteFrame, siteNavigation } from "@/lib/site-navigation";
import { ProjectIndex } from "../ProjectIndex";
import { useHomeLocation } from "./useHomeLocation";
import "./home-project-index.css"; // Shared brand, company links and rail actions.
import "./site-frame.css";

export function SiteFrame({ children, projects, preview = false }: {
  children: ReactNode; projects: ProjectLink[]; preview?: boolean;
}) {
  const pathname = usePathname();
  if (!preview && !hasPublicSiteFrame(pathname)) return children;
  return <div className={`site-layout${pathname === "/" || preview ? " site-layout--home" : ""}`}>
    <SiteRail projects={projects} preview={preview} />
    <div className="site-content" id="site-content" tabIndex={-1}>{children}</div>
  </div>;
}

function SiteRail({ projects, preview }: Omit<Parameters<typeof SiteFrame>[0], "children">) {
  const pathname = usePathname();
  const home = pathname === "/" || preview;
  const section = useHomeLocation(Boolean(preview));
  const links = siteNavigation(preview);
  const list = useRef<HTMLElement>(null);
  const positions = useRef(0);
  const activeSlug = pathname.startsWith("/portfolio/") ? pathname.slice("/portfolio/".length) : undefined;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const element = list.current;
      if (!element) return;
      element.scrollTop = positions.current;
      const active = element.querySelector<HTMLElement>('[aria-current="page"]');
      if (active) {
        const bounds = element.getBoundingClientRect();
        const row = active.getBoundingClientRect();
        if (row.top < bounds.top || row.bottom > bounds.bottom) element.scrollTop += row.top - bounds.top - 16;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [home, activeSlug]);

  return <aside className="site-rail selected-rail" aria-label="사이트와 프로젝트 탐색">
    <Link href={home ? "#home-content" : "/"} className="home-rail-brand" aria-label="마이티블레싱 홈" aria-current={home && (!preview || section === "home") ? "page" : undefined}><span className="home-brand-mark" aria-hidden="true" /></Link>
    <nav className="home-company-nav" aria-label="회사 탐색">{links.filter(link => link.section || link.external).map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : preview && section === link.section ? "location" : undefined}>{link.label}{link.external && <span aria-hidden="true"> ↗</span>}</Link>)}</nav>
    <div className="site-rail-label"><span>PROJECT INDEX</span><span>{projects.length}</span></div>
    <nav ref={list} className="site-project-index" data-project-index="desktop" aria-label="전체 프로젝트" tabIndex={0} onScroll={event => { positions.current = event.currentTarget.scrollTop; }}>
      <ProjectIndex projects={projects} activeSlug={activeSlug} />
    </nav>
    <nav className="home-rail-actions" aria-label="프로젝트 탐색과 문의"><Link className="rail-all" href="/portfolio" aria-current={pathname === "/portfolio" ? "page" : undefined}>전체 프로젝트 보기 <span aria-hidden="true">→</span></Link><Link className="home-rail-contact" href="/inquiry" aria-current={pathname === "/inquiry" ? "page" : undefined}>프로젝트 문의 <span aria-hidden="true">↗</span></Link></nav>
  </aside>;
}
