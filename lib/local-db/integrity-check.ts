import type { LocalDatabase } from "./db-types";
import type { Notification } from "@/lib/types";
import { getRuntimeDatabase } from "./runtime-store";
import { isStudentRole } from "@/lib/studio-roster";

export type IntegritySeverity = "error" | "warning" | "info";

export type IntegrityIssue = {
  id: string;
  severity: IntegritySeverity;
  category: string;
  message: string;
  entityType?: string;
  entityId?: string;
};

export type IntegrityReport = {
  checkedAt: string;
  issueCount: number;
  errorCount: number;
  warningCount: number;
  issues: IntegrityIssue[];
};

function issue(
  severity: IntegritySeverity,
  category: string,
  message: string,
  extra?: Pick<IntegrityIssue, "entityType" | "entityId">
): IntegrityIssue {
  return {
    id: `${category}_${extra?.entityId ?? message.slice(0, 24)}`,
    severity,
    category,
    message,
    ...extra
  };
}

/** Validate loaded database for common data problems. */
export function runDatabaseIntegrityCheck(db: LocalDatabase = getRuntimeDatabase()): IntegrityReport {
  const issues: IntegrityIssue[] = [];
  const userIds = new Set(db.users.map((u) => u.id));
  const studioIds = new Set(db.studios.map((s) => s.id));
  const groupIds = new Set(db.groups.map((g) => g.id));
  const parentLinkKeys = new Set<string>();

  for (const u of db.users) {
    if (!u.studioId || !studioIds.has(u.studioId)) {
      issues.push(issue("error", "users", `משתמש ללא סטודיו תקין: ${u.name} (${u.id})`, { entityType: "user", entityId: u.id }));
    }
    if (u.permissions.isTeacher && (!u.assignedGroups || u.assignedGroups.length === 0) && !u.permissions.isManagement && !u.permissions.isSuperAdmin) {
      issues.push(issue("warning", "teachers", `מורה ללא קבוצות משויכות: ${u.name}`, { entityType: "user", entityId: u.id }));
    }
    if (u.isParent && (!u.linkedStudentIds || u.linkedStudentIds.length === 0)) {
      issues.push(issue("warning", "parents", `הורה ללא תלמידים מקושרים: ${u.name}`, { entityType: "user", entityId: u.id }));
    }
  }

  for (const link of db.parentsStudents) {
    const key = `${link.parentUserId}:${link.studentUserId}`;
    if (parentLinkKeys.has(key)) {
      issues.push(issue("warning", "parent_links", `קישור כפול הורה–תלמיד: ${key}`));
    }
    parentLinkKeys.add(key);
    if (!userIds.has(link.parentUserId)) {
      issues.push(issue("error", "parent_links", `קישור להורה חסר: ${link.parentUserId}`, { entityType: "parent_link", entityId: link.id }));
    }
    if (!userIds.has(link.studentUserId)) {
      issues.push(issue("error", "parent_links", `קישור לתלמיד חסר: ${link.studentUserId}`, { entityType: "parent_link", entityId: link.id }));
    }
  }

  for (const u of db.users.filter((x) => x.isParent || x.type === "parent")) {
    for (const sid of u.linkedStudentIds ?? []) {
      if (!parentLinkKeys.has(`${u.id}:${sid}`)) {
        issues.push(issue("warning", "parent_links", `חסר רשומה ב-parents-students עבור ${u.name} → ${sid}`, { entityType: "user", entityId: u.id }));
      }
    }
  }

  for (const t of db.tasks) {
    for (const gid of t.assignedGroupIds ?? []) {
      if (!groupIds.has(gid)) {
        issues.push(issue("warning", "tasks", `משימה עם קבוצה לא קיימת: ${t.title}`, { entityType: "task", entityId: t.id }));
      }
    }
    for (const sid of t.assignedStudentIds ?? []) {
      if (!userIds.has(sid)) {
        issues.push(issue("warning", "tasks", `משימה עם תלמיד לא קיים: ${t.title}`, { entityType: "task", entityId: t.id }));
      }
    }
  }

  for (const p of db.shopProducts) {
    if (!p.category?.trim()) {
      issues.push(issue("warning", "shop", `מוצר ללא קטגוריה: ${p.title}`, { entityType: "shop_product", entityId: p.id }));
    }
    if (!studioIds.has(p.studioId)) {
      issues.push(issue("error", "shop", `מוצר ללא סטודיו: ${p.title}`, { entityType: "shop_product", entityId: p.id }));
    }
  }

  for (const e of db.events) {
    const hasAudience =
      e.isPublicToStudents ||
      (e.participatingGroupIds?.length ?? 0) > 0 ||
      (e.participatingStudentIds?.length ?? 0) > 0;
    if (!hasAudience) {
      issues.push(issue("warning", "events", `אירוע ללא קהל/נראות: ${e.title}`, { entityType: "event", entityId: e.id }));
    }
    for (const gid of e.participatingGroupIds ?? []) {
      if (!groupIds.has(gid)) {
        issues.push(issue("warning", "events", `אירוע עם קבוצה לא קיימת: ${e.title}`, { entityType: "event", entityId: e.id }));
      }
    }
  }

  for (const n of db.notifications) {
    const broadcastTargets: Notification["targetType"][] = [
      "all_students",
      "students",
      "all_teachers",
      "teachers",
      "staff",
      "studio"
    ];
    const hasTarget =
      broadcastTargets.includes(n.targetType) ||
      (n.targetUserIds?.length ?? 0) > 0 ||
      (n.targetGroupIds?.length ?? 0) > 0;
    if (!hasTarget) {
      issues.push(issue("error", "notifications", `התראה ללא יעד: ${n.title}`, { entityType: "notification", entityId: n.id }));
    }
    if (!userIds.has(n.createdByUserId)) {
      issues.push(issue("warning", "notifications", `יוצר התראה לא קיים: ${n.id}`, { entityType: "notification", entityId: n.id }));
    }
  }

  for (const g of db.gallery) {
    const url = g.videoUrl ?? "";
    if (url.startsWith("mock://") && url.includes("broken")) {
      issues.push(issue("warning", "media", `קישור מדיה חשוד: ${g.title}`, { entityType: "gallery", entityId: g.id }));
    }
  }

  for (const txt of db.editableTexts) {
    if (txt.he.trim() && !txt.en?.trim() && txt.defaultEn) {
      issues.push(issue("info", "translations", `חסרה תרגום EN: ${txt.key}`, { entityType: "editable_text", entityId: txt.id }));
    }
  }

  const studentIds = db.users.filter((u) => isStudentRole(u.permissions) && !u.isParent).map((u) => u.id);
  for (const sid of studentIds) {
    const hasGoal = db.productData.goals.some((g) => g.studentId === sid);
    const hasLevel = Boolean(db.studioOs.levelsByUser[sid]);
    if (!hasGoal && !hasLevel) {
      issues.push(issue("info", "students", `תלמיד ללא יעדים/רמה במערכת: ${sid}`, { entityType: "user", entityId: sid }));
    }
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return {
    checkedAt: new Date().toISOString(),
    issueCount: issues.length,
    errorCount,
    warningCount,
    issues
  };
}
