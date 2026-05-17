import type { V6Database, V6User } from "@/lib/v6/types";
import { sortByHebrewName } from "@/lib/domains/users/selectors";
import { dedupeById, dedupeByCompositeKey } from "@/lib/v6/dedupe";

export function selectV6LessonsForActor(db: V6Database, actor: V6User) {
  const allLessons = dedupeById(db.lessons);
  const lessons = actor.role === "super_admin" || actor.role === "management" ? allLessons : allLessons.filter((lesson) => actor.groupIds.includes(lesson.groupId));
  return [...lessons].sort((a, b) => {
    const groupA = db.groups.find((group) => group.id === a.groupId);
    const groupB = db.groups.find((group) => group.id === b.groupId);
    return `${groupA?.name ?? ""} ${a.time}`.localeCompare(`${groupB?.name ?? ""} ${b.time}`, "he", { numeric: true });
  });
}

export function selectV6StudentsForAttendanceGroup(db: V6Database, groupId: string) {
  const group = db.groups.find((item) => item.id === groupId);
  if (!group) return [];
  return sortByHebrewName(dedupeById(db.users).filter((item) => item.role === "student" && group.studentIds.includes(item.id)));
}

export function selectV6AttendanceForActor(db: V6Database, actor: V6User) {
  const attendance = dedupeByCompositeKey(dedupeById(db.attendance), (item) => `${item.studioId ?? ""}:${item.lessonId}:${item.groupId ?? ""}:${item.classDate ?? ""}:${item.studentId}`);
  if (actor.role === "student") return attendance.filter((item) => item.studentId === actor.id);
  if (actor.role === "parent") return attendance.filter((item) => actor.linkedStudentIds.includes(item.studentId));
  return attendance;
}

export function selectV6AttendanceRate(db: V6Database, actor: V6User) {
  const scoped = selectV6AttendanceForActor(db, actor);
  const counted = scoped.filter((item) => item.status !== "excused");
  return counted.length ? Math.round((counted.filter((item) => item.status === "present" || item.status === "late").length / counted.length) * 100) : 0;
}
