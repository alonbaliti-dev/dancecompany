import "server-only";

import { getAuthMode } from "@/lib/auth/auth-mode";
import type { VerifiedAcademySession } from "@/lib/auth/academy-session";
import { requireAcademyScope, type AcademyScopedActor, type AcademyScopedQuery } from "@/lib/security/academy-scope";

export type RepositoryWriteContext = AcademyScopedQuery & {
  actor: AcademyScopedActor;
  verified: true;
  source: "academy_phone_session" | "supabase_auth" | "local_demo";
};

export function repositoryContextFromSession(session: VerifiedAcademySession): RepositoryWriteContext {
  return {
    academyId: session.academyId,
    actor: session.actor,
    verified: true,
    source: session.authMethod === "academy_phone" ? "academy_phone_session" : "supabase_auth"
  };
}

export function requireRepositoryWriteContext(context?: Partial<RepositoryWriteContext> | null): RepositoryWriteContext {
  if (!context?.verified || !context.actor?.userId) {
    throw new Error("Verified repository context is required for production writes.");
  }

  requireAcademyScope({ academyId: context.academyId ?? "" });

  if (getAuthMode() === "supabase" && context.source !== "supabase_auth" && context.source !== "academy_phone_session") {
    throw new Error("Supabase writes require a verified academy session.");
  }

  return context as RepositoryWriteContext;
}
