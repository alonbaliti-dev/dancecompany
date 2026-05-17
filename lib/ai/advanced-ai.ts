import type { AIActionType, AIRequestContext, AIScope, AISensitivityLevel, AITargetEntityIds, AITargetModule } from "./ai-types";
import { isUserFacingAIAction } from "./ai-approval";
import { validateAIRequestContext } from "./ai-request-context";
import type { V6Role, V6User } from "@/lib/v6/types";

export type AIHumanBoundary =
  | "suggest_only"
  | "draft_requires_approval"
  | "insight_review_only"
  | "future_research_only";

export type AIRolloutStage = "phase_11_contract" | "pilot_review" | "approved_live";

export type AdvancedAIUseCaseId =
  | "student_stretch_reminder"
  | "student_encouragement"
  | "student_practice_consistency"
  | "student_rehearsal_reminder"
  | "student_task_summary"
  | "parent_child_progress"
  | "parent_attention_alert"
  | "parent_attendance_summary"
  | "parent_event_reminder"
  | "parent_payment_reminder"
  | "teacher_attendance_insights"
  | "teacher_group_engagement"
  | "teacher_practice_completion"
  | "teacher_message_draft"
  | "teacher_event_preparation"
  | "teacher_rehearsal_readiness"
  | "management_bottlenecks"
  | "management_event_readiness"
  | "management_engagement_drops"
  | "management_unresolved_tasks"
  | "management_attendance_risks"
  | "management_parent_comms"
  | "super_admin_platform_health"
  | "super_admin_academy_health"
  | "super_admin_integration_issues"
  | "super_admin_scaling_insights"
  | "super_admin_ux_friction"
  | "super_admin_operational_anomalies"
  | "media_timeline_organization"
  | "media_highlight_suggestions"
  | "event_show_recap";

export type AIInsightRegistryEntry = {
  id: AdvancedAIUseCaseId;
  title: string;
  role: V6Role;
  scope: AIScope;
  actionType: AIActionType;
  targetModule: AITargetModule;
  sensitivityLevel: AISensitivityLevel;
  requiresApproval: boolean;
  boundary: AIHumanBoundary;
  promptTemplateKey: AIAdvancedPromptTemplateKey;
  rolloutStage: AIRolloutStage;
  dataPolicy: "provided_context_only";
  noAutonomousAction: true;
};

export type AIAdvancedContext = AIRequestContext & {
  academyId: string;
  role: V6Role;
  dataPolicy: "provided_context_only";
  approvalRequiredForUserFacingOutput: true;
  automationMode: "human_review_only";
};

export type AIApprovalQueueItem = {
  id: string;
  academyId: string;
  studioId: string;
  actorUserId: string;
  reviewerRole: V6Role;
  useCaseId: AdvancedAIUseCaseId;
  actionType: AIActionType;
  targetModule: AITargetModule;
  sensitivityLevel: AISensitivityLevel;
  status: "pending_review" | "approved" | "rejected" | "expired";
  suggestionPreview: string;
  createdAt: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  auditRequired: true;
};

export type AIAdvancedPromptTemplateKey =
  | "student_practice_support"
  | "parent_child_summary"
  | "teacher_group_support"
  | "management_operations_summary"
  | "super_admin_platform_review"
  | "event_show_support"
  | "media_gallery_organization";

export type AIAdvancedPromptTemplate = {
  key: AIAdvancedPromptTemplateKey;
  purpose: string;
  allowedInputs: string[];
  outputRules: string[];
  forbiddenInputs: string[];
};

