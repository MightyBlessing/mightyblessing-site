"use client";

import { useEffect, useRef } from "react";

type HomePosition = { y: number; rail: number };

/** Keep the two home scroll areas when returning from an existing detail route. */
export function useHomeReturn(pathname: string, enabled: boolean) {
  const positions = useRef(new Map<string, HomePosition>());
  const pending = useRef<HomePosition | null>(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (!enabled) return;
    const remember = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || !document.querySelector(".production-home")) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      positions.current.set(window.location.href, {
        y: window.scrollY,
        rail: document.querySelector<HTMLElement>('[data-project-index="desktop"]')?.scrollTop ?? 0,
      });
      if (positions.current.size > 10) positions.current.delete(positions.current.keys().next().value!);
    };
    const returning = () => {
      // Anchor history within home retains the browser's normal behavior.
      pending.current = previousPath.current !== window.location.pathname
        ? positions.current.get(window.location.href) ?? null : null;
    };
    document.addEventListener("click", remember, true);
    window.addEventListener("popstate", returning);
    return () => {
      document.removeEventListener("click", remember, true);
      window.removeEventListener("popstate", returning);
    };
  }, [enabled]);

  useEffect(() => {
    previousPath.current = pathname;
    if (!enabled || !pending.current) return;
    const position = pending.current;
    pending.current = null;
    let frame = requestAnimationFrame(() => {
      // Apply after the router's own focus/scroll commit, without taking over scrolling.
      frame = requestAnimationFrame(() => {
        if (!document.querySelector(".production-home")) return;
        const rail = document.querySelector<HTMLElement>('[data-project-index="desktop"]');
        if (rail) rail.scrollTop = position.rail;
        window.scrollTo({ top: position.y, behavior: "instant" });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, enabled]);
}
