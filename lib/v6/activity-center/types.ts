import type { V6Tone } from "@/components/v6/design-system/tokens";
import type { V6Role, V6Screen, V6Tab } from "@/lib/v6/types";

export type V6ActivitySeverity = "info" | "notice" | "important" | "critical";

export type V6ActivityCategory =
  | "announcement"
  | "message"
  | "schedule"
  | "attendance"
  | "class"
  | "event"
  | "commerce"
  | "system";

export type V6ActivitySourceKind = "notification" | "message" | "event" | "audit" | "derived";

export type V6ActivityItem = {
  id: string;
  sourceKind: V6ActivitySourceKind;
  sourceId: string;
  category: V6ActivityCategory;
  severity: V6ActivitySeverity;
  title: string;
  body: string;
  meta: string;
  tone: V6Tone;
  createdAt: string;
  isRead: boolean;
  targetTab?: V6Tab;
  targetScreen?: V6Screen;
  audienceRoles?: V6Role[];
};

export type V6ActivityGroup = {
  category: V6ActivityCategory;
  label: string;
  items: V6ActivityItem[];
  unreadCount: number;
};

export type V6ActivityCenterViewModel = {
  items: V6ActivityItem[];
  groups: V6ActivityGroup[];
  recent: V6ActivityItem[];
  unreadCount: number;
  totalCount: number;
};

export type V6ActivityCenterOptions = {
  limit?: number;
  recentLimit?: number;
  includeAudit?: boolean;
  extras?: V6ActivityItem[];
};
