import type { V6Database, V6User } from "@/lib/v6/types";

export function selectV6PrivateLessonsForActor(db: V6Database, actor: V6User) {
  if (actor.role === "student") return db.privateLessons.filter((item) => item.studentId === actor.id || item.requestedByUserId === actor.id);
  if (actor.role === "parent") return db.privateLessons.filter((item) => actor.linkedStudentIds.includes(item.studentId));
  if (actor.role === "teacher") return db.privateLessons.filter((item) => item.teacherId === actor.id);
  return db.privateLessons;
}

export function selectV6PrivateLessonPipeline(db: V6Database, actor: V6User) {
  const lessons = selectV6PrivateLessonsForActor(db, actor);
  return {
    requested: lessons.filter((item) => item.status === "requested"),
    awaitingPayment: lessons.filter((item) => item.status === "slot_selected" || item.status === "payment_open"),
    confirmed: lessons.filter((item) => item.status === "paid")
  };
}
