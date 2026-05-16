import type { LocalDatabase } from "@/lib/local-db/db-types";
import type { ConsentType, StudentConsentRecord } from "@/lib/platform-os/types";
import { logActivity } from "./activity-feed-service";

export const CONSENT_LABELS: Record<ConsentType, string> = {
  photography: "צילום",
  video_upload: "העלאת וידאו",
  public_media: "פרסום מדיה",
  performance_participation: "השתתפות במופע",
  emergency_contact: "איש קשר חירום",
  app_terms: "תנאי שימוש",
  privacy_policy: "מדיניות פרטיות"
};

export function getConsentsForStudent(db: LocalDatabase, studentUserId: string): StudentConsentRecord[] {
  return db.consents.records.filter((c) => c.studentUserId === studentUserId);
}

export function getMissingConsents(db: LocalDatabase, studioId: string, studentUserId: string): ConsentType[] {
  const required: ConsentType[] = ["photography", "app_terms", "privacy_policy", "performance_participation"];
  return required.filter(
    (ct) =>
      !db.consents.records.some(
        (c) =>
          c.studentUserId === studentUserId &&
          c.studioId === studioId &&
          c.consentType === ct &&
          c.status === "approved" &&
          (!c.expiresAt || c.expiresAt > new Date().toISOString())
      )
  );
}

export function upsertConsent(
  db: LocalDatabase,
  record: Omit<StudentConsentRecord, "id" | "updatedAt"> & { id?: string }
): LocalDatabase {
  const now = new Date().toISOString();
  const id = record.id ?? `consent_${Date.now().toString(36)}`;
  const existing = db.consents.records.findIndex((c) => c.id === id);
  const row: StudentConsentRecord = { ...record, id, updatedAt: now };
  const records =
    existing >= 0
      ? db.consents.records.map((c, i) => (i === existing ? row : c))
      : [row, ...db.consents.records];
  let next = { ...db, consents: { records } };
  next = logActivity(next, record.studioId, "consent", `עודכן אישור: ${CONSENT_LABELS[record.consentType]}`, {
    targetUserIds: [record.studentUserId],
    visibility: "personal",
    relatedType: "consent",
    relatedId: id
  });
  return next;
}
