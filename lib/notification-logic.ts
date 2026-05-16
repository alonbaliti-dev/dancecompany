import { STUDIO_LK } from "@/lib/platform/constants";
import { getDirectoryUsers } from "@/lib/directory-store";
import { getStudioGroups } from "@/lib/studio-groups-access";
import { getStudentsForTeacher, isStudentRole } from "@/lib/studio-roster";
import type { Notification, NotificationTargetType, SendStudioUpdatePayload, UserProfile } from "@/lib/types";

export function getAllStudentIds(): string[] {
  return getDirectoryUsers()
    .filter((u) => isStudentRole(u.permissions) && !u.isParent)
    .map((u) => u.id);
}

export function getAllTeacherIds(): string[] {
  return getDirectoryUsers()
    .filter((u) => u.permissions.isTeacher && !u.permissions.isManagement)
    .map((u) => u.id);
}

export function getStaffUserIds(): string[] {
  return getDirectoryUsers()
    .filter((u) => u.permissions.isTeacher || u.permissions.isManagement)
    .map((u) => u.id);
}

export function isManagementUserId(userId: string): boolean {
  const u = getDirectoryUsers().find((x) => x.id === userId);
  return Boolean(u?.permissions.isManagement);
}

export function studentIdsInGroups(groupIds: string[]): string[] {
  const names = groupIds
    .map((gid) => getStudioGroups().find((g) => g.id === gid)?.name)
    .filter(Boolean) as string[];
  return getDirectoryUsers()
    .filter((u) => isStudentRole(u.permissions) && u.assignedGroups.some((gn) => names.includes(gn)))
    .map((u) => u.id);
}

/** Resolve recipient user IDs for a broadcast notification record. */
export function resolveNotificationRecipientIds(n: Pick<Notification, "targetType" | "targetUserIds" | "targetGroupIds">): string[] {
  switch (n.targetType) {
    case "student":
    case "teacher":
      return n.targetUserIds ?? [];
    case "students":
    case "teachers":
      return n.targetUserIds ?? [];
    case "dance_group":
      return studentIdsInGroups(n.targetGroupIds ?? []);
    case "all_students":
    case "studio":
      return getAllStudentIds();
    case "all_teachers":
      return getAllTeacherIds();
    case "staff":
      return getStaffUserIds();
    default:
      return [];
  }
}

/** Whether the logged-in user should see this notification in their inbox. */
export function notificationAppliesToUser(n: Notification, user: UserProfile): boolean {
  if (n.createdByUserId === user.id) return true;
  const recipients = resolveNotificationRecipientIds(n);
  return recipients.includes(user.id);
}

export function isNotificationRead(n: Notification, userId: string): boolean {
  return n.readByUserIds.includes(userId);
}

export function getNotificationReadRate(n: Notification): { read: number; total: number; pct: number } {
  const total = resolveNotificationRecipientIds(n).length;
  const read = n.readByUserIds.filter((id) => resolveNotificationRecipientIds(n).includes(id)).length;
  return { read, total, pct: total ? Math.round((read / total) * 100) : 0 };
}

export function formatNotificationTargetLabel(n: Pick<Notification, "targetType" | "targetUserIds" | "targetGroupIds">): string {
  const users = getDirectoryUsers();
  switch (n.targetType) {
    case "student": {
      const name = users.find((u) => u.id === n.targetUserIds?.[0])?.name;
      return name ? `תלמיד/ה: ${name}` : "תלמיד/ה";
    }
    case "students":
      return `${n.targetUserIds?.length ?? 0} תלמידים`;
    case "dance_group": {
      const names = (n.targetGroupIds ?? [])
        .map((gid) => getStudioGroups().find((g) => g.id === gid)?.name)
        .filter(Boolean);
      return names.length ? `קבוצה: ${names.join(", ")}` : "קבוצת ריקוד";
    }
    case "all_students":
      return "כל התלמידים";
    case "studio":
      return "כל הסטודיו";
    case "teacher": {
      const name = users.find((u) => u.id === n.targetUserIds?.[0])?.name;
      return name ? `מורה: ${name}` : "מורה";
    }
    case "teachers":
      return `${n.targetUserIds?.length ?? 0} מורים`;
    case "all_teachers":
      return "כל המורים";
    case "staff":
      return "צוות (מורים + הנהלה)";
    default:
      return "יעד";
  }
}

