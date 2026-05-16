import fs from "fs";
import { ensureAuthCredentials } from "@/lib/auth/credentials";
import { DB_FILES, dbFilePath, getDatabaseDir } from "./paths";
import type { LocalDatabase } from "./db-types";
import { EMPTY_DATABASE } from "./db-types";

function readJson<T>(fileName: string, fallback: T): T {
  const full = dbFilePath(fileName);
  if (!fs.existsSync(full)) return fallback;
  const raw = fs.readFileSync(full, "utf8");
  return JSON.parse(raw) as T;
}

/** Server-only: load full database from `/database/*.json`. */
export function readLocalDatabaseFromDisk(): LocalDatabase {
  if (!fs.existsSync(getDatabaseDir())) {
    return { ...EMPTY_DATABASE };
  }

  const db: LocalDatabase = {
    version: 1,
    studios: readJson(DB_FILES.studios, []),
    users: readJson(DB_FILES.users, []),
    authCredentials: readJson(DB_FILES.authCredentials, []),
    groups: readJson(DB_FILES.groups, []),
    classes: readJson(DB_FILES.classes, []),
    parentsStudents: readJson(DB_FILES.parentsStudents, []),
    tasks: readJson(DB_FILES.tasks, []),
    attendance: readJson(DB_FILES.attendance, EMPTY_DATABASE.attendance),
    messages: readJson(DB_FILES.messages, EMPTY_DATABASE.messages),
    notifications: readJson(DB_FILES.notifications, []),
    chats: readJson(DB_FILES.chats, []),
    gallery: readJson(DB_FILES.gallery, []),
    events: readJson(DB_FILES.events, []),
    achievements: readJson(DB_FILES.achievements, []),
    shopProducts: readJson(DB_FILES.shopProducts, []),
    shopOrders: readJson(DB_FILES.shopOrders, []),
    privateLessons: readJson(DB_FILES.privateLessons, EMPTY_DATABASE.privateLessons),
    teachersAvailability: readJson(DB_FILES.teachersAvailability, []),
    editableTexts: readJson(DB_FILES.editableTexts, []),
    featureFlags: readJson(DB_FILES.featureFlags, EMPTY_DATABASE.featureFlags),
    branding: readJson(DB_FILES.branding, {}),
    auditLog: readJson(DB_FILES.auditLog, []),
    studioOs: readJson(DB_FILES.studioOs, EMPTY_DATABASE.studioOs),
    productData: readJson(DB_FILES.productData, EMPTY_DATABASE.productData),
    faculty: readJson(DB_FILES.faculty, []),
    studioIdentity: readJson(DB_FILES.studioIdentity, EMPTY_DATABASE.studioIdentity),
    platformMeta: readJson(DB_FILES.platformMeta, EMPTY_DATABASE.platformMeta),
    trainings: readJson(DB_FILES.trainings, EMPTY_DATABASE.trainings),
    systemSettings: readJson(DB_FILES.systemSettings, EMPTY_DATABASE.systemSettings),
    platformOs: readJson(DB_FILES.platformOs, EMPTY_DATABASE.platformOs),
    seasons: readJson(DB_FILES.seasons, EMPTY_DATABASE.seasons),
    consents: readJson(DB_FILES.consents, EMPTY_DATABASE.consents)
  };
  return ensureAuthCredentials(db);
}

export function readLocalDatabaseFile<K extends keyof typeof DB_FILES>(
  key: K
): unknown {
  const fileName = DB_FILES[key];
  const full = dbFilePath(fileName);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}
