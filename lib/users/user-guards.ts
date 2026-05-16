import { assertStudioScope } from "@/lib/security/studio-isolation";
import type { DirectoryUser, UserProfile, UserType } from "@/lib/types";
import { inferUserType } from "./user-type";

export function canManageUsers(actor: UserProfile): boolean {
  if (actor.permissions.isSuperAdmin) return true;
  return actor.permissions.isManagement && actor.permissions.canManageUsers;
}

export function canCreateUser(actor: UserProfile, userType: UserType, studioId: string): boolean {
  if (!canManageUsers(actor)) return false;
  if (userType === "super_admin") return actor.permissions.isSuperAdmin;
  if (actor.permissions.isSuperAdmin) return true;
  return assertStudioScope(actor, studioId);
}

export function canEditUser(actor: UserProfile, target: DirectoryUser): boolean {
  if (target.status === "removed" && !actor.permissions.isSuperAdmin) return false;
  if (!assertStudioScope(actor, target.studioId)) return false;
  if (target.permissions.isSuperAdmin) return actor.permissions.isSuperAdmin;
  if (actor.permissions.isSuperAdmin) return true;
  if (!actor.permissions.isManagement || !actor.permissions.canManageUsers) return false;
  return !target.permissions.isSuperAdmin;
}

export function canRemoveUser(actor: UserProfile, target: DirectoryUser): boolean {
  if (actor.id === target.id) return false;
  return canEditUser(actor, target);
}

export function canRestoreUser(actor: UserProfile, target: DirectoryUser): boolean {
  return canEditUser(actor, target) && target.status === "removed";
}

export function canDeactivateUser(actor: UserProfile, target: DirectoryUser): boolean {
  if (actor.id === target.id) return false;
  return canEditUser(actor, target) && target.status === "active";
}

export function canLinkParentStudent(actor: UserProfile, parent: DirectoryUser, student: DirectoryUser): boolean {
  if (!canManageUsers(actor)) return false;
  if (inferUserType(parent) !== "parent" || inferUserType(student) !== "student") return false;
  if (parent.studioId !== student.studioId) return false;
  if (!actor.permissions.isSuperAdmin && !assertStudioScope(actor, parent.studioId)) return false;
  return canEditUser(actor, parent) && canEditUser(actor, student);
}

export function canEditTeacherGroups(actor: UserProfile, teacher: DirectoryUser): boolean {
  if (inferUserType(teacher) !== "teacher") return false;
  return canEditUser(actor, teacher);
}

export function canResetPassword(actor: UserProfile, target: DirectoryUser): boolean {
  if (actor.id === target.id && target.status === "active") return true;
  return canEditUser(actor, target);
}

export function canEditManagementPermissions(actor: UserProfile, target: DirectoryUser): boolean {
  const t = inferUserType(target);
  if (t !== "management" && t !== "super_admin") return false;
  if (target.permissions.isSuperAdmin) return actor.permissions.isSuperAdmin;
  return canEditUser(actor, target);
}

export function directoryVisibleToActor(actor: UserProfile, rows: DirectoryUser[]): DirectoryUser[] {
  if (actor.permissions.isSuperAdmin) return rows.filter((r) => r.status !== "removed" || true);
  return rows.filter((r) => r.studioId === actor.studioId);
}
