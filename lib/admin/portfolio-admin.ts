import matter from "gray-matter";
import type { PortfolioMediaAsset } from "@/lib/portfolio-media";
import {
  type PortfolioEntry,
  type PortfolioFrontmatter,
  type PortfolioStatus,
  normalizePortfolioFrontmatter,
} from "@/lib/content";
import { base64ToString, stringToBase64 } from "./base64";
import { getAdminRepository } from "./repository";

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
    },
    gallery: (document.frontmatter.gallery || []).map((item, index) => ({
      id: `gallery-${index + 1}`,
      type: item.type,
      alt: item.alt || "",
      caption: item.caption || "",
      existingUrl: item.url,
      existingPoster: item.poster,
    })),
  };
}

function sortByDateDesc(items: AdminPortfolioDocument[]) {
  return [...items].sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

function portfolioContentPath(slug: string) {
  return `content/portfolio/${slug}.md`;
}

function portfolioMediaDir(slug: string) {
  return `public/media/portfolio/${slug}`;
}

function publicUrlToRepoPath(url: string) {
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `public${normalized}`;
}

function repoPathToPublicUrl(repoPath: string) {
  return repoPath.startsWith("public/") ? `/${repoPath.slice("public/".length)}` : repoPath;
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

function rewriteAssetSlug(asset: PortfolioMediaAsset | undefined, fromSlug: string, toSlug: string) {
  if (!asset) return asset;

  const prefix = `/media/portfolio/${fromSlug}/`;
  return {
    ...asset,
    url: asset.url.startsWith(prefix) ? asset.url.replace(prefix, `/media/portfolio/${toSlug}/`) : asset.url,
    poster:
      asset.poster && asset.poster.startsWith(prefix)
        ? asset.poster.replace(prefix, `/media/portfolio/${toSlug}/`)
        : asset.poster,
  };
}

function collectManagedRepoPaths(frontmatter: PortfolioFrontmatter) {
  const paths = new Set<string>();
  const add = (url?: string) => {
    if (url?.startsWith("/media/portfolio/")) {
      paths.add(publicUrlToRepoPath(url));
    }
  };

  add(frontmatter.heroMedia?.url);
  add(frontmatter.heroMedia?.poster);

  for (const media of frontmatter.gallery || []) {
    add(media.url);
    add(media.poster);
  }

  return [...paths];
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
    gallery: (frontmatter.gallery || []).filter((item) => item.url),
  });
}

