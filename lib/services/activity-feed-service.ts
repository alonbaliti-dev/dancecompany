import type { LocalDatabase } from "@/lib/local-db/db-types";
import type { ActivityFeedItem, ActivityFeedKind } from "@/lib/platform-os/types";
import type { UserProfile } from "@/lib/types";
import { isManagement, isSuperAdmin, isTeacherTier } from "@/lib/permissions";

const MAX_FEED = 500;

export function appendActivity(
  db: LocalDatabase,
  input: Omit<ActivityFeedItem, "id" | "createdAt">
): LocalDatabase {
  const item: ActivityFeedItem = {
    ...input,
    id: `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    createdAt: new Date().toISOString()
  };
  return {
    ...db,
    platformOs: {
      ...db.platformOs,
      activityFeed: [item, ...db.platformOs.activityFeed].slice(0, MAX_FEED)
    }
  };
}

export function logActivity(
  db: LocalDatabase,
  studioId: string,
  kind: ActivityFeedKind,
  messageHe: string,
  opts?: Partial<Omit<ActivityFeedItem, "id" | "studioId" | "kind" | "messageHe" | "createdAt">>
): LocalDatabase {
  return appendActivity(db, {
    studioId,
    kind,
    messageHe,
    visibility: opts?.visibility ?? "studio",
    ...opts
  });
}

export function filterActivityForUser(user: UserProfile, items: ActivityFeedItem[]): ActivityFeedItem[] {
  if (isSuperAdmin(user)) return items;
  const studioId = user.studioId;
  let list = items.filter((i) => i.studioId === studioId || i.visibility === "platform");

  if (isManagement(user)) return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (isTeacherTier(user) && !isManagement(user)) {
    const groups = new Set(user.assignedGroups ?? []);
    list = list.filter(
      (i) =>
        i.visibility === "studio" ||
        i.actorUserId === user.id ||
        (i.targetGroupIds?.some((g) => groups.has(g)) ?? false)
    );
  } else {
    list = list.filter(
      (i) =>
        i.visibility === "personal" && i.targetUserIds?.includes(user.id) ||
        i.actorUserId === user.id ||
        (i.targetUserIds?.includes(user.id) ?? false) ||
        (i.visibility === "group" &&
          i.targetGroupIds?.some((g) => (user.assignedGroups ?? []).includes(g)))
    );
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
