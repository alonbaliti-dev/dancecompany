import type {
  AiDailyRecommendation,
  AttendanceRecord,
  AttendanceSession,
  AuditLogEntry,
  DanceGroupChat,
  DirectoryUser,
  EditableText,
  FacultyMember,
  FacultyRecord,
  FeatureFlags,
  GamificationState,
  GalleryItem,
  LiveFeedPost,
  ManagementReportSummary,
  Notification,
  ParentDashboardData,
  PerformanceCountdown,
  PerformanceEventDetail,
  PracticeHeatmapDay,
  PracticeVideo,
  PrivateLessonAvailabilityRequest,
  PrivateLessonBooking,
  PrivateLessonProduct,
  ProfessionalFeedbackEntry,
  PlatformBillingSummary,
  RehearsalSession,
  ReleaseNote,
  RiskAlert,
  ShopOrder,
  ShopProduct,
  StudentGoal,
  StudentLevelProgress,
  StudentTask,
  StudioBranding,
  StudioCalendarEntry,
  StudioClass,
  StudioEvent,
  StudioGroup,
  StudioHealthSnapshot,
  LegacyMilestone,
  StudioLegacyQuote,
  StudioMission,
  StudioRecord,
  StudioUpdate,
  TrainingItem,
  TeacherDashboardData,
  ChatMessage,
  DigitalStudentFile
} from "@/lib/types";
import type { LocalAuthCredential } from "@/lib/auth/credentials";
import type { ConsentsData, PlatformOsData, SeasonsData } from "@/lib/platform-os/types";

const EMPTY_PLATFORM_OS: PlatformOsData = {
  backups: [],
  restorePoints: [],
  activityFeed: [],
  syncQueue: [],
  moderationQueue: [],
  notificationPrefsByUserId: {},
  analyticsSnapshots: [],
  systemStatus: {
    appVersion: "1.0.0",
    databaseStatus: "ok",
    storageUsedMb: 0,
    storageLimitMb: 5120,
    failedUploads: 0,
    brokenMediaLinks: 0,
    paymentProviderStatus: "demo",
    notificationDeliveryStatus: "ok",
    syncQueuePending: 0,
    updatedAt: new Date().toISOString()
  },
  permissionPresets: [],
  eventOperatingModes: {},
  onboardingByUserId: {},
  calendarSyncEntries: []
};

const EMPTY_SEASONS: SeasonsData = { seasons: [] };
const EMPTY_CONSENTS: ConsentsData = { records: [] };

export type ParentStudentLink = {
  id: string;
  studioId: string;
  parentUserId: string;
  studentUserId: string;
};

/** User row persisted in `/database/users.json` (no passwords — see auth-credentials.json). */
export type DbUserRecord = DirectoryUser & {
  /** @deprecated — migrated to authCredentials; stripped on export */
  initialPassword?: string;
  /** Fictional placeholder staff — not a real person */
  isDemoStaff?: boolean;
};

/** Root snapshot — one object per `/database/*.json` file. */
export type LocalDatabase = {
  version: 1;
  studios: StudioRecord[];
  users: DbUserRecord[];
  /** LOCAL DEV ONLY — `/database/auth-credentials.json`. Production: Supabase Auth. */
  authCredentials: LocalAuthCredential[];
  groups: StudioGroup[];
  classes: StudioClass[];
  parentsStudents: ParentStudentLink[];
  tasks: StudentTask[];
  attendance: {
    sessions: AttendanceSession[];
    intelligenceRecords: AttendanceRecord[];
  };
  messages: {
    studioUpdates: StudioUpdate[];
    chatMessages: ChatMessage[];
  };
  notifications: Notification[];
  chats: DanceGroupChat[];
  gallery: GalleryItem[];
  events: StudioEvent[];
  achievements: AchievementRow[];
  shopProducts: ShopProduct[];
  shopOrders: ShopOrder[];
  privateLessons: {
    products: PrivateLessonProduct[];
    bookings: PrivateLessonBooking[];
  };
  teachersAvailability: PrivateLessonAvailabilityRequest[];
  editableTexts: EditableText[];
  featureFlags: {
    global: FeatureFlags;
    byStudio: Record<string, FeatureFlags>;
  };
  branding: Record<string, StudioBranding>;
  auditLog: AuditLogEntry[];
  studioOs: StudioOsData;
  productData: ProductDataBundle;
  faculty: FacultyRecord[];
  studioIdentity: StudioIdentityData;
  platformMeta: PlatformMetaData;
  trainings: TrainingsData;
  systemSettings: SystemSettings;
  platformOs: PlatformOsData;
  seasons: SeasonsData;
  consents: ConsentsData;
};

export type SystemSettings = {
  appName: string;
  defaultLocale: "he" | "en";
  /** Demo payments only — never imply live processing when true */
  paymentsDemoMode: boolean;
  maintenanceMode: boolean;
  maintenanceMessageHe?: string;
  databaseSchemaVersion: number;
};

export type StudioOsData = {
  levelsByUser: Record<string, StudentLevelProgress>;
  heatmapDays: PracticeHeatmapDay[];
  feedback: ProfessionalFeedbackEntry[];
  rehearsals: RehearsalSession[];
  liveFeed: LiveFeedPost[];
  riskAlerts: RiskAlert[];
  calendarEntries: StudioCalendarEntry[];
  aiDailyByUser: Record<string, AiDailyRecommendation>;
  studioHealth: StudioHealthSnapshot | null;
};

