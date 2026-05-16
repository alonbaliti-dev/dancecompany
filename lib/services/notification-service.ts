import type { V2Database, V2Notification, V2NotificationPriority, V2Screen, V2Tab, V2User } from "@/lib/v2/types";

type NotificationInput = {
  studioId: string;
  userIds: string[];
  title: string;
  body: string;
  priority?: V2NotificationPriority;
  relatedType: V2Notification["relatedType"];
  relatedId?: string;
  screen?: V2Screen;
  tab?: V2Tab;
};

function newNotificationId() {
  return `notif_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function unique(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}

export function createNotification(input: NotificationInput, createdAt = new Date().toISOString()): V2Notification | null {
  const userIds = unique(input.userIds);
  if (!userIds.length) return null;
  return {
    id: newNotificationId(),
    studioId: input.studioId,
    userIds,
    title: input.title,
    body: input.body,
    priority: input.priority ?? "normal",
    relatedType: input.relatedType,
    relatedId: input.relatedId,
    screen: input.screen,
    tab: input.tab,
    readByUserIds: [],
    createdAt
  };
}

export function notifyUsers(db: V2Database, input: NotificationInput): V2Database {
  const notification = createNotification(input);
  if (!notification) return db;
  return { ...db, notifications: [notification, ...db.notifications].slice(0, 300) };
}

export function notifyGroup(
  db: V2Database,
  studioId: string,
  groupId: string,
  input: Omit<NotificationInput, "studioId" | "userIds">
): V2Database {
  const groupMembers = db.users.filter((u) => u.studioId === studioId && u.groupIds.includes(groupId)).map((u) => u.id);
  const assignedTeachers = db.groups.find((g) => g.id === groupId)?.teacherIds ?? [];
  return notifyUsers(db, { ...input, studioId, userIds: unique([...groupMembers, ...assignedTeachers]) });
}

export function notifyTeacher(
  db: V2Database,
  teacherId: string,
  input: Omit<NotificationInput, "studioId" | "userIds">
): V2Database {
  const teacher = db.users.find((u) => u.id === teacherId);
  if (!teacher) return db;
  return notifyUsers(db, { ...input, studioId: teacher.studioId, userIds: [teacher.id] });
}

export function notifyManagement(
  db: V2Database,
  studioId: string,
  input: Omit<NotificationInput, "studioId" | "userIds">
): V2Database {
  const managers = db.users
    .filter((u) => u.studioId === studioId && (u.role === "management" || u.role === "super_admin"))
    .map((u) => u.id);
  return notifyUsers(db, { ...input, studioId, userIds: managers });
}

export function notifyParentStudentLinks(
  db: V2Database,
  studentId: string,
  input: Omit<NotificationInput, "studioId" | "userIds">
): V2Database {
  const student = db.users.find((u) => u.id === studentId);
  if (!student) return db;
  const parentIds = db.users
    .filter((u) => u.studioId === student.studioId && u.role === "parent" && u.linkedStudentIds.includes(studentId))
    .map((u) => u.id);
  return notifyUsers(db, { ...input, studioId: student.studioId, userIds: unique([student.id, ...parentIds]) });
}

export function markNotificationRead(db: V2Database, notificationId: string, userId: string): V2Database {
  return {
    ...db,
    notifications: db.notifications.map((n) =>
      n.id === notificationId && !n.readByUserIds.includes(userId)
        ? { ...n, readByUserIds: [...n.readByUserIds, userId] }
        : n
    )
  };
}

export function markAllNotificationsRead(db: V2Database, userId: string): V2Database {
  return {
    ...db,
    notifications: db.notifications.map((n) =>
      n.userIds.includes(userId) && !n.readByUserIds.includes(userId)
        ? { ...n, readByUserIds: [...n.readByUserIds, userId] }
        : n
    )
  };
}

export function getNotificationsForUser(db: V2Database, user: V2User): V2Notification[] {
  return db.notifications
    .filter((n) => n.userIds.includes(user.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Notifications — mock. Supabase: `from('notifications').insert/select`. */
export const notificationService = {
  listForStudio(_studioId: string) {
    return [];
  }
};
