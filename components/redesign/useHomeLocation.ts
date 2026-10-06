"use client";

import { useEffect, useState } from "react";
import { homeLocationAt } from "@/lib/home-location";

export function useHomeLocation(enabled = true) {
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const sections = Array.from(document.querySelectorAll<HTMLElement>(
        ".home-film-hero, .production-home-sections > section, .production-home-sections [data-home-location]",
      )).map((section) => {
        const { top, bottom } = section.getBoundingClientRect();
        return { id: section.dataset.homeLocation || section.id || "home", top, bottom };
      });
      const inset = window.matchMedia("(min-width: 1024px)").matches ? 24 : 88;
      setLocation(homeLocationAt(sections.reverse(), inset + Math.min(100, window.innerHeight * .12)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(schedule);
    const home = document.querySelector(".production-home-body");
    if (home) resize.observe(home);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
    };
  }, [enabled]);

  return enabled ? location : null;
}