export function resolveSendUpdateRecipients(payload: SendStudioUpdatePayload, sender: UserProfile): string[] {
  const scoped = constrainTargetsForSender(payload, sender);
  return resolveNotificationRecipientIds({
    targetType: scoped.targetType,
    targetUserIds: scoped.targetUserIds,
    targetGroupIds: scoped.targetGroupIds
  });
}

/** Enforce teacher vs management broadcast rules. */
export function constrainTargetsForSender(
  payload: SendStudioUpdatePayload,
  sender: UserProfile
): Pick<SendStudioUpdatePayload, "targetType" | "targetUserIds" | "targetGroupIds"> {
  if (!sender.permissions.isTeacher && !sender.permissions.isManagement) {
    return { targetType: payload.targetType, targetUserIds: [], targetGroupIds: [] };
  }

  if (sender.permissions.isManagement) {
    return {
      targetType: payload.targetType,
      targetUserIds: payload.targetUserIds,
      targetGroupIds: payload.targetGroupIds
    };
  }

  const allowedStudentIds = new Set(getStudentsForTeacher(sender).map((s) => s.id));
  const allowedParentIds = new Set(
    getDirectoryUsers()
      .filter(
        (u) =>
          (u.type === "parent" || u.isParent) &&
          u.linkedStudentIds?.some((sid) => allowedStudentIds.has(sid))
      )
      .map((u) => u.id)
  );
  const allowedGroupIds = new Set(
    getStudioGroups().filter((g) => sender.assignedGroups.includes(g.name)).map((g) => g.id)
  );

  switch (payload.targetType) {
    case "student":
      return {
        targetType: "student",
        targetUserIds: payload.targetUserIds?.filter((id) => allowedStudentIds.has(id)) ?? []
      };
    case "students":
      return {
        targetType: "students",
        targetUserIds:
          payload.targetUserIds?.filter((id) => allowedStudentIds.has(id) || allowedParentIds.has(id)) ?? []
      };
    case "dance_group":
      return {
        targetType: "dance_group",
        targetGroupIds: payload.targetGroupIds?.filter((id) => allowedGroupIds.has(id)) ?? []
      };
    default:
      return { targetType: payload.targetType, targetUserIds: [], targetGroupIds: [] };
  }
}

export type NotificationFilterId = "all" | "urgent" | "unread" | "studio" | "teacher";

export function filterNotifications(
  items: Notification[],
  user: UserProfile,
  filter: NotificationFilterId
): Notification[] {
  const base = items.filter((n) => notificationAppliesToUser(n, user));
  switch (filter) {
    case "urgent":
      return base.filter((n) => n.priority === "urgent");
    case "unread":
      return base.filter((n) => !isNotificationRead(n, user.id));
    case "studio":
      return base.filter((n) => isManagementUserId(n.createdByUserId));
    case "teacher":
      return base.filter((n) => !isManagementUserId(n.createdByUserId) && getDirectoryUsers().find((u) => u.id === n.createdByUserId)?.permissions.isTeacher);
    default:
      return base;
  }
}

export function managementTargetOptions(): { value: NotificationTargetType; label: string }[] {
  return [
    { value: "all_students", label: "כל התלמידים" },
    { value: "students", label: "תלמידים נבחרים" },
    { value: "student", label: "תלמיד/ה" },
    { value: "dance_group", label: "קבוצת ריקוד" },
    { value: "all_teachers", label: "כל המורים" },
    { value: "teachers", label: "מורים נבחרים" },
    { value: "teacher", label: "מורה" },
    { value: "staff", label: "צוות בלבד" },
    { value: "studio", label: "כל הסטודיו" }
  ];
}

export function teacherTargetOptions(): { value: NotificationTargetType; label: string }[] {
  return [
    { value: "dance_group", label: "קבוצה משויכת" },
    { value: "student", label: "תלמיד/ה" },
    { value: "students", label: "תלמידים נבחרים" }
  ];
}
