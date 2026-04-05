import { createClient } from "@supabase/supabase-js";
import { getContentMediaBucket, getContentMediaPublicUrl } from "@/lib/content-media";
import { base64ToBytes } from "./base64";
import type { UploadedBinaryFile } from "./portfolio-admin";

type ContentMediaConfig = {
  url: string;
  serviceRoleKey: string;
  bucket: string;
};

function getContentMediaConfig(): ContentMediaConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "") || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const bucket = process.env.SUPABASE_STORAGE_BUCKET_CONTENT?.trim() || getContentMediaBucket();

  if (!url || !serviceRoleKey || !bucket) {
    return null;
  }

  return { url, serviceRoleKey, bucket };
}

function requireContentMediaConfig() {
  const config = getContentMediaConfig();
  if (!config) {
    throw new Error("Supabase 콘텐츠 스토리지 설정이 없습니다.");
  }
  return config;
}

function createStorageClient() {
  const config = requireContentMediaConfig();
  return {
    bucket: config.bucket,
    client: createClient(config.url, config.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
  };
}

function detectContentType(fileName: string) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".mp4")) return "video/mp4";
  if (lowerName.endsWith(".png")) return "image/png";
  if (lowerName.endsWith(".webp")) return "image/webp";
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";

  return "application/octet-stream";
}

export function isContentMediaStorageConfigured() {
  return Boolean(getContentMediaConfig());
}

export async function uploadContentMediaFile(storageKey: string, file: UploadedBinaryFile) {
  const { client, bucket } = createStorageClient();
  const binary = base64ToBytes(file.contentBase64);
  const { error } = await client.storage.from(bucket).upload(storageKey, binary, {
    upsert: true,
    contentType: detectContentType(file.name),
  });

  if (error) {
    throw new Error(`Supabase 업로드에 실패했습니다: ${error.message}`);
  }

  return {
    storageKey,
    publicUrl: getContentMediaPublicUrl(storageKey),
  };
}

export async function uploadContentMediaBuffer(storageKey: string, buffer: Uint8Array, fileName: string) {
  const { client, bucket } = createStorageClient();
  const { error } = await client.storage.from(bucket).upload(storageKey, buffer, {
    upsert: true,
    contentType: detectContentType(fileName),
  });

  if (error) {
    throw new Error(`Supabase 업로드에 실패했습니다: ${error.message}`);
  }

  return {
    storageKey,
    publicUrl: getContentMediaPublicUrl(storageKey),
  };
}

export async function copyContentMediaFile(fromStorageKey: string, toStorageKey: string) {
  const { client, bucket } = createStorageClient();
  const { error } = await client.storage.from(bucket).copy(fromStorageKey, toStorageKey);

  if (error) {
    throw new Error(`Supabase 파일 복제에 실패했습니다: ${error.message}`);
  }

  return {
    storageKey: toStorageKey,
    publicUrl: getContentMediaPublicUrl(toStorageKey),
  };
}

export async function deleteContentMediaFiles(storageKeys: string[]) {
  const uniqueKeys = [...new Set(storageKeys.filter(Boolean))];
  if (uniqueKeys.length === 0) return;

  const { client, bucket } = createStorageClient();
  const { error } = await client.storage.from(bucket).remove(uniqueKeys);

  if (error) {
    throw new Error(`Supabase 파일 삭제에 실패했습니다: ${error.message}`);
  }
}
