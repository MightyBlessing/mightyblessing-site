import { randomUUID } from "crypto";
import matter from "gray-matter";
import { resolveContentMediaUrl } from "@/lib/content-media";
import type { PortfolioMediaAsset } from "@/lib/portfolio-media";
import {
  type PortfolioEntry,
  type PortfolioFrontmatter,
  type PortfolioStatus,
  normalizePortfolioFrontmatter,
} from "@/lib/content";
import { base64ToString, stringToBase64 } from "./base64";
import { getAdminRepository } from "./repository";
import {
  copyContentMediaFile,
  deleteContentMediaFiles,
  isContentMediaStorageConfigured,
  uploadContentMediaFile,
} from "./content-media-storage";

export type AdminPortfolioDocument = {
  slug: string;
  frontmatter: PortfolioFrontmatter;
  content: string;
};

export type AdminPortfolioSummary = PortfolioEntry & {
  status: PortfolioStatus;
};

export type PortfolioEditorGalleryItem = {
  id: string;
  type: "image" | "video";
  alt: string;
  caption?: string;
  existingUrl?: string;
  existingPoster?: string;
  existingStorageKey?: string;
  existingPosterStorageKey?: string;
};

export type PortfolioEditorPayload = {
  previousSlug?: string;
  title: string;
  slug: string;
  date: string;
  summary: string;
  location?: string;
  partner?: string;
  featured: boolean;
  featured_order?: number;
  status: PortfolioStatus;
  roles: string[];
  categories: string[];
  search_terms: string[];
  goals?: string;
  our_role?: string;
  process?: string;
  metrics: { label: string; value: string }[];
  related_cases: string[];
  content: string;
  heroMedia: {
    type: "image" | "video";
    alt: string;
    existingUrl?: string;
    existingPoster?: string;
    existingStorageKey?: string;
    existingPosterStorageKey?: string;
  };
  gallery: PortfolioEditorGalleryItem[];
};

export type UploadedBinaryFile = {
  name: string;
  contentBase64: string;
};

export type PortfolioEditorUploads = {
  heroFile?: UploadedBinaryFile;
  heroPosterFile?: UploadedBinaryFile;
  galleryFiles: Record<string, UploadedBinaryFile>;
  galleryPosterFiles: Record<string, UploadedBinaryFile>;
};

export function portfolioDocumentToPayload(document: AdminPortfolioDocument): PortfolioEditorPayload {
  return {
    previousSlug: document.slug,
    title: document.frontmatter.title,
    slug: document.slug,
    date: document.frontmatter.date,
    summary: document.frontmatter.summary,
    location: document.frontmatter.location || "",
    partner: document.frontmatter.partner || "",
    featured: Boolean(document.frontmatter.featured),
    featured_order: document.frontmatter.featured_order,
    status: ensureStatus(document.frontmatter.status),
    roles: document.frontmatter.roles || [],
    categories: document.frontmatter.categories || [],
    search_terms: document.frontmatter.search_terms || [],
    goals: document.frontmatter.goals || "",
    our_role: document.frontmatter.our_role || document.frontmatter.scope || "",
    process: document.frontmatter.process || "",
    metrics: (document.frontmatter.metrics || []).map((item) => ({
      label: item.label,
      value: item.value,
    })),
    related_cases: document.frontmatter.related_cases || [],
    content: document.content,
    heroMedia: {
      type: document.frontmatter.heroMedia?.type || "image",
      alt: document.frontmatter.heroMedia?.alt || "",
      existingUrl: document.frontmatter.heroMedia?.url,
      existingPoster: document.frontmatter.heroMedia?.poster,
      existingStorageKey: document.frontmatter.heroMedia?.storageKey,
      existingPosterStorageKey: document.frontmatter.heroMedia?.posterStorageKey,
    },
    gallery: (document.frontmatter.gallery || []).map((item, index) => ({
      id: `gallery-${index + 1}`,
      type: item.type,
      alt: item.alt || "",
      caption: item.caption || "",
      existingUrl: item.url,
      existingPoster: item.poster,
      existingStorageKey: item.storageKey,
      existingPosterStorageKey: item.posterStorageKey,
    })),
  };
}

