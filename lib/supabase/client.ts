import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseClientStatus =
  | {
      enabled: true;
      client: SupabaseClient;
      url: string;
      usingAnonKey: true;
    }
  | {
      enabled: false;
      reason: string;
      missingEnv: Array<"NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY">;
    };

let browserClient: SupabaseClient | null = null;

function publicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const missingEnv: Array<"NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"> = [];

  if (!url) missingEnv.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missingEnv.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return { url, anonKey, missingEnv };
}

export function getSupabaseBrowserClient(): SupabaseClientStatus {
  const { url, anonKey, missingEnv } = publicSupabaseEnv();

  if (missingEnv.length > 0 || !url || !anonKey) {
    return {
      enabled: false,
      reason: "Supabase browser client is not configured. Media will use dev-only metadata fallback.",
      missingEnv
    };
  }

  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  return { enabled: true, client: browserClient, url, usingAnonKey: true };
}

export function isSupabaseBrowserConfigured() {
  return getSupabaseBrowserClient().enabled;
}
