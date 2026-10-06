"use client";
/* eslint-disable @next/next/no-img-element -- Art-directed responsive image, stable layout before hydration. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { imageSrcSet, type ProjectLink } from "@/lib/project-presentation";
import { createHeroMotion, type HeroMode, type PhotoState } from "@/lib/hero-motion";
import { motion } from "@/lib/motion";

type Connection = EventTarget & { saveData?: boolean };

export function HomeHero({ project }: { project?: ProjectLink & { role: string } }) {
  const stage = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const controller = useRef<ReturnType<typeof createHeroMotion> | null>(null);
  const [mode, setMode] = useState<HeroMode>("still");
  const [photoState, setPhotoState] = useState<PhotoState>("loading");
  const [canAnimate, setCanAnimate] = useState(false);

  function updatePhoto(next: PhotoState) {
    setPhotoState(next);
    controller.current?.setPhoto(next);
  }

  useEffect(() => {
    const canvas = stage.current;
    const type = overlay.current;
    if (!canvas || !type) return;
    const words = Array.from(type.querySelectorAll("img"));
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const supported = typeof type.animate === "function";
    const player = createHeroMotion(type, words, (next) => {
      canvas.dataset.motion = next;
      setMode(next);
    });
    controller.current = player;
    let disposed = false;
    let typeReady = false;
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height"));
    let inView = canvas.getBoundingClientRect().bottom > headerHeight && canvas.getBoundingClientRect().top < window.innerHeight;
    const allowed = () => supported && Boolean(project?.image) && typeReady && !preference.matches && !connection?.saveData;
    const syncPreference = () => { player.setAllowed(allowed()); setCanAnimate(allowed()); };
    const syncVisibility = () => player.setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncVisibility();
    }, { rootMargin: `-${headerHeight}px 0px 0px 0px` });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", syncVisibility);
    preference.addEventListener("change", syncPreference);
    connection?.addEventListener?.("change", syncPreference);

    const frame = requestAnimationFrame(async () => {
      const initial = document.documentElement.dataset.mbIntro === "yes";
      const started = Number(document.documentElement.dataset.mbIntroStart || 0);
      const loadedPhoto: PhotoState = photo.current?.complete ? (photo.current.naturalWidth ? "ready" : "error") : "loading";
      setPhotoState(loadedPhoto);
      player.setPhoto(loadedPhoto);
      try { await Promise.all(words.map((word) => word.decode())); typeReady = true; }
      catch { /* Keep the photograph usable if brand art fails. */ }
      if (disposed) return;
      syncPreference();
      syncVisibility();
      // Never resurrect an intro after its initial-paint fail-safe has elapsed.
      if (initial && allowed() && performance.now() - started < motion.failsafe) player.play();
      document.documentElement.removeAttribute("data-mb-intro");
      document.documentElement.removeAttribute("data-mb-intro-start");
      try { sessionStorage.setItem("mb-home-seen", "1"); } catch { /* No storage means no automatic intro. */ }
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      player.dispose();
      controller.current = null;
      document.removeEventListener("visibilitychange", syncVisibility);
      preference.removeEventListener("change", syncPreference);
      connection?.removeEventListener?.("change", syncPreference);
    };
  }, [project?.image]);

  function toggle() {
    if (mode === "still") controller.current?.play();
    else if (mode === "paused") controller.current?.resume();
    else controller.current?.pause();
  }

  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div ref={stage} className="hero-stage" data-motion={mode} data-photo={project?.image ? photoState : "none"}>
        {project?.image && <img ref={photo} className="hero-photo" src={project.image} srcSet={imageSrcSet(project.image)} sizes="(min-width: 1280px) min(1280px, calc(100vw - 288px)), 100vw" alt={project.alt} width={1920} height={1280} fetchPriority="high" onLoad={() => updatePhoto("ready")} onError={() => updatePhoto("error")} />}
        <div ref={overlay} className="hero-type" aria-hidden="true">
          <div className="hero-type-words"><img src="/brand/live.svg" alt="" width={183.5} height={97} /><img src="/brand/event.svg" alt="" width={301.3} height={97} /><img src="/brand/production.svg" alt="" width={607} height={97} /></div>
          <span className="hero-type-note">MIGHTY BLESSING — LIVE EVENT PRODUCTION</span>
        </div>
        {project?.image && photoState === "error" && <p className="hero-media-message" role="status">사진을 불러오지 못했습니다. 아래 프로젝트에서 내용을 확인해 주세요.</p>}
        {canAnimate && photoState !== "error" && <button type="button" className="hero-play" onClick={toggle} aria-label={mode === "still" ? "타이포 인트로 다시 재생" : mode === "paused" ? "타이포 인트로 계속 재생" : "타이포 인트로 일시정지"}>
          <span aria-hidden="true">{mode === "playing" || mode === "waiting" ? "Ⅱ" : "↻"}</span><span>{mode === "still" ? "INTRO" : mode === "paused" ? "RESUME" : "PAUSE"}</span>
        </button>}
      </div>
      <div className="hero-caption">
        <div><h1 id="home-title">Live Event Production</h1><p>공연·행사 기획과 현장 운영</p></div>
        {project && <Link href={`/portfolio/${project.slug}`} className="hero-credit"><span>{project.title} <span className="hero-year">/ {project.year}</span> <span aria-hidden="true">↗</span></span><small>{project.role}</small></Link>}
      </div>
    </section>
  );
}
