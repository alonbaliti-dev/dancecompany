import type { LucideIcon } from "lucide-react";

export type { AudienceTarget, AudienceTargetType, EntityId, IsoDateString, IsoDateTimeString, StudioScoped, StudioScopedEntity, StudioScopedTimestamped, Timestamped } from "./types/base";

export type {
  AppRuntime,
  DeviceSnapshot,
  DeviceType,
  PreviewRole,
  ResolvedLayoutMode,
  ViewMode
} from "@/lib/device/device-detection";

/** Primary bottom navigation — daily hub structure. */
export type MainTabId = "dashboard" | "lessons" | "messages" | "shop" | "more";

export type MainTabBadgeKey = "messages" | "tasks";

/** Full-screen routes opened from More, headers, or action center (stack over main tab). */
export type StackTabId =
  | "profile"
  | "teacher"
  | "files"
  | "attendance"
  | "ai"
  | "management"
  | "users"
  | "reports"
  | "studio_settings"
  | "schedule_full"
  | "group_chats"
  | "send_update"
  | "notifications"
  | "gallery"
  | "legacy_board"
  | "levels"
  | "rehearsal_mode"
  | "feedback_hub"
  | "calendar_hub"
  | "parent_peace"
  | "studio_health"
  | "live_feed"
  | "ai_coach"
  | "risk_center"
  | "attendance_intelligence"
  | "creator_dashboard"
  | "super_admin_hub"
  | "studios_admin"
  | "feature_flags"
  | "platform_audit"
  | "platform_billing"
  | "system_updates"
  | "data_safety"
  | "billing"
  | "audit_log"
  | "global_settings"
  | "branding_editor"
  | "shop"
  | "studio_legacy"
  | "studio_faculty"
  | "studio_media"
  | "dance_styles"
  | "practice_hub"
  | "progress"
  | "settings"
  | "view_display_settings"
  | "tasks_hub"
  | "text_editor"
  | "user_relationships"
  | "activity_feed"
  | "backup_restore"
  | "system_status"
  | "parent_consents"
  | "moderation_queue"
  | "event_command_center"
  | "role_onboarding";

export type TabId = MainTabId | StackTabId;

/** Unified priority for sorting “what matters first” across tasks, updates, and nudges. */
export type FlowPriority = "urgent" | "important" | "normal";

export type UserType = "super_admin" | "management" | "teacher" | "parent" | "student";

export type UserPermissions = {
  isStudent: boolean;
  isTeacher: boolean;
  isManagement: boolean;
  isSuperAdmin: boolean;
  canSendNotifications: boolean;
  canManageUsers: boolean;
  canManageGallery: boolean;
  canModerateChats: boolean;
  canManageEvents: boolean;
  canViewReports: boolean;
  canManageBilling: boolean;
  canManageFeatureFlags: boolean;
  canManageShop: boolean;
  canManageAttendance: boolean;
  canCreateTasks: boolean;
  canReviewVideos: boolean;
};

export type EditableText = {
  id: string;
  key: string;
  studioId?: string;
  scope: "global" | "studio";
  module: string;
  label: string;
  he: string;
  en?: string;
  defaultHe: string;
  defaultEn?: string;
  lastEditedByUserId?: string;
  lastEditedByName?: string;
  updatedAt?: string;
};

export type FeatureFlags = {
  aiCoach: boolean;
  liveEventFeed: boolean;
  parentPeaceMode: boolean;
  videoUploads: boolean;
  staffChat: boolean;
  gallery: boolean;
  achievementsBoard: boolean;
  reports: boolean;
  payments: boolean;
  shop: boolean;
  studioIdentity: boolean;
};

export type StudioBranding = {
  studioName: string;
  logoText: string;
  primaryColor: string;
  accentColor: string;
  appName: string;
};

export type StudioRecord = {
  id: string;
  name: string;
  status: "active" | "disabled";
  plan: "starter" | "pro" | "enterprise";
  activeUsers: number;
  storageGb: number;
  createdAt: string;
};

export type SoftDeleteMeta = {
  archivedAt?: string;
  deletedAt?: string;
  deletedByUserId?: string;
  restoredAt?: string;
};

