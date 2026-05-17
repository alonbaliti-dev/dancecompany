import { getSupabaseServerClient } from "@/lib/supabase/server";

export type RepositoryMode = "local_demo" | "supabase";

export function getRepositoryMode(options: { requireServiceRole?: boolean } = {}): {
  mode: RepositoryMode;
  reason: string;
} {
  const client = getSupabaseServerClient({ preferServiceRole: options.requireServiceRole });

  if (client.enabled === false) {
    return {
      mode: "local_demo",
      reason: client.reason
    };
  }

  return {
    mode: "supabase",
    reason: client.keyType === "service_role" ? "Using Supabase service-role client in a trusted server context." : "Using Supabase anon server client."
  };
}
