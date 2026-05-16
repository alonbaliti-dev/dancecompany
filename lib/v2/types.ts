import type { MediaItem } from "@/lib/media/media-types";

export type V2Role = "student" | "parent" | "teacher" | "management" | "super_admin";

export type V2PermissionKey =
  | "manage_users"
  | "edit_credentials"
  | "edit_permissions"
  | "export_import_db"
  | "edit_text"
  | "view_audit"
  | "manage_feature_flags"
  | "manage_studio"
  | "manage_attendance"
  | "manage_shop"
  | "manage_private_lessons"
  | "teacher_dashboard";

export type V2Permissions = Record<V2PermissionKey, boolean>;

export type V2Studio = {
  id: string;
  name: string;
  city: string;
  ownerUserId: string;
};

export type V2User = {
  id: string;
  studioId: string;
  name: string;
  phone: string;
  role: V2Role;
  style?: string;
  groupIds: string[];
  linkedStudentIds: string[];
  permissions: V2Permissions;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type V2Credential = {
  userId: string;
  phone: string;
  password: string;
  updatedAt: string;
};

export type V2Group = {
  id: string;
  studioId: string;
  name: string;
  style: string;
  teacherIds: string[];
};

export type V2Class = {
  id: string;
  studioId: string;
  groupId: string;
  title: string;
  weekday: string;
  time: string;
  room: string;
};

export type V2Task = {
  id: string;
  studioId: string;
  groupId: string;
  title: string;
  dueText: string;
  createdByUserId: string;
};

export type V2AttendanceMark = "present" | "late" | "absent";

export type V2AttendanceRecord = {
  id: string;
  studioId: string;
  classId: string;
  studentId: string;
  mark: V2AttendanceMark;
  date: string;
};

export type V2Message = {
  id: string;
  studioId: string;
  target: "all" | "group" | "student";
  targetId?: string;
  title: string;
  body: string;
  createdByUserId: string;
  createdAt: string;
};

export type V2ProductType = "product" | "ticket" | "private_lesson";
export type V2ShopCategory =
  | "בגדי סטודיו"
  | "חולצות ממותגות"
  | "נעלי ריקוד"
  | "גרבי ריקוד"
  | "אביזרים"
  | "כרטיסים למופעים"
  | "שיעורים פרטיים"
  | "סדנאות / מחנות";

export type V2StockStatus = "in_stock" | "low_stock" | "sold_out" | "preorder";

export type V2Product = {
  id: string;
  studioId: string;
  type: V2ProductType;
  title: string;
  description: string;
  price: number;
  category?: V2ShopCategory;
  stockStatus?: V2StockStatus;
  sizes?: string[];
  colors?: string[];
  imageMediaIds?: string[];
  featuredImageMediaId?: string;
  style?: string;
  isActive: boolean;
  archivedAt?: string;
};

export type V2PrivateLessonDuration = 30 | 45;
export type V2PrivateLessonStatus =
  | "draft"
  | "requested"
  | "teacher_suggested"
  | "teacher_unavailable"
  | "slot_selected"
  | "payment_pending"
  | "paid";

export type V2PrivateLessonRequest = {
  id: string;
  studioId: string;
  studentId: string;
  requestedByUserId: string;
  teacherId: string;
  duration: V2PrivateLessonDuration;
  price: number;
  status: V2PrivateLessonStatus;
  studentNote?: string;
  suggestedSlots: string[];
  selectedSlot?: string;
  createdAt: string;
  updatedAt: string;
};

export type V2FeatureFlags = {
  shop: boolean;
  privateLessons: boolean;
  payments: boolean;
  teacherDashboard: boolean;
  managementDashboard: boolean;
  superAdminTools: boolean;
};

export type V2EditableText = {
  key: string;
  value: string;
};

export type V2AuditEntry = {
  id: string;
  studioId: string;
  actorUserId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId?: string;
  createdAt: string;
};

export type V2NotificationPriority = "urgent" | "important" | "normal";

export type V2Notification = {
  id: string;
  studioId: string;
  userIds: string[];
  title: string;
  body: string;
  priority: V2NotificationPriority;
  relatedType:
    | "private_lesson"
    | "user"
    | "shop"
    | "task"
    | "media"
    | "message"
    | "attendance"
    | "system";
  relatedId?: string;
  screen?: V2Screen;
  tab?: V2Tab;
  readByUserIds: string[];
  createdAt: string;
};

export type V2Database = {
  version: 2;
  studios: V2Studio[];
  users: V2User[];
  credentials: V2Credential[];
  groups: V2Group[];
  classes: V2Class[];
  tasks: V2Task[];
  attendance: V2AttendanceRecord[];
  messages: V2Message[];
  products: V2Product[];
  privateLessonRequests: V2PrivateLessonRequest[];
  mediaItems: MediaItem[];
  featureFlags: V2FeatureFlags;
  editableTexts: V2EditableText[];
  auditLog: V2AuditEntry[];
  notifications: V2Notification[];
};

export type V2Session = {
  userId: string;
};

export type V2Tab = "dashboard" | "lessons" | "messages" | "shop" | "more";
export type V2Screen =
  | "home"
  | "teacher"
  | "management"
  | "super_admin"
  | "users"
  | "database"
  | "texts"
  | "audit"
  | "flags"
  | "private_lessons"
  | "media_library"
  | "product_management";

