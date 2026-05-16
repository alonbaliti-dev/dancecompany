import type { LocalDatabase } from "@/lib/local-db/db-types";
import type { SoftDeleteMeta } from "@/lib/types";

export function softDelete<T extends SoftDeleteMeta>(
  entity: T,
  deletedByUserId: string,
  archive = false
): T {
  const now = new Date().toISOString();
  return {
    ...entity,
    ...(archive ? { archivedAt: now } : {}),
    deletedAt: now,
    deletedByUserId,
    restoredAt: undefined
  };
}

export function restoreSoftDeleted<T extends SoftDeleteMeta>(entity: T): T {
  return {
    ...entity,
    deletedAt: undefined,
    deletedByUserId: undefined,
    restoredAt: new Date().toISOString()
  };
}

export function isActive<T extends SoftDeleteMeta>(entity: T): boolean {
  return !entity.deletedAt;
}

export function archiveSeason(
  db: LocalDatabase,
  seasonId: string,
  userId: string
): LocalDatabase {
  const now = new Date().toISOString();
  return {
    ...db,
    seasons: {
      seasons: db.seasons.seasons.map((s) =>
        s.id === seasonId ? { ...s, isActive: false, archivedAt: now } : s
      )
    },
    groups: db.groups.map((g) =>
      g.seasonId === seasonId ? softDelete(g, userId, true) : g
    ),
    tasks: db.tasks.map((t) => (t.seasonId === seasonId ? softDelete(t, userId, true) : t))
  };
}
