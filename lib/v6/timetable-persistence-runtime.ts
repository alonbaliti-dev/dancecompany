import { createV6NoopTimetablePersistenceAdapter, type V6TimetablePersistenceAdapter, type V6TimetablePersistenceContext } from "@/lib/v6/timetable-persistence-adapter";
import { createV6SupabaseTimetablePersistenceAdapter, type V6SupabaseTimetablePersistenceAdapter, type V6TimetableSupabaseClientLike } from "@/lib/v6/timetable-supabase-adapter";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { V6Database, V6User } from "@/lib/v6/types";

export const V6_TIMETABLE_SUPABASE_PERSISTENCE_FLAG = "v6TimetableSupabasePersistence";

export type V6TimetablePersistenceRuntimeStatus =
  | "disabled"
  | "ready"
  | "unavailable";

export type V6TimetablePersistenceRuntimeScope = {
  academyId: string;
  timetableId: string;
  academyName?: string;
};

export type V6TimetablePersistenceRuntime = {
  flagEnabled: boolean;
  status: V6TimetablePersistenceRuntimeStatus;
  statusLabel: string;
  scope: V6TimetablePersistenceRuntimeScope | null;
  context: V6TimetablePersistenceContext | null;
  adapter: V6TimetablePersistenceAdapter;
  supabaseAdapter?: V6SupabaseTimetablePersistenceAdapter;
  unavailableReason?: string;
};

function isNonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function selectActiveAcademyId(db: V6Database, user: V6User) {
  const academyIds = new Set([
    user.activeAcademyId,
    user.academyId,
    ...(user.academyIds ?? []),
    user.studioId
  ].filter(isNonEmptyText));

  const academies = [...(db.academies ?? []), ...db.studios];
  return academies.find((academy) => academyIds.has(academy.id))?.id ?? [...academyIds][0];
}

export function selectV6TimetablePersistenceScope(input: {
  db: V6Database;
  user: V6User;
}): V6TimetablePersistenceRuntimeScope | null {
  const academyId = selectActiveAcademyId(input.db, input.user);
  if (!isNonEmptyText(academyId)) return null;

  const academy = [...(input.db.academies ?? []), ...input.db.studios].find((item) => item.id === academyId);
  return {
    academyId,
    timetableId: `${academyId}:management-weekly`,
    academyName: academy?.branding.displayName ?? academy?.name
  };
}

export function createV6TimetablePersistenceRuntime(input: {
  db: V6Database;
  user: V6User;
}): V6TimetablePersistenceRuntime {
  const noopAdapter = createV6NoopTimetablePersistenceAdapter();
  const flagEnabled = input.db.featureFlags[V6_TIMETABLE_SUPABASE_PERSISTENCE_FLAG] === true;
  const scope = selectV6TimetablePersistenceScope(input);
  const context = scope
    ? {
      academyId: scope.academyId,
      timetableId: scope.timetableId,
      actorId: input.user.id,
      source: "v6-management-home"
    }
    : null;

  if (!flagEnabled) {
    return {
      flagEnabled,
      status: "disabled",
      statusLabel: "התמדה חיצונית כבויה",
      scope,
      context,
      adapter: noopAdapter
    };
  }

  if (!context) {
    return {
      flagEnabled,
      status: "unavailable",
      statusLabel: "התמדה לא זמינה",
      scope,
      context,
      adapter: noopAdapter,
      unavailableReason: "Missing academy or timetable scope."
    };
  }

  if (typeof window === "undefined") {
    return {
      flagEnabled,
      status: "unavailable",
      statusLabel: "Supabase זמין רק בדפדפן",
      scope,
      context,
      adapter: noopAdapter,
      unavailableReason: "Browser Supabase client cannot be created outside the browser runtime."
    };
  }

  const supabase = getSupabaseBrowserClient();
  if (supabase.enabled === false) {
    return {
      flagEnabled,
      status: "unavailable",
      statusLabel: "Supabase לא מוגדר",
      scope,
      context,
      adapter: noopAdapter,
      unavailableReason: supabase.reason
    };
  }

  const supabaseAdapter = createV6SupabaseTimetablePersistenceAdapter({
    client: supabase.client as unknown as V6TimetableSupabaseClientLike
  });

  return {
    flagEnabled,
    status: "ready",
    statusLabel: "Supabase פעיל",
    scope,
    context,
    adapter: supabaseAdapter,
    supabaseAdapter
  };
}
