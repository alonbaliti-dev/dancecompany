export type V6Role = "student" | "parent" | "teacher" | "management" | "super_admin";
export type V6Tab = "dashboard" | "lessons" | "messages" | "shop" | "more";
export type V6Screen =
  | "home"
  | "users"
  | "private_lessons"
  | "media"
  | "calendar"
  | "legacy"
  | "database"
  | "texts"
  | "flags"
  | "audit"
  | "system"
  | "branding"
  | "integrations";

export type V6Permissions = {
  manageUsers: boolean;
  editCredentials: boolean;
  editPermissions: boolean;
  manageStudio: boolean;
  manageAttendance: boolean;
  manageShop: boolean;
  managePrivateLessons: boolean;
  manageMedia: boolean;
  exportImportDb: boolean;
  editText: boolean;
  viewAudit: boolean;
  manageFlags: boolean;
  manageBranding: boolean;
  systemHealth: boolean;
};

export type AcademyStatus = "active" | "inactive" | "archived";

export type AcademyBranding = {
  logo?: string;
  /** Legacy V6 login fields kept while the local MVP still reads studio.branding directly. */
  name?: string;
  tagline?: string;
  accent?: string;
  displayName: string;
  accentColors: {
    primary: string;
    secondary: string;
    highlight: string;
  };
  backgroundMood: string;
  danceStylePalette: string[];
  heroImagery: string[];
  typographyPreference?: string;
  shopMood: string;
  eventMood: string;
  galleryMood: string;
  pwaAppName: string;
  iconSet?: string[];
  splashScreens?: string[];
};

export type AcademySettings = {
  defaultLocale: "he-IL" | "en-US";
  direction: "rtl" | "ltr";
  defaultRouteStrategy: "/academy/[slug]" | "user_context";
  communicationMode: "parent_linked" | "direct" | "mixed";
  schoolYearLabel: string;
  adultGroupsEnabled: boolean;
  superAdminUserIds: string[];
  enabledFeatureFlags: AcademyFeatureFlag[];
  mediaStorage: {
    provider: "cloudflare-r2";
    bucket: string;
    keyPrefix: string;
    privateByDefault: boolean;
  };
};

export type Academy = {
  id: string;
  name: string;
  slug: string;
  location: string;
  country: string;
  timezone: string;
  status: AcademyStatus;
  branding: AcademyBranding;
  settings: AcademySettings;
  createdAt: string;
  updatedAt: string;
};

export type AcademyFeatureFlag =
  | "shop"
  | "private_lessons"
  | "media_gallery"
  | "ai_insights"
  | "push_notifications"
  | "event_mode"
  | "attendance"
  | "payments"
  | "public_legacy_gallery"
  | "adult_groups"
  | "student_uploads"
  | "daily_practice";

export type V6User = {
  id: string;
  studioId: string;
  academyId?: string;
  name: string;
  role: V6Role;
  platformRole?: "super_admin";
  academyIds?: string[];
  activeAcademyId?: string;
  phone: string;
  permissions: V6Permissions;
  groupIds: string[];
  linkedStudentIds: string[];
  linkedParentIds?: string[];
  ageGroup?: string;
  danceStyleIds?: string[];
  status?: "active" | "inactive" | "pending" | "paused";
  notes?: string;
  communicationPrefs?: string;
  primaryContact?: boolean;
  privateLessonEnabled?: boolean;
  responsibility?: string;
  active: boolean;
};

export type V6Credential = {
  userId: string;
  academyId?: string;
  phone: string;
  password: string;
};

export type V6AgeStage = "early_childhood" | "kindergarten" | "elementary" | "middle_school" | "high_school" | "adults";

export type V6AgeGroup = {
  id: string;
  studioId: string;
  academyId?: string;
  stage: V6AgeStage;
  name: string;
  ageRange: string;
  sortOrder: number;
  parentVisibilityDefault: boolean;
  communicationMode: "parent" | "direct" | "mixed";
  notes?: string;
};

