import type { V6ActivityCategory } from "./types";

export const V6_ACTIVITY_CATEGORY_LABELS: Record<V6ActivityCategory, string> = {
  announcement: "הודעות מהסטודיו",
  message: "הודעות קבוצה",
  schedule: "שינויים בלוח",
  attendance: "נוכחות",
  class: "שיעורים",
  event: "אירועים",
  commerce: "חנות ורכישות",
  system: "מערכת"
};

export const V6_ACTIVITY_CATEGORY_ORDER: V6ActivityCategory[] = [
  "attendance",
  "schedule",
  "class",
  "event",
  "announcement",
  "message",
  "commerce",
  "system"
];

export const V6_ACTIVITY_SEVERITY_RANK: Record<string, number> = {
  critical: 4,
  important: 3,
  notice: 2,
  info: 1
};