export type ProductDataBundle = {
  goals: StudentGoal[];
  filesByStudentId: Record<string, DigitalStudentFile>;
  videos: PracticeVideo[];
  performance: PerformanceEventDetail;
  gamification: GamificationState;
  reports: ManagementReportSummary;
  parentDashboardByParentId: Record<string, ParentDashboardData>;
  /** Master teacher ops view — filtered per teacher at runtime. */
  teacherDashboardMaster: TeacherDashboardData;
};

export type StudioIdentityData = {
  missionsByStudio: Record<string, StudioMission>;
  /** @deprecated — use `LocalDatabase.faculty` / `faculty.json` */
  faculty?: FacultyMember[];
  quotes: StudioLegacyQuote[];
  milestones: LegacyMilestone[];
};

export type PlatformMetaData = {
  releaseNotes: ReleaseNote[];
  platformBilling: PlatformBillingSummary;
  studioBillingByStudio: Record<string, PlatformBillingSummary>;
  performanceCountdown: PerformanceCountdown;
};

export type TrainingsData = {
  categories: string[];
  items: TrainingItem[];
};

export type AchievementRow = {
  id: string;
  title: string;
  body: string;
  icon?: string;
};

export const DB_FILE_KEYS = [
  "studios",
  "users",
  "auth-credentials",
  "groups",
  "classes",
  "parents-students",
  "tasks",
  "attendance",
  "messages",
  "notifications",
  "chats",
  "gallery",
  "events",
  "achievements",
  "shop-products",
  "shop-orders",
  "private-lessons",
  "teachers-availability",
  "editable-texts",
  "feature-flags",
  "branding",
  "audit-log",
  "studio-os",
  "product-data",
  "studio-identity",
  "faculty",
  "platform-meta",
  "trainings",
  "system-settings",
  "platform-os",
  "seasons",
  "consents"
] as const;

export type DbFileKey = (typeof DB_FILE_KEYS)[number];

export const EMPTY_DATABASE: LocalDatabase = {
  version: 1,
  studios: [],
  users: [],
  authCredentials: [],
  groups: [],
  classes: [],
  parentsStudents: [],
  tasks: [],
  attendance: { sessions: [], intelligenceRecords: [] },
  messages: { studioUpdates: [], chatMessages: [] },
  notifications: [],
  chats: [],
  gallery: [],
  events: [],
  achievements: [],
  shopProducts: [],
  shopOrders: [],
  privateLessons: { products: [], bookings: [] },
  teachersAvailability: [],
  editableTexts: [],
  featureFlags: {
    global: {
      aiCoach: false,
      liveEventFeed: false,
      parentPeaceMode: false,
      videoUploads: false,
      staffChat: false,
      gallery: false,
      achievementsBoard: false,
      reports: false,
      payments: false,
      shop: false,
      studioIdentity: false
    },
    byStudio: {}
  },
  branding: {},
  auditLog: [],
  studioOs: {
    levelsByUser: {},
    heatmapDays: [],
    feedback: [],
    rehearsals: [],
    liveFeed: [],
    riskAlerts: [],
    calendarEntries: [],
    aiDailyByUser: {},
    studioHealth: null
  },
  productData: {
    goals: [],
    filesByStudentId: {},
    videos: [],
    performance: {
      id: "",
      title: "",
      daysRemaining: 0,
      venue: "",
      rehearsalSchedule: [],
      costumeRequirements: [],
      equipmentChecklist: [],
      orderOfAppearance: [],
      parentApprovalsPending: 0,
      musicFileLabel: ""
    },
    gamification: {
      xp: 0,
      level: 1,
      levelLabel: "",
      streakDays: 0,
      badges: [],
      weeklyChallengeTitle: "",
      weeklyChallengeProgressPct: 0,
      groupChallengeTitle: "",
      groupChallengeProgressPct: 0
    },
    reports: {
      teacherActivity: [],
      attendanceCompletionPct: 0,
      taskCompletionPct: 0,
      homePracticeEngagementPct: 0,
      atRiskStudents: [],
      retentionRisk: [],
      unreadImportantUpdates: 0,
      groupsNeedingAttention: [],
      weeklyHebrewInsight: ""
    },
    parentDashboardByParentId: {},
    teacherDashboardMaster: {
      groups: [],
      todaysClasses: [],
      homePracticeByGroup: [],
      studentsAtRisk: [],
      pendingReviews: [],
      quickActions: []
    }
  },
  faculty: [],
  studioIdentity: {
    missionsByStudio: {},
    quotes: [],
    milestones: []
  },
  platformMeta: {
    releaseNotes: [],
    platformBilling: {
      plan: "",
      monthlyPriceNis: 0,
      paymentStatus: "paid",
      activeStudents: 0,
      storageGb: 0
    },
    studioBillingByStudio: {},
    performanceCountdown: { label: "", daysRemaining: 0, eventTitle: "" }
  },
  trainings: { categories: [], items: [] },
  systemSettings: {
    appName: "LK Student Space",
    defaultLocale: "he",
    paymentsDemoMode: true,
    maintenanceMode: false,
    databaseSchemaVersion: 2
  },
  platformOs: EMPTY_PLATFORM_OS,
  seasons: EMPTY_SEASONS,
  consents: EMPTY_CONSENTS
};
