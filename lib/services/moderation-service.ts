import type { LocalDatabase } from "@/lib/local-db/db-types";
import type { ModerationQueueItem } from "@/lib/platform-os/types";
import { logActivity } from "./activity-feed-service";

export function reportToModerationQueue(
  db: LocalDatabase,
  item: Omit<ModerationQueueItem, "id" | "status" | "createdAt">
): LocalDatabase {
  const row: ModerationQueueItem = {
    ...item,
    id: `mod_${Date.now().toString(36)}`,
    status: "open",
    createdAt: new Date().toISOString()
  };
  return {
    ...db,
    platformOs: {
      ...db.platformOs,
      moderationQueue: [row, ...db.platformOs.moderationQueue]
    }
  };
}

export function resolveModerationItem(
  db: LocalDatabase,
  itemId: string,
  resolvedByUserId: string,
  status: "resolved" | "dismissed"
): LocalDatabase {
  const item = db.platformOs.moderationQueue.find((m) => m.id === itemId);
  let next: LocalDatabase = {
    ...db,
    platformOs: {
      ...db.platformOs,
      moderationQueue: db.platformOs.moderationQueue.map((m) =>
        m.id === itemId
          ? { ...m, status, resolvedByUserId, resolvedAt: new Date().toISOString() }
          : m
      )
    }
  };
  if (item) {
    next = logActivity(next, item.studioId, "moderation", "פריט נסגר בתור הניהול", {
      visibility: "studio",
      relatedType: "moderation",
      relatedId: itemId
    });
  }
  return next;
}

export function lockGroupChat(db: LocalDatabase, chatId: string): LocalDatabase {
  return {
    ...db,
    chats: db.chats.map((c) => (c.id === chatId ? { ...c, groupName: `${c.groupName} (נעול)` } : c))
  };
}
