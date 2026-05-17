import type { AcademyScopedQuery } from "@/lib/security/academy-scope";
import type { EntityId, IsoDateString } from "@/lib/types/base";
import type {
  AIOperationalInsight,
  AttendanceAnalyticsWindow,
  AttendanceSummary,
  AttendanceTrend,
  CalendarEvent,
  CalendarFilter,
  CalendarParticipant,
  EngagementRiskScore,
  EventLifecycleState,
  ManagementIssue,
  MediaOperationCollection,
  MediaVisibilityRule,
  NotificationDelivery,
  NotificationPreference,
  OperationalNotification,
  OperationalOrder,
  OperationalProduct,
  OperationsActorContext,
  OperationsAuditDraft,
  PracticeCompletion,
  PracticePlan,
  PracticeStreak,
  PracticeTask,
  PrivateLessonHistoryEntry,
  PrivateLessonRequest,
  PrivateLessonSlotSuggestion,
  SchoolYear,
  TeacherAvailability
} from "@/lib/domains/operations/types";

export type OperationsRepositoryContext = AcademyScopedQuery & {
  actor?: OperationsActorContext;
};

export type OperationsListOptions = {
  limit?: number;
  cursor?: string;
};

export type CalendarEventDraft = Omit<CalendarEvent, "id" | "createdAt" | "updatedAt" | "reminderIds"> & {
  id?: EntityId;
  reminderIds?: EntityId[];
};

export type NotificationDraft = Omit<OperationalNotification, "id" | "createdAt" | "updatedAt"> & {
  id?: EntityId;
};

export type PracticeCompletionDraft = Omit<PracticeCompletion, "id" | "createdAt" | "updatedAt"> & {
  id?: EntityId;
};

export type PrivateLessonRequestDraft = Omit<PrivateLessonRequest, "id" | "createdAt" | "updatedAt" | "reminderIds"> & {
  id?: EntityId;
  reminderIds?: EntityId[];
};

export interface CalendarOperationsRepository {
  listSchoolYears(scope: OperationsRepositoryContext): Promise<SchoolYear[]>;
  listEvents(scope: OperationsRepositoryContext, filters?: CalendarFilter): Promise<CalendarEvent[]>;
  getEvent(scope: OperationsRepositoryContext, eventId: EntityId): Promise<CalendarEvent | null>;
  upsertEvent(scope: OperationsRepositoryContext, draft: CalendarEventDraft): Promise<CalendarEvent>;
  listParticipants(scope: OperationsRepositoryContext, eventId: EntityId): Promise<CalendarParticipant[]>;
  listLifecycleStates(scope: OperationsRepositoryContext, eventId?: EntityId): Promise<EventLifecycleState[]>;
}

export interface PracticeOperationsRepository {
  listTasks(scope: OperationsRepositoryContext, options?: OperationsListOptions): Promise<PracticeTask[]>;
  listPlans(scope: OperationsRepositoryContext, filters?: { groupIds?: EntityId[]; teacherIds?: EntityId[]; activeOn?: IsoDateString }): Promise<PracticePlan[]>;
  assignPlan(scope: OperationsRepositoryContext, plan: PracticePlan): Promise<PracticePlan>;
  recordCompletion(scope: OperationsRepositoryContext, completion: PracticeCompletionDraft): Promise<PracticeCompletion>;
  listCompletions(scope: OperationsRepositoryContext, filters?: { studentIds?: EntityId[]; groupIds?: EntityId[]; from?: IsoDateString; to?: IsoDateString }): Promise<PracticeCompletion[]>;
  listStreaks(scope: OperationsRepositoryContext, studentIds?: EntityId[]): Promise<PracticeStreak[]>;
}

export interface AttendanceAnalyticsRepository {
  listTrends(scope: OperationsRepositoryContext, window: AttendanceAnalyticsWindow): Promise<AttendanceTrend[]>;
  listSummaries(scope: OperationsRepositoryContext, window: AttendanceAnalyticsWindow): Promise<AttendanceSummary[]>;
  listEngagementRisks(scope: OperationsRepositoryContext, window: AttendanceAnalyticsWindow): Promise<EngagementRiskScore[]>;
}

