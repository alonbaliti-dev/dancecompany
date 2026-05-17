import type { EntityId, IsoDateTimeString } from "@/lib/types/base";
import type { OfflineQueueDomain } from "@/lib/reliability/offline-queue-types";

export type LiveIncidentSeverity = "p0" | "p1" | "p2" | "p3";

export type LiveIncidentKind =
  | "upload_failure"
  | "payment_failure"
  | "auth_failure"
  | "webhook_failure"
  | "broken_gallery"
  | "notification_issue"
  | "sync_issue"
  | "weak_internet_failure";

export type LiveIncidentStatus = "new" | "triaged" | "mitigating" | "monitoring" | "resolved" | "accepted_risk";

export type LiveIncidentRecoveryAction =
  | "retry_now"
  | "queue_for_retry"
  | "show_user_guidance"
  | "notify_admin"
  | "reconcile_provider"
  | "pause_flow"
  | "rollback_release"
  | "manual_support";

export type LiveIncidentDraft = {
  id: string;
  academyId: EntityId;
  kind: LiveIncidentKind;
  severity: LiveIncidentSeverity;
  status: LiveIncidentStatus;
  titleHe: string;
  userMessageHe: string;
  adminDiagnosisHe: string;
  safeMetadata: Record<string, string | number | boolean | null>;
  recoveryActions: LiveIncidentRecoveryAction[];
  retry?: {
    queueDomain: OfflineQueueDomain;
    maxAttempts: number;
    nextRetryAt?: IsoDateTimeString;
  };
  ownerUserId?: EntityId;
  openedAt: IsoDateTimeString;
  resolvedAt?: IsoDateTimeString;
};

export type LiveIncidentPlaybook = {
  kind: LiveIncidentKind;
  defaultSeverity: LiveIncidentSeverity;
  userMessageHe: string;
  adminDiagnosisHe: string;
  recoveryActions: LiveIncidentRecoveryAction[];
  rollbackTrigger: boolean;
};

export const phase9IncidentPlaybooks: readonly LiveIncidentPlaybook[] = [
  {
    kind: "upload_failure",
    defaultSeverity: "p1",
    userMessageHe: "ההעלאה לא הושלמה. אפשר לנסות שוב, והקובץ לא פורסם עד שההעלאה מצליחה.",
    adminDiagnosisHe: "בדקו חיבור, גודל קובץ, חתימת העלאה, השלמת מטא־דאטה וסטטוס R2.",
    recoveryActions: ["queue_for_retry", "show_user_guidance", "notify_admin"],
    rollbackTrigger: false
  },
  {
    kind: "payment_failure",
    defaultSeverity: "p1",
    userMessageHe: "התשלום לא הושלם. אין חיוב נוסף בלי אישור, והצוות יכול לבדוק את ההזמנה.",
    adminDiagnosisHe: "השוו סטטוס הזמנה מול ספק התשלום, webhook ולוגים לפני שינוי ידני.",
    recoveryActions: ["reconcile_provider", "notify_admin", "manual_support"],
    rollbackTrigger: false
  },
  {
    kind: "auth_failure",
    defaultSeverity: "p1",
    userMessageHe: "לא הצלחנו לאמת את הכניסה. נסו שוב או פנו לתמיכה.",
    adminDiagnosisHe: "בדקו מצב Auth, שיוך אקדמיה, תפקיד, הרשאות ו-reset סיסמה.",
    recoveryActions: ["show_user_guidance", "notify_admin", "manual_support"],
    rollbackTrigger: true
  },
  {
    kind: "webhook_failure",
    defaultSeverity: "p1",
    userMessageHe: "עדכון חיצוני מתעכב. הצוות יבדוק לפני שינוי ידני.",
    adminDiagnosisHe: "בדקו חתימה, idempotency, payload בטוח, ניסיון חוזר וסטטוס ספק.",
    recoveryActions: ["reconcile_provider", "queue_for_retry", "notify_admin"],
    rollbackTrigger: false
  },
  {
    kind: "broken_gallery",
    defaultSeverity: "p1",
    userMessageHe: "הגלריה לא נטענה כרגע. התמונות נשארות שמורות ונבדוק את הגישה.",
    adminDiagnosisHe: "בדקו הרשאות צפייה, מפתחות R2, מטא־דאטה, collection וסטטוס moderation.",
    recoveryActions: ["show_user_guidance", "notify_admin", "manual_support"],
    rollbackTrigger: false
  },
  {
    kind: "notification_issue",
    defaultSeverity: "p2",
    userMessageHe: "ייתכן שהתראה לא נשלחה. מידע חשוב צריך להישלח גם בערוץ גיבוי.",
    adminDiagnosisHe: "בדקו הסכמה, הרשמת מכשיר, ספק, retry וערוץ חלופי.",
    recoveryActions: ["queue_for_retry", "notify_admin", "manual_support"],
    rollbackTrigger: false
  },
  {
    kind: "sync_issue",
    defaultSeverity: "p1",
    userMessageHe: "השינוי נשמר לתור סנכרון. נציג סטטוס ברור עד שהסנכרון מסתיים.",
    adminDiagnosisHe: "בדקו תור offline, שגיאת API, הרשאות וגרסת נתונים.",
    recoveryActions: ["queue_for_retry", "show_user_guidance", "notify_admin"],
    rollbackTrigger: false
  },
  {
    kind: "weak_internet_failure",
    defaultSeverity: "p2",
    userMessageHe: "החיבור חלש. פעולות חשובות ימתינו לסנכרון או יקבלו הנחיה ברורה.",
    adminDiagnosisHe: "בדקו האם הפעולה חסמה שיעור, האם נוצר retry והאם הוצג משוב למשתמש.",
    recoveryActions: ["queue_for_retry", "show_user_guidance"],
    rollbackTrigger: false
  }
];

export function getIncidentPlaybook(kind: LiveIncidentKind): LiveIncidentPlaybook {
  return phase9IncidentPlaybooks.find((playbook) => playbook.kind === kind) ?? phase9IncidentPlaybooks[0];
}

export function createLiveIncidentDraft(input: {
  id: string;
  academyId: EntityId;
  kind: LiveIncidentKind;
  openedAt: IsoDateTimeString;
  severity?: LiveIncidentSeverity;
  titleHe?: string;
  safeMetadata?: Record<string, string | number | boolean | null>;
  ownerUserId?: EntityId;
}): LiveIncidentDraft {
  const playbook = getIncidentPlaybook(input.kind);

  return {
    id: input.id,
    academyId: input.academyId,
    kind: input.kind,
    severity: input.severity ?? playbook.defaultSeverity,
    status: "new",
    titleHe: input.titleHe ?? playbook.userMessageHe,
    userMessageHe: playbook.userMessageHe,
    adminDiagnosisHe: playbook.adminDiagnosisHe,
    safeMetadata: input.safeMetadata ?? {},
    recoveryActions: playbook.recoveryActions,
    ownerUserId: input.ownerUserId,
    openedAt: input.openedAt
  };
}

export function shouldFreezeRollout(incident: Pick<LiveIncidentDraft, "severity" | "kind">) {
  if (incident.severity === "p0") return true;
  const playbook = getIncidentPlaybook(incident.kind);
  return incident.severity === "p1" && playbook.rollbackTrigger;
}
