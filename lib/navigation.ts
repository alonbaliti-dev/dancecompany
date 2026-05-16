import { LayoutDashboard, MessageCircle, MoreHorizontal, School, ShoppingBag } from "lucide-react";
import { statusForStudent, taskVisibleToStudent } from "./studio-task-logic";
import type { MainTabBadgeKey, MainTabDefinition, StudentTask, UserProfile } from "./types";

const NAV_LABEL_KEYS: Record<string, string> = {
  dashboard: "nav.dashboard",
  lessons: "nav.lessons",
  messages: "nav.messages",
  shop: "nav.shop",
  more: "nav.more"
};

/** Fixed five tabs — shop is a primary destination. */
export const MAIN_NAV_TABS: MainTabDefinition[] = [
  { id: "dashboard", label: "דשבורד", icon: LayoutDashboard },
  { id: "lessons", label: "שיעורים", icon: School },
  { id: "messages", label: "הודעות", icon: MessageCircle, badgeKey: "messages" },
  { id: "shop", label: "חנות", icon: ShoppingBag },
  { id: "more", label: "עוד", icon: MoreHorizontal }
];

export const MAIN_TAB_LABELS: Record<string, string> = {
  dashboard: "דשבורד",
  lessons: "שיעורים",
  messages: "הודעות",
  shop: "חנות",
  more: "עוד"
};

export function buildMainNavTabs(t?: (key: string, fallback: string) => string): MainTabDefinition[] {
  if (!t) return MAIN_NAV_TABS;
  return MAIN_NAV_TABS.map((tab) => ({
    ...tab,
    label: t(NAV_LABEL_KEYS[tab.id] ?? tab.id, tab.label)
  }));
}

export function computeMainTabBadges(
  user: UserProfile,
  tasks: StudentTask[],
  messagesUnread: number
): Partial<Record<MainTabBadgeKey, number>> {
  const openTasks = tasks
    .filter((t) => taskVisibleToStudent(t, user))
    .filter((t) => {
      const st = statusForStudent(t, user.id);
      return st === "overdue" || st === "in_progress" || st === "not_started";
    }).length;

  return {
    messages: Math.min(99, messagesUnread),
    tasks: Math.min(99, openTasks)
  };
}