function sortByDateDesc(items: AdminPortfolioDocument[]) {
  return [...items].sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

function portfolioContentPath(slug: string) {
  return `content/portfolio/${slug}.md`;
}

function fileExtension(fileName: string) {
  const matched = fileName.toLowerCase().match(/\.(jpg|jpeg|png|webp|mp4)$/);
  return matched?.[0] || "";
}

function ensureStatus(status?: string): PortfolioStatus {
  if (status === "draft" || status === "archived") {
    return status;
  }
  return "published";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueSlug(baseSlug: string, usedSlugs: Set<string>) {
  let nextSlug = baseSlug;
  let index = 2;

  while (usedSlugs.has(nextSlug)) {
    nextSlug = `${baseSlug}-${index}`;
    index += 1;
  }

  return nextSlug;
}

function createPortfolioMediaId(seed?: string) {
  const normalized = slugify(seed || "");
  return normalized || `portfolio-${randomUUID().slice(0, 8)}`;
}

function buildPortfolioStorageKey(mediaId: string, fileName: string) {
  return `portfolio/${mediaId}/${fileName}`;
}

function resolveManagedMediaAsset({
  type,
  storageKey,
  legacyUrl,
  posterStorageKey,
  legacyPosterUrl,
  alt,
  caption,
}: {
  type: "image" | "video";
  storageKey?: string;
  legacyUrl?: string;
  posterStorageKey?: string;
  legacyPosterUrl?: string;
  alt?: string;
  caption?: string;
}) {
  const url = storageKey
    ? resolveContentMediaUrl({ storageKey, fallbackUrl: legacyUrl })
    : legacyUrl || "";

  if (!url) {
    return undefined;
  }

  return {
    type,
    url,
    storageKey,
    alt,
    caption,
    poster: posterStorageKey
      ? resolveContentMediaUrl({ storageKey: posterStorageKey, fallbackUrl: legacyPosterUrl }) || undefined
      : legacyPosterUrl || undefined,
    posterStorageKey: posterStorageKey || undefined,
  } satisfies PortfolioMediaAsset;
}

function collectManagedStorageKeys(frontmatter: PortfolioFrontmatter) {
  const keys = new Set<string>();
  const add = (storageKey?: string) => {
    if (storageKey) keys.add(storageKey);
  };

  add(frontmatter.heroMedia?.storageKey);
  add(frontmatter.heroMedia?.posterStorageKey);

  for (const media of frontmatter.gallery || []) {
    add(media.storageKey);
    add(media.posterStorageKey);
  }

  return [...keys];
}

function toStoredMediaAsset(asset?: PortfolioMediaAsset) {
  if (!asset) return undefined;

  const storedAsset: Record<string, unknown> = {
    type: asset.type,
  };

  if (asset.storageKey) {
    storedAsset.storageKey = asset.storageKey;
  } else if (asset.url) {
    storedAsset.url = asset.url;
  }

  if (asset.posterStorageKey) {
    storedAsset.posterStorageKey = asset.posterStorageKey;
  } else if (asset.poster) {
    storedAsset.poster = asset.poster;
  }

  if (asset.alt) {
    storedAsset.alt = asset.alt;
  }

  if (asset.caption) {
    storedAsset.caption = asset.caption;
  }

  return storedAsset;
}

function cleanFrontmatter(frontmatter: PortfolioFrontmatter): PortfolioFrontmatter {
  return normalizePortfolioFrontmatter({
    ...frontmatter,
    thumbnail: undefined,
    featured_order: frontmatter.featured ? frontmatter.featured_order : undefined,
    metrics: (frontmatter.metrics || []).filter((item) => item.label.trim() && item.value.trim()),
    related_cases: (frontmatter.related_cases || []).filter(Boolean),
    search_terms: (frontmatter.search_terms || []).filter(Boolean),
    roles: (frontmatter.roles || []).filter(Boolean),
    categories: (frontmatter.categories || []).filter(Boolean),
    gallery: (frontmatter.gallery || []).filter((item) => item.url || item.storageKey),
  });
}

function serializePortfolioFile(frontmatter: PortfolioFrontmatter, content: string) {
  const cleaned = cleanFrontmatter(frontmatter);

  const data = Object.fromEntries(
    Object.entries({
      ...cleaned,
      thumbnail: undefined,
      heroMedia: toStoredMediaAsset(cleaned.heroMedia),
      gallery: cleaned.gallery?.map((item) => toStoredMediaAsset(item)).filter(Boolean),
    }).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }),
  );

  return matter.stringify(content.trim(), data).trimEnd() + "\n";
}

async function readPortfolioFile(slug: string) {
  const repository = getAdminRepository();
  const contentBase64 = await repository.readFile(portfolioContentPath(slug));
  if (!contentBase64) return null;

  const raw = base64ToString(contentBase64);
  const parsed = matter(raw);
  const frontmatter = normalizePortfolioFrontmatter(parsed.data as Partial<PortfolioFrontmatter>);

  return {
    slug,
    frontmatter,
    content: parsed.content.trim(),
  } satisfies AdminPortfolioDocument;
}

