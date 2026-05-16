import type { UserPermissions, UserProfile, UserType } from "@/lib/types";

const NOW = "2026-05-15T10:00:00.000Z";

export const USER_TYPE_LABELS: Record<UserType, string> = {
  super_admin: "בעל פלטפורמה / מנהל על",
  management: "הנהלה",
  teacher: "מורה",
  parent: "הורה",
  student: "תלמיד"
};

export const USER_STATUS_LABELS: Record<UserProfile["status"], string> = {
  active: "חשבון פעיל",
  inactive: "חשבון מושבת",
  removed: "הוסר מהמערכת"
};

export function inferUserType(p: Pick<UserProfile, "permissions" | "isParent" | "type">): UserType {
  if (p.type) return p.type;
  if (p.permissions.isSuperAdmin) return "super_admin";
  if (p.permissions.isManagement) return "management";
  if (p.isParent) return "parent";
  if (p.permissions.isTeacher) return "teacher";
  return "student";
}

export function permissionsForUserType(
  type: UserType,
  overrides: Partial<UserPermissions> = {}
): UserPermissions {
  const base = {
    isStudent: type === "student",
    isTeacher: type === "teacher" || type === "management" || type === "super_admin",
    isManagement: type === "management" || type === "super_admin",
    isSuperAdmin: type === "super_admin",
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
    canReviewVideos: false,
    ...overrides
  };

  if (type === "super_admin") {
    return {
      ...base,
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

  if (type === "management") {
    return {
      ...base,
      isStudent: false,
      isTeacher: true,
      isManagement: true,
      canSendNotifications: overrides.canSendNotifications ?? true,
      canManageUsers: overrides.canManageUsers ?? true,
      canManageGallery: overrides.canManageGallery ?? true,
      canModerateChats: overrides.canModerateChats ?? true,
      canManageEvents: overrides.canManageEvents ?? true,
      canViewReports: overrides.canViewReports ?? true,
      canManageBilling: overrides.canManageBilling ?? true,
      canManageFeatureFlags: overrides.canManageFeatureFlags ?? false,
      canManageShop: overrides.canManageShop ?? true,
      canManageAttendance: overrides.canManageAttendance ?? true,
      canCreateTasks: overrides.canCreateTasks ?? true,
      canReviewVideos: overrides.canReviewVideos ?? true
    };
  }

  if (type === "teacher") {
    return {
      ...base,
      isStudent: false,
      isTeacher: true,
      canSendNotifications: overrides.canSendNotifications ?? true,
      canManageGallery: overrides.canManageGallery ?? true,
      canModerateChats: overrides.canModerateChats ?? true,
      canManageEvents: overrides.canManageEvents ?? true,
      canManageAttendance: overrides.canManageAttendance ?? true,
      canCreateTasks: overrides.canCreateTasks ?? true,
      canReviewVideos: overrides.canReviewVideos ?? true
    };
  }

  if (type === "parent") {
    return {
      ...base,
      isStudent: false,
      isTeacher: false,
      isManagement: false
    };
  }

  return {
    ...base,
    isStudent: true,
    isTeacher: false,
    isManagement: false
  };
}

export function enrichUserProfile(partial: Partial<UserProfile> & Pick<UserProfile, "id" | "studioId" | "name" | "phone">): UserProfile {
  const type = inferUserType(partial as UserProfile);
  const permissions = partial.permissions ?? permissionsForUserType(type);
  const assignedGroups = partial.assignedGroups ?? [];
  const assignedGroupIds = partial.assignedGroupIds ?? [];

  return {
    id: partial.id,
    studioId: partial.studioId,
    type,
    name: partial.name,
    phone: partial.phone,
    email: partial.email,
    avatarInitial: partial.avatarInitial ?? partial.name.charAt(0),
    permissions,
    assignedGroups,
    assignedGroupIds,
    linkedStudentIds: partial.linkedStudentIds ?? [],
    linkedParentIds: partial.linkedParentIds ?? [],
    passwordLastChangedAt: partial.passwordLastChangedAt ?? "1.1.2026",
    lastLoginAt: partial.lastLoginAt ?? "—",
    status: partial.status ?? "active",
    isParent: type === "parent" || partial.isParent,
    canPinStaffMessages: partial.canPinStaffMessages,
    createdAt: partial.createdAt ?? NOW,
    updatedAt: partial.updatedAt ?? NOW
  };
}

export function syncRelationshipLinks<T extends UserProfile>(users: T[]): T[] {
  const byId = new Map(users.map((u) => [u.id, { ...u }]));

  for (const u of byId.values()) {
    if (u.type === "parent" && u.linkedStudentIds?.length) {
      for (const sid of u.linkedStudentIds) {
        const student = byId.get(sid);
        if (!student) continue;
        const parents = new Set(student.linkedParentIds ?? []);
        parents.add(u.id);
        byId.set(sid, { ...student, linkedParentIds: [...parents] });
      }
    }
    if (u.type === "student" && u.linkedParentIds?.length) {
      for (const pid of u.linkedParentIds) {
        const parent = byId.get(pid);
        if (!parent) continue;
        const children = new Set(parent.linkedStudentIds ?? []);
        children.add(u.id);
        byId.set(pid, { ...parent, linkedStudentIds: [...children] });
      }
    }
  }

  return [...byId.values()];
}
