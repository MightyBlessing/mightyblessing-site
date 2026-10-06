import { randomUUID } from "crypto";
import matter from "gray-matter";
import { contentRevision, EditConflict } from "./revision";
import { RequestError } from "@/lib/request-guard";
import { resolveContentMediaUrl } from "@/lib/content-media";
import type { PortfolioMediaAsset } from "@/lib/portfolio-media";
import { isDevelopmentMediaUrl, markdownImageSources, mediaSourceKey, updateMarkdownImages } from "@/lib/markdown-media";
import {
  type PortfolioEntry,
  type PortfolioFrontmatter,
  type PortfolioStatus,
  normalizePortfolioFrontmatter,
} from "@/lib/content";
import {
  normalizePortfolioFeaturedSelection,
  type FeaturedPortfolioOrder,
} from "@/lib/portfolio-display";
import { base64ToString, stringToBase64 } from "./base64";
import { getAdminRepository, type AdminRepository } from "./repository";
import {
  deleteContentMediaFiles,
  uploadContentMediaFile,
} from "./content-media-storage";

export type AdminPortfolioDocument = {
  slug: string;
  revision?: string;
  frontmatter: PortfolioFrontmatter;
  content: string;
  // Server-only source data. Never send this object to the public site or editor.
  storedFrontmatter?: Record<string, unknown>;
};

type SaveServices = {
  repository: AdminRepository;
  upload: typeof uploadContentMediaFile;
  remove: typeof deleteContentMediaFiles;
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
  revision?: string;
  title: string;
  shortTitle?: string;
  slug: string;
  date: string;
  summary: string;
  location?: string;
  partner?: string;
  featured: boolean;
  featured_order?: FeaturedPortfolioOrder;
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
    revision: document.revision,
    title: document.frontmatter.title,
    shortTitle: document.frontmatter.shortTitle || "",
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

function toStoredMediaAsset(asset?: PortfolioMediaAsset, previous?: unknown, preserveCaption = false) {
  if (!asset) return undefined;
  const source = previous && typeof previous === "object" ? previous as Record<string, unknown> : {};
  const sameAsset = asset.storageKey ? asset.storageKey === source.storageKey : asset.url === source.url;
  const storedAsset: Record<string, unknown> = {
    ...(sameAsset ? source : {}),
    type: asset.type,
    url: undefined,
    storageKey: undefined,
    poster: undefined,
    posterStorageKey: undefined,
    alt: undefined,
    caption: sameAsset && preserveCaption ? source.caption : undefined,
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

  return Object.fromEntries(Object.entries(storedAsset).filter(([, value]) => value !== undefined));
}

function cleanFrontmatter(frontmatter: PortfolioFrontmatter): PortfolioFrontmatter {
  const featuredSelection = normalizePortfolioFeaturedSelection(frontmatter);

  return normalizePortfolioFrontmatter({
    ...frontmatter,
    ...featuredSelection,
    thumbnail: undefined,
    metrics: (frontmatter.metrics || []).filter((item) => item.label.trim() && item.value.trim()),
    related_cases: (frontmatter.related_cases || []).filter(Boolean),
    search_terms: (frontmatter.search_terms || []).filter(Boolean),
    roles: (frontmatter.roles || []).filter(Boolean),
    categories: (frontmatter.categories || []).filter(Boolean),
    gallery: (frontmatter.gallery || []).filter((item) => item.url || item.storageKey),
  });
}

function serializePortfolioFile(frontmatter: PortfolioFrontmatter, content: string, original: Record<string, unknown> = {}) {
  const cleaned = cleanFrontmatter(frontmatter);
  const originalGallery = Array.isArray(original.gallery) ? original.gallery : [];
  // Only fields supported by this editor can replace their source values.
  // New schema blocks, review records and nested credits survive legacy editing.
  const editableFields = new Set(["title", "shortTitle", "slug", "mediaId", "date", "status", "featured", "featured_order", "location", "partner", "summary", "roles", "categories", "search_terms", "goals", "our_role", "process", "metrics", "related_cases", "thumbnail", "heroMedia", "gallery"]);
  const retained = Object.fromEntries(Object.entries(original).filter(([key]) => !editableFields.has(key)));

  const data = Object.fromEntries(
    Object.entries({
      ...original,
      ...cleaned,
      ...retained,
      thumbnail: undefined,
      heroMedia: toStoredMediaAsset(cleaned.heroMedia, original.heroMedia, true),
      gallery: cleaned.gallery?.map((item) => toStoredMediaAsset(item, originalGallery.find((candidate) =>
        item.storageKey ? candidate.storageKey === item.storageKey : candidate.url === item.url
      ))).filter(Boolean),
    }).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }),
  );

  return matter.stringify(content.trim(), data).trimEnd() + "\n";
}

