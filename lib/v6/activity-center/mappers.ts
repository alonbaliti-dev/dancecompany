import type { V6Tone } from "@/components/v6/design-system/tokens";
import { prioritizeV6Notifications } from "@/lib/engines/v6/notification-priority-engine";
import type {
  V6AuditEntry,
  V6CalendarEvent,
  V6Database,
  V6Message,
  V6Notification,
  V6User
} from "@/lib/v6/types";
import type { V6ActivityCategory, V6ActivityItem, V6ActivitySeverity, V6ActivitySourceKind } from "./types";

function severityFromNotificationPriority(priority: "low" | "normal" | "high" | "critical"): V6ActivitySeverity {
  if (priority === "critical") return "critical";
  if (priority === "high") return "important";
  if (priority === "normal") return "notice";
  return "info";
}

function categoryFromNotificationType(type: V6Notification["type"]): V6ActivityCategory {
  if (type === "event") return "event";
  if (type === "task") return "class";
  if (type === "media") return "announcement";
  if (type === "shop" || type === "private_lesson") return "commerce";
  if (type === "system") return "system";
  return "announcement";
}

function toneFromSeverity(severity: V6ActivitySeverity): V6Tone {
  if (severity === "critical") return "urgent";
  if (severity === "important") return "urgent";
  if (severity === "notice") return "modern";
  return "studio";
}

function buildActivityItem(input: {
  id: string;
  sourceKind: V6ActivitySourceKind;
  sourceId: string;
  category: V6ActivityCategory;
  severity: V6ActivitySeverity;
  title: string;
  body: string;
  meta: string;
  createdAt: string;
  isRead: boolean;
  targetTab?: V6ActivityItem["targetTab"];
  targetScreen?: V6ActivityItem["targetScreen"];
  tone?: V6Tone;
}): V6ActivityItem {
  return {
    ...input,
    tone: input.tone ?? toneFromSeverity(input.severity)
  };
}

export function mapV6NotificationToActivityItem(notification: V6Notification, actor: V6User): V6ActivityItem {
  const prioritized = prioritizeV6Notifications([notification])[0];
  const severity = severityFromNotificationPriority(prioritized?.priority ?? "normal");
  const isRead = notification.readBy.includes(actor.id);
  return buildActivityItem({
    id: `activity:notification:${notification.id}`,
    sourceKind: "notification",
    sourceId: notification.id,
    category: categoryFromNotificationType(notification.type),
    severity,
    title: notification.title,
    body: notification.body,
    meta: isRead ? "נקרא" : "חדש",
    createdAt: notification.createdAt,
    isRead,
    targetTab: notification.tab,
    targetScreen: notification.screen,
    tone: isRead ? "studio" : toneFromSeverity(severity)
  });
}

export function mapV6MessageToActivityItem(message: V6Message, _actor: V6User, groupName?: string): V6ActivityItem {
  return buildActivityItem({
    id: `activity:message:${message.id}`,
    sourceKind: "message",
    sourceId: message.id,
    category: "message",
    severity: "notice",
    title: message.title,
    body: message.body,
    meta: groupName ?? "סטודיו",
    createdAt: message.createdAt ?? new Date(0).toISOString(),
    isRead: true,
    targetTab: "messages",
    tone: "modern"
  });
}

export function mapV6EventToActivityItem(event: V6CalendarEvent): V6ActivityItem {
  const needsAttention = event.status === "needs_attention";
  return buildActivityItem({
    id: `activity:event:${event.id}`,
    sourceKind: "event",
    sourceId: event.id,
    category: "event",
    severity: needsAttention ? "important" : "notice",
    title: event.title,
    body: event.parentInstructions ?? event.adultInstructions ?? event.location ?? "בלוח הסטודיו",
    meta: event.startTime ?? event.date,
    createdAt: event.date,
    isRead: !needsAttention,
    targetScreen: "calendar",
    tone: needsAttention ? "urgent" : "management"
  });
}

export function mapV6AuditEntryToActivityItem(entry: V6AuditEntry): V6ActivityItem | null {
  const scheduleHint = /מערכת|שיעור|לוח|פרסום|timetable|publish|conflict|נוכחות/i.test(`${entry.action} ${entry.target}`);
  if (!scheduleHint) return null;

  const severity: V6ActivitySeverity = /חסום|שגיא|conflict|blocked/i.test(entry.action) ? "critical" : /פרסום|publish|ייבוא|import/i.test(entry.action) ? "important" : "notice";

  return buildActivityItem({
    id: `activity:audit:${entry.id}`,
    sourceKind: "audit",
    sourceId: entry.id,
    category: /נוכחות|attendance/i.test(entry.action) ? "attendance" : "schedule",
    severity,
    title: entry.action,
    body: entry.target,
    meta: entry.actorName,
    createdAt: entry.createdAt,
    isRead: true,
    targetScreen: "audit",
    tone: severity === "critical" ? "urgent" : "management"
  });
}

export function mapV6DerivedActivityItem(input: Omit<V6ActivityItem, "tone"> & { tone?: V6Tone }): V6ActivityItem {
  return buildActivityItem({
    ...input,
    tone: input.tone
  });
}

export function selectV6ActivityGroupName(db: V6Database, message: V6Message) {
  if (!message.groupId) return "כללי";
  return db.groups.find((group) => group.id === message.groupId)?.name ?? "קבוצה";
}
