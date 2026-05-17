import type { EntityId, IsoDateString, IsoDateTimeString } from "@/lib/types/base";

export type AcademyId = EntityId;
export type SchoolYearId = string;
export type MoneyAmount = number;

export type AcademyScopedModel = {
  id: EntityId;
  academyId: AcademyId;
  createdAt: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
};

export type LifecycleStatus = "draft" | "active" | "scheduled" | "completed" | "cancelled" | "archived";
export type ApprovalStatus = "not_required" | "pending" | "approved" | "rejected";
export type VisibilityScope = "student" | "linked_parent" | "group" | "teacher" | "management" | "staff" | "public_event";

export type OperationsActorRole = "student" | "parent" | "teacher" | "management" | "super_admin";

export type OperationsActorContext = {
  academyId: AcademyId;
  actorUserId: EntityId;
  role: OperationsActorRole;
  groupIds?: EntityId[];
  linkedStudentIds?: EntityId[];
  teacherIds?: EntityId[];
  isSuperAdmin?: boolean;
};

export type OperationsAuditAction =
  | "attendance.edit"
  | "payment_status.change"
  | "media_visibility.change"
  | "event.edit"
  | "parent_student_link.change"
  | "role.change"
  | "practice_assignment.edit"
  | "notification.preference_change"
  | "private_lesson.status_change";

export type OperationsAuditDraft = {
  academyId: AcademyId;
  actorUserId: EntityId;
  action: OperationsAuditAction;
  entityType: string;
  entityId: EntityId;
  before?: unknown;
  after?: unknown;
  reason?: string;
};

export type CalendarEventType =
  | "rehearsal"
  | "general_rehearsal"
  | "competition"
  | "annual_show"
  | "workshop"
  | "camp"
  | "private_lesson"
  | "deadline";

export type CalendarViewMode = "month" | "day" | "list" | "year";

export type CalendarParticipantStatus = "invited" | "confirmed" | "declined" | "attended" | "absent" | "not_required";

export type SchoolYear = AcademyScopedModel & {
  label: string;
  startsOn: IsoDateString;
  endsOn: IsoDateString;
  status: "planning" | "active" | "closed" | "archived";
};

export type CalendarFilter = {
  academyId: AcademyId;
  schoolYearId?: SchoolYearId;
  from?: IsoDateString;
  to?: IsoDateString;
  view?: CalendarViewMode;
  eventTypes?: CalendarEventType[];
  groupIds?: EntityId[];
  danceStyleIds?: EntityId[];
  teacherIds?: EntityId[];
  studentIds?: EntityId[];
};

export type CalendarEvent = AcademyScopedModel & {
  schoolYearId: SchoolYearId;
  type: CalendarEventType;
  title: string;
  description?: string;
  startsAt: IsoDateTimeString;
  endsAt?: IsoDateTimeString;
  allDay?: boolean;
  location?: string;
  groupIds: EntityId[];
  danceStyleIds: EntityId[];
  teacherIds: EntityId[];
  studentIds: EntityId[];
  linkedProductIds?: EntityId[];
  linkedMediaCollectionIds?: EntityId[];
  reminderIds: EntityId[];
  status: LifecycleStatus;
  visibility: VisibilityScope[];
};

export type CalendarParticipant = AcademyScopedModel & {
  eventId: EntityId;
  userId: EntityId;
  studentId?: EntityId;
  role: "student" | "parent" | "teacher" | "staff" | "guest";
  status: CalendarParticipantStatus;
  approvalStatus: ApprovalStatus;
  note?: string;
};

export type EventLifecycleStage =
  | "draft"
  | "announced"
  | "collecting_approvals"
  | "rehearsing"
  | "ready"
  | "live"
  | "completed"
  | "archived";

export type EventLifecycleState = AcademyScopedModel & {
  eventId: EntityId;
  stage: EventLifecycleStage;
  readinessScore?: number;
  openIssueIds: EntityId[];
  missingApprovalCount: number;
  missingCostumeCount: number;
  missingPaymentCount: number;
  nextAction?: string;
};

export type PracticeTaskKind = "daily_stretch" | "technique" | "choreography" | "conditioning" | "reflection";
export type PracticeTaskStatus = "draft" | "assigned" | "active" | "paused" | "completed" | "archived";
export type PracticeCompletionStatus = "done" | "skipped" | "excused" | "needs_help";

export type PracticeTask = AcademyScopedModel & {
  kind: PracticeTaskKind;
  title: string;
  instructions: string;
  estimatedMinutes: number;
  mediaIds?: EntityId[];
  createdByTeacherId: EntityId;
  status: PracticeTaskStatus;
};

