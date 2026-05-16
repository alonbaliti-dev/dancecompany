import type { LocalDatabase } from "./db-types";
import { EMPTY_DATABASE } from "./db-types";

let runtimeDb: LocalDatabase = { ...EMPTY_DATABASE };

export function setRuntimeDatabase(db: LocalDatabase): void {
  runtimeDb = db;
}

export function getRuntimeDatabase(): LocalDatabase {
  return runtimeDb;
}

export function getStudioGroupsFromDb() {
  return runtimeDb.groups;
}

export function getScheduleFromDb() {
  return runtimeDb.classes;
}

export function getDirectoryUsersFromDb() {
  return runtimeDb.users;
}
