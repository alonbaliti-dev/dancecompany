import type { UserProfile } from "@/lib/types";

type AuditInput = {
  studioId: string;
  actorUserId: string;
  actorName: string;
  action: string;
  targetId: string;
  severity?: "info" | "warning" | "critical";
};

export function auditUserCreated(actor: UserProfile, targetId: string, targetName: string, studioId: string): AuditInput {
  return {
    studioId,
    actorUserId: actor.id,
    actorName: actor.name,
    action: `נוצר משתמש: ${targetName}`,
    targetId,
    severity: "info"
  };
}

export function auditUserEdited(actor: UserProfile, targetId: string, targetName: string, studioId: string): AuditInput {
  return {
    studioId,
    actorUserId: actor.id,
    actorName: actor.name,
    action: `עודכן משתמש: ${targetName}`,
    targetId,
    severity: "info"
  };
}

export function auditUserDeactivated(actor: UserProfile, targetId: string, targetName: string, studioId: string): AuditInput {
  return {
    studioId,
    actorUserId: actor.id,
    actorName: actor.name,
    action: `הושבת משתמש: ${targetName}`,
    targetId,
    severity: "warning"
  };
}

export function auditUserRemoved(actor: UserProfile, targetId: string, targetName: string, studioId: string): AuditInput {
  return {
    studioId,
    actorUserId: actor.id,
    actorName: actor.name,
    action: `הוסר משתמש: ${targetName}`,
    targetId,
    severity: "critical"
  };
}

export function auditUserRestored(actor: UserProfile, targetId: string, targetName: string, studioId: string): AuditInput {
  return {
    studioId,
    actorUserId: actor.id,
    actorName: actor.name,
    action: `שוחזר משתמש: ${targetName}`,
    targetId,
    severity: "info"
  };
}

export function auditParentLinked(actor: UserProfile, parentId: string, studentId: string, studioId: string): AuditInput {
  return {
    studioId,
    actorUserId: actor.id,
    actorName: actor.name,
    action: `קישור הורה לתלמיד`,
    targetId: `${parentId}:${studentId}`,
    severity: "info"
  };
}

export function auditParentUnlinked(actor: UserProfile, parentId: string, studentId: string, studioId: string): AuditInput {
  return {
    studioId,
    actorUserId: actor.id,
    actorName: actor.name,
    action: `ניתוק הורה מתלמיד`,
    targetId: `${parentId}:${studentId}`,
    severity: "warning"
  };
}

export function auditTeacherGroups(actor: UserProfile, teacherId: string, studioId: string): AuditInput {
  return {
    studioId,
    actorUserId: actor.id,
    actorName: actor.name,
    action: `עודכנו קבוצות מורה`,
    targetId: teacherId,
    severity: "info"
  };
}

export function auditPasswordReset(actor: UserProfile, targetId: string, targetName: string, studioId: string): AuditInput {
  return {
    studioId,
    actorUserId: actor.id,
    actorName: actor.name,
    action: `איפוס סיסמה: ${targetName}`,
    targetId,
    severity: "warning"
  };
}

export function auditPermissionsChanged(actor: UserProfile, targetId: string, targetName: string, studioId: string): AuditInput {
  return {
    studioId,
    actorUserId: actor.id,
    actorName: actor.name,
    action: `שינוי הרשאות: ${targetName}`,
    targetId,
    severity: "warning"
  };
}
