import type { LocalDatabase } from "./db-types";

/** Current on-disk / in-memory schema version. */
export const DATABASE_SCHEMA_VERSION = 1;

export const DATABASE_MODULE_KEYS = [
  "studios",
  "users",
  "authCredentials",
  "groups",
  "classes",
  "parentsStudents",
  "tasks",
  "attendance",
  "messages",
  "notifications",
  "chats",
  "gallery",
  "events",
  "achievements",
  "shopProducts",
  "shopOrders",
  "privateLessons",
  "teachersAvailability",
  "editableTexts",
  "featureFlags",
  "branding",
  "auditLog",
  "studioOs",
  "productData",
  "faculty",
  "studioIdentity",
  "platformMeta",
  "trainings",
  "systemSettings",
  "platformOs",
  "seasons",
  "consents"
] as const satisfies readonly (keyof Omit<LocalDatabase, "version">)[];

export type DatabaseModuleKey = (typeof DATABASE_MODULE_KEYS)[number];
