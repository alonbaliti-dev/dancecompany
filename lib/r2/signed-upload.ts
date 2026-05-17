import "server-only";

import { createHmac, createHash } from "crypto";
import { sanitizeMediaFileName } from "@/lib/domains/media/media-repository";
import type { MediaVisibility } from "@/lib/supabase/types";
import { assertR2ServerConfigured, getR2Config } from "./client";
import type { CreateUploadUrlRequest, CreateUploadUrlResponse, MediaUploadContext } from "./types";

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
const MAX_IMAGE_UPLOAD_BYTES = 25 * 1024 * 1024;
const SIGNED_UPLOAD_EXPIRY_SECONDS = 10 * 60;
const SIGNED_READ_EXPIRY_SECONDS = 10 * 60;
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]);
const ALLOWED_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function encodeR2Key(key: string) {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function safeSegment(value: string | undefined, fallback: string) {
  return sanitizeMediaFileName(value ?? fallback).replace(/\./g, "-") || fallback;
}

function assertUploadRequest(input: Partial<CreateUploadUrlRequest>): asserts input is CreateUploadUrlRequest {
  if (!input.academyId?.trim()) throw new Error("academyId is required.");
  if (!input.actorUserId?.trim()) throw new Error("actorUserId is required.");
  if (!input.fileName?.trim()) throw new Error("fileName is required.");
  if (!input.mimeType?.trim()) throw new Error("mimeType is required.");
  if (!input.fileSize || input.fileSize <= 0 || input.fileSize > MAX_UPLOAD_BYTES) throw new Error("fileSize must be between 1 byte and 500 MB.");
  if (input.mediaType !== "image" && input.mediaType !== "video") throw new Error("Only image and video uploads are supported.");
  if (input.mediaType === "image" && input.fileSize > MAX_IMAGE_UPLOAD_BYTES) throw new Error("Images must be 25 MB or smaller.");
  if (input.mediaType === "image" && !ALLOWED_IMAGE_MIME_TYPES.has(input.mimeType)) throw new Error("Unsupported image type.");
  if (input.mediaType === "video" && !ALLOWED_VIDEO_MIME_TYPES.has(input.mimeType)) throw new Error("Unsupported video type.");
  if (input.visibility === "shop_public" && input.mediaType !== "image") throw new Error("Product media uploads must be images.");
  if (!input.visibility) throw new Error("visibility is required.");
}

function signedR2Url(options: { method: "GET" | "PUT"; key: string; expiresInSeconds: number }) {
  const config = assertR2ServerConfigured();
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const signedHeaders = "host";
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${config.bucket}/${encodeR2Key(options.key)}`;
  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${config.accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(options.expiresInSeconds),
    "X-Amz-SignedHeaders": signedHeaders
  });
  const canonicalQuery = Array.from(query.entries())
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .sort()
    .join("&");
  const canonicalRequest = [options.method, canonicalUri, canonicalQuery, `host:${host}\n`, signedHeaders, "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hash(canonicalRequest)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${config.secretAccessKey}`, dateStamp), region), service), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  query.set("X-Amz-Signature", signature);

  return `${config.endpoint}${canonicalUri}?${query.toString()}`;
}

export function buildR2ObjectKey(context: MediaUploadContext, mediaItemId: string, fileName: string, visibility: MediaVisibility) {
  const academyId = safeSegment(context.academyId, "unknown-academy");
  const suffix = `${safeSegment(mediaItemId, "media")}-${sanitizeMediaFileName(fileName)}`;

  if (context.productId || visibility === "shop_public") return `academies/${academyId}/shop/products/${safeSegment(context.productId, "uncategorized")}/${suffix}`;
  if (context.eventId || visibility === "event_public") return `academies/${academyId}/events/${safeSegment(context.eventId, "uncategorized")}/${suffix}`;
  if (context.studentId) return `academies/${academyId}/students/${safeSegment(context.studentId, "student")}/submissions/${suffix}`;
  if (context.groupId && context.classId) {
    return `academies/${academyId}/groups/${safeSegment(context.groupId, "group")}/lessons/${safeSegment(context.classId, "class")}/${safeSegment(context.lessonDate, "undated")}/${suffix}`;
  }
  if (visibility === "legacy_public") return `academies/${academyId}/legacy/${suffix}`;

  return `academies/${academyId}/media/${suffix}`;
}

export async function createR2SignedUpload(input: Partial<CreateUploadUrlRequest>): Promise<CreateUploadUrlResponse> {
  assertUploadRequest(input);

  const config = getR2Config();
  const mediaItemId = crypto.randomUUID();
  const r2Key = buildR2ObjectKey(input, mediaItemId, input.fileName, input.visibility);

  if (config.configured === false) {
    return {
      ok: true,
      mode: "local_demo",
      mediaItemId,
      bucket: config.bucket,
      r2Key,
      reason: config.reason
    };
  }

  return {
    ok: true,
    mode: "r2",
    mediaItemId,
    uploadUrl: signedR2Url({ method: "PUT", key: r2Key, expiresInSeconds: SIGNED_UPLOAD_EXPIRY_SECONDS }),
    method: "PUT",
    headers: {
      "content-type": input.mimeType
    },
    bucket: config.bucket,
    r2Key,
    expiresInSeconds: SIGNED_UPLOAD_EXPIRY_SECONDS
  };
}

export function createR2SignedReadUrl(key: string) {
  return {
    url: signedR2Url({ method: "GET", key, expiresInSeconds: SIGNED_READ_EXPIRY_SECONDS }),
    expiresInSeconds: SIGNED_READ_EXPIRY_SECONDS
  };
}
