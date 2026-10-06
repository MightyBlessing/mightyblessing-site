import timeline from "./home-film.json";
import type { SystemProject } from "./design-system";

export const filmFiles = ["desktop.mp4", "mobile.mp4", "poster-desktop.webp", "poster-mobile.webp"] as const;
// A tall desktop review pane also needs the deliberately composed portrait cut.
export const filmMobileQuery = "(max-aspect-ratio: 1/1)";
export type FilmFile = typeof filmFiles[number];
export type FilmProject = Pick<SystemProject, "slug" | "fullTitle" | "roles" | "excludedRoles" | "credits">;
export type FilmCut = typeof timeline.cuts[number] & { project: FilmProject };
export type HomeFilm = { duration: number; desktop: string; mobile: string; posterDesktop: string; posterMobile: string; cuts: FilmCut[] };

/** A baked multi-project film is indivisible: never merely filter its captions. */
export function canReviewFilm(projects: { slug: string }[], environment = process.env.NODE_ENV) {
  const allowed = new Set(projects.map(project => project.slug));
  return environment === "development" && timeline.cuts.every(cut => allowed.has(cut.projectSlug));
}

export function getHomeFilm(projects: SystemProject[], environment = process.env.NODE_ENV): HomeFilm | undefined {
  if (!canReviewFilm(projects, environment)) return;
  const allowed = new Map(projects.map(project => [project.slug, project]));
  const url = (file: FilmFile) => `/api/preview-film/${file}?v=${timeline.revision}`;
  return {
    duration: timeline.duration, desktop: url("desktop.mp4"), mobile: url("mobile.mp4"),
    posterDesktop: url("poster-desktop.webp"), posterMobile: url("poster-mobile.webp"),
    cuts: timeline.cuts.map(cut => {
      const { slug, fullTitle, roles, excludedRoles, credits } = allowed.get(cut.projectSlug)!;
      return { ...cut, project: { slug, fullTitle, roles, excludedRoles, credits } };
    }),
  };
}

/** Decode timestamps, not a second animation clock, determine the current credit. */
export function filmCutAt<T extends { start: number; end: number }>(cuts: T[], time: number, duration = timeline.duration): T | undefined {
  if (!cuts.length) return;
  const current = Number.isFinite(time) && time >= 0 ? time % duration : 0;
  return cuts.find(cut => current >= cut.start && current < cut.end) ?? cuts[0];
}

export function filmFileAllowed(file: string): file is FilmFile { return (filmFiles as readonly string[]).includes(file); }

/** One byte range; false means unsatisfiable/malformed, undefined means full response. */
export function filmByteRange(header: string | null, size: number): { start: number; end: number } | false | undefined {
  if (!header) return;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || size <= 0) return false;
  const first = Number(match[1]), last = Number(match[2]);
  if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last)) return false;
  const start = match[1] ? first : Math.max(0, size - last);
  const end = match[1] && match[2] ? Math.min(last, size - 1) : size - 1;
  return start >= size || start > end ? false : { start, end };
}
