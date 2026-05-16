import { getDirectoryUsersFromDb } from "@/lib/local-db/runtime-store";
import type { DirectoryUser } from "@/lib/types";

let snapshot: DirectoryUser[] | null = null;

export function setDirectorySnapshot(users: DirectoryUser[]) {
  snapshot = users;
}

export function getDirectoryUsers(): DirectoryUser[] {
  if (snapshot?.length) return snapshot;
  return getDirectoryUsersFromDb();
}
