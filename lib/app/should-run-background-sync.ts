/**
 * Background /api/local-db/read sync is optional.
 * Production (Vercel) and mobile Safari should open instantly from the bundled JSON only.
 */
export function shouldRunBackgroundDatabaseSync(): boolean {
  if (typeof window === "undefined") return false;

  if (process.env.NEXT_PUBLIC_ENABLE_DB_SYNC === "true") return true;
  if (process.env.NEXT_PUBLIC_ENABLE_DB_SYNC === "false") return false;

  const host = window.location.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".local") ||
    /^192\.168\.\d+\.\d+$/.test(host) ||
    /^10\.\d+\.\d+\.\d+$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(host);

  if (isLocal) return true;

  // Vercel / public hosts: bundled database only (no blocking fetch).
  if (process.env.NODE_ENV === "production") return false;

  return isLocal;
}
