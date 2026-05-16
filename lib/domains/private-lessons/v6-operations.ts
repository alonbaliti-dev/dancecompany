import type { V6PrivateLesson, V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied } from "../core/v6";
import { canV6CoordinatePrivateLesson, canV6RequestPrivateLesson } from "./guards";

export function buildV6RequestPrivateLessonOperation(actor: V6User) {
  return canV6RequestPrivateLesson(actor) ? v6Allowed({ requesterId: actor.id }) : v6Denied("לא ניתן לפתוח בקשה");
}

export function buildV6CoordinatePrivateLessonOperation(actor: V6User, lesson: V6PrivateLesson) {
  return canV6CoordinatePrivateLesson(actor, lesson) ? v6Allowed({ requestId: lesson.id }) : v6Denied("אין הרשאה לתאם שיעור פרטי");
}
