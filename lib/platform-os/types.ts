/**
 * Production OS layer types — persisted in `/database/platform-os.json`, `seasons.json`, `consents.json`.
 */

export type BackupSnapshot = {
  id: string;
  label: string;
  createdAt: string;
  createdByUserId: string;
  createdByName: string;
  scope: "platform" | "studio";
  studioId?: string;
  /** Full LocalDatabase JSON at snapshot time */
  payload: unknown;
  byteSize: number;
  recordCounts: Record<string, number>;
  schemaVersion: number;
};

export type RestorePoint = {
  id: string;
  backupId: string;
  label: string;
  createdAt: string;
  scope: "platform" | "studio";
  studioId?: string;
  restoredAt?: string;
  restoredByUserId?: string;
};

export type ActivityFeedKind =
  | "task_completed"
  | "update_sent"
  | "gallery_upload"
  | "private_lesson"
  | "achievement"
  | "attendance"
  | "shop_order"
  | "event"
  | "notification"
  | "moderation"
  | "backup"
  | "consent"
  | "season"
  | "system";

export type ActivityFeedItem = {
  id: string;
  studioId: string;
  kind: ActivityFeedKind;
  /** Hebrew human-readable line */
  messageHe: string;
  messageEn?: string;
  actorUserId?: string;
  actorName?: string;
  targetUserIds?: string[];
  targetGroupIds?: string[];
  relatedType?: string;
  relatedId?: string;
  visibility: "personal" | "group" | "studio" | "platform";
  createdAt: string;
};

export type SyncActionStatus = "pending" | "syncing" | "synced" | "failed";

export type QueuedAction = {
  id: string;
  studioId: string;
  userId: string;
  actionType: string;
  payload: unknown;
  status: SyncActionStatus;
  createdAt: string;
  lastAttemptAt?: string;
  errorMessage?: string;
  retryCount: number;
};

export type MediaProcessingStatus = "pending" | "processing" | "ready" | "failed";

export type MediaPipelineMeta = {
  uploadStatus?: "idle" | "uploading" | "complete" | "failed";
  processingStatus?: MediaProcessingStatus;
  thumbnailUrl?: string;
  compressedUrl?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  maxSizeBytes?: number;
  /** Placeholder for signed CDN URL */
  streamingUrl?: string;
  storageQuotaMb?: number;
  lazyLoad?: boolean;
};

export type CalendarSyncProvider = "apple" | "google" | "ics";

export type CalendarSyncItemType =
  | "class"
  | "rehearsal"
  | "private_lesson"
  | "competition"
  | "annual_show"
  | "workshop";

export type CalendarSyncEntry = {
  id: string;
  studioId: string;
  itemType: CalendarSyncItemType;
  title: string;
  startAt: string;
  endAt?: string;
  location?: string;
  relatedId: string;
  icsBody?: string;
};

export type ConsentType =
  | "photography"
  | "video_upload"
  | "public_media"
  | "performance_participation"
  | "emergency_contact"
  | "app_terms"
  | "privacy_policy";

export type ConsentStatus = "pending" | "approved" | "denied" | "expired";

export type StudentConsentRecord = {
  id: string;
  studioId: string;
  studentUserId: string;
  parentUserId?: string;
  consentType: ConsentType;
  status: ConsentStatus;
  approvedAt?: string;
  expiresAt?: string;
  relatedEventId?: string;
  relatedGroupId?: string;
  notes?: string;
  updatedAt: string;
};

export type ModerationQueueItem = {
  id: string;
  studioId: string;
  kind: "message" | "gallery" | "chat_lock" | "user_mute";
  targetId: string;
  groupChatId?: string;
  reportedByUserId?: string;
  reason?: string;
  status: "open" | "resolved" | "dismissed";
  resolvedByUserId?: string;
  resolvedAt?: string;
  createdAt: string;
};

export type NotificationPreferences = {
  userId: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  digestMode: boolean;
  urgentBypass: boolean;
  groupNotifications: boolean;
  maxDailyFromTeachers?: number;
  readReceipts: boolean;
};

export type AnalyticsAggregate = {
  period: "day" | "week" | "month";
  studioId?: string;
  dau?: number;
  wau?: number;
  screenViews: Record<string, number>;
  taskCompletionRate?: number;
  attendanceTrendPct?: number;
  shopConversionRate?: number;
  privateLessonConversionRate?: number;
  notificationReadRate?: number;
  featureUsage: Record<string, number>;
  retentionRiskCount?: number;
  computedAt: string;
};

export type SystemStatusSnapshot = {
  appVersion: string;
  databaseStatus: "ok" | "degraded" | "error";
  storageUsedMb: number;
  storageLimitMb: number;
  failedUploads: number;
  brokenMediaLinks: number;
  paymentProviderStatus: "demo" | "connected" | "error";
  notificationDeliveryStatus: "ok" | "degraded";
  syncQueuePending: number;
  lastBackupAt?: string;
  lastError?: string;
  updatedAt: string;
};

export type PermissionPresetId =
  | "teacher_basic"
  | "teacher_senior"
  | "management_limited"
  | "management_full"
  | "shop_manager"
  | "event_manager"
  | "super_admin";

export type PermissionPreset = {
  id: PermissionPresetId;
  labelHe: string;
  labelEn: string;
  permissions: import("@/lib/types").UserPermissions;
};

export type StudioSeason = {
  id: string;
  studioId: string;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  archivedAt?: string;
  createdAt: string;
};

export type RoleOnboardingStep = {
  id: string;
  titleHe: string;
  descriptionHe: string;
  stackTarget?: string;
  completed: boolean;
};

export type RoleOnboardingProgress = {
  userId: string;
  role: import("@/lib/types").UserType;
  steps: RoleOnboardingStep[];
  completedAt?: string;
};

export type EventOperatingMode = {
  eventId: string;
  studioId: string;
  backstageMode: boolean;
  arrivalTracking: { studentId: string; arrivedAt?: string; checkedInBy?: string }[];
  emergencyContacts: { name: string; phone: string; role: string }[];
  costumeChecklist: string[];
  equipmentChecklist: string[];
  runningOrder: { order: number; groupName: string; pieceTitle: string; notes?: string }[];
  liveUpdates: { id: string; message: string; createdAt: string; createdByName: string }[];
  ticketScanPlaceholder: boolean;
  dressingRoomNotes?: string;
  memoryVideoCollectionOpen: boolean;
  updatedAt: string;
};

export type PlatformOsData = {
  backups: BackupSnapshot[];
  restorePoints: RestorePoint[];
  activityFeed: ActivityFeedItem[];
  syncQueue: QueuedAction[];
  moderationQueue: ModerationQueueItem[];
  notificationPrefsByUserId: Record<string, NotificationPreferences>;
  analyticsSnapshots: AnalyticsAggregate[];
  systemStatus: SystemStatusSnapshot;
  permissionPresets: PermissionPreset[];
  eventOperatingModes: Record<string, EventOperatingMode>;
  onboardingByUserId: Record<string, RoleOnboardingProgress>;
  calendarSyncEntries: CalendarSyncEntry[];
};

export type SeasonsData = {
  seasons: StudioSeason[];
};

export type ConsentsData = {
  records: StudentConsentRecord[];
};
