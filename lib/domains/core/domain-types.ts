import type { AudienceTarget, EntityId, IsoDateString, IsoDateTimeString, StudioScopedTimestamped } from "@/lib/types/base";
import type { V6Role } from "@/lib/v6/types";

export type StudioId = EntityId;
export type AcademyId = EntityId;
export type UserId = EntityId;
export type StudentId = EntityId;
export type ParentId = EntityId;
export type FamilyId = EntityId;
export type TeacherId = EntityId;
export type GroupId = EntityId;
export type WeeklyGroupScheduleId = EntityId;
export type LessonOccurrenceId = EntityId;
export type AttendanceRecordId = EntityId;
export type StudioRoomId = EntityId;
export type MembershipPlanId = EntityId;
export type NotificationId = EntityId;
export type StudioMessageId = EntityId;
export type AttentionItemId = EntityId;

export type DomainEntityKind =
  | "student"
  | "parent"
  | "family"
  | "teacher"
  | "group"
  | "weekly_group_schedule"
  | "lesson_occurrence"
  | "attendance_record"
  | "studio_room"
  | "membership_plan"
  | "notification"
  | "studio_message"
  | "attention_item";

export type DomainReference = {
  kind: DomainEntityKind;
  id: EntityId;
};

export type DomainStatus = "active" | "inactive" | "pending" | "paused" | "archived";
export type CommunicationMode = "parent" | "direct" | "mixed";
export type WeekdayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type LessonOccurrenceStatus = "scheduled" | "cancelled" | "completed" | "needs_attention";
export type AttendanceStatus = "present" | "absent" | "late" | "excused" | "missing";
export type PaymentStatus = "not_applicable" | "demo_disabled" | "pending" | "due" | "overdue" | "partial" | "paid" | "refunded";
export type MembershipPlanStatus = "active" | "paused" | "cancelled" | "draft";
export type MessageChannel = "announcement" | "group" | "direct" | "staff" | "system";
export type AttentionSeverity = "info" | "warning" | "urgent";
export type AttentionStatus = "open" | "in_progress" | "resolved" | "dismissed";

export type AcademyScoped = {
  academyId?: AcademyId;
};

export type DomainRecord = Omit<StudioScopedTimestamped, "studioId"> & {
  studioId: StudioId;
} & AcademyScoped;

export type Student = DomainRecord & {
  id: StudentId;
  userId: UserId;
  displayName: string;
  status: DomainStatus;
  familyId?: FamilyId;
  parentIds: ParentId[];
  groupIds: GroupId[];
  primaryTeacherIds?: TeacherId[];
  ageGroupId?: EntityId;
  danceStyleIds: EntityId[];
  membershipPlanId?: MembershipPlanId;
  paymentStatus?: PaymentStatus;
  communicationMode?: CommunicationMode;
};

export type ParentFamily = DomainRecord & {
  id: FamilyId;
  familyName?: string;
  primaryParentId?: ParentId;
  parentIds: ParentId[];
  studentIds: StudentId[];
  billingContactParentId?: ParentId;
  communicationMode: CommunicationMode;
  notes?: string;
};

export type Parent = DomainRecord & {
  id: ParentId;
  userId: UserId;
  displayName: string;
  status: DomainStatus;
  familyId?: FamilyId;
  linkedStudentIds: StudentId[];
  primaryContact?: boolean;
  communicationPrefs?: string;
};

export type Teacher = DomainRecord & {
  id: TeacherId;
  userId: UserId;
  displayName: string;
  status: DomainStatus;
  groupIds: GroupId[];
  danceStyleIds: EntityId[];
  privateLessonEnabled?: boolean;
  responsibility?: string;
};

export type Group = DomainRecord & {
  id: GroupId;
  name: string;
  status: DomainStatus;
  ageGroupId?: EntityId;
  danceStyleId?: EntityId;
  teacherIds: TeacherId[];
  studentIds: StudentId[];
  defaultRoomId?: StudioRoomId;
  weeklyScheduleIds: WeeklyGroupScheduleId[];
  communicationMode: CommunicationMode;
  parentVisible: boolean;
  notes?: string;
};

export type WeeklyGroupSchedule = DomainRecord & {
  id: WeeklyGroupScheduleId;
  groupId: GroupId;
  weekday: WeekdayKey;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  roomId: StudioRoomId;
  teacherIds?: TeacherId[];
  effectiveFrom?: IsoDateString;
  effectiveUntil?: IsoDateString;
  status: "active" | "paused" | "archived";
  label?: string;
};

export type LessonOccurrence = DomainRecord & {
  id: LessonOccurrenceId;
  groupId: GroupId;
  weeklyScheduleId?: WeeklyGroupScheduleId;
  date: IsoDateString;
  startAt: IsoDateTimeString;
  endAt?: IsoDateTimeString;
  roomId?: StudioRoomId;
  teacherIds: TeacherId[];
  status: LessonOccurrenceStatus;
  source: "weekly_schedule" | "event" | "manual";
  cancelledReason?: string;
};

export type AttendanceRecord = DomainRecord & {
  id: AttendanceRecordId;
  lessonOccurrenceId: LessonOccurrenceId;
  studentId: StudentId;
  groupId: GroupId;
  status: AttendanceStatus;
  note?: string;
  markedByUserId?: UserId;
  markedAt?: IsoDateTimeString;
};

export type StudioRoom = DomainRecord & {
  id: StudioRoomId;
  name: string;
  capacity?: number;
  active: boolean;
  notes?: string;
};

export type MembershipPlan = DomainRecord & {
  id: MembershipPlanId;
  name: string;
  status: MembershipPlanStatus;
  billingCycle: "monthly" | "semester" | "annual" | "one_time";
  price?: number;
  currency?: "ILS";
  groupLimit?: number;
};

export type Notification = DomainRecord & {
  id: NotificationId;
  audience: AudienceTarget;
  title: string;
  body: string;
  category: "attendance" | "message" | "task" | "event" | "shop" | "system";
  priority: "normal" | "important" | "urgent";
  relatedEntity?: DomainReference;
  readByUserIds: UserId[];
  createdByUserId?: UserId;
};

export type StudioMessage = DomainRecord & {
  id: StudioMessageId;
  channel: MessageChannel;
  senderUserId: UserId;
  audience: AudienceTarget;
  groupId?: GroupId;
  title?: string;
  body: string;
  readByUserIds?: UserId[];
  createdAt: IsoDateTimeString;
};

export type AttentionItem = DomainRecord & {
  id: AttentionItemId;
  kind: "attendance" | "payment" | "schedule" | "registration" | "task" | "student_wellbeing" | "system";
  subject: DomainReference;
  title: string;
  body?: string;
  severity: AttentionSeverity;
  status: AttentionStatus;
  ownerUserId?: UserId;
  dueAt?: IsoDateTimeString;
  source?: DomainReference;
};

export type DomainUserRole = V6Role;