export type PracticePlan = AcademyScopedModel & {
  title: string;
  schoolYearId?: SchoolYearId;
  groupIds: EntityId[];
  teacherIds: EntityId[];
  taskIds: EntityId[];
  startsOn: IsoDateString;
  endsOn?: IsoDateString;
  parentVisible: boolean;
  status: PracticeTaskStatus;
};

export type PracticeCompletion = AcademyScopedModel & {
  taskId: EntityId;
  planId?: EntityId;
  studentId: EntityId;
  groupId?: EntityId;
  completedOn: IsoDateString;
  status: PracticeCompletionStatus;
  note?: string;
  mediaIds?: EntityId[];
  reviewedByTeacherId?: EntityId;
};

export type PracticeStreak = {
  academyId: AcademyId;
  studentId: EntityId;
  currentStreakDays: number;
  longestStreakDays: number;
  completionRatePercent: number;
  lastCompletedOn?: IsoDateString;
};

export type AttendanceTrendKind = "absence" | "lateness" | "excused" | "missing_record";
export type EngagementRiskLevel = "low" | "medium" | "high" | "critical";

export type AttendanceAnalyticsWindow = {
  academyId: AcademyId;
  from: IsoDateString;
  to: IsoDateString;
  groupIds?: EntityId[];
  studentIds?: EntityId[];
  teacherIds?: EntityId[];
};

export type AttendanceTrend = {
  academyId: AcademyId;
  studentId: EntityId;
  groupId?: EntityId;
  kind: AttendanceTrendKind;
  count: number;
  dates: IsoDateString[];
  riskLevel: EngagementRiskLevel;
  suggestedFollowUp?: string;
};

export type AttendanceSummary = {
  academyId: AcademyId;
  studentId?: EntityId;
  groupId?: EntityId;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  missingRecordCount: number;
  attendanceRatePercent: number;
};

export type EngagementRiskScore = {
  academyId: AcademyId;
  studentId: EntityId;
  score: number;
  level: EngagementRiskLevel;
  reasons: string[];
  suggestedFollowUp?: string;
  requiresHumanReview: true;
};

export type NotificationKind =
  | "attendance_alert"
  | "event_reminder"
  | "rehearsal_update"
  | "competition_update"
  | "private_lesson_update"
  | "payment_order_update"
  | "teacher_message"
  | "practice_reminder"
  | "gallery_update";

export type NotificationChannel = "in_app" | "push" | "email" | "sms";
export type NotificationDeliveryState = "queued" | "sent" | "delivered" | "read" | "failed" | "cancelled";

export type NotificationTarget = {
  userIds?: EntityId[];
  studentIds?: EntityId[];
  parentIds?: EntityId[];
  teacherIds?: EntityId[];
  groupIds?: EntityId[];
  roles?: OperationsActorRole[];
};

export type OperationalNotification = AcademyScopedModel & {
  kind: NotificationKind;
  title: string;
  body: string;
  target: NotificationTarget;
  channels: NotificationChannel[];
  sourceEntityType?: string;
  sourceEntityId?: EntityId;
  requiresApproval: boolean;
  createdByUserId: EntityId;
  scheduledFor?: IsoDateTimeString;
  status: "draft" | "approved" | "queued" | "sent" | "cancelled";
};

export type NotificationPreference = AcademyScopedModel & {
  userId: EntityId;
  kind: NotificationKind;
  channels: NotificationChannel[];
  enabled: boolean;
  quietHours?: {
    startsAt: string;
    endsAt: string;
    timezone: string;
  };
};

export type NotificationDelivery = AcademyScopedModel & {
  notificationId: EntityId;
  userId: EntityId;
  channel: NotificationChannel;
  state: NotificationDeliveryState;
  providerMessageId?: string;
  error?: string;
  deliveredAt?: IsoDateTimeString;
  readAt?: IsoDateTimeString;
};

export type MediaOperationKind = "lesson_timeline" | "event_gallery" | "annual_show_archive" | "competition_memory";
export type MediaModerationState = "pending_review" | "approved" | "hidden" | "rejected" | "archived";

export type MediaTag = AcademyScopedModel & {
  label: string;
  kind: "student" | "group" | "event" | "style" | "teacher" | "custom";
  linkedEntityId?: EntityId;
};

export type MediaVisibilityRule = AcademyScopedModel & {
  collectionId?: EntityId;
  mediaItemId?: EntityId;
  visibility: VisibilityScope[];
  groupIds?: EntityId[];
  studentIds?: EntityId[];
  parentVisible: boolean;
  expiresAt?: IsoDateTimeString;
};

