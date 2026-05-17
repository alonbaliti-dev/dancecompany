import type { V6Database, V6Role, V6User } from "@/lib/v6/types";
import { dedupeById } from "@/lib/v6/dedupe";

export const v6RoleOrder: V6Role[] = ["student", "parent", "teacher", "management", "super_admin"];

export function sortByHebrewName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "he"));
}

export function sortGroupsByAgeAndStyle(db: V6Database) {
  return dedupeById(db.groups).sort((a, b) => {
    const ageCompare = (a.ageGroup ?? "").localeCompare(b.ageGroup ?? "", "he", { numeric: true });
    if (ageCompare) return ageCompare;
    const styleCompare = (a.danceStyle ?? a.style).localeCompare(b.danceStyle ?? b.style, "he");
    if (styleCompare) return styleCompare;
    return a.name.localeCompare(b.name, "he");
  });
}

export function groupUsersByRole(users: V6User[]) {
  return v6RoleOrder.map((role) => ({ role, users: sortByHebrewName(users.filter((user) => user.role === role)) })).filter((group) => group.users.length);
}

export function groupStudentsByGroup(db: V6Database, students: V6User[]) {
  const sortedGroups = sortGroupsByAgeAndStyle(db);
  const assigned = new Set<string>();
  const groups = sortedGroups
    .map((group) => {
      const users = sortByHebrewName(students.filter((student) => student.groupIds.includes(group.id)));
      users.forEach((student) => assigned.add(student.id));
      return { group, users };
    })
    .filter((group) => group.users.length);
  const unassigned = sortByHebrewName(students.filter((student) => !assigned.has(student.id)));
  return unassigned.length ? [...groups, { group: undefined, users: unassigned }] : groups;
}

export function groupTeachersByStyle(db: V6Database, teachers: V6User[]) {
  const styles = [...new Set(db.groups.map((group) => group.danceStyle ?? group.style).filter(Boolean))].sort((a, b) => a.localeCompare(b, "he"));
  const assigned = new Set<string>();
  const grouped = styles
    .map((style) => {
      const users = sortByHebrewName(teachers.filter((teacher) => teacher.groupIds.some((groupId) => {
        const group = db.groups.find((item) => item.id === groupId);
        return (group?.danceStyle ?? group?.style) === style;
      }) || teacher.danceStyleIds?.includes(style)));
      users.forEach((teacher) => assigned.add(teacher.id));
      return { style, users };
    })
    .filter((group) => group.users.length);
  const unassigned = sortByHebrewName(teachers.filter((teacher) => !assigned.has(teacher.id)));
  return unassigned.length ? [...grouped, { style: "ללא שיוך", users: unassigned }] : grouped;
}

export function selectV6UsersForActor(db: V6Database, actor: V6User) {
  const normalizedUsers = dedupeById(db.users);
  const users = actor.role === "super_admin" ? normalizedUsers : normalizedUsers.filter((user) => user.studioId === actor.studioId);
  return sortByHebrewName(users);
}

export function selectV6UsersByRole(db: V6Database, actor: V6User, role: V6Role | "all") {
  const users = selectV6UsersForActor(db, actor);
  return role === "all" ? users : sortByHebrewName(users.filter((user) => user.role === role));
}
