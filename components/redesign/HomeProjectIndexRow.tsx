"use client";
/* eslint-disable @next/next/no-img-element -- Reuse the existing responsive review derivatives. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { homeProjectTitle, imageSrcSet, type ProjectLink } from "@/lib/project-presentation";
import { homeProjectThumbnail } from "@/lib/home-project-thumbnail";
import "./home-project-index.css";

export function HomeProjectIndexRow({ project, onNavigate }: { project: ProjectLink; onNavigate?: () => void }) {
  const image = useRef<HTMLImageElement>(null);
  const [failedSource, setFailedSource] = useState<string>();
  const crop = homeProjectThumbnail(project.image);

  useEffect(() => {
    // An image may have failed before React attached its error handler.
    const frame = requestAnimationFrame(() => {
      if (image.current?.complete && !image.current.naturalWidth) setFailedSource(project.image);
    });
    return () => cancelAnimationFrame(frame);
  }, [project.image]);

  return <Link href={`/portfolio/${project.slug}`} className="home-project-row" data-has-image={Boolean(project.image)} onClick={onNavigate}>
    {project.image && <span className="home-project-thumb" aria-hidden="true">
      <span className="home-project-crop" style={{ transform: `scale(${crop.zoom})`, transformOrigin: crop.position }}>
        <img ref={image} src={project.image} srcSet={imageSrcSet(project.image)} sizes="(min-width: 1200px) 64px, 56px" width={48} height={48} alt="" loading="lazy" decoding="async" style={{ objectPosition: crop.position }} data-failed={failedSource === project.image || undefined} onError={() => setFailedSource(project.image)} />
      </span>
    </span>}
    <span className="home-project-copy"><span className="home-project-title">{homeProjectTitle(project)}</span><small className="home-project-year">{project.year}</small></span>
    <span className="home-project-arrow" aria-hidden="true">↗</span>
  </Link>;
}
