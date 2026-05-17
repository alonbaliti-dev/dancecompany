import type { EntityId, IsoDateTimeString } from "@/lib/types/base";
import type { OperationsActorRole } from "@/lib/domains/operations/types";
import type { LiveIncidentKind, LiveIncidentSeverity } from "@/lib/operations/incidents";

export type SupportWorkflowKind =
  | "password_reset"
  | "parent_relinking"
  | "incorrect_attendance"
  | "media_visibility_correction"
  | "upload_issue_resolution"
  | "payment_support"
  | "academy_onboarding_help";

export type SupportWorkflowStep = {
  id: string;
  titleHe: string;
  ownerRole: OperationsActorRole | "support";
  requiresAudit: boolean;
  requiresIdentityCheck: boolean;
};

export type SupportWorkflowDefinition = {
  kind: SupportWorkflowKind;
  titleHe: string;
  defaultSeverity: LiveIncidentSeverity;
  relatedIncidentKinds: LiveIncidentKind[];
  allowedOwnerRoles: Array<OperationsActorRole | "support">;
  userPromiseHe: string;
  steps: SupportWorkflowStep[];
};

export type SupportCaseDraft = {
  id: string;
  academyId: EntityId;
  kind: SupportWorkflowKind;
  openedByUserId?: EntityId;
  requesterRole?: OperationsActorRole;
  relatedEntityId?: EntityId;
  status: "open" | "waiting_for_user" | "waiting_for_staff" | "resolved" | "closed";
  severity: LiveIncidentSeverity;
  safeSummaryHe: string;
  openedAt: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
};

