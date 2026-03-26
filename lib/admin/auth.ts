import { ADMIN_SESSION_MAX_AGE } from "./constants";

function toBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function createKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signValue(value: string, secret: string) {
  const key = await createKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(userId: string, secret: string) {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  const payload = `${userId}:${expiresAt}`;
  const signature = await signValue(payload, secret);

  return `${userId}.${expiresAt}.${signature}`;
}

export async function verifySessionToken(token: string | undefined, secret: string) {
  if (!token) return null;

  const [userId, expiresAt, signature] = token.split(".");
  if (!userId || !expiresAt || !signature) return null;

  const payload = `${userId}:${expiresAt}`;
  const expectedSignature = await signValue(payload, secret);
  if (signature !== expectedSignature) return null;

  const expiresAtNumber = Number(expiresAt);
  if (!Number.isFinite(expiresAtNumber) || expiresAtNumber <= Date.now()) {
    return null;
  }

  return {
    userId,
    expiresAt: expiresAtNumber,
  };
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function encodeFileContent(value: string) {
  return toBase64Url(new TextEncoder().encode(value));
}

export function decodeFileContent(value: string) {
  return new TextDecoder().decode(fromBase64Url(value));
}