export interface NotificationOperationsRepository {
  createDraft(scope: OperationsRepositoryContext, draft: NotificationDraft): Promise<OperationalNotification>;
  queueApproved(scope: OperationsRepositoryContext, notificationId: EntityId): Promise<OperationalNotification>;
  listForUser(scope: OperationsRepositoryContext, userId: EntityId, options?: OperationsListOptions): Promise<OperationalNotification[]>;
  listPreferences(scope: OperationsRepositoryContext, userId: EntityId): Promise<NotificationPreference[]>;
  updatePreference(scope: OperationsRepositoryContext, preference: NotificationPreference): Promise<NotificationPreference>;
  listDeliveries(scope: OperationsRepositoryContext, notificationId: EntityId): Promise<NotificationDelivery[]>;
}

export interface MediaOperationsRepository {
  listCollections(scope: OperationsRepositoryContext, filters?: { eventId?: EntityId; groupIds?: EntityId[] }): Promise<MediaOperationCollection[]>;
  upsertCollection(scope: OperationsRepositoryContext, collection: MediaOperationCollection): Promise<MediaOperationCollection>;
  updateVisibilityRule(scope: OperationsRepositoryContext, rule: MediaVisibilityRule): Promise<MediaVisibilityRule>;
}

export interface ShopOperationsRepository {
  listOperationalProducts(scope: OperationsRepositoryContext, options?: OperationsListOptions): Promise<OperationalProduct[]>;
  listOrders(scope: OperationsRepositoryContext, filters?: { buyerUserId?: EntityId; studentId?: EntityId; paymentStatus?: string }): Promise<OperationalOrder[]>;
  updateOrderPaymentStatus(scope: OperationsRepositoryContext, orderId: EntityId, paymentStatus: OperationalOrder["paymentStatus"], audit: OperationsAuditDraft): Promise<OperationalOrder>;
}

export interface PrivateLessonOperationsRepository {
  listAvailability(scope: OperationsRepositoryContext, teacherId?: EntityId): Promise<TeacherAvailability[]>;
  listSlotSuggestions(scope: OperationsRepositoryContext, requestId: EntityId): Promise<PrivateLessonSlotSuggestion[]>;
  createRequest(scope: OperationsRepositoryContext, draft: PrivateLessonRequestDraft): Promise<PrivateLessonRequest>;
  updateRequestState(scope: OperationsRepositoryContext, requestId: EntityId, state: PrivateLessonRequest["state"], audit: OperationsAuditDraft): Promise<PrivateLessonRequest>;
  listHistory(scope: OperationsRepositoryContext, studentId?: EntityId): Promise<PrivateLessonHistoryEntry[]>;
}

export interface ManagementOperationsRepository {
  listIssues(scope: OperationsRepositoryContext, options?: OperationsListOptions): Promise<ManagementIssue[]>;
  acknowledgeIssue(scope: OperationsRepositoryContext, issueId: EntityId, actorUserId: EntityId): Promise<void>;
}

export interface AIOperationsRepository {
  listInsights(scope: OperationsRepositoryContext, options?: OperationsListOptions): Promise<AIOperationalInsight[]>;
  createInsightDraft(scope: OperationsRepositoryContext, insight: AIOperationalInsight): Promise<AIOperationalInsight>;
  updateApproval(scope: OperationsRepositoryContext, insightId: EntityId, approvalStatus: AIOperationalInsight["approvalStatus"], actorUserId: EntityId): Promise<AIOperationalInsight>;
}

export interface OperationsRepositoryBundle {
  calendar: CalendarOperationsRepository;
  practice: PracticeOperationsRepository;
  attendanceAnalytics: AttendanceAnalyticsRepository;
  notifications: NotificationOperationsRepository;
  media: MediaOperationsRepository;
  shop: ShopOperationsRepository;
  privateLessons: PrivateLessonOperationsRepository;
  management: ManagementOperationsRepository;
  ai: AIOperationsRepository;
}