function commitMessage(action: "create" | "update" | "publish" | "archive" | "duplicate", slug: string) {
  return `admin: ${action} portfolio ${slug}`;
}

async function buildHeroMedia(
  mediaId: string,
  payload: PortfolioEditorPayload,
  uploads: PortfolioEditorUploads,
  createdStorageKeys: Set<string>,
) {
  const heroUpload = uploads.heroFile;
  const posterUpload = uploads.heroPosterFile;
  const existing = payload.heroMedia;

  let heroStorageKey = existing.existingStorageKey || "";
  let heroLegacyUrl = existing.existingUrl || "";
  let posterStorageKey = existing.existingPosterStorageKey || "";
  let posterLegacyUrl = existing.existingPoster || "";

  if (heroUpload) {
    const ext = fileExtension(heroUpload.name) || (payload.heroMedia.type === "video" ? ".mp4" : ".jpg");
    heroStorageKey = buildPortfolioStorageKey(mediaId, `hero${ext}`);
    await uploadContentMediaFile(heroStorageKey, heroUpload);
    createdStorageKeys.add(heroStorageKey);
    heroLegacyUrl = "";
  }

  if (payload.heroMedia.type === "video") {
    if (posterUpload) {
      const ext = fileExtension(posterUpload.name) || ".jpg";
      posterStorageKey = buildPortfolioStorageKey(mediaId, `poster${ext}`);
      await uploadContentMediaFile(posterStorageKey, posterUpload);
      createdStorageKeys.add(posterStorageKey);
      posterLegacyUrl = "";
    }
  } else {
    posterStorageKey = "";
    posterLegacyUrl = "";
  }

  return resolveManagedMediaAsset({
    type: payload.heroMedia.type,
    storageKey: heroStorageKey || undefined,
    legacyUrl: heroLegacyUrl || undefined,
    posterStorageKey: posterStorageKey || undefined,
    legacyPosterUrl: posterLegacyUrl || undefined,
    alt: payload.heroMedia.alt,
  });
}

async function buildGalleryMedia(
  mediaId: string,
  payload: PortfolioEditorPayload,
  uploads: PortfolioEditorUploads,
  createdStorageKeys: Set<string>,
): Promise<PortfolioMediaAsset[]> {
  const galleryItems: PortfolioMediaAsset[] = [];

  for (const [index, item] of payload.gallery.entries()) {
    const uploadedFile = uploads.galleryFiles[item.id];
    const uploadedPosterFile = uploads.galleryPosterFiles[item.id];

    let storageKey = item.existingStorageKey || "";
    let legacyUrl = item.existingUrl || "";
    let posterStorageKey = item.existingPosterStorageKey || "";
    let legacyPosterUrl = item.existingPoster || "";

    if (uploadedFile) {
      const fallbackExt = item.type === "video" ? ".mp4" : ".jpg";
      storageKey = buildPortfolioStorageKey(
        mediaId,
        `detail-${String(index + 1).padStart(2, "0")}${fileExtension(uploadedFile.name) || fallbackExt}`,
      );
      await uploadContentMediaFile(storageKey, uploadedFile);
      createdStorageKeys.add(storageKey);
      legacyUrl = "";
    }

    if (item.type === "video") {
      if (uploadedPosterFile) {
        posterStorageKey = buildPortfolioStorageKey(
          mediaId,
          `detail-${String(index + 1).padStart(2, "0")}-poster${fileExtension(uploadedPosterFile.name) || ".jpg"}`,
        );
        await uploadContentMediaFile(posterStorageKey, uploadedPosterFile);
        createdStorageKeys.add(posterStorageKey);
        legacyPosterUrl = "";
      }
    } else {
      posterStorageKey = "";
      legacyPosterUrl = "";
    }

    const media = resolveManagedMediaAsset({
      type: item.type,
      storageKey: storageKey || undefined,
      legacyUrl: legacyUrl || undefined,
      posterStorageKey: posterStorageKey || undefined,
      legacyPosterUrl: legacyPosterUrl || undefined,
      alt: item.alt,
      caption: item.caption || undefined,
    });

    if (media) {
      galleryItems.push(media);
    }
  }

  return galleryItems;
}

