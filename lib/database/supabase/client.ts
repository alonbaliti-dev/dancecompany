/**
 * Browser Supabase client (anon key + RLS).
 *
 * Production wiring:
 * ```ts
 * import { createBrowserClient } from '@supabase/ssr';
 * export function getSupabaseBrowser() {
 *   return createBrowserClient(
 *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 *   );
 * }
 * ```
 *
 * Realtime: `supabase.channel('studio:${studioId}:notifications')`
 * Storage: `supabase.storage.from('gallery').upload(path, file)`
 */
/** Install `@supabase/supabase-js` + `@supabase/ssr` when wiring production. */
export type SupabaseClient = {
  from: (table: string) => unknown;
  auth: unknown;
  storage: unknown;
  channel: (name: string) => unknown;
};

export type Database = Record<string, never>;

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (browserClient) return browserClient;
  // Lazy init when @supabase/supabase-js is installed:
  // browserClient = createBrowserClient<Database>(url, key);
  return null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
