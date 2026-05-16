import type { V6PrivateLesson, V6User } from "@/lib/v6/types";
import { v6SameStudio } from "../core/v6";

export function canV6RequestPrivateLesson(actor: V6User) {
  return actor.active;
}

export function canV6CoordinatePrivateLesson(actor: V6User, lesson?: V6PrivateLesson) {
  if (actor.role === "super_admin" || actor.permissions.managePrivateLessons) return true;
  return Boolean(lesson && actor.role === "teacher" && lesson.teacherId === actor.id && v6SameStudio(actor, lesson.studioId));
}
