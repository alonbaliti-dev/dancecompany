/**
 * Studio data isolation — every tenant row carries `studioId`.
 *
 * Supabase Row Level Security (RLS) must enforce:
 * - `studio_id = auth.jwt() -> studio_id` for management/teacher/student roles.
 * - Teachers: additional join/filter on `group_members` for assigned groups only.
 * - Students: `user_id = auth.uid()` OR group membership for shared resources.
 * - Super admin: separate `platform_admin` role + server-only service role for cross-studio ops.
 *   Never expose service role to the browser; use Edge Functions / API routes.
 */
import type { UserProfile } from "@/lib/types";

export function sameStudio(user: Pick<UserProfile, "studioId">, rowStudioId: string): boolean {
  return user.studioId === rowStudioId;
}

/** Management and below: row must belong to user's studio. Super admin may cross studios when auditing. */
export function canAccessStudioRow(user: UserProfile, rowStudioId: string): boolean {
  if (user.permissions.isSuperAdmin) return true;
  return sameStudio(user, rowStudioId);
}

export function assertStudioScope(user: UserProfile, rowStudioId: string): boolean {
  return canAccessStudioRow(user, rowStudioId);
}

/**
 * Production query hint (PostgREST / Supabase):
 * `.eq('studio_id', session.studioId)` on all studio-scoped tables.
 */
export function studioScopeFilter(user: UserProfile): { studioId: string } | null {
  if (user.permissions.isSuperAdmin) return null;
  return { studioId: user.studioId };
}
