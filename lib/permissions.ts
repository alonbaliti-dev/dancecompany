import { canViewAttendanceIntelligenceStaff } from "@/lib/security/permissions";
import type { FeatureFlags, StackTabId, UserPermissions, UserProfile } from "@/lib/types";

export function isSuperAdmin(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isSuperAdmin;
}

export function isManagement(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isManagement && !user.permissions.isSuperAdmin;
}

export function isTeacherTier(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isTeacher || user.permissions.isManagement || user.permissions.isSuperAdmin;
}

export function isStudent(user: Pick<UserProfile, "permissions">): boolean {
  return user.permissions.isStudent;
}

/** Expand legacy two-flag seeds into full permission matrix. */
export function normalizePermissions(p: Partial<UserPermissions> & { isTeacher: boolean; isManagement: boolean }): UserPermissions {
  const isSuperAdmin = p.isSuperAdmin ?? false;
  const isManagement = p.isManagement ?? false;
  const isTeacher = p.isTeacher ?? false;
  const isStudent = p.isStudent ?? (!isTeacher && !isManagement && !isSuperAdmin);

  if (isSuperAdmin) {
    return {
      isStudent: false,
      isTeacher: true,
      isManagement: true,
      isSuperAdmin: true,
      canSendNotifications: true,
      canManageUsers: true,
      canManageGallery: true,
      canModerateChats: true,
      canManageEvents: true,
      canViewReports: true,
      canManageBilling: true,
      canManageFeatureFlags: true,
      canManageShop: true,
      canManageAttendance: true,
      canCreateTasks: true,
      canReviewVideos: true
    };
  }

  if (isManagement) {
    return {
      isStudent: false,
      isTeacher: true,
      isManagement: true,
      isSuperAdmin: false,
      canSendNotifications: p.canSendNotifications ?? true,
      canManageUsers: p.canManageUsers ?? true,
      canManageGallery: p.canManageGallery ?? true,
      canModerateChats: p.canModerateChats ?? true,
      canManageEvents: p.canManageEvents ?? true,
      canViewReports: p.canViewReports ?? true,
      canManageBilling: p.canManageBilling ?? true,
      canManageFeatureFlags: p.canManageFeatureFlags ?? false,
      canManageShop: p.canManageShop ?? true,
      canManageAttendance: p.canManageAttendance ?? true,
      canCreateTasks: p.canCreateTasks ?? true,
      canReviewVideos: p.canReviewVideos ?? true
    };
  }

  if (isTeacher) {
    return {
      isStudent: false,
      isTeacher: true,
      isManagement: false,
      isSuperAdmin: false,
      canSendNotifications: p.canSendNotifications ?? true,
      canManageUsers: p.canManageUsers ?? false,
      canManageGallery: p.canManageGallery ?? true,
      canModerateChats: p.canModerateChats ?? true,
      canManageEvents: p.canManageEvents ?? true,
      canViewReports: p.canViewReports ?? false,
      canManageBilling: p.canManageBilling ?? false,
      canManageFeatureFlags: p.canManageFeatureFlags ?? false,
      canManageShop: p.canManageShop ?? false,
      canManageAttendance: p.canManageAttendance ?? true,
      canCreateTasks: p.canCreateTasks ?? true,
      canReviewVideos: p.canReviewVideos ?? true
    };
  }

  return {
    isStudent: true,
    isTeacher: false,
    isManagement: false,
    isSuperAdmin: false,
    canSendNotifications: false,
    canManageUsers: false,
    canManageGallery: false,
    canModerateChats: false,
    canManageEvents: false,
    canViewReports: false,
    canManageBilling: false,
    canManageFeatureFlags: false,
    canManageShop: false,
    canManageAttendance: false,
    canCreateTasks: false,
    canReviewVideos: false
  };
}

export function canOpenStackForUser(user: UserProfile, stack: StackTabId, flags: FeatureFlags): boolean {
  if (
    stack === "profile" ||
    stack === "progress" ||
    stack === "schedule_full" ||
    stack === "settings" ||
    stack === "practice_hub" ||
    stack === "tasks_hub" ||
    stack === "view_display_settings"
  )
    return true;

  if (user.permissions.isSuperAdmin) {
    const platformStacks: StackTabId[] = [
      "creator_dashboard",
      "super_admin_hub",
      "studios_admin",
      "feature_flags",
      "platform_audit",
      "platform_billing",
      "system_updates",
      "global_settings",
      "data_safety",
      "billing",
      "audit_log",
      "branding_editor",
      "text_editor",
      "backup_restore",
      "system_status",
      "activity_feed",
      "moderation_queue",
      "event_command_center"
    ];
    if (platformStacks.includes(stack)) return true;
  }

  if (stack === "activity_feed") return true;
  if (stack === "parent_consents") {
    return user.permissions.isStudent || user.isParent || user.permissions.isManagement || user.permissions.isSuperAdmin;
  }
  if (stack === "role_onboarding") return true;
  if (stack === "moderation_queue") {
    return user.permissions.canModerateChats || user.permissions.isManagement || user.permissions.isSuperAdmin;
  }
  if (stack === "event_command_center") return true;
  if (stack === "backup_restore") return user.permissions.isSuperAdmin;
  if (stack === "system_status") return user.permissions.isSuperAdmin;

  if (stack === "creator_dashboard" || stack === "super_admin_hub" || stack === "studios_admin" || stack === "feature_flags" || stack === "platform_audit" || stack === "platform_billing" || stack === "global_settings" || stack === "branding_editor") {
    return false;
  }

  if (stack === "studio_settings" || stack === "audit_log" || stack === "data_safety" || stack === "billing" || stack === "system_updates") {
    return user.permissions.isManagement || user.permissions.isSuperAdmin;
  }

  if (stack === "reports") return user.permissions.canViewReports && (user.permissions.isManagement || user.permissions.isSuperAdmin);
  if (stack === "user_relationships") {
    return canManageUsersStack(user);
  }

  if (["management", "users"].includes(stack)) {
    return canManageUsersStack(user);
  }

  const teacher = isTeacherTier(user);
  if (stack === "attendance_intelligence") return canViewAttendanceIntelligenceStaff(user);

  if (["teacher", "files", "attendance", "ai", "rehearsal_mode", "feedback_hub", "risk_center"].includes(stack)) {
    return teacher;
  }

  if (stack === "send_update") return user.permissions.canSendNotifications;
  if (stack === "gallery") return flags.gallery;
  if (stack === "legacy_board") return flags.achievementsBoard;
  if (stack === "shop") return flags.shop;
  if (stack === "studio_legacy" || stack === "studio_faculty" || stack === "studio_media" || stack === "dance_styles")
    return flags.studioIdentity;
  if (stack === "group_chats") return true;
  if (stack === "notifications") return true;
  if (stack === "live_feed") return flags.liveEventFeed;
  if (stack === "parent_peace") return user.isParent && flags.parentPeaceMode;
  if (stack === "ai_coach") return flags.aiCoach;
  if (stack === "levels" || stack === "calendar_hub") return true;
  if (stack === "studio_health") return user.permissions.isManagement;

  return false;
}

export function isFeatureEnabled(flags: FeatureFlags, key: keyof FeatureFlags): boolean {
  return flags[key];
}

function canManageUsersStack(user: UserProfile): boolean {
  if (user.permissions.isSuperAdmin) return true;
  return user.permissions.isManagement && user.permissions.canManageUsers;
}