async function cleanupCreatedStorageKeys(createdStorageKeys: Set<string>) {
  if (createdStorageKeys.size === 0) return;

  try {
    await deleteContentMediaFiles([...createdStorageKeys]);
  } catch (error) {
    console.error("Failed to cleanup uploaded Supabase files after repository error.", error);
  }
}

export async function listAdminPortfolios() {
  const repository = getAdminRepository();
  const files = await repository.listFiles("content/portfolio");
  const markdownFiles = files.filter((file) => file.endsWith(".md"));

  const items = await Promise.all(
    markdownFiles.map(async (filePath) => {
      const slug = filePath.split("/").pop()?.replace(/\.md$/, "");
      if (!slug) return null;
      return readPortfolioFile(slug);
    }),
  );

  return sortByDateDesc(items.filter((item): item is AdminPortfolioDocument => item !== null));
}

export async function getAdminPortfolio(slug: string) {
  return readPortfolioFile(slug);
}

export async function saveAdminPortfolio(
  payload: PortfolioEditorPayload,
  uploads: PortfolioEditorUploads,
  action: "create" | "update" | "publish" | "archive",
) {
  const repository = getAdminRepository();
  const previousSlug = payload.previousSlug?.trim();
  const desiredSlug = slugify(payload.slug || payload.title);

  if (!payload.title.trim() || !desiredSlug || !payload.date.trim() || !payload.summary.trim()) {
    throw new Error("제목, slug, 날짜, summary는 필수입니다.");
  }

  const allItems = await listAdminPortfolios();
  const existing = previousSlug ? allItems.find((item) => item.slug === previousSlug) || null : null;
  const usedSlugs = new Set(allItems.map((item) => item.slug));

  if (!previousSlug && usedSlugs.has(desiredSlug)) {
    throw new Error("같은 slug가 이미 존재합니다.");
  }

  if (previousSlug && desiredSlug !== previousSlug) {
    usedSlugs.delete(previousSlug);
    if (usedSlugs.has(desiredSlug)) {
      throw new Error("변경하려는 slug가 이미 존재합니다.");
    }
  }

  const nextSlug = desiredSlug;
  const mediaId = existing?.frontmatter.mediaId || createPortfolioMediaId(nextSlug);
  const existingFrontmatter = existing?.frontmatter;
  const createdStorageKeys = new Set<string>();
  const deletes = new Set<string>();

  const heroMedia = await buildHeroMedia(mediaId, payload, uploads, createdStorageKeys);
  const gallery = await buildGalleryMedia(mediaId, payload, uploads, createdStorageKeys);

  const frontmatter = cleanFrontmatter({
    title: payload.title.trim(),
    slug: nextSlug,
    mediaId,
    date: payload.date,
    status: ensureStatus(payload.status),
    featured: payload.featured,
    featured_order: payload.featured ? payload.featured_order : undefined,
    location: payload.location?.trim() || undefined,
    partner: payload.partner?.trim() || undefined,
    summary: payload.summary.trim(),
    roles: payload.roles.map((item) => item.trim()).filter(Boolean),
    categories: payload.categories.map((item) => item.trim()).filter(Boolean),
    search_terms: payload.search_terms.map((item) => item.trim()).filter(Boolean),
    goals: payload.goals?.trim() || undefined,
    our_role: payload.our_role?.trim() || undefined,
    process: payload.process?.trim() || undefined,
    metrics: payload.metrics
      .map((item) => ({
        label: item.label.trim(),
        value: item.value.trim(),
      }))
      .filter((item) => item.label && item.value),
    related_cases: payload.related_cases.filter((item) => item && item !== nextSlug),
    heroMedia,
    gallery,
  });

  const nextManagedStorageKeys = new Set(collectManagedStorageKeys(frontmatter));
  const removedStorageKeys = existingFrontmatter
    ? collectManagedStorageKeys(existingFrontmatter).filter((storageKey) => !nextManagedStorageKeys.has(storageKey))
    : [];

  if (removedStorageKeys.length > 0 && !isContentMediaStorageConfigured()) {
    await cleanupCreatedStorageKeys(createdStorageKeys);
    throw new Error("Supabase 콘텐츠 스토리지 설정이 없어 기존 미디어를 정리할 수 없습니다.");
  }

  if (previousSlug && previousSlug !== nextSlug) {
    deletes.add(portfolioContentPath(previousSlug));
  }

  const markdownContent = serializePortfolioFile(frontmatter, payload.content);

  try {
    await repository.commitChanges({
      message: commitMessage(action, nextSlug),
      upserts: [
        {
          path: portfolioContentPath(nextSlug),
          contentBase64: stringToBase64(markdownContent),
        },
      ],
      deletes: [...deletes].filter((filePath) => filePath !== portfolioContentPath(nextSlug)),
    });
  } catch (error) {
    await cleanupCreatedStorageKeys(createdStorageKeys);
    throw error;
  }

  if (removedStorageKeys.length > 0) {
    try {
      await deleteContentMediaFiles(removedStorageKeys);
    } catch (error) {
      console.error("Failed to delete stale Supabase media after commit.", error);
    }
  }

  return { slug: nextSlug };
}

