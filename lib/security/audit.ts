import type { AuditLogEntry } from "@/lib/types";
import type { CreateAuditLogInput } from "./types";

const ACTION_LABELS: Record<string, string> = {
  permission_changed: "שינוי הרשאות משתמש",
  user_disabled: "משתמש הושבת",
  message_removed: "הודעה הוסרה",
  gallery_visibility_changed: "שינוי נראות גלריה",
  event_edited: "אירוע עודכן",
  task_edited: "משימה עודכנה",
  notification_sent: "התראה נשלחה",
  password_changed: "סיסמה שונתה",
  data_export_requested: "בקשת ייצוא נתונים",
  feature_flag_changed: "תכונה עודכנה",
  billing_changed: "חיוב עודכן",
  login: "התחברות",
  logout: "יציאה",
  content_filtered: "תוכן נחסם בצ׳אט"
};

function newAuditId(): string {
  return `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function formatAuditAction(input: CreateAuditLogInput): string {
  if (typeof input.action === "string" && !ACTION_LABELS[input.action]) return input.action;
  return ACTION_LABELS[input.action] ?? String(input.action);
}

/**
 * Build an audit row — persist via PlatformContext.appendAudit or Supabase insert.
 * Production: insert from Edge Function with service role; never trust client-only logging.
 */
export function createAuditLog(input: CreateAuditLogInput): Omit<AuditLogEntry, "id"> & { id: string } {
  const studioId = input.target?.studioId ?? input.actor.studioId;
  return {
    id: newAuditId(),
    studioId,
    actorUserId: input.actor.userId,
    actorName: input.actor.name,
    action: formatAuditAction(input),
    targetType: input.target?.type ?? "system",
    targetId: input.target?.id,
    timestamp: new Date().toISOString(),
    severity: input.severity ?? "info"
  };
}

export function auditActorFromUser(user: { id: string; name: string; studioId: string }): CreateAuditLogInput["actor"] {
  return { userId: user.id, name: user.name, studioId: user.studioId };
}