export type AuditLogEntry = {
  id: string;
  studioId: string;
  actorUserId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId?: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
};

export type ReleaseNote = {
  id: string;
  version: string;
  title: string;
  body: string;
  publishedAt: string;
  type: "release" | "maintenance" | "upcoming";
};

export type PlatformBillingSummary = {
  plan: string;
  monthlyPriceNis: number;
  paymentStatus: "paid" | "due" | "trial";
  activeStudents: number;
  storageGb: number;
};

/** Authenticated studio user — permissions come from server profile after login (mock: from seed). */
export type UserProfile = {
  id: string;
  studioId: string;
  type: UserType;
  name: string;
  /** E.164-style local display: 05XXXXXXXX */
  phone: string;
  email?: string;
  avatarInitial: string;
  permissions: UserPermissions;
  /** Group display names (legacy roster) */
  assignedGroups: string[];
  /** Group ids for management UI */
  assignedGroupIds?: string[];
  linkedStudentIds?: string[];
  linkedParentIds?: string[];
  passwordLastChangedAt: string;
  lastLoginAt: string;
  status: "active" | "inactive" | "removed";
  /** @deprecated use type === "parent" */
  isParent?: boolean;
  /** Mock: מורה שרשאי לנעוץ הודעות בצ׳אט צוות */
  canPinStaffMessages?: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Row in management → user directory (audit trail for permission changes). */
export type DirectoryUser = UserProfile & {
  lastActiveAt: string;
  permissionsModifiedBy: string | null;
  permissionsModifiedAt: string | null;
};

export type StudioGroup = SoftDeleteMeta & {
  id: string;
  studioId: string;
  seasonId?: string;
  name: string;
  levelLabel?: string;
};

export type TabDefinition = {
  id: TabId;
  label: string;
  icon: LucideIcon;
};

export type MainTabDefinition = {
  id: MainTabId;
  label: string;
  icon: LucideIcon;
  badgeKey?: MainTabBadgeKey;
};

/** Aggregated achievement for legacy board + profile */
export type GeneratedAchievement = {
  id: string;
  title: string;
  description?: string;
  year: number;
  source: "event" | "competition" | "task" | "attendance" | "video" | "feedback" | "level" | "milestone" | "manual";
  scope: "student" | "group" | "studio";
  userId?: string;
  groupId?: string;
  eventId?: string;
  awardedAt: string;
  place?: AchievementPlace;
};

/** Class session for schedule views */
export type StudioClass = {
  id: string;
  studioId: string;
  section: "today" | "week";
  day: string;
  time: string;
  title: string;
  group: string;
  teacher: string;
  room: string;
  style: string;
  status: "confirmed" | "optional" | "cancelled";
};

export type TrainingCategory = string;

export type TrainingItem = {
  id: string;
  title: string;
  category: string;
  duration: string;
  xp: number;
  done: boolean;
  difficulty: "קל" | "בינוני" | "מתקדם";
  featured?: boolean;
};

/** Legacy checklist on home (being phased out for `StudentTask`). */
export type StudioTask = {
  id: string;
  title: string;
  body: string;
  due: string;
  xp: number;
  done: boolean;
  relatedGroup?: string;
  relatedClass?: string;
};

export type TaskFrequency = "once" | "daily" | "weekly" | "custom";

/** Structured studio task (assignments, XP, recurrence). */
export type StudentTask = SoftDeleteMeta & {
  id: string;
  studioId: string;
  seasonId?: string;
  title: string;
  description: string;
  targetType: "personal" | "group" | "studio";
  assignedStudentIds?: string[];
  assignedGroupIds?: string[];
  createdByUserId: string;
  createdByName: string;
  dueDate?: string;
  startDate: string;
  endDate?: string;
  frequency: TaskFrequency;
  timesPerWeek?: number;
  targetCompletions: number;
  /** Used for `personal` tasks (single assignee). */
  completedCount: number;
  progressPercent: number;
  status: "not_started" | "in_progress" | "completed" | "overdue";
  xpReward: number;
  relatedGoal?: string;
  /** For `group` / `studio` tasks — per-student completion counts. */
  perStudentCompletions?: Record<string, number>;
};

export type StudioUpdate = {
  id: string;
  studioId: string;
  title: string;
  body: string;
  targetType: "personal" | "group" | "studio";
  assignedStudentIds?: string[];
  assignedGroupIds?: string[];
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  priority: "normal" | "important" | "urgent";
  readByUserIds: string[];
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  tag: string;
  date: string;
  important?: boolean;
};

export type StudentStats = {
  name: string;
  group: string;
  level: string;
  streak: number;
  xp: number;
  attendance: number;
  xpToNextLevel: number;
  monthlyProgressPct: number;
};

export type PerformanceCountdown = {
  label: string;
  daysRemaining: number;
  eventTitle: string;
};

export type Achievement = {
  title: string;
  body: string;
  icon: LucideIcon;
};

export type TeacherGroup = {
  id: string;
  name: string;
  level: string;
  students: number;
  attendancePct: number;
  practiceCompletionPct: number;
  nextSession: string;
};

export type TeacherTodayClass = {
  id: string;
  time: string;
  title: string;
  room: string;
  groupName: string;
  expected: number;
  marked: number;
};

export type StudentAtRisk = {
  id: string;
  name: string;
  group: string;
  reason: string;
};

export type PendingTaskReview = {
  id: string;
  title: string;
  group: string;
  count: number;
};

export type TeacherQuickAction = {
  id: string;
  label: string;
};

export type TeacherDashboardData = {
  groups: TeacherGroup[];
  todaysClasses: TeacherTodayClass[];
  homePracticeByGroup: { groupName: string; completionPct: number }[];
  studentsAtRisk: StudentAtRisk[];
  pendingReviews: PendingTaskReview[];
  quickActions: TeacherQuickAction[];
};

export type ManagementTeacherCard = {
  userId: string;
  name: string;
  groups: number;
  attendancePct: number;
  taskCompletionPct: number;
  studentsAtRisk: number;
  lastAttendanceUpdate: string;
  engagementScore: number;
};

export type ManagementAlert = {
  id: string;
  kind: "attendance" | "practice" | "inactive";
  title: string;
  detail: string;
};

export type ManagementRankingRow = {
  rank: number;
  name: string;
  score: number;
  note: string;
};

export type ManagementOverview = {
  totalTeachers: number;
  totalGroups: number;
  totalStudents: number;
  sessionsThisWeek: number;
  averageAttendancePct: number;
  homeTaskCompletionPct: number;
  teachers: ManagementTeacherCard[];
  alerts: ManagementAlert[];
  ranking: ManagementRankingRow[];
  studioInsight: string;
};

// ——— Student goals ———

export type GoalCategory = "flexibility" | "attendance" | "home_practice" | "performance_prep" | "custom";

export type StudentGoal = {
  id: string;
  studentId: string;
  category: GoalCategory;
  title: string;
  description: string;
  monthlyProgressPct: number;
  deadline: string;
  progressPercent: number;
  teacherNotes?: string;
  createdAt: string;
};

// ——— Digital student file (מורים / הנהלה) ———

export type AttendanceHistoryEntry = {
  date: string;
  status: "present" | "late" | "absent";
  classTitle: string;
};

export type DigitalStudentFile = {
  studentId: string;
  strengths: string[];
  improvementAreas: string[];
  teacherNotes: string;
  attendanceHistory: AttendanceHistoryEntry[];
  taskHistorySummary: string;
  practiceStreakDays: number;
  uploadedVideoIds: string[];
  timeline: { date: string; label: string; detail: string }[];
};

// ——— Practice videos ———

export type PracticeVideoStatus = "pending_review" | "approved" | "needs_correction";

export type PracticeVideo = {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  note: string;
  mockUri: string;
  attachedTaskId?: string;
  attachedGoalId?: string;
  status: PracticeVideoStatus;
  teacherFeedback?: string;
  technicalNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
};

// ——— Attendance ———

export type AttendanceMark = "present" | "late" | "absent";

export type ClassAttendanceRow = {
  studentId: string;
  studentName: string;
  mark: AttendanceMark | null;
  repeatedAbsences?: number;
};

export type AttendanceSession = {
  id: string;
  classId: string;
  classTitle: string;
  groupName: string;
  date: string;
  teacherId: string;
  rows: ClassAttendanceRow[];
  updatedAt: string | null;
};

/** Staff attendance intelligence — granular class-level records (Sep–Jul school year). */
export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export type AttendanceRecord = {
  id: string;
  studioId: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  teacherId: string;
  teacherName: string;
  classDate: string;
  classTitle: string;
  status: AttendanceStatus;
  note?: string;
};

export type AttendanceRiskLevel = "ok" | "watch" | "at_risk";

export type AttendanceTrend = "improving" | "stable" | "declining";

export type StudentAttendanceSummary = {
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  teacherId: string;
  teacherName: string;
  totalScheduled: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  attendedCount: number;
  attendancePct: number;
  currentStreak: number;
  absencesLast4Weeks: number;
  missedDates: string[];
  trend: AttendanceTrend;
  riskLevel: AttendanceRiskLevel;
  lastAbsence?: AttendanceRecord;
  lastAttendedDate?: string;
  flaggedForReview?: boolean;
};

export type GroupAttendanceSummary = {
  groupId: string;
  groupName: string;
  teacherName: string;
  studentCount: number;
  averageAttendancePct: number;
  atRiskCount: number;
};

// ——— Parent area (עתידי — מודל בלבד) ———

export type ParentProfile = {
  id: string;
  name: string;
  phone: string;
  linkedStudentIds: string[];
};

export type ParentApprovalItem = {
  id: string;
  title: string;
  dueDate: string;
};

export type ParentDashboardData = {
  parentId: string;
  announcements: Announcement[];
  schedulePreview: StudioClass[];
  paymentStatusLabel: string;
  pendingApprovals: ParentApprovalItem[];
  equipmentList: string[];
  performanceSummary: string;
  generalProgressSummary: string;
};

// ——— Performances & competitions ———

export type RehearsalSlot = {
  date: string;
  time: string;
  note: string;
};

export type ChecklistItem = {
  item: string;
  done: boolean;
};

export type PerformanceEventDetail = {
  id: string;
  title: string;
  daysRemaining: number;
  venue: string;
  rehearsalSchedule: RehearsalSlot[];
  costumeRequirements: string[];
  equipmentChecklist: ChecklistItem[];
  orderOfAppearance: string[];
  parentApprovalsPending: number;
  musicFileLabel: string;
};

// ——— Gamification ———

export type BadgeUnlock = {
  id: string;
  title: string;
  unlockedAt: string;
};

export type GamificationState = {
  xp: number;
  level: number;
  levelLabel: string;
  streakDays: number;
  badges: BadgeUnlock[];
  weeklyChallengeTitle: string;
  weeklyChallengeProgressPct: number;
  groupChallengeTitle: string;
  groupChallengeProgressPct: number;
};

// ——— Management reports ———

export type ReportTeacherActivity = {
  name: string;
  score: string;
  detail: string;
};

export type ReportRiskRow = {
  segment: string;
  note: string;
};

export type ManagementReportSummary = {
  teacherActivity: ReportTeacherActivity[];
  attendanceCompletionPct: number;
  taskCompletionPct: number;
  homePracticeEngagementPct: number;
  atRiskStudents: { name: string; reason: string }[];
  retentionRisk: ReportRiskRow[];
  unreadImportantUpdates: number;
  groupsNeedingAttention: { groupName: string; reason: string }[];
  weeklyHebrewInsight: string;
};

export type AiToolId = "weekly_task" | "parent_message" | "summarize_progress" | "at_risk";

// ——— Broadcast notifications (teacher / management) ———

export type NotificationTargetType =
  | "student"
  | "students"
  | "dance_group"
  | "all_students"
  | "teacher"
  | "teachers"
  | "all_teachers"
  | "staff"
  | "studio";

export type NotificationRelatedType =
  | "update"
  | "task"
  | "chat"
  | "attendance"
  | "event"
  | "gallery"
  | "private_lesson";

export type Notification = {
  id: string;
  studioId: string;
  title: string;
  body: string;
  createdByUserId: string;
  createdByName: string;
  targetType: NotificationTargetType;
  targetUserIds?: string[];
  targetGroupIds?: string[];
  priority: FlowPriority;
  relatedType?: NotificationRelatedType;
  relatedId?: string;
  readByUserIds: string[];
  createdAt: string;
};

// ——— Group & staff chat (studio workspace) ———

export type DanceGroupChat = {
  id: string;
  studioId: string;
  chatType: "dance_group" | "staff";
  groupId?: string;
  groupName: string;
  teacherIds: string[];
  studentIds: string[];
  pinnedMessageIds: string[];
};

export type ChatMessageType = "text" | "video" | "note" | "teacher_feedback";

export type ChatModerationStatus = "visible" | "removed" | "flagged";

export type ChatMessage = {
  id: string;
  groupChatId: string;
  senderUserId: string;
  senderName: string;
  senderRoleLabel: string;
  messageType: ChatMessageType;
  body: string;
  videoUrl?: string;
  attachedTaskId?: string;
  attachedGoalId?: string;
  /** Links teacher_feedback to a video message in the same thread */
  replyToMessageId?: string;
  createdAt: string;
  isPinned: boolean;
  moderationStatus: ChatModerationStatus;
  reviewedAt?: string;
};

export type SendStudioUpdatePayload = {
  targetType: NotificationTargetType;
  targetUserIds?: string[];
  targetGroupIds?: string[];
  title: string;
  body: string;
  priority: FlowPriority;
  pinToGroupChat?: boolean;
};

// ——— Learning gallery ———

export type GalleryVisibility =
  | "student_group"
  | "specific_students"
  | "teachers_only"
  | "staff_only"
  | "management_only";

export type GallerySourceType = "manual_upload" | "group_chat" | "staff_chat";

export type GalleryMediaKind = "video" | "photo";

export type GalleryItem = SoftDeleteMeta & {
  id: string;
  studioId: string;
  seasonId?: string;
  title: string;
  description?: string;
  mediaKind?: GalleryMediaKind;
  videoUrl?: string;
  photoUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  uploadStatus?: "idle" | "uploading" | "complete" | "failed";
  processingStatus?: "pending" | "processing" | "ready" | "failed";
  mimeType?: string;
  fileSizeBytes?: number;
  streamingUrl?: string;
  createdByUserId: string;
  createdByName: string;
  sourceType: GallerySourceType;
  sourceMessageId?: string;
  visibility: GalleryVisibility;
  assignedGroupIds?: string[];
  assignedStudentIds?: string[];
  tags: string[];
  relatedTaskId?: string;
  relatedGoalId?: string;
  createdAt: string;
  isPinned: boolean;
};

export type GalleryUploadPayload = {
  title: string;
  description?: string;
  mediaKind?: GalleryMediaKind;
  videoUrl?: string;
  photoUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  visibility: GalleryVisibility;
  assignedGroupIds?: string[];
  assignedStudentIds?: string[];
  tags: string[];
  relatedTaskId?: string;
  relatedGoalId?: string;
  notifyUsers?: boolean;
};

export type SaveToGalleryPayload = {
  messageId: string;
  chatId: string;
  title: string;
  description?: string;
  visibility: GalleryVisibility;
  assignedGroupIds?: string[];
  assignedStudentIds?: string[];
  tags: string[];
  notifyUsers?: boolean;
};

// ——— Studio legacy board (achievements & events) ———

export type StudioEventStatus = "past" | "current" | "future";

export type StudioEventType =
  | "competition"
  | "performance"
  | "workshop"
  | "showcase"
  | "photoshoot"
  | "camp"
  | "other";

export type AchievementPlace = "1" | "2" | "3" | "finalist" | "special_award" | "participation";

export type StudioAchievement = {
  id: string;
  title: string;
  description?: string;
  place?: AchievementPlace;
  groupId?: string;
  studentIds?: string[];
  eventId: string;
  awardedAt: string;
  mediaUrl?: string;
};

export type LegacyTeacherNote = {
  id: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
};

export type LegacyTeacherSuggestion = {
  id: string;
  userId: string;
  userName: string;
  kind: "achievement" | "memory_video";
  title: string;
  description?: string;
  place?: AchievementPlace;
  createdAt: string;
};

export type StudioEvent = {
  id: string;
  title: string;
  type: StudioEventType;
  status: StudioEventStatus;
  date: string;
  endDate?: string;
  location?: string;
  participatingGroupIds: string[];
  participatingStudentIds?: string[];
  teacherIds: string[];
  description: string;
  achievements: StudioAchievement[];
  memoryVideoUrl?: string;
  memoryVideoThumbnailUrl?: string;
  photoGalleryUrls?: string[];
  equipmentChecklist?: string[];
  scheduleNotes?: string;
  parentApprovalRequired: boolean;
  parentApprovalCount?: number;
  isPublicToStudents: boolean;
  teacherNotes?: LegacyTeacherNote[];
  pendingSuggestions?: LegacyTeacherSuggestion[];
  createdByUserId: string;
  createdAt: string;
};

export type LegacyEventFormPayload = Omit<
  StudioEvent,
  "id" | "achievements" | "teacherNotes" | "pendingSuggestions" | "createdAt" | "createdByUserId"
> & {
  achievements?: StudioAchievement[];
};

export type LegacyEventNotifyTarget = "participants" | "parents" | "teachers" | "studio";

// ——— Studio shop ———

export type ShopProductCategory =
  | "studio_wear"
  | "dance_shoes"
  | "dance_socks"
  | "accessories"
  | "event_ticket"
  | "workshop"
  | "digital";

export type ShopStockStatus = "in_stock" | "low_stock" | "sold_out" | "preorder";

export type ShopProduct = {
  id: string;
  studioId: string;
  title: string;
  description: string;
  category: ShopProductCategory;
  price: number;
  currency: "ILS";
  imageUrl?: string;
  tags: string[];
  availableSizes?: string[];
  availableColors?: string[];
  stockStatus: ShopStockStatus;
  relatedEventId?: string;
  isActive: boolean;
};

export type ShopOrderItem = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
};

