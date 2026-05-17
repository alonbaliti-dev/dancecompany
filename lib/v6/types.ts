export type V6Role = "student" | "parent" | "teacher" | "management" | "super_admin";
export type V6Tab = "dashboard" | "lessons" | "messages" | "shop" | "more";
export type V6Screen =
  | "home"
  | "users"
  | "private_lessons"
  | "media"
  | "database"
  | "texts"
  | "flags"
  | "audit"
  | "system"
  | "branding";

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

export type V6User = {
  id: string;
  studioId: string;
  name: string;
  role: V6Role;
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
  phone: string;
  password: string;
};

export type V6Group = {
  id: string;
  studioId: string;
  name: string;
  style: string;
  ageGroup?: string;
  danceStyle?: string;
  schedule?: string;
  teacherIds: string[];
  studentIds: string[];
};

export type V6Lesson = {
  id: string;
  studioId: string;
  groupId: string;
  title: string;
  weekday: string;
  time: string;
  room: string;
};

export type V6Message = {
  id: string;
  studioId: string;
  title: string;
  body: string;
  groupId?: string;
  createdAt: string;
};

export type V6Notification = {
  id: string;
  studioId: string;
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

export type V6PrivateLesson = {
  id: string;
  studioId: string;
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
  uploadedByUserId: string;
  title: string;
  fileName: string;
  mediaType: "image" | "video";
  linkedGroupId?: string;
  linkedProductId?: string;
  localPreviewUrl?: string;
  visibility: "group" | "staff" | "shop" | "management";
  createdAt: string;
};

export type V6AuditEntry = {
  id: string;
  studioId: string;
  actorUserId: string;
  actorName: string;
  action: string;
  target: string;
  createdAt: string;
};

export type V6Database = {
  version: 6;
  studios: Array<{ id: string; name: string; branding: { name: string; tagline: string; accent: string } }>;
  users: V6User[];
  credentials: V6Credential[];
  groups: V6Group[];
  lessons: V6Lesson[];
  messages: V6Message[];
  notifications: V6Notification[];
  products: V6Product[];
  privateLessons: V6PrivateLesson[];
  media: V6MediaItem[];
  attendance: V6AttendanceRecord[];
  tasks: Array<{ id: string; groupId: string; title: string; doneByUserIds: string[] }>;
  events: Array<{ id: string; studioId: string; title: string; date: string }>;
  achievements: Array<{ id: string; studentId: string; title: string; createdAt: string }>;
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