async function readPortfolioFile(slug: string, repository = getAdminRepository()): Promise<AdminPortfolioDocument | null> {
  if (!/^[a-zA-Z0-9가-힣-]+$/.test(slug)) throw new RequestError("프로젝트 주소가 올바르지 않습니다.");
  const contentBase64 = await repository.readFile(portfolioContentPath(slug));
  if (!contentBase64) return null;

  const raw = base64ToString(contentBase64);
  const parsed = matter(raw);
  const frontmatter = normalizePortfolioFrontmatter(parsed.data as Partial<PortfolioFrontmatter>);

  return {
    slug,
    revision: contentRevision(contentBase64)!,
    frontmatter,
    content: parsed.content.trim(),
    storedFrontmatter: parsed.data,
  } satisfies AdminPortfolioDocument;
}

function commitMessage(action: "create" | "update" | "publish" | "archive", slug: string) {
  return `admin: ${action} portfolio ${slug}`;
}

async function buildHeroMedia(
  mediaId: string,
  payload: PortfolioEditorPayload,
  uploads: PortfolioEditorUploads,
  createdStorageKeys: Set<string>,
  upload: typeof uploadContentMediaFile,
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
    await upload(heroStorageKey, heroUpload);
    createdStorageKeys.add(heroStorageKey);
    heroLegacyUrl = "";
  }

  if (payload.heroMedia.type === "video") {
    if (posterUpload) {
      const ext = fileExtension(posterUpload.name) || ".jpg";
      posterStorageKey = buildPortfolioStorageKey(mediaId, `poster${ext}`);
      await upload(posterStorageKey, posterUpload);
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
  upload: typeof uploadContentMediaFile,
) {
  const galleryItems: PortfolioMediaAsset[] = [];
  const itemsById = new Map<string, PortfolioMediaAsset>();

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
      await upload(storageKey, uploadedFile);
      createdStorageKeys.add(storageKey);
      legacyUrl = "";
    }

    if (item.type === "video") {
      if (uploadedPosterFile) {
        posterStorageKey = buildPortfolioStorageKey(
          mediaId,
          `detail-${String(index + 1).padStart(2, "0")}-poster${fileExtension(uploadedPosterFile.name) || ".jpg"}`,
        );
        await upload(posterStorageKey, uploadedPosterFile);
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
      itemsById.set(item.id, media);
    }
  }

  return { gallery: galleryItems, itemsById };
}

function syncGalleryImages(content: string, previous: PortfolioMediaAsset[], next: PortfolioMediaAsset[], itemsById: ReadonlyMap<string, PortfolioMediaAsset>) {
  const retainedSources = new Set(next.flatMap(media => [media.url, media.poster].filter((source): source is string => Boolean(source))).map(mediaSourceKey));
  const replacements = new Map<string, string | null>();
  // The editor preserves gallery IDs while moving/uploading items. Their ID at
  // load time identifies the original asset; current array position does not.
  previous.forEach((media, index) => {
    const replacement = itemsById.get(`gallery-${index + 1}`);
    for (const source of [media.url, media.poster]) {
      if (source && !retainedSources.has(mediaSourceKey(source))) replacements.set(source, replacement?.poster || replacement?.url || null);
    }
  });
  return updateMarkdownImages(content, replacements);
}

async function cleanupCreatedStorageKeys(createdStorageKeys: Set<string>, remove: typeof deleteContentMediaFiles) {
  if (createdStorageKeys.size === 0) return;

  try {
    await remove([...createdStorageKeys]);
  } catch (error) {
    console.error("Failed to cleanup uploaded Supabase files after repository error.", error);
  }
}