export type ShopPaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export type ShopFulfillmentStatus = "new" | "processing" | "ready_for_pickup" | "delivered" | "cancelled";

export type ShopOrder = {
  id: string;
  studioId: string;
  userId: string;
  userName: string;
  items: ShopOrderItem[];
  totalPrice: number;
  currency: "ILS";
  paymentStatus: ShopPaymentStatus;
  fulfillmentStatus: ShopFulfillmentStatus;
  paymentMethod?: ShopPaymentMethod;
  /** Links to `payment_transactions` row — set after intent creation */
  paymentTransactionId?: string;
  /** Placeholder for server-generated receipt PDF URL */
  receiptUrl?: string;
  createdAt: string;
};

/**
 * Checkout method shown to the user.
 * Card data is never collected in-app — `credit_card` opens PSP hosted fields on server.
 */
export type ShopPaymentMethod =
  | "apple_pay"
  | "google_pay"
  | "credit_card"
  | "bit"
  | "paybox"
  | "bank_transfer"
  /** @deprecated Use `credit_card` */
  | "card";

export type ShopProductFormPayload = Omit<ShopProduct, "id" | "studioId" | "currency">;

export type ShopCartLine = ShopOrderItem & { product: ShopProduct };

// ——— Private lessons (shop) ———

export type PrivateLessonDurationMinutes = 30 | 45;