const nowId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const aiAdvancedPromptTemplates: Record<AIAdvancedPromptTemplateKey, AIAdvancedPromptTemplate> = {
  student_practice_support: {
    key: "student_practice_support",
    purpose: "Summarize practice, stretching, tasks and upcoming rehearsals in a calm student voice.",
    allowedInputs: ["academyId", "actor role", "assigned task counts", "attendance buckets", "upcoming rehearsal labels"],
    outputRules: ["short Hebrew", "supportive", "no blame", "suggestion only", "no names of unrelated students"],
    forbiddenInputs: ["raw medical details", "private parent notes", "teacher-only comments", "other students' records"]
  },
  parent_child_summary: {
    key: "parent_child_summary",
    purpose: "Help a parent understand linked child progress, attendance and upcoming obligations.",
    allowedInputs: ["linked student IDs", "attendance buckets", "event reminder labels", "payment status labels"],
    outputRules: ["simple Hebrew", "only linked children", "draft requires approval for outbound messages"],
    forbiddenInputs: ["unlinked students", "staff-only notes", "raw payment identifiers", "private media URLs"]
  },
  teacher_group_support: {
    key: "teacher_group_support",
    purpose: "Organize assigned group readiness, attendance, practice completion and message drafts.",
    allowedInputs: ["assigned group IDs", "attendance buckets", "task completion counts", "event checklist summaries"],
    outputRules: ["actionable", "teacher-friendly", "drafts remain pending approval"],
    forbiddenInputs: ["unassigned groups", "parent contact details unless already permitted", "sensitive personal notes"]
  },
  management_operations_summary: {
    key: "management_operations_summary",
    purpose: "Highlight operational bottlenecks, event readiness, engagement drops and unresolved work.",
    allowedInputs: ["academy-scoped aggregate counts", "event readiness statuses", "unresolved task counts", "attendance risk buckets"],
    outputRules: ["simple Hebrew", "no enterprise jargon", "human decides next action"],
    forbiddenInputs: ["cross-academy data", "raw secrets", "card data", "private message bodies by default"]
  },
  super_admin_platform_review: {
    key: "super_admin_platform_review",
    purpose: "Summarize platform health, academy health, integration issues, scaling risks and UX friction.",
    allowedInputs: ["academy-scoped health metadata", "integration statuses", "error categories", "feature flag summaries"],
    outputRules: ["operational", "audit-aware", "no automatic repair"],
    forbiddenInputs: ["provider secrets", "passwords", "raw private content", "unnecessary personal details"]
  },
  event_show_support: {
    key: "event_show_support",
    purpose: "Prepare rehearsal readiness, missing participation, costumes, checklist summaries and recaps.",
    allowedInputs: ["event IDs", "checklist categories", "participation statuses", "readiness buckets"],
    outputRules: ["calm", "specific next review", "no public announcement without approval"],
    forbiddenInputs: ["unsafe backstage details for unauthorized roles", "private medical or safety notes"]
  },
  media_gallery_organization: {
    key: "media_gallery_organization",
    purpose: "Suggest media timeline grouping, highlights, archive organization and search helpers.",
    allowedInputs: ["media IDs", "event IDs", "collection IDs", "visibility labels", "non-sensitive captions"],
    outputRules: ["no facial recognition", "no auto-publish", "moderation remains human"],
    forbiddenInputs: ["face identity matching", "private URLs", "hidden media", "unapproved student submissions"]
  }
};