export const phase9SupportWorkflows: readonly SupportWorkflowDefinition[] = [
  {
    kind: "password_reset",
    titleHe: "איפוס סיסמה",
    defaultSeverity: "p2",
    relatedIncidentKinds: ["auth_failure"],
    allowedOwnerRoles: ["management", "super_admin", "support"],
    userPromiseHe: "נעזור לחזור לחשבון בלי לשנות תפקידים או שיוך אקדמיה ללא בדיקה.",
    steps: [
      { id: "verify_identity", titleHe: "לאמת זהות ותפקיד", ownerRole: "management", requiresAudit: false, requiresIdentityCheck: true },
      { id: "send_reset", titleHe: "לשלוח איפוס או הנחיה מאושרת", ownerRole: "super_admin", requiresAudit: true, requiresIdentityCheck: true },
      { id: "confirm_login", titleHe: "לוודא כניסה תקינה", ownerRole: "support", requiresAudit: false, requiresIdentityCheck: false }
    ]
  },
  {
    kind: "parent_relinking",
    titleHe: "שיוך הורה לילד",
    defaultSeverity: "p1",
    relatedIncidentKinds: ["auth_failure"],
    allowedOwnerRoles: ["management", "super_admin"],
    userPromiseHe: "נבדוק את השיוך לפני הצגת מידע על תלמידים.",
    steps: [
      { id: "verify_parent", titleHe: "לאמת את ההורה והילד", ownerRole: "management", requiresAudit: false, requiresIdentityCheck: true },
      { id: "update_link", titleHe: "לעדכן שיוך רק אחרי אישור", ownerRole: "super_admin", requiresAudit: true, requiresIdentityCheck: true },
      { id: "permission_check", titleHe: "לבדוק שההורה רואה רק את הילדים שלו", ownerRole: "super_admin", requiresAudit: false, requiresIdentityCheck: false }
    ]
  },
  {
    kind: "incorrect_attendance",
    titleHe: "תיקון נוכחות",
    defaultSeverity: "p2",
    relatedIncidentKinds: ["sync_issue", "weak_internet_failure"],
    allowedOwnerRoles: ["teacher", "management", "super_admin"],
    userPromiseHe: "נתקן נוכחות עם סימון ברור מי שינה ומתי.",
    steps: [
      { id: "collect_context", titleHe: "לאסוף שיעור, קבוצה ותאריך", ownerRole: "teacher", requiresAudit: false, requiresIdentityCheck: false },
      { id: "correct_record", titleHe: "לתקן את הרשומה", ownerRole: "management", requiresAudit: true, requiresIdentityCheck: false },
      { id: "confirm_parent_view", titleHe: "לוודא שהצגה להורים תקינה", ownerRole: "management", requiresAudit: false, requiresIdentityCheck: false }
    ]
  },
  {
    kind: "media_visibility_correction",
    titleHe: "תיקון חשיפת מדיה",
    defaultSeverity: "p1",
    relatedIncidentKinds: ["broken_gallery"],
    allowedOwnerRoles: ["management", "super_admin"],
    userPromiseHe: "מדיה תוצג רק למי שמותר, וכל שינוי חשיפה יירשם.",
    steps: [
      { id: "pause_if_sensitive", titleHe: "להסתיר זמנית אם יש ספק", ownerRole: "management", requiresAudit: true, requiresIdentityCheck: false },
      { id: "verify_visibility", titleHe: "לבדוק קבוצות, תלמידים והרשאות", ownerRole: "super_admin", requiresAudit: false, requiresIdentityCheck: false },
      { id: "restore_gallery", titleHe: "להחזיר גלריה רק אחרי בדיקה", ownerRole: "super_admin", requiresAudit: true, requiresIdentityCheck: false }
    ]
  },
  {
    kind: "upload_issue_resolution",
    titleHe: "פתרון בעיית העלאה",
    defaultSeverity: "p1",
    relatedIncidentKinds: ["upload_failure", "weak_internet_failure"],
    allowedOwnerRoles: ["teacher", "management", "super_admin", "support"],
    userPromiseHe: "העלאה שלא הושלמה לא תפורסם, ונציע ניסיון חוזר ברור.",
    steps: [
      { id: "check_file", titleHe: "לבדוק סוג וגודל קובץ", ownerRole: "support", requiresAudit: false, requiresIdentityCheck: false },
      { id: "retry_or_queue", titleHe: "לנסות שוב או לשמור לתור", ownerRole: "teacher", requiresAudit: false, requiresIdentityCheck: false },
      { id: "verify_metadata", titleHe: "לוודא שהקובץ נקשר לגלריה הנכונה", ownerRole: "management", requiresAudit: true, requiresIdentityCheck: false }
    ]
  },
  {
    kind: "payment_support",
    titleHe: "תמיכה בתשלום",
    defaultSeverity: "p1",
    relatedIncidentKinds: ["payment_failure", "webhook_failure"],
    allowedOwnerRoles: ["management", "super_admin"],
    userPromiseHe: "לא נשנה סטטוס תשלום בלי בדיקה מול מקור האמת.",
    steps: [
      { id: "compare_provider", titleHe: "להשוות מול ספק התשלום", ownerRole: "management", requiresAudit: false, requiresIdentityCheck: true },
      { id: "reconcile_order", titleHe: "לעדכן הזמנה רק עם אסמכתה", ownerRole: "super_admin", requiresAudit: true, requiresIdentityCheck: true },
      { id: "notify_family", titleHe: "לעדכן את המשפחה בשפה פשוטה", ownerRole: "management", requiresAudit: false, requiresIdentityCheck: false }
    ]
  },
  {
    kind: "academy_onboarding_help",
    titleHe: "עזרה בהצטרפות אקדמיה",
    defaultSeverity: "p3",
    relatedIncidentKinds: ["auth_failure", "notification_issue"],
    allowedOwnerRoles: ["management", "super_admin", "support"],
    userPromiseHe: "נכניס משתמשים בהדרגה ונעצור אם יש בלבול או תקלה חוזרת.",
    steps: [
      { id: "confirm_scope", titleHe: "לאשר מי נכנס עכשיו", ownerRole: "management", requiresAudit: false, requiresIdentityCheck: false },
      { id: "check_accounts", titleHe: "לבדוק חשבונות ותפקידים", ownerRole: "super_admin", requiresAudit: true, requiresIdentityCheck: false },
      { id: "collect_feedback", titleHe: "לאסוף משוב אחרי שימוש ראשון", ownerRole: "support", requiresAudit: false, requiresIdentityCheck: false }
    ]
  }
];

export function getSupportWorkflow(kind: SupportWorkflowKind): SupportWorkflowDefinition {
  return phase9SupportWorkflows.find((workflow) => workflow.kind === kind) ?? phase9SupportWorkflows[0];
}

export function createSupportCaseDraft(input: {
  id: string;
  academyId: EntityId;
  kind: SupportWorkflowKind;
  openedAt: IsoDateTimeString;
  openedByUserId?: EntityId;
  requesterRole?: OperationsActorRole;
  relatedEntityId?: EntityId;
  safeSummaryHe: string;
}): SupportCaseDraft {
  const workflow = getSupportWorkflow(input.kind);

  return {
    id: input.id,
    academyId: input.academyId,
    kind: input.kind,
    openedByUserId: input.openedByUserId,
    requesterRole: input.requesterRole,
    relatedEntityId: input.relatedEntityId,
    status: "open",
    severity: workflow.defaultSeverity,
    safeSummaryHe: input.safeSummaryHe,
    openedAt: input.openedAt
  };
}
