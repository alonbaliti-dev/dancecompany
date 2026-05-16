import type { V6Notification } from "@/lib/v6/types";

export type V6PrioritizedNotification = V6Notification & {
  priority: "low" | "normal" | "high" | "critical";
};

export function prioritizeV6Notifications(notifications: V6Notification[]): V6PrioritizedNotification[] {
  const score = (notification: V6Notification) => {
    if (notification.type === "system") return 4;
    if (notification.type === "private_lesson" || notification.type === "event") return 3;
    if (notification.type === "media" || notification.type === "task") return 2;
    return 1;
  };
  return notifications
    .map((notification) => {
      const value = score(notification);
      return { ...notification, priority: value === 4 ? "critical" : value === 3 ? "high" : value === 2 ? "normal" : "low" } as V6PrioritizedNotification;
    })
    .sort((a, b) => score(b) - score(a) || b.createdAt.localeCompare(a.createdAt));
}
