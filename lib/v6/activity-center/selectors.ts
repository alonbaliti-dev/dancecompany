import { selectV6MessagesForActor, selectV6NotificationsForActor } from "@/lib/domains/messages/selectors";
import { selectV6UpcomingEvents } from "@/lib/domains/events/selectors";
import type { V6Database, V6Role, V6User } from "@/lib/v6/types";
import { V6_ACTIVITY_CATEGORY_LABELS, V6_ACTIVITY_CATEGORY_ORDER, V6_ACTIVITY_SEVERITY_RANK } from "./constants";
import {
  mapV6AuditEntryToActivityItem,
  mapV6EventToActivityItem,
  mapV6MessageToActivityItem,
  mapV6NotificationToActivityItem,
  selectV6ActivityGroupName
} from "./mappers";
import { selectV6RoleDerivedActivityItems } from "./role-context";
import type { V6ActivityCategory, V6ActivityCenterOptions, V6ActivityCenterViewModel, V6ActivityGroup, V6ActivityItem } from "./types";

const DEFAULT_LIMIT = 40;
const DEFAULT_RECENT_LIMIT = 4;

function roleAllowsCategory(role: V6Role, category: V6ActivityCategory) {
  if (role === "super_admin" || role === "management") return true;
  if (role === "teacher") return category !== "commerce";
  if (role === "parent") return category !== "system" && category !== "schedule";
  return category === "announcement" || category === "message" || category === "event" || category === "class" || category === "commerce";
}

function compareActivityItems(a: V6ActivityItem, b: V6ActivityItem) {
  const severityDelta = (V6_ACTIVITY_SEVERITY_RANK[b.severity] ?? 0) - (V6_ACTIVITY_SEVERITY_RANK[a.severity] ?? 0);
  if (severityDelta) return severityDelta;
  if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
  return b.createdAt.localeCompare(a.createdAt);
}

function dedupeActivityItems(items: V6ActivityItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.sourceKind}:${item.sourceId}:${item.category}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function groupActivityItems(items: V6ActivityItem[]): V6ActivityGroup[] {
  const buckets = new Map<V6ActivityCategory, V6ActivityItem[]>();
  items.forEach((item) => {
    const list = buckets.get(item.category) ?? [];
    list.push(item);
    buckets.set(item.category, list);
  });

  return V6_ACTIVITY_CATEGORY_ORDER.filter((category) => buckets.has(category)).map((category) => {
    const groupItems = [...(buckets.get(category) ?? [])].sort(compareActivityItems);
    return {
      category,
      label: V6_ACTIVITY_CATEGORY_LABELS[category],
      items: groupItems,
      unreadCount: groupItems.filter((item) => !item.isRead).length
    };
  });
}

export function selectV6ActivityCenterForActor(
  db: V6Database,
  actor: V6User,
  options: V6ActivityCenterOptions = {}
): V6ActivityCenterViewModel {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const recentLimit = options.recentLimit ?? DEFAULT_RECENT_LIMIT;
  const notifications = selectV6NotificationsForActor(db, actor).map((item) => mapV6NotificationToActivityItem(item, actor));
  const messages = selectV6MessagesForActor(db, actor).map((item) => mapV6MessageToActivityItem(item, actor, selectV6ActivityGroupName(db, item)));
  const events = selectV6UpcomingEvents(db, actor).map(mapV6EventToActivityItem);
  const audit =
    options.includeAudit !== false && (actor.role === "management" || actor.role === "super_admin")
      ? db.auditLog
          .filter((entry) => entry.studioId === actor.studioId)
          .map(mapV6AuditEntryToActivityItem)
          .filter((item): item is V6ActivityItem => Boolean(item))
      : [];
  const derived = selectV6RoleDerivedActivityItems(db, actor);
  const extras = options.extras ?? [];

  const items = dedupeActivityItems(
    [...extras, ...derived, ...notifications, ...messages, ...events, ...audit]
      .filter((item) => roleAllowsCategory(actor.role, item.category))
      .sort(compareActivityItems)
      .slice(0, limit)
  );

  const groups = groupActivityItems(items);
  const recent = items.slice(0, recentLimit);
  const unreadCount = items.filter((item) => !item.isRead).length;

  return {
    items,
    groups,
    recent,
    unreadCount,
    totalCount: items.length
  };
}

export function selectV6ActivityItemNavigation(item: V6ActivityItem) {
  return {
    tab: item.targetTab,
    screen: item.targetScreen
  };
}

export function selectV6ActivityCenterUnreadCount(db: V6Database, actor: V6User) {
  return selectV6ActivityCenterForActor(db, actor, { limit: 80, recentLimit: 0 }).unreadCount;
}
