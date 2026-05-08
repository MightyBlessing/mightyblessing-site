import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

const rootDir = process.cwd();
const contentDir = path.join(rootDir, "content", "portfolio");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "") || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
const bucket =
  process.env.SUPABASE_STORAGE_BUCKET_CONTENT?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_CONTENT?.trim() ||
  "content-media";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const explicitAssetMappings = [
  {
    localUrl: "/media/portfolio/hero-draft.mp4",
    storageKey: "portfolio/shared/hero-draft.mp4",
  },
  {
    localUrl: "/media/portfolio/blue-stage.jpg",
    storageKey: "portfolio/shared/blue-stage.jpg",
  },
  {
    localUrl: "/media/portfolio/ambient-stage.jpg",
    storageKey: "portfolio/shared/ambient-stage.jpg",
  },
  {
    localUrl: "/media/portfolio/worship-room.jpg",
    storageKey: "portfolio/shared/worship-room.jpg",
  },
  {
    localUrl: "/media/portfolio/crowd-arms.jpg",
    storageKey: "portfolio/shared/crowd-arms.jpg",
  },
  {
    localUrl: "/media/portfolio/audience-lights.jpg",
    storageKey: "portfolio/shared/audience-lights.jpg",
  },
  {
    localUrl: "/media/portfolio/worship-hands.jpg",
    storageKey: "portfolio/shared/worship-hands.jpg",
  },
  {
    localUrl: "/media/portfolio/home-hero-worship.mp4",
    storageKey: "home/hero/video.mp4",
  },
  {
    localUrl: "/media/portfolio/home-hero-worship-poster.jpg",
    storageKey: "home/hero/poster.jpg",
  },
  {
    localUrl: "/media/instagram/mightyblessing-post-01.jpg",
    storageKey: "home/instagram/mightyblessing-post-01.jpg",
  },
  {
    localUrl: "/media/instagram/mightyblessing-post-02.jpg",
    storageKey: "home/instagram/mightyblessing-post-02.jpg",
  },
  {
    localUrl: "/media/instagram/mightyblessing-post-03.jpg",
    storageKey: "home/instagram/mightyblessing-post-03.jpg",
  },
  {
    localUrl: "/media/instagram/mightyblessing-post-04.jpg",
    storageKey: "home/instagram/mightyblessing-post-04.jpg",
  },
  {
    localUrl: "/media/instagram/mightyblessing-post-05.jpg",
    storageKey: "home/instagram/mightyblessing-post-05.jpg",
  },
];

