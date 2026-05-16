import { userGroupIds } from "@/lib/studio-roster";
import type { StudioEvent, UserProfile } from "@/lib/types";

export function canManageLegacyEvents(user: UserProfile): boolean {
  return user.permissions.isManagement;
}

export function canAddTeacherLegacyContent(user: UserProfile): boolean {
  return user.permissions.isTeacher || user.permissions.isManagement;
}

/** Whether the user may open this event in the legacy board. */
export function canViewLegacyEvent(user: UserProfile, event: StudioEvent): boolean {
  if (user.permissions.isManagement) return true;

  const staff = user.permissions.isTeacher;
  if (staff) {
    if (event.teacherIds.includes(user.id)) return true;
    const ug = new Set(userGroupIds(user));
    if (event.participatingGroupIds.some((gid) => ug.has(gid))) return true;
    if (event.isPublicToStudents) return true;
    return false;
  }

  if (user.isParent) {
    return event.isPublicToStudents;
  }

  if (!event.isPublicToStudents) return false;
  if (!event.participatingGroupIds.length) return true;
  const ug = new Set(userGroupIds(user));
  if (event.participatingGroupIds.some((gid) => ug.has(gid))) return true;
  if (event.participatingStudentIds?.includes(user.id)) return true;
  return false;
}

export function filterLegacyEventsForUser(user: UserProfile, events: StudioEvent[]): StudioEvent[] {
  return events.filter((e) => canViewLegacyEvent(user, e));
}

export function canSeeTeacherNotes(user: UserProfile): boolean {
  return user.permissions.isTeacher || user.permissions.isManagement;
}
