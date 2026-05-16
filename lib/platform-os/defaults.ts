import { normalizePermissions } from "@/lib/permissions";
import type { ConsentsData, PermissionPreset, PlatformOsData, SeasonsData } from "./types";
import { STUDIO_LK } from "@/lib/platform/constants";

export const EMPTY_PLATFORM_OS: PlatformOsData = {
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
  permissionPresets: seedPermissionPresets(),
  eventOperatingModes: {},
  onboardingByUserId: {},
  calendarSyncEntries: []
};

export const EMPTY_SEASONS: SeasonsData = { seasons: [] };

export const EMPTY_CONSENTS: ConsentsData = { records: [] };

export function seedPermissionPresets(): PermissionPreset[] {
  return [
    {
      id: "teacher_basic",
      labelHe: "מורה בסיסי",
      labelEn: "Teacher Basic",
      permissions: normalizePermissions({
        isTeacher: true,
        isManagement: false,
        canManageAttendance: true,
        canCreateTasks: true
      })
    },
    {
      id: "teacher_senior",
      labelHe: "מורה בכיר",
      labelEn: "Teacher Senior",
      permissions: normalizePermissions({
        isTeacher: true,
        isManagement: false,
        canManageAttendance: true,
        canCreateTasks: true,
        canModerateChats: true,
        canManageGallery: true,
        canSendNotifications: true
      })
    },
    {
      id: "management_limited",
      labelHe: "הנהלה מוגבלת",
      labelEn: "Management Limited",
      permissions: normalizePermissions({
        isTeacher: false,
        isManagement: true,
        canManageUsers: true,
        canViewReports: true
      })
    },
    {
      id: "management_full",
      labelHe: "הנהלה מלאה",
      labelEn: "Management Full",
      permissions: normalizePermissions({
        isTeacher: false,
        isManagement: true,
        canManageUsers: true,
        canViewReports: true,
        canManageShop: true,
        canManageEvents: true,
        canManageGallery: true,
        canModerateChats: true,
        canSendNotifications: true,
        canManageAttendance: true,
        canManageBilling: true
      })
    },
    {
      id: "shop_manager",
      labelHe: "מנהל חנות",
      labelEn: "Shop Manager",
      permissions: normalizePermissions({
        isTeacher: false,
        isManagement: true,
        canManageShop: true,
        canViewReports: true
      })
    },
    {
      id: "event_manager",
      labelHe: "מנהל אירועים",
      labelEn: "Event Manager",
      permissions: normalizePermissions({
        isTeacher: false,
        isManagement: true,
        canManageEvents: true,
        canSendNotifications: true
      })
    },
    {
      id: "super_admin",
      labelHe: "מנהל על",
      labelEn: "Super Admin",
      permissions: normalizePermissions({ isTeacher: true, isManagement: true, isSuperAdmin: true })
    }
  ];
}

export function seedSeasons(): SeasonsData {
  return {
    seasons: [
      {
        id: "season_2025_26",
        studioId: STUDIO_LK,
        label: "2025–2026",
        startDate: "2025-09-01",
        endDate: "2026-08-31",
        isActive: true,
        createdAt: "2025-09-01T08:00:00.000Z"
      }
    ]
  };
}

export function seedActivityFeed(): PlatformOsData["activityFeed"] {
  return [
    {
      id: "act_demo_1",
      studioId: STUDIO_LK,
      kind: "task_completed",
      messageHe: "מאיה השלימה משימת גמישות",
      visibility: "group",
      targetGroupIds: ["g_hiphop_teen"],
      actorUserId: "u_maya",
      actorName: "מאיה כהן",
      relatedType: "task",
      createdAt: "2026-05-14T18:00:00.000Z"
    },
    {
      id: "act_demo_2",
      studioId: STUDIO_LK,
      kind: "update_sent",
      messageHe: "נשלח עדכון לקבוצת היפ הופ",
      visibility: "studio",
      targetGroupIds: ["g_hiphop_teen"],
      actorUserId: "u_teacher_demo",
      actorName: "דנה לוי",
      relatedType: "notification",
      createdAt: "2026-05-14T12:00:00.000Z"
    },
    {
      id: "act_demo_3",
      studioId: STUDIO_LK,
      kind: "gallery_upload",
      messageHe: "הועלה סרטון חדש לגלריית החומרים",
      visibility: "studio",
      actorUserId: "u_teacher_demo",
      actorName: "דנה לוי",
      relatedType: "gallery",
      createdAt: "2026-05-13T16:30:00.000Z"
    }
  ];
}

export function seedConsents(): ConsentsData {
  return {
    records: [
      {
        id: "consent_maya_photo",
        studioId: STUDIO_LK,
        studentUserId: "u_maya",
        parentUserId: "u_parent_demo",
        consentType: "photography",
        status: "approved",
        approvedAt: "2025-09-15T10:00:00.000Z",
        expiresAt: "2026-09-15T10:00:00.000Z",
        updatedAt: "2025-09-15T10:00:00.000Z"
      },
      {
        id: "consent_maya_video",
        studioId: STUDIO_LK,
        studentUserId: "u_maya",
        parentUserId: "u_parent_demo",
        consentType: "video_upload",
        status: "pending",
        updatedAt: "2026-05-01T10:00:00.000Z"
      },
      {
        id: "consent_maya_terms",
        studioId: STUDIO_LK,
        studentUserId: "u_maya",
        parentUserId: "u_parent_demo",
        consentType: "app_terms",
        status: "approved",
        approvedAt: "2025-09-01T08:00:00.000Z",
        updatedAt: "2025-09-01T08:00:00.000Z"
      }
    ]
  };
}

export function seedPlatformOs(): PlatformOsData {
  return {
    ...EMPTY_PLATFORM_OS,
    activityFeed: seedActivityFeed(),
    permissionPresets: seedPermissionPresets(),
    systemStatus: {
      ...EMPTY_PLATFORM_OS.systemStatus,
      appVersion: "1.0.0",
      storageUsedMb: 128,
      syncQueuePending: 0,
      lastBackupAt: undefined,
      updatedAt: new Date().toISOString()
    }
  };
}
