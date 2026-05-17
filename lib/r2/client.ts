import "server-only";

import type { R2Config, R2EnvKey } from "./types";

export const R2_MEDIA_BUCKET_FALLBACK = "academy-media";

export function getR2Config(): R2Config {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim();
  const configuredBucket = process.env.CLOUDFLARE_R2_BUCKET?.trim();
  const bucket = configuredBucket || R2_MEDIA_BUCKET_FALLBACK;
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim();
  const missingEnv: R2EnvKey[] = [];

  if (!accountId) missingEnv.push("CLOUDFLARE_R2_ACCOUNT_ID");
  if (!accessKeyId) missingEnv.push("CLOUDFLARE_R2_ACCESS_KEY_ID");
  if (!secretAccessKey) missingEnv.push("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
  if (!configuredBucket) missingEnv.push("CLOUDFLARE_R2_BUCKET");
  if (!publicBaseUrl) missingEnv.push("CLOUDFLARE_R2_PUBLIC_BASE_URL");

  if (missingEnv.length > 0 || !accountId || !accessKeyId || !secretAccessKey || !configuredBucket || !publicBaseUrl) {
    return {
      configured: false,
      bucket,
      publicBaseUrl,
      missingEnv,
      reason: `Cloudflare R2 is not configured. Missing: ${missingEnv.join(", ")}. Real uploads are disabled; local previews are demo-only.`
    };
  }

  return {
    configured: true,
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket: configuredBucket,
    publicBaseUrl,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`
  };
}

export function assertR2ServerConfigured(): Extract<R2Config, { configured: true }> {
  const config = getR2Config();
  if (config.configured === false) throw new Error(config.reason);
  return config;
}