export type MediaOperationCollection = AcademyScopedModel & {
  kind: MediaOperationKind;
  title: string;
  eventId?: EntityId;
  lessonId?: EntityId;
  groupIds: EntityId[];
  teacherIds: EntityId[];
  mediaItemIds: EntityId[];
  tagIds: EntityId[];
  moderationState: MediaModerationState;
  visibilityRuleId?: EntityId;
};

export type TeacherUploadHistory = AcademyScopedModel & {
  teacherId: EntityId;
  mediaItemId: EntityId;
  collectionId?: EntityId;
  uploadedAt: IsoDateTimeString;
  moderationState: MediaModerationState;
};

export type ProductLifecycleStatus = "draft" | "published" | "paused" | "sold_out" | "archived";
export type StockState = "untracked" | "in_stock" | "low_stock" | "sold_out" | "preorder";
export type OrderStatus = "draft" | "pending" | "confirmed" | "fulfilled" | "cancelled" | "refunded";
export type PaymentStatus = "not_required" | "pending" | "manual_office_pending" | "paid" | "failed" | "refunded" | "partially_refunded";

export type OperationalProduct = AcademyScopedModel & {
  title: string;
  productType: "shop_item" | "event_ticket" | "private_lesson" | "camp" | "workshop";
  price: MoneyAmount;
  currency: "ILS";
  stockState: StockState;
  stockQuantity?: number;
  linkedEventId?: EntityId;
  status: ProductLifecycleStatus;
};

export type OperationalOrder = AcademyScopedModel & {
  buyerUserId: EntityId;
  studentId?: EntityId;
  productIds: EntityId[];
  totalAmount: MoneyAmount;
  currency: "ILS";
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "future_provider" | "manual_office" | "cash" | "bank_transfer" | "not_required";
  receiptId?: EntityId;
  refundIds?: EntityId[];
};

export type PrivateLessonRequestState =
  | "draft"
  | "requested"
  | "teacher_review"
  | "approved"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "payment_pending";

export type TeacherAvailability = AcademyScopedModel & {
  teacherId: EntityId;
  weekday: number;
  startsAt: string;
  endsAt: string;
  location?: string;
  effectiveFrom: IsoDateString;
  effectiveTo?: IsoDateString;
  status: "active" | "paused" | "archived";
};

export type PrivateLessonSlotSuggestion = {
  academyId: AcademyId;
  teacherId: EntityId;
  studentId: EntityId;
  startsAt: IsoDateTimeString;
  endsAt: IsoDateTimeString;
  confidence: "low" | "medium" | "high";
  reason: string;
};

export type PrivateLessonRequest = AcademyScopedModel & {
  studentId: EntityId;
  parentUserId?: EntityId;
  teacherId?: EntityId;
  requestedByUserId: EntityId;
  preferredStyleIds: EntityId[];
  preferredWindows?: string[];
  approvedSlot?: PrivateLessonSlotSuggestion;
  state: PrivateLessonRequestState;
  paymentStatus: PaymentStatus;
  reminderIds: EntityId[];
};

export type PrivateLessonHistoryEntry = AcademyScopedModel & {
  requestId: EntityId;
  studentId: EntityId;
  teacherId: EntityId;
  startsAt: IsoDateTimeString;
  status: "completed" | "cancelled" | "no_show";
  teacherNote?: string;
};

export type ManagementIssueKind =
  | "missing_attendance"
  | "unresolved_issue"
  | "inactive_student"
  | "missing_rehearsal"
  | "unpaid_order"
  | "pending_private_lesson"
  | "event_readiness";

export type ManagementIssue = {
  academyId: AcademyId;
  kind: ManagementIssueKind;
  title: string;
  severity: EngagementRiskLevel;
  entityType: string;
  entityId: EntityId;
  groupIds?: EntityId[];
  studentIds?: EntityId[];
  teacherIds?: EntityId[];
  nextAction: string;
  createdAt: IsoDateTimeString;
};

export type AIInsightSource =
  | "attendance"
  | "calendar"
  | "practice"
  | "notifications"
  | "media"
  | "shop"
  | "private_lessons"
  | "management";

export type AIOperationalInsight = AcademyScopedModel & {
  source: AIInsightSource;
  title: string;
  summary: string;
  riskLevel: EngagementRiskLevel;
  targetEntityType?: string;
  targetEntityId?: EntityId;
  suggestedActions: string[];
  requiresApproval: true;
  approvalStatus: "draft" | "pending_review" | "approved" | "rejected";
  approvedByUserId?: EntityId;
  publishedEntityId?: EntityId;
};