function serializePortfolioFile(frontmatter: PortfolioFrontmatter, content: string) {
  const {
    thumbnail,
    ...rest
  } = cleanFrontmatter(frontmatter);

  const data = Object.fromEntries(
    Object.entries(rest).filter(([, value]) => {
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

function buildHeroMedia(
  slug: string,
  payload: PortfolioEditorPayload,
  uploads: PortfolioEditorUploads,
  nextUpserts: { path: string; contentBase64: string }[],
  nextUsedManagedPaths: Set<string>,
) {
  const folder = portfolioMediaDir(slug);
  const heroUpload = uploads.heroFile;
  const posterUpload = uploads.heroPosterFile;
  const existing = payload.heroMedia;

  let heroUrl = existing.existingUrl || "";
  let posterUrl = existing.existingPoster || "";

  if (heroUpload) {
    const ext = fileExtension(heroUpload.name) || (payload.heroMedia.type === "video" ? ".mp4" : ".jpg");
    const heroPath = `${folder}/hero${ext}`;
    nextUpserts.push({ path: heroPath, contentBase64: heroUpload.contentBase64 });
    nextUsedManagedPaths.add(heroPath);
    heroUrl = repoPathToPublicUrl(heroPath);
  } else if (heroUrl.startsWith("/media/portfolio/")) {
    nextUsedManagedPaths.add(publicUrlToRepoPath(heroUrl));
  }

  if (payload.heroMedia.type === "video") {
    if (posterUpload) {
      const ext = fileExtension(posterUpload.name) || ".jpg";
      const posterPath = `${folder}/poster${ext}`;
      nextUpserts.push({ path: posterPath, contentBase64: posterUpload.contentBase64 });
      nextUsedManagedPaths.add(posterPath);
      posterUrl = repoPathToPublicUrl(posterPath);
    } else if (posterUrl.startsWith("/media/portfolio/")) {
      nextUsedManagedPaths.add(publicUrlToRepoPath(posterUrl));
    }
  } else {
    posterUrl = "";
  }

  if (!heroUrl) {
    return undefined;
  }

  return cleanFrontmatter({
    title: "",
    slug,
    date: payload.date,
    summary: payload.summary,
    roles: [],
    categories: [],
    heroMedia: {
      type: payload.heroMedia.type,
      url: heroUrl,
      poster: posterUrl || undefined,
      alt: payload.heroMedia.alt,
    },
  }).heroMedia;
}

function buildGalleryMedia(
  slug: string,
  payload: PortfolioEditorPayload,
  uploads: PortfolioEditorUploads,
  nextUpserts: { path: string; contentBase64: string }[],
  nextUsedManagedPaths: Set<string>,
) {
  const folder = portfolioMediaDir(slug);
  const galleryItems: Array<PortfolioMediaAsset | null> = payload.gallery.map((item, index) => {
      const uploadedFile = uploads.galleryFiles[item.id];
      const uploadedPosterFile = uploads.galleryPosterFiles[item.id];

      let mediaUrl = item.existingUrl || "";
      let posterUrl = item.existingPoster || "";

      if (uploadedFile) {
        const fallbackExt = item.type === "video" ? ".mp4" : ".jpg";
        const mediaPath = `${folder}/detail-${String(index + 1).padStart(2, "0")}${fileExtension(uploadedFile.name) || fallbackExt}`;
        nextUpserts.push({ path: mediaPath, contentBase64: uploadedFile.contentBase64 });
        nextUsedManagedPaths.add(mediaPath);
        mediaUrl = repoPathToPublicUrl(mediaPath);
      } else if (mediaUrl.startsWith("/media/portfolio/")) {
        nextUsedManagedPaths.add(publicUrlToRepoPath(mediaUrl));
      }

      if (item.type === "video") {
        if (uploadedPosterFile) {
          const posterPath = `${folder}/detail-${String(index + 1).padStart(2, "0")}-poster${fileExtension(uploadedPosterFile.name) || ".jpg"}`;
          nextUpserts.push({ path: posterPath, contentBase64: uploadedPosterFile.contentBase64 });
          nextUsedManagedPaths.add(posterPath);
          posterUrl = repoPathToPublicUrl(posterPath);
        } else if (posterUrl.startsWith("/media/portfolio/")) {
          nextUsedManagedPaths.add(publicUrlToRepoPath(posterUrl));
        }
      } else {
        posterUrl = "";
      }

      if (!mediaUrl) return null;

      return {
        type: item.type,
        url: mediaUrl,
        poster: posterUrl || undefined,
        alt: item.alt,
        caption: item.caption || undefined,
      } satisfies PortfolioMediaAsset;
    });

  return galleryItems.filter((item): item is PortfolioMediaAsset => item !== null);
}

async function moveManagedMedia(previousSlug: string, nextSlug: string) {
  const repository = getAdminRepository();
  const sourceFiles = await repository.listFiles(portfolioMediaDir(previousSlug));

  const upserts = await Promise.all(
    sourceFiles.map(async (filePath) => {
      const contentBase64 = await repository.readFile(filePath);
      if (!contentBase64) return null;

      return {
        path: filePath.replace(`/${previousSlug}/`, `/${nextSlug}/`),
        contentBase64,
      };
    }),
  );

  return {
    upserts: upserts.filter((item): item is { path: string; contentBase64: string } => item !== null),
    deletes: sourceFiles,
  };
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
  const nextUpserts: { path: string; contentBase64: string }[] = [];
  const nextUsedManagedPaths = new Set<string>();
  const deletes = new Set<string>();

  if (existing && previousSlug && previousSlug !== nextSlug) {
    const movedMedia = await moveManagedMedia(previousSlug, nextSlug);
    for (const item of movedMedia.upserts) {
      nextUpserts.push(item);
    }
    for (const item of movedMedia.deletes) {
      deletes.add(item);
    }
  }

  const existingFrontmatter = existing?.frontmatter;
  const heroSeed = rewriteAssetSlug(existingFrontmatter?.heroMedia, previousSlug || "", nextSlug);
  const gallerySeed = (existingFrontmatter?.gallery || []).map((item) => rewriteAssetSlug(item, previousSlug || "", nextSlug));

  const nextPayload: PortfolioEditorPayload = {
    ...payload,
    slug: nextSlug,
    heroMedia: {
      ...payload.heroMedia,
      existingUrl: payload.heroMedia.existingUrl || heroSeed?.url,
      existingPoster: payload.heroMedia.existingPoster || heroSeed?.poster,
    },
    gallery: payload.gallery.map((item, index) => ({
      ...item,
      existingUrl: item.existingUrl || gallerySeed[index]?.url,
      existingPoster: item.existingPoster || gallerySeed[index]?.poster,
    })),
  };

  const heroMedia = buildHeroMedia(nextSlug, nextPayload, uploads, nextUpserts, nextUsedManagedPaths);
  const gallery = buildGalleryMedia(nextSlug, nextPayload, uploads, nextUpserts, nextUsedManagedPaths);

  const frontmatter = cleanFrontmatter({
    title: payload.title.trim(),
    slug: nextSlug,
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

  const nextManagedPaths = collectManagedRepoPaths(frontmatter);
  for (const filePath of nextManagedPaths) {
    nextUsedManagedPaths.add(filePath);
  }

  if (existingFrontmatter) {
    for (const filePath of collectManagedRepoPaths(existingFrontmatter)) {
      if (!nextUsedManagedPaths.has(filePath)) {
        deletes.add(filePath);
      }
    }
  }

  if (previousSlug && previousSlug !== nextSlug) {
    deletes.add(portfolioContentPath(previousSlug));
  }

  const markdownContent = serializePortfolioFile(frontmatter, payload.content);
  nextUpserts.push({
    path: portfolioContentPath(nextSlug),
    contentBase64: stringToBase64(markdownContent),
  });

  await repository.commitChanges({
    message: commitMessage(action, nextSlug),
    upserts: nextUpserts,
    deletes: [...deletes].filter((filePath) => filePath !== portfolioContentPath(nextSlug)),
  });

  return { slug: nextSlug };
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
  const duplicatedGallery: PortfolioMediaAsset[] = (existing.frontmatter.gallery || []).map(
    (item) => rewriteAssetSlug(item, existing.slug, nextSlug) as PortfolioMediaAsset,
  );
  const nextFrontmatter = cleanFrontmatter({
    ...existing.frontmatter,
    title: nextTitle,
    slug: nextSlug,
    status: "draft",
    featured: false,
    featured_order: undefined,
    heroMedia: rewriteAssetSlug(existing.frontmatter.heroMedia, existing.slug, nextSlug),
    gallery: duplicatedGallery,
  });

  const sourceMediaFiles = await repository.listFiles(portfolioMediaDir(existing.slug));
  const upserts = await Promise.all(
    sourceMediaFiles.map(async (filePath) => {
      const contentBase64 = await repository.readFile(filePath);
      if (!contentBase64) return null;
      return {
        path: filePath.replace(`/${existing.slug}/`, `/${nextSlug}/`),
        contentBase64,
      };
    }),
  );

  upserts.push({
    path: portfolioContentPath(nextSlug),
    contentBase64: stringToBase64(serializePortfolioFile(nextFrontmatter, existing.content)),
  });

  await repository.commitChanges({
    message: commitMessage("duplicate", nextSlug),
    upserts: upserts.filter((item): item is { path: string; contentBase64: string } => item !== null),
    deletes: [],
  });

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
