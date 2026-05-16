import { getDirectoryUsers } from "@/lib/directory-store";
import { groupNameToId } from "@/lib/studio-group-ids";
import type { DirectoryUser, UserPermissions, UserProfile } from "@/lib/types";

export { groupIdToName, groupNameToId } from "@/lib/studio-group-ids";

export function userGroupIds(user: UserProfile): string[] {
  return user.assignedGroups.map((n) => groupNameToId(n)).filter(Boolean) as string[];
}

export function isStudentRole(p: UserPermissions, isParent?: boolean): boolean {
  if (isParent) return false;
  return p.isStudent && !p.isTeacher && !p.isManagement && !p.isSuperAdmin;
}

export function getDirectoryStudents(): DirectoryUser[] {
  return getDirectoryUsers().filter((u) => isStudentRole(u.permissions, u.isParent) || u.type === "student");
}

/** True when teacher and student share at least one assigned group name. */
export function teacherSharesGroupWithStudent(teacher: UserProfile, student: DirectoryUser): boolean {
  const set = new Set(teacher.assignedGroups);
  return student.assignedGroups.some((g) => set.has(g));
}

export function getStudentsForTeacher(teacher: UserProfile): DirectoryUser[] {
  return getDirectoryStudents().filter((s) => teacherSharesGroupWithStudent(teacher, s));
}