export type PrivateLessonPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PrivateLessonRequestPaymentStatus = "not_started" | "pending" | "paid" | "failed" | "refunded";

export type PrivateLessonAvailabilityRequestStatus =
  | "waiting_for_teacher"
  | "teacher_suggested_time"
  | "student_requested_other_time"
  | "ready_for_payment"
  | "reserved"
  | "not_available"
  | "cancelled";

export type PrivateLessonSuggestedSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
};

export type PrivateLessonAvailabilityRequest = {
  id: string;
  studioId: string;
  teacherId: string;
  teacherName: string;
  productId: string;
  requestedByUserId: string;
  requestedByName: string;
  studentId: string;
  studentName: string;
  durationMinutes: PrivateLessonDurationMinutes;
  preferredTimeNotes?: string;
  studentNote?: string;
  status: PrivateLessonAvailabilityRequestStatus;
  teacherSuggestedSlots?: PrivateLessonSuggestedSlot[];
  selectedSlotId?: string;
  paymentStatus: PrivateLessonRequestPaymentStatus;
  paymentMethod?: ShopPaymentMethod;
  paymentTransactionId?: string;
  bookingId?: string;
  managementCoordinated?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PrivateLessonBookingStatus = "requested" | "confirmed" | "completed" | "cancelled";

export type PrivateLessonProduct = {
  id: string;
  studioId: string;
  teacherId: string;
  teacherName: string;
  teacherStyles: string[];
  title: string;
  description: string;
  durations: {
    minutes: PrivateLessonDurationMinutes;
    price: number;
  }[];
  availabilityNote?: string;
  warmupPolicy: string;
  isActive: boolean;
};

export type PrivateLessonBooking = {
  id: string;
  studioId: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  productId: string;
  durationMinutes: PrivateLessonDurationMinutes;
  price: number;
  currency: "ILS";
  paymentStatus: PrivateLessonPaymentStatus;
  bookingStatus: PrivateLessonBookingStatus;
  paymentMethod?: ShopPaymentMethod;
  paymentTransactionId?: string;
  requestedDate?: string;
  requestedTime?: string;
  notes?: string;
  availabilityRequestId?: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  createdAt: string;
};

// ——— Studio identity: legacy & faculty ———

export type InstitutionalStyleId =
  | "flamenco"
  | "ballet"
  | "modern"
  | "hiphop"
  | "acro"
  | "jazz"
  | "lyrical"
  | "pre_ballet";

export type LegacyMilestoneKind =
  | "competition_win"
  | "annual_show"
  | "showcase"
  | "workshop"
  | "international"
  | "guest_choreographer"
  | "milestone"
  | "media"
  | "charity";

export type LegacyMilestone = {
  id: string;
  studioId: string;
  title: string;
  subtitle?: string;
  year: number;
  kind: LegacyMilestoneKind;
  eventType?: StudioEventType;
  participatingGroups: string[];
  awards?: string[];
  quote?: string;
  heroImageUrl?: string;
  memoryVideoUrl?: string;
  relatedEventId?: string;
  featured?: boolean;
  tags: string[];
};

export type StudioLegacyQuote = {
  id: string;
  text: string;
  attribution: string;
};

/** Core dance disciplines — aligned with LK mentor team structure */
export type DanceStyle = "flamenco" | "ballet" | "pointe" | "modern" | "hiphop" | "acro" | "repertoire";

export type FacultyMemberRole = "owner" | "management" | "teacher" | "mentor";

/** Persisted in `/database/faculty.json` — single source of truth for staff/styles. */
export type FacultyRecord = {
  id: string;
  studioId: string;
  userId: string;
  fullName: string;
  role: FacultyMemberRole;
  danceStyles: DanceStyle[];
  profileImage?: string;
  visibility: "public" | "internal";
  assignedGroupIds: string[];
  privateLessonEnabled: boolean;
  managementAccess?: boolean;
  shortDescription?: string;
};

/** Runtime view for UI (enriched from FacultyRecord + directory permissions). */
export type FacultyMember = {
  id: string;
  studioId: string;
  userId: string;
  fullName: string;
  role: FacultyMemberRole;
  danceStyles: DanceStyle[];
  visibility: "public" | "internal";
  profileImage?: string;
  shortDescription?: string;
  permissions: UserPermissions;
  assignedGroupIds: string[];
  privateLessonEnabled: boolean;
  privateLessonFocus?: string[];
  canUploadGallery: boolean;
  canModerateChats: boolean;
  canManageAttendance: boolean;
  /** Premium UI */
  portraitGradient: string;
  roleLabelHe: string;
};

export type StudioMission = {
  studioId: string;
  missionStatement: string;
  vision: string;
  foundedYear: number;
};

export type InstitutionalDanceStyle = {
  id: InstitutionalStyleId;
  nameHe: string;
  nameEn: string;
  description: string;
  energy: string;
  mood: string;
  signatureColors: { core: string; soft: string; border: string; glow: string };
  heroGradient: string;
  featuredTeacherIds: string[];
  featuredGroupNames: string[];
  relatedEventIds?: string[];
  galleryPlaceholders: string[];
};

// ——— Studio OS: professional levels ———

export type ProfessionalLevelId = "beginner" | "foundation" | "intermediate" | "advanced" | "team" | "elite";

export type LevelSkillItem = {
  id: string;
  label: string;
  completed: boolean;
  teacherApproved: boolean;
};

export type StudentLevelProgress = {
  userId: string;
  currentLevel: ProfessionalLevelId;
  progressPct: number;
  skills: LevelSkillItem[];
  promotionRequestedAt?: string;
  promotedAt?: string;
};

// ——— Studio OS: heatmap ———

export type PracticeHeatmapDay = {
  date: string;
  minutes: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type ConsistencyStats = {
  streakDays: number;
  bestWeekMinutes: number;
  missedDaysLast30: number;
  consistencyScore: number;
  days: PracticeHeatmapDay[];
};

// ——— Studio OS: professional feedback ———

export type FeedbackCategory =
  | "technique"
  | "energy"
  | "musicality"
  | "flexibility"
  | "confidence"
  | "teamwork";

export type ProfessionalFeedbackEntry = {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  category: FeedbackCategory;
  score: number;
  note: string;
  visibleToStudent: boolean;
  relatedVideoId?: string;
  relatedTaskId?: string;
  relatedEventId?: string;
  createdAt: string;
};

// ——— Studio OS: rehearsal mode ———

export type RehearsalSession = {
  id: string;
  title: string;
  groupId?: string;
  eventId?: string;
  date: string;
  musicLabel?: string;
  orderOfAppearance: string[];
  equipmentChecklist: { item: string; done: boolean }[];
  attendance: { studentId: string; name: string; present: boolean | null }[];
  notes: string;
  timerStartedAt?: string;
  studentBrief?: {
    arriveBy: string;
    location: string;
    bring: string[];
    lineupPosition?: number;
  };
};

// ——— Studio OS: live event feed ———

export type LiveFeedStatus = "arrived" | "warming_up" | "on_stage" | "results" | "update";

export type LiveFeedPost = {
  id: string;
  eventId: string;
  status: LiveFeedStatus;
  message: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  photoUrl?: string;
  parentVisible: boolean;
};

// ——— Studio OS: risk ———

export type RiskSeverity = "low" | "medium" | "high";

export type RiskAlert = {
  id: string;
  severity: RiskSeverity;
  title: string;
  detail: string;
  groupId?: string;
  studentId?: string;
  teacherId?: string;
  kind: "attendance" | "tasks" | "inactive" | "teacher_ops" | "group_engagement";
};

// ——— Studio OS: unified calendar ———

export type CalendarEntryType =
  | "class"
  | "rehearsal"
  | "competition"
  | "photoshoot"
  | "workshop"
  | "camp"
  | "birthday"
  | "other";

export type StudioCalendarEntry = {
  id: string;
  title: string;
  type: CalendarEntryType;
  date: string;
  endDate?: string;
  time?: string;
  groupId?: string;
  groupName?: string;
  teacherId?: string;
  location?: string;
};

// ——— Studio OS: parent peace ———

export type ParentPeaceSummary = {
  childUserId: string;
  childName: string;
  attendanceToday: "present" | "absent" | "unknown";
  nextClassLabel: string;
  nextEventLabel?: string;
  unreadUpdates: number;
  taskProgressPct: number;
  equipmentReminders: string[];
  pendingApprovals: { id: string; title: string; dueLabel: string }[];
  paymentPlaceholder?: string;
};

// ——— Studio OS: AI coach ———

export type AiDailyRecommendation = {
  title: string;
  why: string;
  durationMinutes: number;
  relatedTaskId?: string;
  relatedGoalId?: string;
  relatedVideoLabel?: string;
};

// ——— External studio media (public platforms) ———

export type ExternalMediaPlatform = "instagram" | "youtube" | "facebook";

export type ExternalMediaCategory =
  | "performance"
  | "rehearsal"
  | "workshop"
  | "studio_update"
  | "achievement"
  | "flamenco"
  | "hiphop"
  | "modern"
  | "ballet"
  | "acro";

export type ExternalMediaItem = {
  id: string;
  platform: ExternalMediaPlatform;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  externalUrl: string;
  category: ExternalMediaCategory;
  featured: boolean;
};

export type StudioHealthSnapshot = {
  score: number;
  alertsCount: number;
  teacherActivityPct: number;
  lowEngagementGroups: string[];
  urgentUpdates: number;
};
