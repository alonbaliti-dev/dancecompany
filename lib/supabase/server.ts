import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type ServerSupabaseEnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY";

export type SupabaseServerClientStatus =
  | {
      enabled: true;
      client: SupabaseClient;
      url: string;
      keyType: "anon" | "service_role";
      serviceRoleAvailable: boolean;
    }
  | {
      enabled: false;
      reason: string;
      missingEnv: ServerSupabaseEnvKey[];
      serviceRoleAvailable: false;
    };

type ServerClientCacheKey = "anon" | "service_role";

const serverClients: Partial<Record<ServerClientCacheKey, SupabaseClient>> = {};

function serverSupabaseEnv(preferServiceRole: boolean) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const serviceRoleAvailable = Boolean(serviceRoleKey);
  const key = preferServiceRole && serviceRoleKey ? serviceRoleKey : anonKey;
  const keyType: ServerClientCacheKey = preferServiceRole && serviceRoleKey ? "service_role" : "anon";
  const missingEnv: ServerSupabaseEnvKey[] = [];

  if (!url) missingEnv.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!key) missingEnv.push(preferServiceRole ? "SUPABASE_SERVICE_ROLE_KEY" : "NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return { url, key, keyType, missingEnv, serviceRoleAvailable };
}

export function getSupabaseServerClient(options: { preferServiceRole?: boolean } = {}): SupabaseServerClientStatus {
  const { url, key, keyType, missingEnv, serviceRoleAvailable } = serverSupabaseEnv(Boolean(options.preferServiceRole));

  if (missingEnv.length > 0 || !url || !key) {
    return {
      enabled: false,
      reason: options.preferServiceRole
        ? "Supabase service-role client is not configured. Server media writes will use dev-only metadata fallback."
        : "Supabase server client is not configured. Server media reads will use dev-only metadata fallback.",
      missingEnv,
      serviceRoleAvailable: false
    };
  }

  if (!serverClients[keyType]) {
    serverClients[keyType] = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  return {
    enabled: true,
    client: serverClients[keyType],
    url,
    keyType,
    serviceRoleAvailable
  };
}

export function isSupabaseServerConfigured(options: { requireServiceRole?: boolean } = {}) {
  return getSupabaseServerClient({ preferServiceRole: options.requireServiceRole }).enabled;
}