export async function listAdminPortfolios(repository = getAdminRepository()) {
  const files = await repository.listFiles("content/portfolio");
  const markdownFiles = files.filter((file) => file.endsWith(".md"));

  const items = await Promise.all(
    markdownFiles.map(async (filePath) => {
      const slug = filePath.split("/").pop()?.replace(/\.md$/, "");
      if (!slug) return null;
      return readPortfolioFile(slug, repository);
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
  services: SaveServices = { repository: getAdminRepository(), upload: uploadContentMediaFile, remove: deleteContentMediaFiles },
) {
  const { repository, upload, remove } = services;
  repository.assertWritable?.();
  if (!payload || typeof payload.title !== "string" || typeof payload.slug !== "string" || typeof payload.date !== "string" || typeof payload.summary !== "string" || typeof payload.content !== "string" || !["roles", "categories", "search_terms", "metrics", "related_cases", "gallery"].every(key => Array.isArray(payload[key as keyof PortfolioEditorPayload])) || !payload.heroMedia) {
    throw new RequestError("편집 데이터 형식이 올바르지 않습니다.");
  }
  if (!["create", "update", "publish", "archive"].includes(action) || !["draft", "published", "archived"].includes(payload.status)) throw new RequestError("저장 상태가 올바르지 않습니다.");
  const strings = [payload.previousSlug, payload.revision, payload.location, payload.partner, payload.goals, payload.our_role, payload.process];
  if (strings.some(value => value !== undefined && typeof value !== "string") || [payload.roles, payload.categories, payload.search_terms, payload.related_cases].some(list => list.some(value => typeof value !== "string")) || payload.metrics.some(item => !item || typeof item.label !== "string" || typeof item.value !== "string") || payload.gallery.length > 30) throw new RequestError("편집 데이터 형식이 올바르지 않습니다.");
  for (const media of [payload.heroMedia, ...payload.gallery]) {
    if (!media || !["image", "video"].includes(media.type) || typeof media.alt !== "string") throw new RequestError("미디어 정보가 올바르지 않습니다.");
    for (const url of [media.existingUrl, media.existingPoster]) {
      if (url && (typeof url !== "string" || !/^(https:\/\/|\/(?!\/))/.test(url))) throw new RequestError("미디어 주소는 HTTPS 또는 사이트 내부 주소만 사용할 수 있습니다.");
    }
  }
  const previousSlug = payload.previousSlug?.trim();
  const desiredSlug = slugify(payload.slug || payload.title);
  if (payload.shortTitle !== undefined && typeof payload.shortTitle !== "string") {
    throw new RequestError("목록용 제목은 문자열이어야 합니다.");
  }

  if (!payload.title.trim() || !desiredSlug || !payload.date.trim() || !payload.summary.trim()) {
    throw new Error("제목, slug, 날짜, summary는 필수입니다.");
  }

  const allItems = await listAdminPortfolios(repository);
  const existing = previousSlug ? allItems.find((item) => item.slug === previousSlug) || null : null;
  const usedSlugs = new Set(allItems.map((item) => item.slug));

  if (previousSlug && !existing) {
    throw new Error("수정할 프로젝트를 찾을 수 없습니다. 목록을 새로고침해 주세요.");
  }

  if (existing && !payload.revision) throw new RequestError("편집 버전이 없습니다. 편집 화면을 다시 열어 주세요.", 428);
  if (existing && payload.revision !== existing.revision) throw new EditConflict();

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
  const createdStorageKeys = new Set<string>();
  const deletes = new Set<string>();
  const nextStatus =
    action === "publish" ? "published" : action === "archive" ? "archived" : ensureStatus(payload.status);
  const featuredSelection = normalizePortfolioFeaturedSelection({
    featured: payload.featured,
    featured_order: payload.featured_order,
  });

  // Immutable paths protect the currently deployed version and rollback assets.
  const uploadMediaId = `${mediaId}/versions/${randomUUID()}`;
  let commitAttempted = false;
  try {
    const heroMedia = await buildHeroMedia(uploadMediaId, payload, uploads, createdStorageKeys, upload);
    const { gallery, itemsById } = await buildGalleryMedia(uploadMediaId, payload, uploads, createdStorageKeys, upload);
    const content = syncGalleryImages(payload.content, existing?.frontmatter.gallery || [], gallery, itemsById);
    const mediaSources = [heroMedia, ...gallery].flatMap(media => media ? [media.url, media.poster || ""] : []);
    if (nextStatus === "published" && [...mediaSources, ...markdownImageSources(content)].some(isDevelopmentMediaUrl)) {
      throw new Error("로컬 검토용 미디어는 공개할 수 없습니다. 공개 확인을 마친 웹용 이미지로 교체해 주세요.");
    }

    const frontmatter = cleanFrontmatter({
      ...existing?.frontmatter,
      title: payload.title.trim(),
      // Omission preserves older editor requests; an explicit empty value clears it.
      shortTitle: payload.shortTitle === undefined ? existing?.frontmatter.shortTitle : payload.shortTitle.trim() || undefined,
      slug: nextSlug,
      mediaId,
      date: payload.date,
      status: nextStatus,
      featured: featuredSelection.featured,
      featured_order: featuredSelection.featured_order,
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
    const conflictingFeaturedItems =
      frontmatter.featured_order === undefined
        ? []
        : allItems.filter(
            (item) => item.slug !== previousSlug && item.frontmatter.featured_order === frontmatter.featured_order,
          );
    const conflictingUpserts = conflictingFeaturedItems.map((item) => ({
      path: portfolioContentPath(item.slug),
      contentBase64: stringToBase64(
        serializePortfolioFile(
          cleanFrontmatter({
            ...item.frontmatter,
            featured: false,
            featured_order: undefined,
          }),
          item.content,
          item.storedFrontmatter,
        ),
      ),
    }));

    if (previousSlug && previousSlug !== nextSlug) {
      deletes.add(portfolioContentPath(previousSlug));
    }

    const markdownContent = serializePortfolioFile(frontmatter, content, existing?.storedFrontmatter);

    commitAttempted = true;
    const receipt = await repository.commitChanges({
      expectedFiles: {
        ...Object.fromEntries(allItems.map(item => [portfolioContentPath(item.slug), item.revision!])),
        ...(!usedSlugs.has(nextSlug) ? { [portfolioContentPath(nextSlug)]: null } : {}),
      },
      message: commitMessage(action, nextSlug),
      upserts: [
        {
          path: portfolioContentPath(nextSlug),
          contentBase64: stringToBase64(markdownContent),
        },
        ...conflictingUpserts,
      ],
      deletes: [...deletes].filter((filePath) => filePath !== portfolioContentPath(nextSlug)),
    });
    // Return only editor-supported fields, never stored review/private metadata.
    // The editor can now continue from committed media URLs and updated Markdown.
    return { slug: nextSlug, commitSha: receipt?.commitSha, publication: "deployment-required" as const, payload: portfolioDocumentToPayload({ slug: nextSlug, revision: contentRevision(stringToBase64(markdownContent))!, frontmatter, content: content.trim() }) };
  } catch (error) {
    // A timed-out commit may already have succeeded remotely. Retain its files.
    if (!commitAttempted) await cleanupCreatedStorageKeys(createdStorageKeys, remove);
    if (error instanceof EditConflict) throw error;
    if (commitAttempted) {
      throw new Error("저장 결과를 확인하지 못했습니다. 목록을 새로고침해 상태를 확인해 주세요. 연결된 미디어는 보존했습니다.", { cause: error });
    }
    throw error;
  }
}
export async function updateAdminPortfolioStatus(slug: string, status: PortfolioStatus, revision?: string) {
  const repository = getAdminRepository();
  repository.assertWritable?.();
  const existing = await readPortfolioFile(slug, repository);
  if (!existing) {
    throw new Error("포트폴리오를 찾을 수 없습니다.");
  }

  const payload = portfolioDocumentToPayload(existing);
  payload.status = status;
  payload.revision = revision;

  const action = status === "published" ? "publish" : status === "archived" ? "archive" : "update";

  return saveAdminPortfolio(
    payload,
    {
      galleryFiles: {},
      galleryPosterFiles: {},
    },
    action,
    { repository, upload: uploadContentMediaFile, remove: deleteContentMediaFiles },
  );
}
