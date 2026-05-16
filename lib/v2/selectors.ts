import type {
  V2Class,
  V2Database,
  V2Group,
  V2PrivateLessonDuration,
  V2PrivateLessonRequest,
  V2Product,
  V2User
} from "./types";

export function textValue(db: V2Database, key: string, fallback: string): string {
  return db.editableTexts.find((item) => item.key === key)?.value ?? fallback;
}

export function currentStudio(db: V2Database, user: V2User) {
  return db.studios.find((studio) => studio.id === user.studioId) ?? db.studios[0];
}

export function usersForActor(db: V2Database, actor: V2User): V2User[] {
  if (actor.role === "super_admin") return db.users;
  return db.users.filter((u) => u.studioId === actor.studioId);
}

export function teachers(db: V2Database): V2User[] {
  return db.users.filter((u) => u.role === "teacher" || u.role === "management");
}

export function students(db: V2Database): V2User[] {
  return db.users.filter((u) => u.role === "student");
}

export function groupsForUser(db: V2Database, user: V2User): V2Group[] {
  if (user.role === "super_admin" || user.role === "management") {
    return db.groups.filter((g) => g.studioId === user.studioId);
  }
  if (user.role === "parent") {
    const linked = new Set(user.linkedStudentIds);
    const groupIds = new Set(db.users.filter((u) => linked.has(u.id)).flatMap((u) => u.groupIds));
    return db.groups.filter((g) => groupIds.has(g.id));
  }
  return db.groups.filter((g) => user.groupIds.includes(g.id));
}

export function classesForUser(db: V2Database, user: V2User): V2Class[] {
  const groupIds = new Set(groupsForUser(db, user).map((g) => g.id));
  return db.classes.filter((c) => groupIds.has(c.groupId));
}

export function productsForShop(db: V2Database): V2Product[] {
  return db.products.filter((p) => p.isActive);
}

export function privateLessonPrice(duration: V2PrivateLessonDuration): number {
  return duration === 45 ? 225 : 150;
}

export function privateLessonRequestsForUser(db: V2Database, user: V2User): V2PrivateLessonRequest[] {
  if (user.role === "super_admin" || user.role === "management") return db.privateLessonRequests;
  if (user.role === "teacher") return db.privateLessonRequests.filter((r) => r.teacherId === user.id);
  if (user.role === "parent") {
    return db.privateLessonRequests.filter((r) => r.requestedByUserId === user.id || user.linkedStudentIds.includes(r.studentId));
  }
  return db.privateLessonRequests.filter((r) => r.studentId === user.id || r.requestedByUserId === user.id);
}

export function displayUserName(db: V2Database, userId: string): string {
  return db.users.find((u) => u.id === userId)?.name ?? "משתמש";
}
