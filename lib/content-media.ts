const DEFAULT_CONTENT_MEDIA_BUCKET = "content-media";

export type ContentMediaAsset = {
  type: "image" | "video";
  url: string;
  alt?: string;
  caption?: string;
  poster?: string;
  storageKey?: string;
  posterStorageKey?: string;
  fallbackUrl?: string;
  fallbackPosterUrl?: string;
};

export type ContentMediaAssetInput = Partial<Omit<ContentMediaAsset, "url">> & {
  type?: "image" | "video";
  url?: string;
};

export const HOME_HERO_VIDEO_STORAGE_KEY = "home/hero/video.mp4";
export const HOME_HERO_POSTER_STORAGE_KEY = "home/hero/poster.jpg";
export const DEFAULT_OG_IMAGE_STORAGE_KEY = HOME_HERO_POSTER_STORAGE_KEY;

const homeHeroFallbacks: Record<string, string> = {
  [HOME_HERO_VIDEO_STORAGE_KEY]: "/media/portfolio/home-hero-worship.mp4",
  [HOME_HERO_POSTER_STORAGE_KEY]: "/media/portfolio/home-hero-worship-poster.jpg",
};

function normalizeStorageKey(storageKey: string) {
  return storageKey.replace(/^\/+/, "");
}

export function getContentMediaBucket() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_CONTENT?.trim() ||
    process.env.SUPABASE_STORAGE_BUCKET_CONTENT?.trim() ||
    DEFAULT_CONTENT_MEDIA_BUCKET
  );
}

export function getContentMediaBaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "") || "";
}

export function getContentMediaPublicUrl(storageKey: string) {
  const baseUrl = getContentMediaBaseUrl();
  if (!baseUrl) return "";

  const bucket = getContentMediaBucket();
  const encodedPath = normalizeStorageKey(storageKey)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

export function inferLegacyPublicUrlFromStorageKey(storageKey?: string) {
  if (!storageKey) return "";

  const normalized = normalizeStorageKey(storageKey);
  if (homeHeroFallbacks[normalized]) {
    return homeHeroFallbacks[normalized];
  }

  if (normalized.startsWith("home/instagram/")) {
    return `/media/instagram/${normalized.replace("home/instagram/", "")}`;
  }

  if (normalized.startsWith("portfolio/shared/")) {
    return `/media/portfolio/${normalized.replace("portfolio/shared/", "")}`;
  }

  if (normalized.startsWith("portfolio/")) {
    const [, mediaId, ...rest] = normalized.split("/");
    if (mediaId && rest.length > 0) {
      return `/media/portfolio/${mediaId}/${rest.join("/")}`;
    }
  }

  return "";
}

export function resolveContentMediaUrl({
  storageKey,
  fallbackUrl,
}: {
  storageKey?: string;
  fallbackUrl?: string;
}) {
  if (storageKey) {
    const publicUrl = getContentMediaPublicUrl(storageKey);
    if (publicUrl) {
      return publicUrl;
    }
  }

  return fallbackUrl || inferLegacyPublicUrlFromStorageKey(storageKey) || "";
}

export function resolveContentMediaAsset(asset?: ContentMediaAssetInput | null): ContentMediaAsset | undefined {
  if (!asset) return undefined;

  const type = asset.type || "image";
  const url = asset.url || resolveContentMediaUrl({ storageKey: asset.storageKey, fallbackUrl: asset.fallbackUrl });

  if (!url) {
    return undefined;
  }

  const poster =
    asset.poster ||
    resolveContentMediaUrl({
      storageKey: asset.posterStorageKey,
      fallbackUrl: asset.fallbackPosterUrl,
    }) ||
    undefined;

  return {
    type,
    url,
    alt: asset.alt,
    caption: asset.caption,
    poster,
    storageKey: asset.storageKey,
    posterStorageKey: asset.posterStorageKey,
    fallbackUrl: asset.fallbackUrl,
    fallbackPosterUrl: asset.fallbackPosterUrl,
  };
}
