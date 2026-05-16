import type { V6Database, V6User } from "@/lib/v6/types";

export function selectV6LessonsForActor(db: V6Database, actor: V6User) {
  if (actor.role === "super_admin" || actor.role === "management") return db.lessons;
  return db.lessons.filter((lesson) => actor.groupIds.includes(lesson.groupId));
}

export function selectV6AttendanceForActor(db: V6Database, actor: V6User) {
  if (actor.role === "student") return db.attendance.filter((item) => item.studentId === actor.id);
  if (actor.role === "parent") return db.attendance.filter((item) => actor.linkedStudentIds.includes(item.studentId));
  return db.attendance;
}

export function selectV6AttendanceRate(db: V6Database, actor: V6User) {
  const scoped = selectV6AttendanceForActor(db, actor);
  return scoped.length ? Math.round((scoped.filter((item) => item.status === "present").length / scoped.length) * 100) : 0;
}