export const advancedAIInsightRegistry: readonly AIInsightRegistryEntry[] = [
  { id: "student_stretch_reminder", title: "תזכורת מתיחות רגועה", role: "student", scope: "self", actionType: "draft_reminder", targetModule: "practice", sensitivityLevel: "personal", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "student_practice_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "student_encouragement", title: "חיזוק אישי", role: "student", scope: "self", actionType: "practice_recommendation", targetModule: "practice", sensitivityLevel: "personal", requiresApproval: false, boundary: "suggest_only", promptTemplateKey: "student_practice_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "student_practice_consistency", title: "סיכום עקביות תרגול", role: "student", scope: "self", actionType: "draft_summary", targetModule: "practice", sensitivityLevel: "personal", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "student_practice_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "student_rehearsal_reminder", title: "תזכורת לחזרה", role: "student", scope: "self", actionType: "draft_event_reminder", targetModule: "events", sensitivityLevel: "personal", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "event_show_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "student_task_summary", title: "סיכום משימות", role: "student", scope: "self", actionType: "draft_summary", targetModule: "tasks", sensitivityLevel: "personal", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "student_practice_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "parent_child_progress", title: "סיכום התקדמות ילד/ה", role: "parent", scope: "linked_students", actionType: "draft_parent_update", targetModule: "students", sensitivityLevel: "personal", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "parent_child_summary", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "parent_attention_alert", title: "נקודה לתשומת לב", role: "parent", scope: "linked_students", actionType: "draft_parent_update", targetModule: "engagement", sensitivityLevel: "sensitive", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "parent_child_summary", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "parent_attendance_summary", title: "סיכום נוכחות", role: "parent", scope: "linked_students", actionType: "draft_summary", targetModule: "attendance", sensitivityLevel: "personal", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "parent_child_summary", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "parent_event_reminder", title: "תזכורת אירוע", role: "parent", scope: "linked_students", actionType: "draft_event_reminder", targetModule: "events", sensitivityLevel: "personal", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "event_show_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "parent_payment_reminder", title: "תזכורת תשלום", role: "parent", scope: "linked_students", actionType: "draft_reminder", targetModule: "shop", sensitivityLevel: "sensitive", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "parent_child_summary", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "teacher_attendance_insights", title: "תובנות נוכחות", role: "teacher", scope: "assigned_groups", actionType: "analysis", targetModule: "attendance", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "teacher_group_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "teacher_group_engagement", title: "מעורבות קבוצה", role: "teacher", scope: "assigned_groups", actionType: "engagement_recommendation", targetModule: "engagement", sensitivityLevel: "internal", requiresApproval: false, boundary: "suggest_only", promptTemplateKey: "teacher_group_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "teacher_practice_completion", title: "השלמת תרגולים", role: "teacher", scope: "assigned_groups", actionType: "practice_recommendation", targetModule: "practice", sensitivityLevel: "internal", requiresApproval: false, boundary: "suggest_only", promptTemplateKey: "teacher_group_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "teacher_message_draft", title: "טיוטת הודעה", role: "teacher", scope: "assigned_groups", actionType: "draft_message", targetModule: "messages", sensitivityLevel: "internal", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "teacher_group_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "teacher_event_preparation", title: "הכנות לאירוע", role: "teacher", scope: "assigned_groups", actionType: "event_readiness_summary", targetModule: "events", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "event_show_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "teacher_rehearsal_readiness", title: "מוכנות חזרה", role: "teacher", scope: "assigned_groups", actionType: "event_readiness_summary", targetModule: "events", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "event_show_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "management_bottlenecks", title: "צווארי בקבוק תפעוליים", role: "management", scope: "studio_management", actionType: "academy_health_summary", targetModule: "system", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "management_operations_summary", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "management_event_readiness", title: "מוכנות אירוע", role: "management", scope: "studio_management", actionType: "event_readiness_summary", targetModule: "events", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "event_show_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "management_engagement_drops", title: "ירידה במעורבות", role: "management", scope: "studio_management", actionType: "engagement_recommendation", targetModule: "engagement", sensitivityLevel: "internal", requiresApproval: false, boundary: "suggest_only", promptTemplateKey: "management_operations_summary", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "management_unresolved_tasks", title: "משימות פתוחות", role: "management", scope: "studio_management", actionType: "analysis", targetModule: "tasks", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "management_operations_summary", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "management_attendance_risks", title: "סיכוני נוכחות", role: "management", scope: "studio_management", actionType: "analysis", targetModule: "attendance", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "management_operations_summary", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "management_parent_comms", title: "תקשורת הורים", role: "management", scope: "studio_management", actionType: "draft_summary", targetModule: "messages", sensitivityLevel: "internal", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "management_operations_summary", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "super_admin_platform_health", title: "בריאות הפלטפורמה", role: "super_admin", scope: "system", actionType: "academy_health_summary", targetModule: "system", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "super_admin_platform_review", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "super_admin_academy_health", title: "בריאות אקדמיה", role: "super_admin", scope: "system", actionType: "academy_health_summary", targetModule: "system", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "super_admin_platform_review", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "super_admin_integration_issues", title: "בעיות אינטגרציה", role: "super_admin", scope: "system", actionType: "analysis", targetModule: "system", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "super_admin_platform_review", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "super_admin_scaling_insights", title: "תובנות גדילה", role: "super_admin", scope: "system", actionType: "analysis", targetModule: "system", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "super_admin_platform_review", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "super_admin_ux_friction", title: "חיכוך שימוש", role: "super_admin", scope: "system", actionType: "analysis", targetModule: "system", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "super_admin_platform_review", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "super_admin_operational_anomalies", title: "חריגות תפעוליות", role: "super_admin", scope: "system", actionType: "analysis", targetModule: "system", sensitivityLevel: "internal", requiresApproval: false, boundary: "insight_review_only", promptTemplateKey: "super_admin_platform_review", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "media_timeline_organization", title: "ארגון זיכרונות וגלריות", role: "management", scope: "studio_management", actionType: "media_organization_suggestion", targetModule: "media", sensitivityLevel: "internal", requiresApproval: false, boundary: "suggest_only", promptTemplateKey: "media_gallery_organization", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "media_highlight_suggestions", title: "הצעות להיילייטים", role: "teacher", scope: "assigned_groups", actionType: "media_organization_suggestion", targetModule: "gallery", sensitivityLevel: "internal", requiresApproval: false, boundary: "suggest_only", promptTemplateKey: "media_gallery_organization", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true },
  { id: "event_show_recap", title: "סיכום אירוע", role: "management", scope: "studio_management", actionType: "draft_summary", targetModule: "events", sensitivityLevel: "internal", requiresApproval: true, boundary: "draft_requires_approval", promptTemplateKey: "event_show_support", rolloutStage: "phase_11_contract", dataPolicy: "provided_context_only", noAutonomousAction: true }
];

export const managementAIExampleInsights = [
  "קבוצת היפ הופ נוער ירדה בהשלמת תרגולים השבוע",
  "יש 3 תלמידים עם היעדרויות חוזרות",
  "אירוע סוף שנה עדיין חסר רשימת תלבושות"
] as const;

export function buildAdvancedAIContext(input: {
  currentUser: V6User;
  studioId: string;
  academyId?: string;
  allowedScope: AIScope;
  targetEntityIds: AITargetEntityIds;
}): { ok: true; context: AIAdvancedContext } | { ok: false; code: string; message: string; status: number } {
  const academyId = input.academyId ?? input.currentUser.activeAcademyId ?? input.currentUser.academyId ?? input.currentUser.studioId;
  const validation = validateAIRequestContext({
    currentUser: input.currentUser,
    role: input.currentUser.role,
    studioId: input.studioId,
    academyId,
    allowedScope: input.allowedScope,
    targetEntityIds: {
      ...input.targetEntityIds,
      academyIds: input.targetEntityIds.academyIds ?? [academyId],
      studioIds: input.targetEntityIds.studioIds ?? [input.studioId]
    }
  });

  if (validation.ok === false) return validation;

  return {
    ok: true,
    context: {
      ...validation.context,
      academyId,
      dataPolicy: "provided_context_only",
      approvalRequiredForUserFacingOutput: true,
      automationMode: "human_review_only"
    }
  };
}

export function getAdvancedAIRegistryForRole(role: V6Role) {
  return advancedAIInsightRegistry.filter((entry) => entry.role === role);
}

export function getAdvancedAIPromptTemplate(key: AIAdvancedPromptTemplateKey) {
  return aiAdvancedPromptTemplates[key];
}

export function actionRequiresHumanApproval(actionType: AIActionType) {
  return isUserFacingAIAction(actionType);
}

export function createAIApprovalQueueItem(input: {
  context: AIAdvancedContext;
  useCaseId: AdvancedAIUseCaseId;
  actionType: AIActionType;
  targetModule: AITargetModule;
  sensitivityLevel: AISensitivityLevel;
  suggestionPreview: string;
  reviewerRole?: V6Role;
  createdAt?: string;
}): AIApprovalQueueItem {
  return {
    id: nowId("ai_approval"),
    academyId: input.context.academyId,
    studioId: input.context.studioId,
    actorUserId: input.context.currentUser.id,
    reviewerRole: input.reviewerRole ?? input.context.role,
    useCaseId: input.useCaseId,
    actionType: input.actionType,
    targetModule: input.targetModule,
    sensitivityLevel: input.sensitivityLevel,
    status: "pending_review",
    suggestionPreview: input.suggestionPreview.slice(0, 280),
    createdAt: input.createdAt ?? new Date().toISOString(),
    auditRequired: true
  };
}
