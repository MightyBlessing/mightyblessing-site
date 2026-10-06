"use client";
/* eslint-disable @next/next/no-img-element -- Responsive local review derivatives. */
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { homeHeroCopy } from "@/lib/home-hero-copy";
import type { HeroSlide } from "@/lib/home-hero-slides";
import { imageSrcSet } from "@/lib/project-presentation";
import { filmCutAt, filmMobileQuery, type HomeFilm } from "@/lib/home-film";
import { heroTiming } from "@/lib/hero-typography-motion";
import { FilmTypography } from "./FilmTypography";
import { createFilmPlayback } from "@/lib/film-playback";
import { createFilmTypePlayer } from "@/lib/film-typography";

export function HomeFilmHero({ poster, film }: { poster?: HeroSlide; film?: HomeFilm }) {
  const hero = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef({ pause: () => {}, toggle: () => {} });
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [visibleVideo, setVisibleVideo] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const cut = film?.cuts[index];
  const project = failed ? poster?.project : cut?.project ?? poster?.project;

  useEffect(() => {
    const media = video.current;
    const element = hero.current;
    if (!element) return;
    let disposed = false;
    let inView = true;
    let currentIndex = 0;
    let frame = 0;
    let useVideoFrames = false;
    let typeReady = false;
    let typeVisible = false;
    const typePlayer = createFilmTypePlayer(element);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia(filmMobileQuery);
    const sync = (time: number) => {
      if (!film || disposed) return;
      if (typeReady && typeVisible && !reduce.matches && media && media.readyState >= 2) typePlayer.sync(time);
      const next = filmCutAt(film.cuts, time, film.duration);
      const nextIndex = next ? film.cuts.indexOf(next) : 0;
      if (nextIndex !== currentIndex) { currentIndex = nextIndex; setIndex(nextIndex); }
    };
    const playback = media && film ? createFilmPlayback(media, {
      source: () => mobile.matches ? film.mobile : film.desktop,
      duration: film.duration,
      reset: () => { typeVisible = false; setVisibleVideo(false); typePlayer.reset(); currentIndex = 0; setIndex(0); },
    }) : undefined;
    const pause = () => playback?.pause();
    controls.current = { pause, toggle: () => playback?.toggle() };
    const onPlaying = () => {
      if (disposed) return;
      if (!playback?.shouldPlay()) { media?.pause(); return; }
      typeVisible = true; setPlaying(true); setVisibleVideo(true);
      if (media) sync(media.currentTime);
    };
    const onPause = () => { if (!disposed) { setPlaying(false); if (media) sync(media.currentTime); } };
    const onError = () => { typeVisible = false; pause(); setFailed(true); setVisibleVideo(false); sync(0); typePlayer.reset(); };
    const onTime = () => { if (media) sync(media.currentTime); };
    const onVisibility = () => playback?.setVisible(!document.hidden && inView);
    const onResize = () => playback?.resize();
    const onReduce = () => {
      if (reduce.matches) { typeVisible = false; pause(); typePlayer.reset(); setVisibleVideo(false); if (media?.readyState) media.currentTime = 0; sync(0); }
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; onVisibility(); }, { threshold: 0 });
    observer.observe(element);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    reduce.addEventListener("change", onReduce);
    media?.addEventListener("playing", onPlaying);
    media?.addEventListener("pause", onPause);
    media?.addEventListener("error", onError);
    media?.addEventListener("seeked", onTime);
    if (media && typeof media.requestVideoFrameCallback === "function") {
      useVideoFrames = true;
      const tick: VideoFrameRequestCallback = (_now, metadata) => {
        if (disposed) return;
        sync(metadata.mediaTime); frame = media.requestVideoFrameCallback(tick);
      };
      frame = media.requestVideoFrameCallback(tick);
    } else {
      const tick = () => { if (disposed) return; if (media && !media.paused) sync(media.currentTime); frame = requestAnimationFrame(tick); };
      frame = requestAnimationFrame(tick);
    }
    const initialize = async () => {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      let fontReady = false;
      try {
        fontReady = await Promise.race([
          document.fonts.load('400 100px "Mighty Blessing Title"', "live event production").then(faces => faces.length > 0),
          new Promise<boolean>(resolve => { timeout = setTimeout(() => resolve(false), heroTiming.ready); }),
        ]);
      } catch { /* The final text remains readable if the font or motion fails. */ }
      clearTimeout(timeout);
      if (disposed) return;
      element.dataset.font = fontReady ? "loaded" : "unavailable";
      typeReady = fontReady;
      setReady(true);
      const bounds = element.getBoundingClientRect();
      inView = bounds.bottom > 0 && bounds.top < innerHeight;
      onVisibility();
      playback?.start(!reduce.matches);
    };
    void initialize();
    return () => {
      disposed = true; playback?.dispose();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      reduce.removeEventListener("change", onReduce);
      media?.removeEventListener("playing", onPlaying);
      media?.removeEventListener("pause", onPause);
      media?.removeEventListener("error", onError);
      media?.removeEventListener("seeked", onTime);
      if (useVideoFrames) media?.cancelVideoFrameCallback(frame); else cancelAnimationFrame(frame);
      media?.pause(); typePlayer.reset();
      controls.current = { pause: () => {}, toggle: () => {} };
    };
  }, [film]);

  const filmPoster = film && !posterFailed;
  return <section ref={hero} className="home-film-hero" aria-labelledby="home-title" data-cut={failed ? "poster" : cut?.id} data-playing={playing} style={{ "--film-focal": cut ? `${cut.desktopFocal[0]}% ${cut.desktopFocal[1]}%` : poster?.desktopFocal, "--film-focal-mobile": poster?.mobileFocal, "--film-shade": cut?.shade ?? .25 } as CSSProperties}>
    {filmPoster ? <picture><source media={filmMobileQuery} srcSet={film.posterMobile} /><img className="home-film-poster home-film-encoded-poster" src={film.posterDesktop} alt="" fetchPriority="high" loading="eager" onError={() => setPosterFailed(true)} /></picture> : poster && <img className="home-film-poster" src={poster.image} srcSet={imageSrcSet(poster.image)} sizes="(min-width: 1200px) calc(100vw - 356px), (min-width: 1024px) calc(100vw - 308px), calc(100vw - 16px)" alt="" fetchPriority="high" loading="eager" onError={event => { event.currentTarget.style.visibility = "hidden"; }} />}
    {film && <video ref={video} className="home-film-video" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} style={{ visibility: visibleVideo && !failed ? "visible" : "hidden" }} />}
    <div className="home-film-shade" />
    <div className="film-story-label" data-film-label aria-hidden="true">MIGHTY BLESSING</div>
    {project && <div className="home-film-project" aria-live="off"><Link href={`/portfolio/${project.slug}`}>{project.fullTitle}<span aria-hidden="true">↗</span></Link><p>{project.roles.slice(0, 3).join(" · ")}</p></div>}
    {film && !failed && <button type="button" className="home-film-control" disabled={!ready} onClick={() => controls.current.toggle()} aria-label={playing ? "영상 일시정지" : "영상 재생"}>{playing ? <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path fill="currentColor" d="M1 0h3v14H1zM8 0h3v14H8z" /></svg> : <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path fill="currentColor" d="M1 0l11 7L1 14z" /></svg>}</button>}
    <div className="home-film-message"><FilmTypography /><p className="home-film-definition">{homeHeroCopy.definition.map((line) => <span key={line}>{line}</span>)}</p></div>
    <Link href="#work" className="home-film-discover">프로젝트 살펴보기 <span aria-hidden="true">↓</span></Link>
  </section>;
}