async function duplicateStorageBackedAsset(
  asset: PortfolioMediaAsset,
  nextMediaId: string,
  fileBaseName: string,
  createdStorageKeys: Set<string>,
): Promise<PortfolioMediaAsset | undefined> {
  const nextStorageKey = asset.storageKey
    ? buildPortfolioStorageKey(nextMediaId, `${fileBaseName}${fileExtension(asset.storageKey) || ".jpg"}`)
    : undefined;
  const nextPosterStorageKey = asset.posterStorageKey
    ? buildPortfolioStorageKey(nextMediaId, `${fileBaseName}-poster${fileExtension(asset.posterStorageKey) || ".jpg"}`)
    : undefined;

  if (asset.storageKey && nextStorageKey) {
    await copyContentMediaFile(asset.storageKey, nextStorageKey);
    createdStorageKeys.add(nextStorageKey);
  }

  if (asset.posterStorageKey && nextPosterStorageKey) {
    await copyContentMediaFile(asset.posterStorageKey, nextPosterStorageKey);
    createdStorageKeys.add(nextPosterStorageKey);
  }

  return resolveManagedMediaAsset({
    type: asset.type,
    storageKey: nextStorageKey,
    legacyUrl: !asset.storageKey ? asset.url : undefined,
    posterStorageKey: nextPosterStorageKey,
    legacyPosterUrl: !asset.posterStorageKey ? asset.poster : undefined,
    alt: asset.alt,
    caption: asset.caption,
  });
}

export async function duplicateAdminPortfolio(slug: string) {
  const repository = getAdminRepository();
  const existing = await getAdminPortfolio(slug);
  if (!existing) {
    throw new Error("복제할 포트폴리오를 찾을 수 없습니다.");
  }

  const allItems = await listAdminPortfolios();
  const nextSlug = uniqueSlug(`${existing.slug}-copy`, new Set(allItems.map((item) => item.slug)));
  const nextTitle = `${existing.frontmatter.title} 복사본`;
  const nextMediaId = createPortfolioMediaId(nextSlug);
  const createdStorageKeys = new Set<string>();

  try {
    const duplicatedHero = existing.frontmatter.heroMedia
      ? await duplicateStorageBackedAsset(existing.frontmatter.heroMedia, nextMediaId, "hero", createdStorageKeys)
      : undefined;
    const duplicatedGallery = (
      await Promise.all(
        (existing.frontmatter.gallery || []).map((item, index) =>
          duplicateStorageBackedAsset(
            item,
            nextMediaId,
            `detail-${String(index + 1).padStart(2, "0")}`,
            createdStorageKeys,
          ),
        ),
      )
    ).filter((item): item is PortfolioMediaAsset => Boolean(item));

    const nextFrontmatter = cleanFrontmatter({
      ...existing.frontmatter,
      title: nextTitle,
      slug: nextSlug,
      mediaId: nextMediaId,
      status: "draft",
      featured: false,
      featured_order: undefined,
      heroMedia: duplicatedHero,
      gallery: duplicatedGallery,
    });

    await repository.commitChanges({
      message: commitMessage("duplicate", nextSlug),
      upserts: [
        {
          path: portfolioContentPath(nextSlug),
          contentBase64: stringToBase64(serializePortfolioFile(nextFrontmatter, existing.content)),
        },
      ],
      deletes: [],
    });
  } catch (error) {
    await cleanupCreatedStorageKeys(createdStorageKeys);
    throw error;
  }

  return { slug: nextSlug };
}

export async function updateAdminPortfolioStatus(slug: string, status: PortfolioStatus) {
  const existing = await getAdminPortfolio(slug);
  if (!existing) {
    throw new Error("포트폴리오를 찾을 수 없습니다.");
  }

  const payload = portfolioDocumentToPayload(existing);
  payload.status = status;

  const action = status === "published" ? "publish" : status === "archived" ? "archive" : "update";

  return saveAdminPortfolio(
    payload,
    {
      galleryFiles: {},
      galleryPosterFiles: {},
    },
    action,
  );
}
