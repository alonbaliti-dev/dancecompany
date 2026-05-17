import type { EntityId, IsoDateTimeString } from "@/lib/types/base";
import type { OperationsActorRole } from "@/lib/domains/operations/types";

export type OperationsAnalyticsEventName =
  | "screen.view"
  | "navigation.transition"
  | "action.failed"
  | "upload.failed"
  | "payment.failed"
  | "attendance.completed"
  | "task.completed"
  | "notification.engaged"
  | "gallery.used"
  | "search.used";

export type OperationsAnalyticsSurface =
  | "home"
  | "attendance"
  | "calendar"
  | "gallery"
  | "media_upload"
  | "shop"
  | "payments"
  | "notifications"
  | "management"
  | "super_admin"
  | "search"
  | "unknown";

export type OperationsAnalyticsPayloadByEvent = {
  "screen.view": {
    screen: OperationsAnalyticsSurface;
    loadBucket?: "instant" | "normal" | "slow" | "failed";
  };
  "navigation.transition": {
    fromScreen: OperationsAnalyticsSurface;
    toScreen: OperationsAnalyticsSurface;
    via: "tab" | "card" | "button" | "deep_link" | "back" | "system";
  };
  "action.failed": {
    surface: OperationsAnalyticsSurface;
    action: string;
    errorCode: string;
    recoveryShown: boolean;
  };
  "upload.failed": {
    uploadContext: "lesson" | "event" | "gallery" | "annual_show" | "unknown";
    fileKind: "image" | "video" | "document" | "unknown";
    sizeBucket: "small" | "medium" | "large" | "too_large" | "unknown";
    errorCode: string;
    retryable: boolean;
  };
  "payment.failed": {
    paymentContext: "shop" | "private_lesson" | "event_ticket" | "manual_office" | "unknown";
    providerState?: "sandbox" | "live" | "unknown";
    errorCode: string;
    amountBucket?: "low" | "medium" | "high" | "unknown";
  };
  "attendance.completed": {
    groupId?: EntityId;
    recordCount: number;
    durationBucket?: "under_30s" | "under_2m" | "under_5m" | "over_5m";
    offlineQueued?: boolean;
  };
  "task.completed": {
    taskKind: "practice" | "teacher_task" | "management_task" | "event_task" | "unknown";
    source: OperationsAnalyticsSurface;
  };
  "notification.engaged": {
    notificationKind: "attendance" | "event" | "payment" | "gallery" | "practice" | "system" | "unknown";
    channel: "in_app" | "push" | "email" | "sms" | "whatsapp";
    engagement: "sent" | "delivered" | "opened" | "dismissed" | "failed";
  };
  "gallery.used": {
    galleryKind: "lesson" | "event" | "annual_show" | "legacy" | "unknown";
    action: "opened" | "filtered" | "viewed_item" | "shared_allowed_link" | "reported_issue";
    itemCountBucket?: "empty" | "few" | "many" | "unknown";
  };
  "search.used": {
    scope: "global" | "students" | "events" | "media" | "shop" | "help" | "unknown";
    queryLengthBucket: "empty" | "short" | "medium" | "long";
    resultCountBucket: "none" | "few" | "many" | "unknown";
    usedFilter?: boolean;
  };
};

export type OperationsAnalyticsEvent<TName extends OperationsAnalyticsEventName = OperationsAnalyticsEventName> = {
  id: string;
  academyId: EntityId;
  name: TName;
  occurredAt: IsoDateTimeString;
  actorRole?: OperationsActorRole;
  sessionHash?: string;
  payload: OperationsAnalyticsPayloadByEvent[TName];
  privacy: {
    storesNames: false;
    storesContactDetails: false;
    storesRawSearchText: false;
    storesMediaContent: false;
    storesPaymentSecrets: false;
  };
};

export type OperationsAnalyticsDefinition = {
  name: OperationsAnalyticsEventName;
  labelHe: string;
  purpose: string;
  superAdminInsightHe: string;
};

