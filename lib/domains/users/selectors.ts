import type { V6Database, V6Role, V6User } from "@/lib/v6/types";

export function selectV6UsersForActor(db: V6Database, actor: V6User) {
  if (actor.role === "super_admin") return db.users;
  return db.users.filter((user) => user.studioId === actor.studioId);
}

export function selectV6UsersByRole(db: V6Database, actor: V6User, role: V6Role | "all") {
  const users = selectV6UsersForActor(db, actor);
  return role === "all" ? users : users.filter((user) => user.role === role);
}
