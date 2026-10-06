import photos from "./home-hero-photos.json";
import type { SystemProject } from "./design-system";
import { homeHeroCopy } from "./home-hero-copy";

export type HeroSlide = {
  id: string; image: string; alt: string; desktopFocal: string; mobileFocal: string; centerShade: number; leftShade: number; mobileLeftShade: number;
  project: Pick<SystemProject, "slug" | "fullTitle" | "roles" | "excludedRoles" | "credits">;
};

/** Caller supplies only records permitted by getAllPortfolios. Local curation never changes publication. */
export function getHomeHeroSlides(projects: SystemProject[], fallback?: SystemProject, review = process.env.NODE_ENV === "development"): HeroSlide[] {
  const allowed = new Map(projects.map((project) => [project.slug, project]));
  const present = ({ slug, fullTitle, roles, excludedRoles, credits }: SystemProject) => ({ slug, fullTitle, roles, excludedRoles, credits });
  if (review) {
    const slides = photos.flatMap((photo) => {
      const project = allowed.get(photo.projectSlug);
      return project ? [{ id: photo.id, image: `/api/preview-media/${photo.id.toLowerCase()}-1920.webp`, alt: `${project.fullTitle} · ${photo.alt}`, desktopFocal: photo.desktopFocal, mobileFocal: photo.mobileFocal, centerShade: photo.centerShade, leftShade: photo.leftShade, mobileLeftShade: photo.mobileLeftShade, project: present(project) }] : [];
    });
    if (slides.length) return slides;
  }
  // Never expose development derivatives in a production build.
  if (!fallback?.image || !allowed.has(fallback.slug) || (!review && fallback.image.startsWith("/api/preview-media/"))) return [];
  const selected = fallback.slug === homeHeroCopy.photo.projectSlug;
  return [{ id: fallback.slug, image: fallback.image, alt: fallback.alt, desktopFocal: selected ? homeHeroCopy.photo.focalPoint : "50% 50%", mobileFocal: selected ? homeHeroCopy.photo.mobileFocalPoint : "50% 50%", centerShade: .1, leftShade: .36, mobileLeftShade: .18, project: present(fallback) }];
}
