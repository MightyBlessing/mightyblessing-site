"use client";
/* eslint-disable @next/next/no-img-element -- Supplied SVG brand mark. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { type ProjectLink } from "@/lib/project-presentation";
import { ProjectIndex } from "./ProjectIndex";
import { hasPublicSiteFrame, siteNavigation } from "@/lib/site-navigation";
import { useHomeLocation } from "./redesign/useHomeLocation";
import { useHomeReturn } from "./redesign/useHomeReturn";
import "./navigation.css";

export function Header({ projects = [], preview = false }: { projects?: ProjectLink[]; preview?: boolean }) {
  const pathname = usePathname();
  useHomeReturn(pathname, !preview);
  const dialog = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const logo = useRef<HTMLAnchorElement>(null);
  const isHome = pathname === "/" || preview;
  const isSite = hasPublicSiteFrame(pathname) || preview;
  const homeLocation = useHomeLocation(preview);
  const links = siteNavigation(preview);
  useEffect(() => { dialog.current?.close(); menu.current?.close(); }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia(`(min-width: ${isSite ? 1024 : 1280}px)`);
    const tablet = window.matchMedia(`(min-width: ${isSite ? 1024 : 768}px)`);
    const closeOnResize = () => {
      if ((desktop.matches && dialog.current?.open) || (tablet.matches && menu.current?.open)) {
        dialog.current?.close(); menu.current?.close();
        if (isSite && desktop.matches) document.querySelector<HTMLAnchorElement>(".home-rail-brand")?.focus({ preventScroll: true });
        else logo.current?.focus();
      }
    };
    desktop.addEventListener("change", closeOnResize);
    tablet.addEventListener("change", closeOnResize);
    return () => { desktop.removeEventListener("change", closeOnResize); tablet.removeEventListener("change", closeOnResize); };
  }, [isSite]);
  if (pathname === "/design-system" && !preview) return null;
  function closeProjects() { dialog.current?.close(); }
  function closeMenu() { menu.current?.close(); }
  function openDialog(target: HTMLDialogElement | null) {
    if (isSite) document.documentElement.style.setProperty("--home-dialog-scrollbar", `${Math.max(0, window.innerWidth - document.documentElement.clientWidth)}px`);
    target?.showModal();
  }
  return <>
    <Link href={isSite ? "#site-content" : "#main-content"} className="skip-link" onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      requestAnimationFrame(() => document.getElementById(isSite ? "site-content" : "main-content")?.focus({ preventScroll: true }));
    }}>본문으로 건너뛰기</Link>
    <header className={`global-header${isSite ? " global-header--home" : ""}`}>
      <Link ref={logo} href={isHome ? "#home-content" : "/"} className="global-logo" aria-label="마이티블레싱 홈">{isSite ? <span className="home-brand-mark" aria-hidden="true" /> : <img src="/brand/mighty-blessing.svg" alt="Mighty Blessing" width="190" height="58" />}</Link>
      <nav className="global-nav" aria-label="사이트 탐색">{links.map((link) => <Link key={link.href} href={link.href} className={link.href === "/inquiry" ? "global-contact" : undefined} aria-current={pathname === link.href ? "page" : undefined}>{link.label}{(link.href === "/inquiry" || link.external) && <span aria-hidden="true">↗</span>}</Link>)}</nav>
      <div className="global-mobile-actions">
        <Link ref={trigger} href="/portfolio" aria-haspopup="dialog" onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof dialog.current?.showModal !== "function") return;
          event.preventDefault(); openDialog(dialog.current);
        }}>프로젝트 <span aria-hidden="true">+</span></Link>
        <button ref={menuTrigger} type="button" className="global-menu-trigger" aria-haspopup="dialog" onClick={() => openDialog(menu.current)}>메뉴 <span aria-hidden="true">≡</span></button>
      </div>
    </header>
    {isSite && <noscript><style>{`.global-header--home .global-menu-trigger { display: none !important; }`}</style><nav className="home-noscript-nav" aria-label="사이트 메뉴">{links.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav></noscript>}
    <dialog ref={dialog} className={`global-dialog${isSite ? " global-dialog--site-projects" : ""}`} aria-labelledby="global-project-title" onClose={() => trigger.current?.focus({ preventScroll: isSite })} onClick={(event) => { if (event.target === event.currentTarget) closeProjects(); }}>
      <div className="global-dialog-content"><div className="global-dialog-top"><h2 id="global-project-title">프로젝트 <span className="project-index-count">{projects.length}</span></h2><button type="button" onClick={closeProjects} aria-label="프로젝트 목록 닫기" autoFocus>닫기 ×</button></div>
        <nav className="site-project-index" data-project-index="mobile" aria-label="모바일 프로젝트 색인" tabIndex={0}><ProjectIndex projects={projects} activeSlug={pathname.startsWith("/portfolio/") ? pathname.slice("/portfolio/".length) : undefined} onNavigate={closeProjects} headingLevel={3} /></nav>
        <Link className="global-dialog-all" href="/portfolio" onClick={closeProjects}>전체 프로젝트 보기 →</Link>
      </div>
    </dialog>
    <dialog ref={menu} className={`global-dialog${isSite ? " global-dialog--home-menu" : ""}`} aria-labelledby="global-menu-title" onClose={() => menuTrigger.current?.focus({ preventScroll: isSite })} onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="global-dialog-content"><div className="global-dialog-top"><h2 id="global-menu-title">메뉴</h2><button type="button" onClick={closeMenu} aria-label="메뉴 닫기" autoFocus>닫기 ×</button></div><nav aria-label="전체 메뉴">{links.map((link) => {
        return <Link key={link.href} href={link.href} onClick={closeMenu} aria-current={pathname === link.href ? "page" : preview && homeLocation === link.section ? "location" : undefined}>{link.label}<span aria-hidden="true">↗</span></Link>;
      })}</nav><a className="global-dialog-email" href="mailto:contact@mightyblessing.com">contact@mightyblessing.com</a></div>
    </dialog>
  </>;
}