export type V6DanceStyle = {
  id: string;
  studioId: string;
  academyId?: string;
  name: string;
  category: "flamenco" | "ballet" | "modern" | "hiphop" | "repertoire" | "jazz" | "conditioning" | "other";
  active: boolean;
  description?: string;
};

export type V6Group = {
  id: string;
  studioId: string;
  academyId?: string;
  name: string;
  style: string;
  ageGroup?: string;
  ageGroupId?: string;
  danceStyle?: string;
  danceStyleId?: string;
  schedule?: string;
  teacherIds: string[];
  studentIds: string[];
  yearlyEventIds?: string[];
  galleryCollectionIds?: string[];
  taskIds?: string[];
  attendanceLessonIds?: string[];
  parentVisibility?: boolean;
  communicationMode?: "parent" | "direct" | "mixed";
  location?: string;
  notes?: string;
};

export type V6Lesson = {
  id: string;
  studioId: string;
  academyId?: string;
  groupId: string;
  title: string;
  weekday: string;
  time: string;
  room: string;
};

export type V6Message = {
  id: string;
  studioId: string;
  academyId?: string;
  title: string;
  body: string;
  groupId?: string;
  createdAt: string;
};

export type V6Notification = {
  id: string;
  studioId: string;
  academyId?: string;
  userIds: string[];
  title: string;
  body: string;
  type: "private_lesson" | "shop" | "user" | "task" | "media" | "event" | "system";
  tab?: V6Tab;
  screen?: V6Screen;
  readBy: string[];
  createdAt: string;
};

export type V6Product = {
  id: string;
  studioId: string;
  academyId?: string;
  title: string;
  description: string;
  category: string;
  type?: "physical" | "event_ticket" | "private_lesson" | "workshop_camp" | "accessory" | "clothing";
  price: number;
  priceMode?: "paid" | "free" | "request";
  inventoryStatus?: "in_stock" | "out_of_stock" | "limited" | "preorder" | "draft";
  visibility?: "public" | "members" | "hidden";
  sizes?: string[];
  colors?: string[];
  notes?: string;
  pickupDeliveryNote?: string;
  memberOnly?: boolean;
  eventId?: string;
  groupIds?: string[];
  danceStyleIds?: string[];
  active: boolean;
  imageMediaIds: string[];
  featuredImageMediaId?: string;
};

export type V6AttendanceStatus = "present" | "absent" | "late" | "excused" | "missing";

