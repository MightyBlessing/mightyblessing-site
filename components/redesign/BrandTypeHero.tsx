"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { homeHeroCopy as copy } from "@/lib/home-hero-copy";
import type { HeroSlide } from "@/lib/home-hero-slides";
import { imageSrcSet } from "@/lib/project-presentation";
import { createHeroPlayback } from "@/lib/hero-playback";
import { heroTiming, type TypePerformance } from "@/lib/hero-typography-motion";
import { HeroPhoto, heroImageSizes } from "./HeroPhoto";
import { HeroTypography, type HeroTypographyHandle } from "./HeroTypography";

export function BrandTypeHero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const hero = useRef<HTMLElement>(null);
  const typography = useRef<HeroTypographyHandle>(null);
  const playback = useRef<ReturnType<typeof createHeroPlayback> | null>(null);
  const hover = useRef<TypePerformance | null>(null);
  const slide = slides[index] ?? slides[0];
  const project = slide?.project;

  useEffect(() => {
    let disposed = false;
    let fontReady = false;
    let interrupted = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const requests = new Map<number, Promise<boolean>>();
    const pending = new Set<() => void>();
    const load = (next: number): Promise<boolean> => {
      if (requests.has(next)) return requests.get(next)!;
      const photo = slides[next];
      if (!photo) return Promise.resolve(false);
      const task = new Promise<boolean>((resolve) => {
        const image = new Image();
        let settled = false;
        const done = (success: boolean) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          pending.delete(cancel);
          image.onload = null; image.onerror = null;
          if (!success) requests.delete(next);
          resolve(success);
        };
        const cancel = () => done(false);
        const timeout = setTimeout(cancel, heroTiming.decodeTimeout);
        pending.add(cancel);
        image.onload = () => { image.decode().then(() => done(image.naturalWidth > 0)).catch(cancel); };
        image.onerror = cancel;
        image.sizes = heroImageSizes;
        image.srcset = imageSrcSet(photo.image) ?? "";
        image.src = photo.image;
      });
      requests.set(next, task);
      // Keep only a few decode promises; never eagerly fetch all 30 originals.
      if (requests.size > 3) requests.delete(requests.keys().next().value!);
      return task;
    };
    const controller = createHeroPlayback({
      count: slides.length, load,
      show: (next) => { if (!disposed) setIndex(next); },
      onPlaying: (value) => { if (!disposed) setPlaying(value); },
      type: {
        pause: () => typography.current?.pause(), resume: () => typography.current?.resume(), finish: () => typography.current?.finish(),
        transition: (next, cue) => {
          if (!fontReady || reduce.matches) return false;
          const words: TypePerformance[] = ["live", "production", "event"];
          return typography.current?.play(words[next % words.length], cue) ?? false;
        },
        accent: () => {
          if (!fontReady || reduce.matches) return;
          const word = hover.current;
          hover.current = null;
          if (word) typography.current?.play(word);
        },
      },
    });
    playback.current = controller;
    const interrupt = () => { interrupted = true; controller.pause(); };
    const onVisibility = () => { if (document.hidden) interrupt(); };
    const onReduce = () => { setReduced(reduce.matches); if (reduce.matches) { interrupted = true; controller.stop(); } };
    const onResize = () => { interrupted = true; controller.stop(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) interrupt(); }, { threshold: 0 });
    if (hero.current) observer.observe(hero.current);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    reduce.addEventListener("change", onReduce);
    const initialize = async () => {
      // Font timeout affects only the type intro; photos and all links stay available.
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        fontReady = await Promise.race([
          document.fonts.load('400 100px "Mighty Blessing Title"', copy.headline.join(" ")).then((faces) => faces.length > 0),
          new Promise<boolean>((resolve) => { timeout = setTimeout(() => resolve(false), heroTiming.ready); }),
        ]);
      } catch { fontReady = false; }
      clearTimeout(timeout);
      if (disposed) return;
      if (hero.current) hero.current.dataset.font = fontReady ? "loaded" : "unavailable";
      setReady(true);
      setReduced(reduce.matches);
      const bounds = hero.current?.getBoundingClientRect();
      if (reduce.matches || interrupted || document.hidden || !bounds || bounds.bottom <= 0 || bounds.top >= innerHeight) return;
      controller.resume();
      if (fontReady) typography.current?.play("intro");
    };
    void initialize();
    return () => {
      disposed = true;
      controller.dispose(); playback.current = null;
      pending.forEach((cancel) => cancel());
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      reduce.removeEventListener("change", onReduce);
    };
  }, [slides]);

  const style = {
    "--hero-focal": slide?.desktopFocal ?? "50% 50%", "--hero-focal-mobile": slide?.mobileFocal ?? "50% 50%",
    "--hero-shade-left": slide?.leftShade ?? .36, "--hero-shade-bottom": .9,
    "--hero-shade-left-mobile": slide?.mobileLeftShade ?? .18, "--hero-shade-bottom-mobile": .94,
    "--hero-shade-center": slide?.centerShade ?? .1,
  } as CSSProperties;
  return <section ref={hero} className="brand-type-hero" aria-labelledby="home-title" style={style} data-photo={slide?.id} data-playing={playing}>
    {slide && <HeroPhoto key={slide.image} src={slide.image} alt={slide.alt} />}
    <div className="brand-type-shade" aria-hidden="true" />
    <div className="brand-type-layout">
      <HeroTypography ref={typography} lines={copy.headline} onWordHover={(word) => { hover.current = word; playback.current?.accent(); hover.current = null; }} />
      <div className="brand-type-bottom">
        <div className="brand-type-copy">
          <p className="brand-type-promise">{copy.promise}</p>
          <p className="brand-type-description">{copy.description.join(" ")}</p>
        </div>
        <div className="brand-type-current">
          {project && <div className="brand-type-project" aria-live={playing ? "off" : "polite"} aria-atomic="true">
            <Link href={`/portfolio/${project.slug}`} onFocus={() => playback.current?.pause()}>{project.fullTitle}<span aria-hidden="true">↗</span></Link>
            <p>{project.roles.slice(0, 3).join(" · ")}</p>
            {project.excludedRoles.length > 0 && <p className="brand-type-exclusions">{project.excludedRoles.map((role) => `${role} 제외`).join(" · ")}</p>}
          </div>}
          {slides.length > 0 && <div className="hero-playback" role="group" aria-label="히어로 사진과 타이포 재생">
            <span className="hero-photo-count" aria-label={`사진 ${index + 1} / ${slides.length}`}>{String(index + 1).padStart(2, "0")}<span aria-hidden="true"> / </span>{String(slides.length).padStart(2, "0")}</span>
            <button type="button" aria-label="이전 사진" disabled={!ready || slides.length < 2} onClick={() => void playback.current?.step(-1)}>←</button>
            <button type="button" className="hero-play-toggle" aria-label={playing ? "사진과 타이포 일시정지" : "사진과 타이포 재생"} disabled={!ready || reduced} onClick={() => playing ? playback.current?.pause() : playback.current?.resume()}>
              {playing ? <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path d="M3 2v10M9 2v10" stroke="currentColor" strokeWidth="2" /></svg> : <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path d="m2 1 9 6-9 6z" fill="currentColor" /></svg>}
            </button>
            <button type="button" aria-label="다음 사진" disabled={!ready || slides.length < 2} onClick={() => void playback.current?.step(1)}>→</button>
            {reduced && <span className="hero-reduced-label">모션 줄임</span>}
          </div>}
        </div>
      </div>
    </div>
  </section>;
}
