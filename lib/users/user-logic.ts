import { getStudioGroups } from "@/lib/studio-groups-access";
import type { DirectoryUser, UserProfile, UserType } from "@/lib/types";
import { inferUserType, USER_TYPE_LABELS } from "./user-type";

export type UserMgmtSegment = "all" | UserType;

export type UserMgmtFilters = {
  q: string;
  type: UserMgmtSegment;
  status: "all" | UserProfile["status"];
  groupId: string | "all";
};

export function userTypeLabel(u: Pick<UserProfile, "type" | "permissions" | "isParent">): string {
  return USER_TYPE_LABELS[inferUserType(u as UserProfile)];
}

export function filterDirectoryUsers(users: DirectoryUser[], filters: UserMgmtFilters, studioScope?: string): DirectoryUser[] {
  let list = users;
  if (studioScope) list = list.filter((u) => u.studioId === studioScope);

  const q = filters.q.trim().toLowerCase();
  if (q) {
    const digits = q.replace(/\D/g, "");
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.email?.toLowerCase().includes(q) ?? false) ||
        (digits.length > 0 && u.phone.replace(/\D/g, "").includes(digits))
    );
  }

  if (filters.type !== "all") {
    list = list.filter((u) => inferUserType(u) === filters.type);
  }

  if (filters.status !== "all") {
    list = list.filter((u) => u.status === filters.status);
  }

  if (filters.groupId !== "all") {
    const g = getStudioGroups().find((x) => x.id === filters.groupId);
    if (g) list = list.filter((u) => u.assignedGroups.includes(g.name) || u.assignedGroupIds?.includes(g.id));
  }

  return list.sort((a, b) => a.name.localeCompare(b.name, "he"));
}

export function usersByTypeSection(users: DirectoryUser[]): Record<UserType, DirectoryUser[]> {
  const sections: Record<UserType, DirectoryUser[]> = {
    super_admin: [],
    management: [],
    teacher: [],
    parent: [],
    student: []
  };
  for (const u of users) {
    const t = inferUserType(u);
    sections[t].push(u);
  }
  return sections;
}

export function linkedParentNames(user: DirectoryUser, all: DirectoryUser[]): string[] {
  return (user.linkedParentIds ?? [])
    .map((id) => all.find((x) => x.id === id)?.name)
    .filter(Boolean) as string[];
}

export function linkedStudentNames(user: DirectoryUser, all: DirectoryUser[]): string[] {
  return (user.linkedStudentIds ?? [])
    .map((id) => all.find((x) => x.id === id)?.name)
    .filter(Boolean) as string[];
}

export function nextUserId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}`;
}
