import type { LocalDatabase } from "@/lib/local-db/db-types";
import { appendAuditToDb } from "@/lib/local-db/audit-entry";
import type { BackupSnapshot, RestorePoint } from "@/lib/platform-os/types";
import type { UserProfile } from "@/lib/types";

function countRecords(db: LocalDatabase): Record<string, number> {
  return {
    users: db.users.length,
    groups: db.groups.length,
    tasks: db.tasks.length,
    events: db.events.length,
    gallery: db.gallery.length,
    notifications: db.notifications.length,
    shopOrders: db.shopOrders.length
  };
}

export function createBackupSnapshot(
  db: LocalDatabase,
  user: Pick<UserProfile, "id" | "name" | "studioId" | "permissions">,
  label: string,
  scope: "platform" | "studio" = "platform",
  studioId?: string
): LocalDatabase {
  const payload = scope === "studio" && studioId ? filterDbForStudio(db, studioId) : db;
  const json = JSON.stringify(payload);
  const snapshot: BackupSnapshot = {
    id: `bak_${Date.now().toString(36)}`,
    label,
    createdAt: new Date().toISOString(),
    createdByUserId: user.id,
    createdByName: user.name,
    scope,
    studioId: scope === "studio" ? studioId : undefined,
    payload,
    byteSize: json.length,
    recordCounts: countRecords(db),
    schemaVersion: db.systemSettings.databaseSchemaVersion
  };
  const restorePoint: RestorePoint = {
    id: `rp_${snapshot.id}`,
    backupId: snapshot.id,
    label: `נקודת שחזור · ${label}`,
    createdAt: snapshot.createdAt,
    scope,
    studioId: snapshot.studioId
  };
  let next: LocalDatabase = {
    ...db,
    platformOs: {
      ...db.platformOs,
      backups: [snapshot, ...db.platformOs.backups].slice(0, 20),
      restorePoints: [restorePoint, ...db.platformOs.restorePoints].slice(0, 20),
      systemStatus: {
        ...db.platformOs.systemStatus,
        lastBackupAt: snapshot.createdAt,
        updatedAt: new Date().toISOString()
      }
    }
  };
  next = appendAuditToDb(next, user, {
    action: "גיבוי נוצר",
    targetType: "backup",
    targetId: snapshot.id,
    severity: "info",
    studioId: user.studioId
  });
  return next;
}

function filterDbForStudio(db: LocalDatabase, studioId: string): Partial<LocalDatabase> {
  return {
    version: db.version,
    studios: db.studios.filter((s) => s.id === studioId),
    users: db.users.filter((u) => u.studioId === studioId),
    groups: db.groups.filter((g) => g.studioId === studioId),
    tasks: db.tasks.filter((t) => t.studioId === studioId),
    events: db.events,
    gallery: db.gallery.filter((g) => g.studioId === studioId),
    notifications: db.notifications.filter((n) => n.studioId === studioId)
  };
}

export function restoreFromBackup(
  db: LocalDatabase,
  user: Pick<UserProfile, "id" | "name" | "studioId" | "permissions">,
  backupId: string
): LocalDatabase | null {
  const backup = db.platformOs.backups.find((b) => b.id === backupId);
  if (!backup || typeof backup.payload !== "object") return null;
  const restored = backup.payload as LocalDatabase;
  const points = db.platformOs.restorePoints.map((p) =>
    p.backupId === backupId ? { ...p, restoredAt: new Date().toISOString(), restoredByUserId: user.id } : p
  );
  let next: LocalDatabase = {
    ...restored,
    platformOs: {
      ...db.platformOs,
      ...restored.platformOs,
      restorePoints: points,
      backups: db.platformOs.backups
    },
    auditLog: db.auditLog
  };
  next = appendAuditToDb(next, user, {
    action: "שחזור מגיבוי",
    targetType: "backup",
    targetId: backupId,
    severity: "warning",
    studioId: user.studioId
  });
  return next;
}

export function downloadBackupJson(snapshot: BackupSnapshot): void {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lk-backup-${snapshot.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function compareBackupMetadata(a: BackupSnapshot, b: BackupSnapshot): { key: string; a: number; b: number }[] {
  const keys = new Set([...Object.keys(a.recordCounts), ...Object.keys(b.recordCounts)]);
  return Array.from(keys).map((key) => ({
    key,
    a: a.recordCounts[key] ?? 0,
    b: b.recordCounts[key] ?? 0
  }));
}