export type V6AttendanceRecord = {
  id: string;
  studioId?: string;
  academyId?: string;
  studentId: string;
  lessonId: string;
  groupId?: string;
  classDate?: string;
  status: V6AttendanceStatus;
  note?: string;
  markedByUserId?: string;
  savedAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type V6CalendarEventType =
  | "regular_class"
  | "rehearsal"
  | "general_rehearsal"
  | "competition"
  | "performance"
  | "annual_show"
  | "workshop"
  | "private_lesson"
  | "studio_announcement"
  | "payment_deadline"
  | "costume_equipment_deadline";

export type V6CalendarEventStatus = "draft" | "scheduled" | "needs_attention" | "ready" | "completed" | "archived";

export type V6CalendarEvent = {
  id: string;
  studioId: string;
  academyId?: string;
  title: string;
  type: V6CalendarEventType;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  schoolYear: string;
  groupIds: string[];
  studentIds: string[];
  teacherIds: string[];
  ageGroupIds: string[];
  danceStyleIds: string[];
  whatToBring: string[];
  parentInstructions?: string;
  adultInstructions?: string;
  attachmentMediaIds: string[];
  galleryCollectionIds: string[];
  status: V6CalendarEventStatus;
  reminderIds: string[];
  ticketProductId?: string;
  paymentLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type V6EventParticipant = {
  id: string;
  studioId: string;
  academyId?: string;
  eventId: string;
  studentId: string;
  groupId?: string;
  status: "invited" | "confirmed" | "declined" | "attended" | "absent";
  arrivalTime?: string;
  costumeStatus?: "not_required" | "missing" | "in_progress" | "ready";
  equipmentStatus?: "not_required" | "missing" | "in_progress" | "ready";
  approvalStatus?: "not_required" | "pending" | "approved" | "declined";
  ticketStatus?: "not_required" | "pending" | "paid" | "issued";
  notes?: string;
};

export type V6EventGroup = {
  id: string;
  studioId: string;
  academyId?: string;
  eventId: string;
  groupId: string;
  role: "participant" | "featured" | "support" | "audience";
  rehearsalEventIds: string[];
  generalRehearsalEventId?: string;
  callTime?: string;
  costumeNotes?: string;
  equipmentNotes?: string;
};

export type V6EventChecklistItem = {
  id: string;
  studioId: string;
  academyId?: string;
  eventId: string;
  title: string;
  ownerRole: "teacher" | "management" | "office" | "student" | "parent";
  ownerUserId?: string;
  category: "rehearsal" | "arrival" | "costume" | "equipment" | "tickets" | "payment" | "media" | "communication" | "safety" | "other";
  status: "open" | "in_progress" | "done" | "blocked";
  dueDate?: string;
  groupIds: string[];
  studentIds: string[];
};

export type V6EventMedia = {
  id: string;
  studioId: string;
  academyId?: string;
  eventId: string;
  mediaId: string;
  groupIds: string[];
  visibility: "students" | "parents" | "staff" | "management" | "public_archive";
  status: "draft" | "needs_review" | "approved" | "hidden";
  caption?: string;
};

export type V6PrivateLesson = {
  id: string;
  studioId: string;
  academyId?: string;
  studentId: string;
  teacherId: string;
  requestedByUserId: string;
  duration: 30 | 45;
  price: number;
  status: "requested" | "teacher_suggested" | "slot_selected" | "payment_open" | "paid";
  suggestedSlots: string[];
  selectedSlot?: string;
  note?: string;
  createdAt: string;
};

export type V6MediaItem = {
  id: string;
  studioId: string;
  academyId?: string;
  uploadedByUserId: string;
  uploaderName?: string;
  title: string;
  fileName: string;
  mediaType: "image" | "video";
  groupId?: string;
  classId?: string;
  eventId?: string;
  competitionId?: string;
  studentId?: string;
  lessonDate?: string;
  lessonTime?: string;
  tags?: string[];
  r2Bucket?: string;
  r2Key?: string;
  thumbnailKey?: string;
  mimeType?: string;
  fileSize?: number;
  linkedGroupId?: string;
  linkedProductId?: string;
  linkedEventId?: string;
  linkedGalleryCollectionId?: string;
  linkedAchievementId?: string;
  localPreviewUrl?: string;
  visibility: "group" | "staff" | "shop" | "management" | "event" | "archive";
  createdAt: string;
};

export type V6GalleryCollection = {
  id: string;
  studioId: string;
  academyId?: string;
  title: string;
  kind: "current_year" | "group" | "event" | "competition" | "annual_show" | "achievement_archive" | "teacher_resource" | "practice_submission";
  schoolYear: string;
  groupIds: string[];
  eventId?: string;
  danceStyleIds: string[];
  visibility: "students" | "parents" | "staff" | "management" | "public_archive";
  coverMediaId?: string;
  description?: string;
  itemIds: string[];
  createdAt: string;
};

export type V6GalleryItem = {
  id: string;
  studioId: string;
  academyId?: string;
  collectionId: string;
  mediaId: string;
  title: string;
  caption?: string;
  taggedUserIds: string[];
  groupIds: string[];
  eventId?: string;
  status: "draft" | "needs_review" | "approved" | "hidden";
  uploadedByUserId: string;
  createdAt: string;
};

export type V6AchievementCategory = "competition_win" | "competition_participation" | "annual_show" | "special_performance" | "milestone" | "group_achievement" | "student_achievement";

export type V6Achievement = {
  id: string;
  studioId: string;
  academyId?: string;
  title: string;
  category: V6AchievementCategory;
  date: string;
  relatedEventId?: string;
  studentIds: string[];
  groupIds: string[];
  mediaIds: string[];
  description: string;
  visibility: "students" | "parents" | "staff" | "management" | "public_archive";
  enteredByUserId: string;
  createdAt: string;
};

export type V6LegacyEntry = {
  id: string;
  studioId: string;
  academyId?: string;
  title: string;
  category: V6AchievementCategory | "memory" | "archive_note";
  date?: string;
  schoolYear?: string;
  relatedEventId?: string;
  groupIds: string[];
  studentIds: string[];
  mediaIds: string[];
  summary: string;
  visibility: "students" | "parents" | "staff" | "management" | "public_archive";
  enteredByUserId: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
};

export type V6ShowReadiness = {
  id: string;
  studioId: string;
  academyId?: string;
  eventId: string;
  groupId?: string;
  score: number;
  rehearsalStatus: "not_started" | "in_progress" | "ready" | "blocked";
  costumeStatus: "not_required" | "missing" | "in_progress" | "ready";
  equipmentStatus: "not_required" | "missing" | "in_progress" | "ready";
  approvalsMissing: string[];
  attendanceRiskStudentIds: string[];
  ticketStatus?: "not_required" | "pending" | "open" | "ready";
  nextAction: string;
  updatedAt: string;
};

export type V6CompetitionResult = {
  id: string;
  studioId: string;
  academyId?: string;
  eventId: string;
  groupIds: string[];
  studentIds: string[];
  title: string;
  category: string;
  resultText?: string;
  placement?: string;
  mediaIds: string[];
  achievementId?: string;
  enteredByUserId: string;
  createdAt: string;
};

export type V6AuditEntry = {
  id: string;
  studioId: string;
  academyId?: string;
  actorUserId: string;
  actorName: string;
  action: string;
  target: string;
  createdAt: string;
};

export type V6Database = {
  version: 6;
  studios: Academy[];
  academies?: Academy[];
  users: V6User[];
  credentials: V6Credential[];
  ageGroups: V6AgeGroup[];
  groups: V6Group[];
  danceStyles: V6DanceStyle[];
  lessons: V6Lesson[];
  messages: V6Message[];
  notifications: V6Notification[];
  products: V6Product[];
  privateLessons: V6PrivateLesson[];
  media: V6MediaItem[];
  attendance: V6AttendanceRecord[];
  tasks: Array<{ id: string; studioId?: string; academyId?: string; groupId: string; assignedByUserId?: string; title: string; kind?: "practice" | "stretching" | "rehearsal" | "admin"; doneByUserIds: string[]; streakEnabled?: boolean; videoMediaIds?: string[] }>;
  events: V6CalendarEvent[];
  eventParticipants: V6EventParticipant[];
  eventGroups: V6EventGroup[];
  eventChecklists: V6EventChecklistItem[];
  eventMedia: V6EventMedia[];
  galleryCollections: V6GalleryCollection[];
  galleryItems: V6GalleryItem[];
  achievements: V6Achievement[];
  legacyEntries: V6LegacyEntry[];
  showReadiness: V6ShowReadiness[];
  competitionResults: V6CompetitionResult[];
  editableTexts: Record<string, string>;
  aiPrompts: Record<string, string>;
  aiInsights: Array<{
    id: string;
    studioId: string;
    audience: V6Role | "all";
    title: string;
    body: string;
    riskLevel: "low" | "medium" | "high";
    requiresApproval: boolean;
    createdAt: string;
  }>;
  featureFlags: Record<string, boolean>;
  auditLog: V6AuditEntry[];
};

export type V6Session = { userId: string } | null;
