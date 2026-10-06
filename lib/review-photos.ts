import catalog from "./review-photo-assets.json";
import projectCatalog from "./project-photo-assets.json";

type ReviewPhoto = { width: number; height: number; widths: number[] };
const photos: Record<string, ReviewPhoto> = { ...catalog, ...projectCatalog };

export function getReviewPhoto(source: string) {
  const match = source.match(/^\/api\/preview-media\/([prw]\d{3,4})-(\d+)\.webp$/);
  if (!match) return undefined;
  const photo = photos[match[1]];
  return photo?.widths.includes(Number(match[2])) ? { ...photo, id: match[1] } : undefined;
}

export function reviewPhotoSrcSet(source: string) {
  const photo = getReviewPhoto(source);
  return photo?.widths.map(width => `/api/preview-media/${photo.id}-${width}.webp ${width}w`).join(", ");
}

export function isReviewPhotoFile(file: string) {
  return Boolean(getReviewPhoto(`/api/preview-media/${file}`));
}
