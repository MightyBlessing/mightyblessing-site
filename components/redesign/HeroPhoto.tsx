"use client";
/* eslint-disable @next/next/no-img-element -- Reuse the project's optimized responsive derivatives. */
import { useState } from "react";
import { imageSrcSet } from "@/lib/project-presentation";

export const heroImageSizes = "(min-width: 1200px) calc(100vw - 320px), (min-width: 1024px) calc(100vw - 272px), (max-width: 767px) 150svh, 100vw";

export function HeroPhoto({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return <img className="brand-type-photo" src={src} srcSet={imageSrcSet(src)}
    sizes={heroImageSizes}
    width="1920" height="1280" alt={alt} loading="eager" fetchPriority="high"
    data-failed={failed || undefined} onError={() => setFailed(true)} />;
}
