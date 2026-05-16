/**
 * Shared entity conventions for LK Student Space.
 * All Supabase tables should mirror these fields (snake_case in DB, camelCase in app).
 */

/** UUID v4 in production; mock uses prefixed ids (`u_maya`, `st_*`). */
export type EntityId = string;

export type IsoDateString = string;
export type IsoDateTimeString = string;

/** Every tenant-owned row includes studio_id (RLS: auth.jwt()->studio_id). */
export type StudioScoped = {
  studioId: string;
};

/** Standard audit timestamps — DB: `created_at`, `updated_at` timestamptz. */
export type Timestamped = {
  createdAt: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
};

export type StudioScopedEntity = StudioScoped & { id: EntityId };

export type StudioScopedTimestamped = StudioScopedEntity & Timestamped;

/** Targeting pattern for tasks, updates, notifications. */
export type AudienceTargetType = "personal" | "group" | "studio";

export type AudienceTarget = {
  targetType: AudienceTargetType;
  assignedStudentIds?: EntityId[];
  assignedGroupIds?: EntityId[];
};