export const phase9OperationsAnalyticsCatalog: readonly OperationsAnalyticsDefinition[] = [
  {
    name: "screen.view",
    labelHe: "שימוש במסכים",
    purpose: "Understand which operational screens are actually used during pilot.",
    superAdminInsightHe: "איזה אזורים נפתחים יותר ופחות"
  },
  {
    name: "navigation.transition",
    labelHe: "זרימת ניווט",
    purpose: "Find confusing paths without recording personal behavior.",
    superAdminInsightHe: "איפה אנשים מסתובבים יותר מדי"
  },
  {
    name: "action.failed",
    labelHe: "פעולות שנכשלו",
    purpose: "Count failed operational actions and whether recovery was shown.",
    superAdminInsightHe: "פעולות שדורשות תיקון"
  },
  {
    name: "upload.failed",
    labelHe: "כשלים בהעלאה",
    purpose: "Measure media upload reliability without collecting media content.",
    superAdminInsightHe: "העלאות שנכשלות"
  },
  {
    name: "payment.failed",
    labelHe: "כשלים בתשלום",
    purpose: "Track payment friction and sandbox/live anomalies without card data.",
    superAdminInsightHe: "תשלומים שדורשים בדיקה"
  },
  {
    name: "attendance.completed",
    labelHe: "השלמת נוכחות",
    purpose: "Verify class-time attendance can finish quickly, including weak internet.",
    superAdminInsightHe: "נוכחות שהושלמה בזמן"
  },
  {
    name: "task.completed",
    labelHe: "השלמת משימות",
    purpose: "Understand whether teacher, student, and management tasks are useful.",
    superAdminInsightHe: "משימות שמסתיימות בפועל"
  },
  {
    name: "notification.engaged",
    labelHe: "מעורבות בהתראות",
    purpose: "Measure notification health after consent and provider setup.",
    superAdminInsightHe: "התראות שנפתחו או נכשלו"
  },
  {
    name: "gallery.used",
    labelHe: "שימוש בגלריות",
    purpose: "Validate galleries are discoverable and stable without tracking media content.",
    superAdminInsightHe: "גלריות שנפתחות ונצפות"
  },
  {
    name: "search.used",
    labelHe: "שימוש בחיפוש",
    purpose: "Improve search usefulness without storing raw search text.",
    superAdminInsightHe: "חיפושים שמחזירים תוצאות"
  }
];

const blockedPayloadKeys = ["name", "email", "phone", "token", "secret", "password", "query", "searchText", "mediaUrl", "imageUrl"];

export function createOperationsAnalyticsEvent<TName extends OperationsAnalyticsEventName>(input: {
  id: string;
  academyId: EntityId;
  name: TName;
  occurredAt: IsoDateTimeString;
  actorRole?: OperationsActorRole;
  sessionHash?: string;
  payload: OperationsAnalyticsPayloadByEvent[TName];
}): OperationsAnalyticsEvent<TName> {
  assertPrivacySafePayload(input.payload);

  return {
    ...input,
    privacy: {
      storesNames: false,
      storesContactDetails: false,
      storesRawSearchText: false,
      storesMediaContent: false,
      storesPaymentSecrets: false
    }
  };
}

export function assertPrivacySafePayload(payload: Record<string, unknown>) {
  const keys = Object.keys(payload);
  const unsafeKey = keys.find((key) => blockedPayloadKeys.some((blocked) => key.toLowerCase().includes(blocked.toLowerCase())));

  if (unsafeKey) {
    throw new Error(`Operations analytics payload cannot include sensitive key: ${unsafeKey}`);
  }
}

export function bucketSearchQueryLength(query: string): OperationsAnalyticsPayloadByEvent["search.used"]["queryLengthBucket"] {
  if (!query.trim()) return "empty";
  if (query.length <= 12) return "short";
  if (query.length <= 40) return "medium";
  return "long";
}

export function bucketResultCount(count: number): "none" | "few" | "many" | "unknown" {
  if (!Number.isFinite(count) || count < 0) return "unknown";
  if (count === 0) return "none";
  if (count <= 10) return "few";
  return "many";
}
