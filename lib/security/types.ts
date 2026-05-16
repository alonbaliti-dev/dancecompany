import type { UserPermissions } from "@/lib/types";

/**
 * Server-issued session claims (mock: client sessionStorage).
 * Production: derive from Supabase Auth JWT + `profiles` row — never store passwords in session.
 */
export type AppSession = {
  userId: string;
  studioId: string;
  permissions: UserPermissions;
  issuedAt: string;
  expiresAt: string;
};

export type AuditSeverity = "info" | "warning" | "critical";

export type AuditActionType =
  | "permission_changed"
  | "user_disabled"
  | "message_removed"
  | "gallery_visibility_changed"
  | "event_edited"
  | "task_edited"
  | "notification_sent"
  | "password_changed"
  | "data_export_requested"
  | "feature_flag_changed"
  | "billing_changed"
  | "login"
  | "logout"
  | "content_filtered";

export type AuditActor = {
  userId: string;
  name: string;
  studioId: string;
};

export type AuditTarget = {
  type: string;
  id?: string;
  studioId?: string;
};

export type CreateAuditLogInput = {
  action: AuditActionType | string;
  actor: AuditActor;
  target?: AuditTarget;
  severity?: AuditSeverity;
  metadata?: Record<string, string>;
};

/** Media row shape for storage access checks (gallery, chat video, uploads). */
export type MediaAccessItem = {
  studioId: string;
  visibility: import("@/lib/types").GalleryVisibility;
  assignedGroupIds?: string[];
  assignedStudentIds?: string[];
  createdByUserId?: string;
};

export type NotificationSendTarget = {
  studioId: string;
  targetType: import("@/lib/types").NotificationTargetType;
  targetUserIds?: string[];
  targetGroupIds?: string[];
};
