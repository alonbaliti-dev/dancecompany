import { PLATFORM_OWNER_INITIAL, PLATFORM_OWNER_NAME } from "@/lib/demo/identity";
import type { UserProfile, UserType } from "@/lib/types";
import { STUDIO_DEMO, STUDIO_LK } from "@/lib/platform/constants";
import { normalizePermissions } from "@/lib/permissions";
import { enrichUserProfile, permissionsForUserType } from "@/lib/users/user-type";
import { PILOT_LOGIN_HINTS } from "@/lib/studio/staff-roster";
import { normalizeIsraeliMobile } from "./phone";

/**
 * Pilot login accounts — passwords for local pilot only.
 */
export type AuthAccountSeed = {
  initialPassword: string;
  profile: UserProfile;
};

const base = (
  partial: Omit<UserProfile, "passwordLastChangedAt" | "lastLoginAt" | "status" | "permissions" | "type" | "createdAt" | "updatedAt"> & {
    type?: UserType;
    permissions: Partial<UserProfile["permissions"]> & { isTeacher: boolean; isManagement: boolean };
    passwordLastChangedAt?: string;
    lastLoginAt?: string;
    status?: UserProfile["status"];
  }
): UserProfile => {
  const type =
    partial.type ??
    (partial.permissions.isSuperAdmin
      ? "super_admin"
      : partial.permissions.isManagement
        ? "management"
        : partial.isParent
          ? "parent"
          : partial.permissions.isTeacher
            ? "teacher"
            : "student");
  return enrichUserProfile({
    ...partial,
    type,
    passwordLastChangedAt: partial.passwordLastChangedAt ?? "1.5.2026",
    lastLoginAt: partial.lastLoginAt ?? "—",
    status: partial.status ?? "active",
    permissions: partial.permissions.isSuperAdmin
      ? permissionsForUserType("super_admin")
      : normalizePermissions(partial.permissions)
  });
};

function seed(id: keyof typeof PILOT_LOGIN_HINTS, profile: Omit<Parameters<typeof base>[0], "id">): AuthAccountSeed {
  const hint = PILOT_LOGIN_HINTS[id];
  return {
    initialPassword: hint?.password ?? "lk2026",
    profile: base({
      ...profile,
      id,
      phone: normalizeIsraeliMobile(hint?.phone ?? profile.phone)
    })
  };
}

export const authAccountSeeds: AuthAccountSeed[] = [
  seed("u_maya", {
    studioId: STUDIO_LK,
    name: "מאיה כהן",
    phone: "0501234567",
    avatarInitial: "מ",
    type: "student",
    permissions: { isTeacher: false, isManagement: false, isStudent: true },
    assignedGroups: ["LK Hip Hop Crew"],
    linkedParentIds: ["u_parent_demo"]
  }),
  seed("u_t_yakir", {
    studioId: STUDIO_LK,
    name: "יקיר גבאי",
    phone: "0502223333",
    avatarInitial: "י",
    type: "teacher",
    permissions: { isTeacher: true, isManagement: false },
    assignedGroups: ["היפ הופ — מתבגרים", "היפ הופ — בסיס"],
    canPinStaffMessages: true
  }),
  seed("u_liata", {
    studioId: STUDIO_LK,
    name: "ליאת קפלינסקי",
    phone: "0509998888",
    avatarInitial: "ל",
    type: "management",
    permissions: { isTeacher: true, isManagement: true },
    assignedGroups: ["Junior Flamenco", "נבחרות — חזרות"]
  }),
  seed("u_shahar", {
    studioId: STUDIO_LK,
    name: "שחר קפלינסקי",
    phone: "0509997777",
    avatarInitial: "ש",
    type: "management",
    permissions: { isTeacher: false, isManagement: true },
    assignedGroups: ["נבחרות — חזרות", "חימום וטכניקה"]
  }),
  seed("u_office", {
    studioId: STUDIO_LK,
    name: "משרד הסטודיו",
    phone: "0509996666",
    avatarInitial: "מ",
    type: "management",
    permissions: {
      isTeacher: false,
      isManagement: true,
      canManageUsers: true,
      canManageShop: true,
      canViewReports: true
    },
    assignedGroups: []
  }),
  seed("u_parent_demo", {
    studioId: STUDIO_LK,
    name: "רינה כהן",
    phone: "0504445555",
    avatarInitial: "ר",
    type: "parent",
    permissions: { isTeacher: false, isManagement: false, isStudent: false },
    assignedGroups: [],
    isParent: true,
    linkedStudentIds: ["u_maya"]
  }),
  seed("u_creator", {
    studioId: STUDIO_LK,
    name: PLATFORM_OWNER_NAME,
    phone: "0501110000",
    avatarInitial: PLATFORM_OWNER_INITIAL,
    type: "super_admin",
    permissions: { isTeacher: false, isManagement: false, isSuperAdmin: true },
    assignedGroups: []
  }),
  {
    initialPassword: "demo123",
    profile: base({
      id: "u_demo_mgmt",
      studioId: STUDIO_DEMO,
      name: "ניהול דמו",
      phone: "0508887777",
      avatarInitial: "ד",
      type: "management",
      permissions: { isTeacher: false, isManagement: true },
      assignedGroups: []
    })
  }
];
