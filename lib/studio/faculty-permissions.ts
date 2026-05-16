import { normalizePermissions } from "@/lib/permissions";
import type { UserPermissions } from "@/lib/types";

export function permissionsForOwner(): UserPermissions {
  return normalizePermissions({
    isTeacher: true,
    isManagement: true,
    canManageUsers: true,
    canViewReports: true,
    canManageShop: true,
    canManageGallery: true,
    canModerateChats: true,
    canSendNotifications: true,
    canManageAttendance: true,
    canManageEvents: true,
    canCreateTasks: true,
    canReviewVideos: true
  });
}

export function permissionsForManagement(): UserPermissions {
  return normalizePermissions({
    isTeacher: false,
    isManagement: true,
    canManageUsers: true,
    canViewReports: true,
    canManageShop: true,
    canManageGallery: true,
    canModerateChats: true,
    canSendNotifications: true,
    canManageAttendance: true,
    canManageEvents: true,
    canCreateTasks: true,
    canReviewVideos: true
  });
}

export function permissionsForOffice(): UserPermissions {
  return normalizePermissions({
    isTeacher: false,
    isManagement: true,
    canManageUsers: false,
    canViewReports: true,
    canManageShop: true,
    canSendNotifications: true,
    canManageEvents: true
  });
}

export function permissionsForMentor(): UserPermissions {
  return normalizePermissions({
    isTeacher: true,
    isManagement: false,
    canManageAttendance: true,
    canCreateTasks: true,
    canManageGallery: true,
    canModerateChats: true,
    canSendNotifications: true,
    canReviewVideos: true
  });
}