function detectContentType(filePath) {
  const lowerPath = filePath.toLowerCase();
  if (lowerPath.endsWith(".mp4")) return "video/mp4";
  if (lowerPath.endsWith(".png")) return "image/png";
  if (lowerPath.endsWith(".webp")) return "image/webp";
  if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function publicUrlToAbsoluteFilePath(publicUrl) {
  return path.join(rootDir, "public", publicUrl.replace(/^\/+/, ""));
}

function inferPortfolioStorageKey(publicUrl, mediaId) {
  if (!publicUrl) return null;

  if (publicUrl === "/media/portfolio/home-hero-worship.mp4") {
    return "home/hero/video.mp4";
  }

  if (publicUrl === "/media/portfolio/home-hero-worship-poster.jpg") {
    return "home/hero/poster.jpg";
  }

  if (publicUrl.startsWith("/media/instagram/")) {
    return `home/instagram/${publicUrl.replace("/media/instagram/", "")}`;
  }

  if (publicUrl.startsWith(`/media/portfolio/${mediaId}/`)) {
    return `portfolio/${mediaId}/${publicUrl.replace(`/media/portfolio/${mediaId}/`, "")}`;
  }

  if (publicUrl.startsWith("/media/portfolio/")) {
    return `portfolio/shared/${publicUrl.replace("/media/portfolio/", "")}`;
  }

  return null;
}

function rewriteAsset(asset, mediaId) {
  if (!asset) return undefined;

  const nextAsset = {
    type: asset.type || "image",
  };

  const storageKey = asset.storageKey || inferPortfolioStorageKey(asset.url, mediaId);
  const posterStorageKey = asset.posterStorageKey || inferPortfolioStorageKey(asset.poster, mediaId);

  if (storageKey) {
    nextAsset.storageKey = storageKey;
  }

  if (posterStorageKey) {
    nextAsset.posterStorageKey = posterStorageKey;
  }

  if (asset.alt) {
    nextAsset.alt = asset.alt;
  }

  if (asset.caption) {
    nextAsset.caption = asset.caption;
  }

  return nextAsset;
}

async function uploadLocalFile(publicUrl, storageKey, uploadedKeys) {
  if (!publicUrl || !storageKey || uploadedKeys.has(storageKey)) {
    return;
  }

  const absolutePath = publicUrlToAbsoluteFilePath(publicUrl);
  const buffer = await fs.readFile(absolutePath);
  const { error } = await supabase.storage.from(bucket).upload(storageKey, buffer, {
    upsert: true,
    contentType: detectContentType(absolutePath),
  });

  if (error) {
    throw new Error(`Failed to upload ${publicUrl} -> ${storageKey}: ${error.message}`);
  }

  uploadedKeys.add(storageKey);
}

async function uploadExplicitAssets(uploadedKeys) {
  for (const item of explicitAssetMappings) {
    await uploadLocalFile(item.localUrl, item.storageKey, uploadedKeys);
  }
}

function collectAssetUploads(frontmatter, mediaId) {
  const uploads = [];

  if (frontmatter.heroMedia?.url) {
    const storageKey = inferPortfolioStorageKey(frontmatter.heroMedia.url, mediaId);
    if (storageKey) {
      uploads.push({ publicUrl: frontmatter.heroMedia.url, storageKey });
    }
  }

  if (frontmatter.heroMedia?.poster) {
    const storageKey = inferPortfolioStorageKey(frontmatter.heroMedia.poster, mediaId);
    if (storageKey) {
      uploads.push({ publicUrl: frontmatter.heroMedia.poster, storageKey });
    }
  }

  for (const item of frontmatter.gallery || []) {
    if (item.url) {
      const storageKey = inferPortfolioStorageKey(item.url, mediaId);
      if (storageKey) {
        uploads.push({ publicUrl: item.url, storageKey });
      }
    }

    if (item.poster) {
      const storageKey = inferPortfolioStorageKey(item.poster, mediaId);
      if (storageKey) {
        uploads.push({ publicUrl: item.poster, storageKey });
      }
    }
  }

  return uploads;
}

async function migratePortfolioFiles(uploadedKeys) {
  const files = (await fs.readdir(contentDir)).filter((file) => file.endsWith(".md"));

  for (const fileName of files) {
    const absolutePath = path.join(contentDir, fileName);
    const raw = await fs.readFile(absolutePath, "utf-8");
    const parsed = matter(raw);
    const currentFrontmatter = parsed.data || {};
    const slug = String(currentFrontmatter.slug || fileName.replace(/\.md$/, ""));
    const mediaId = String(currentFrontmatter.mediaId || slug);

    for (const item of collectAssetUploads(currentFrontmatter, mediaId)) {
      await uploadLocalFile(item.publicUrl, item.storageKey, uploadedKeys);
    }

    const nextFrontmatter = {
      ...currentFrontmatter,
      mediaId,
      heroMedia: rewriteAsset(currentFrontmatter.heroMedia, mediaId),
      gallery: (currentFrontmatter.gallery || []).map((item) => rewriteAsset(item, mediaId)),
    };

    const nextRaw = matter.stringify(parsed.content.trim(), nextFrontmatter).trimEnd() + "\n";
    await fs.writeFile(absolutePath, nextRaw, "utf-8");
  }
}

async function main() {
  const uploadedKeys = new Set();

  await uploadExplicitAssets(uploadedKeys);
  await migratePortfolioFiles(uploadedKeys);

  console.log(`Migrated content media to Supabase bucket "${bucket}". Uploaded ${uploadedKeys.size} objects.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
