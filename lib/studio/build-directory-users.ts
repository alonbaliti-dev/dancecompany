import { authAccountSeeds } from "@/lib/auth/studio-accounts";
import { getFacultyRecords } from "@/lib/faculty/faculty-access";
import { seedFacultyRecords } from "@/lib/studio/faculty-seed-data";
import { groupIdToName } from "@/lib/studio-roster";
import { STUDIO_LK } from "@/lib/platform/constants";
import { normalizePermissions } from "@/lib/permissions";
import { enrichUserProfile } from "@/lib/users/user-type";
import type { DirectoryUser } from "@/lib/types";
import {
  permissionsForManagement,
  permissionsForMentor,
  permissionsForOffice,
  permissionsForOwner
} from "./faculty-permissions";

function phoneForId(id: string): string {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return `050${String(3000000 + (n % 7000000)).slice(0, 7)}`;
}

const PILOT_FAMILY: DirectoryUser[] = [];

export function buildStudioDirectoryUsers(): DirectoryUser[] {
  const byId = new Map<string, DirectoryUser>();

  const facultyRows = getFacultyRecords(STUDIO_LK).length ? getFacultyRecords(STUDIO_LK) : seedFacultyRecords();
  for (const f of facultyRows) {
    if (f.userId === "u_liata") continue;
    const groupNames = f.assignedGroupIds.map((id) => groupIdToName(id)).filter(Boolean) as string[];
    const isMgmt = f.role === "owner" || f.role === "management";
    const perms = f.role === "owner"
      ? permissionsForOwner()
      : isMgmt
        ? f.userId === "u_office"
          ? permissionsForOffice()
          : permissionsForManagement()
        : permissionsForMentor();

    const profile = enrichUserProfile({
      id: f.userId,
      studioId: STUDIO_LK,
      name: f.fullName,
      phone: phoneForId(f.userId),
      avatarInitial: f.fullName.charAt(0),
      type: isMgmt ? "management" : "teacher",
      permissions: normalizePermissions({
        isTeacher: !isMgmt || f.role === "owner",
        isManagement: isMgmt,
        ...(!isMgmt
          ? {
              canManageAttendance: true,
              canCreateTasks: true,
              canManageGallery: true,
              canModerateChats: true,
              canSendNotifications: true,
              canReviewVideos: true
            }
          : {})
      }),
      assignedGroups: groupNames,
      canPinStaffMessages: !isMgmt,
      passwordLastChangedAt: "1.5.2026",
      lastLoginAt: "—",
      status: "active"
    });
    byId.set(f.userId, {
      ...profile,
      lastActiveAt: "היום",
      permissionsModifiedBy: null,
      permissionsModifiedAt: null
    });
  }

  for (const s of authAccountSeeds) {
    const profile = enrichUserProfile({
      ...s.profile,
      linkedStudentIds: s.profile.id === "u_parent_demo" ? ["u_maya"] : s.profile.linkedStudentIds,
      linkedParentIds: s.profile.id === "u_maya" ? ["u_parent_demo"] : s.profile.linkedParentIds
    });
    byId.set(s.profile.id, {
      ...profile,
      lastActiveAt: "היום",
      permissionsModifiedBy: null,
      permissionsModifiedAt: null
    });
  }

  for (const u of PILOT_FAMILY) byId.set(u.id, u);

  return Array.from(byId.values());
}
