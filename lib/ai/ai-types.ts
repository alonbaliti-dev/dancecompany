import type { V6Database, V6Role, V6User } from "@/lib/v6/types";

export type AIAgentId =
  | "chatgpt"
  | "student_insight"
  | "parent_summary"
  | "teacher_assistant"
  | "management_analyst"
  | "super_admin_health"
  | "practice_engagement"
  | "risk_detection"
  | "content_writing"
  | "media_gallery"
  | "shop_insight"
  | "event_readiness";

export type AIInsight = {
  id: string;
  agentId: AIAgentId;
  title: string;
  body: string;
  riskLevel: "low" | "medium" | "high";
  requiresApproval: boolean;
  suggestedActions: string[];
};

export type AIContext = {
  db: V6Database;
  actor: V6User;
  role: V6Role;
};

export type AIAgent = {
  id: AIAgentId;
  label: string;
  run: (context: AIContext) => AIInsight[];
};

export type AIPermissionResult = {
  ok: boolean;
  reason?: string;
};

export type AIScope =
  | "self"
  | "linked_students"
  | "assigned_groups"
  | "studio_operations"
  | "studio_management"
  | "system";

export type AIActionType =
  | "insight"
  | "draft_message"
  | "draft_notification"
  | "draft_task"
  | "draft_parent_update"
  | "draft_teacher_feedback"
  | "draft_attendance_follow_up"
  | "draft_event_announcement"
  | "draft_reminder"
  | "draft_summary"
  | "draft_shop_description"
  | "draft_event_reminder"
  | "practice_recommendation"
  | "engagement_recommendation"
  | "event_readiness_summary"
  | "media_organization_suggestion"
  | "academy_health_summary"
  | "analysis";

export type AITargetModule =
  | "students"
  | "parents"
  | "teachers"
  | "groups"
  | "messages"
  | "notifications"
  | "tasks"
  | "attendance"
  | "practice"
  | "engagement"
  | "shop"
  | "events"
  | "media"
  | "gallery"
  | "private_lessons"
  | "system";

export type AITargetEntityIds = Partial<
  Record<
    | "studioIds"
    | "academyIds"
    | "userIds"
    | "studentIds"
    | "parentIds"
    | "teacherIds"
    | "groupIds"
    | "lessonIds"
    | "eventIds"
    | "messageIds"
    | "notificationIds"
    | "taskIds"
    | "productIds"
    | "privateLessonIds"
    | "mediaIds",
    string[]
  >
>;

export type AIRequestContext = {
  currentUser: V6User;
  role: V6Role;
  studioId: string;
  academyId?: string;
  allowedScope: AIScope;
  targetEntityIds: AITargetEntityIds;
};

export type AIApprovalStatus = "draft" | "pending_approval" | "approved" | "rejected" | "published";
export type AISensitivityLevel = "public" | "internal" | "personal" | "sensitive";

export type AIDraft = {
  id: string;
  actionType: AIActionType;
  targetModule: AITargetModule;
  status: AIApprovalStatus;
  requiresApproval: boolean;
  label: "AI suggestion";
  sensitivityLevel?: AISensitivityLevel;
  content: string;
  createdByUserId: string;
  studioId: string;
  academyId?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
};
