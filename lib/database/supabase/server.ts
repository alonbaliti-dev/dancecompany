/**
 * Server Supabase client — Route Handlers, Server Components, Edge Functions.
 * Use service role ONLY in trusted server contexts (never bundle to client).
 *
 * ```ts
 * import { createServerClient } from '@supabase/ssr';
 * import { cookies } from 'next/headers';
 * ```
 *
 * Edge Functions: validate JWT, then use user-scoped client or service role for admin jobs.
 */
import type { SupabaseClient } from "./client";

export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return null;
}

export function getSupabaseServiceRole(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return null;
  return null;
}
