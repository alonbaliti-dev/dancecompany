import fs from "fs";
import { DB_FILES, dbFilePath, getDatabaseDir } from "./paths";
import { EMPTY_DATABASE, type LocalDatabase } from "./db-types";

export type DatabaseFileError = {
  file: string;
  moduleKey: string;
  message: string;
};

export type DatabaseLoadReport = {
  source: "disk" | "partial" | "empty" | "fallback";
  fileErrors: DatabaseFileError[];
  loadedAt: string;
  durationMs: number;
  databaseDirExists: boolean;
};

type ModuleSpec<K extends keyof LocalDatabase> = {
  key: K;
  file: string;
  fallback: LocalDatabase[K];
};

const MODULES: ModuleSpec<keyof LocalDatabase>[] = [
  { key: "studios", file: DB_FILES.studios, fallback: [] },
  { key: "users", file: DB_FILES.users, fallback: [] },
  { key: "authCredentials", file: DB_FILES.authCredentials, fallback: [] },
  { key: "groups", file: DB_FILES.groups, fallback: [] },
  { key: "classes", file: DB_FILES.classes, fallback: [] },
  { key: "parentsStudents", file: DB_FILES.parentsStudents, fallback: [] },
  { key: "tasks", file: DB_FILES.tasks, fallback: [] },
  { key: "attendance", file: DB_FILES.attendance, fallback: EMPTY_DATABASE.attendance },
  { key: "messages", file: DB_FILES.messages, fallback: EMPTY_DATABASE.messages },
  { key: "notifications", file: DB_FILES.notifications, fallback: [] },
  { key: "chats", file: DB_FILES.chats, fallback: [] },
  { key: "gallery", file: DB_FILES.gallery, fallback: [] },
  { key: "events", file: DB_FILES.events, fallback: [] },
  { key: "achievements", file: DB_FILES.achievements, fallback: [] },
  { key: "shopProducts", file: DB_FILES.shopProducts, fallback: [] },
  { key: "shopOrders", file: DB_FILES.shopOrders, fallback: [] },
  { key: "privateLessons", file: DB_FILES.privateLessons, fallback: EMPTY_DATABASE.privateLessons },
  { key: "teachersAvailability", file: DB_FILES.teachersAvailability, fallback: [] },
  { key: "editableTexts", file: DB_FILES.editableTexts, fallback: [] },
  { key: "featureFlags", file: DB_FILES.featureFlags, fallback: EMPTY_DATABASE.featureFlags },
  { key: "branding", file: DB_FILES.branding, fallback: {} },
  { key: "auditLog", file: DB_FILES.auditLog, fallback: [] },
  { key: "studioOs", file: DB_FILES.studioOs, fallback: EMPTY_DATABASE.studioOs },
  { key: "productData", file: DB_FILES.productData, fallback: EMPTY_DATABASE.productData },
  { key: "faculty", file: DB_FILES.faculty, fallback: [] },
  { key: "studioIdentity", file: DB_FILES.studioIdentity, fallback: EMPTY_DATABASE.studioIdentity },
  { key: "platformMeta", file: DB_FILES.platformMeta, fallback: EMPTY_DATABASE.platformMeta },
  { key: "trainings", file: DB_FILES.trainings, fallback: EMPTY_DATABASE.trainings },
  { key: "systemSettings", file: DB_FILES.systemSettings, fallback: EMPTY_DATABASE.systemSettings },
  { key: "platformOs", file: DB_FILES.platformOs, fallback: EMPTY_DATABASE.platformOs },
  { key: "seasons", file: DB_FILES.seasons, fallback: EMPTY_DATABASE.seasons },
  { key: "consents", file: DB_FILES.consents, fallback: EMPTY_DATABASE.consents }
];

function safeReadJsonFile<T>(fileName: string, fallback: T): { value: T; error?: string } {
  const full = dbFilePath(fileName);
  if (!fs.existsSync(full)) {
    return { value: fallback };
  }
  try {
    const raw = fs.readFileSync(full, "utf8");
    if (!raw.trim()) {
      return { value: fallback, error: "קובץ ריק" };
    }
    const parsed = JSON.parse(raw) as T;
    return { value: parsed };
  } catch (e) {
    const message = e instanceof Error ? e.message : "שגיאת קריאה";
    return { value: fallback, error: message };
  }
}

export type DatabaseStatusPayload = {
  databaseFolderExists: boolean;
  jsonFilesFound: string[];
  parsedSuccessfully: { file: string; moduleKey: string }[];
  failed: DatabaseFileError[];
  totalModulesLoaded: number;
  totalModulesExpected: number;
};

/** Server-only: inspect `/database` without returning full payload (for /api/local-db/status). */
export function getLocalDatabaseStatus(): DatabaseStatusPayload {
  const databaseDirExists = fs.existsSync(getDatabaseDir());
  const jsonFilesFound: string[] = [];
  const parsedSuccessfully: { file: string; moduleKey: string }[] = [];
  const failed: DatabaseFileError[] = [];

  if (!databaseDirExists) {
    return {
      databaseFolderExists: false,
      jsonFilesFound: [],
      parsedSuccessfully: [],
      failed: [{ file: "(database/)", moduleKey: "*", message: "תיקיית database לא נמצאה" }],
      totalModulesLoaded: 0,
      totalModulesExpected: MODULES.length
    };
  }

  for (const spec of MODULES) {
    const full = dbFilePath(spec.file);
    if (fs.existsSync(full)) jsonFilesFound.push(spec.file);
    const { error } = safeReadJsonFile(spec.file, spec.fallback);
    if (error) {
      failed.push({ file: spec.file, moduleKey: String(spec.key), message: error });
    } else {
      parsedSuccessfully.push({ file: spec.file, moduleKey: String(spec.key) });
    }
  }

  return {
    databaseFolderExists: true,
    jsonFilesFound,
    parsedSuccessfully,
    failed,
    totalModulesLoaded: parsedSuccessfully.length,
    totalModulesExpected: MODULES.length
  };
}

/** Server-only: resilient load with per-module fallback. */
export function readLocalDatabaseSafe(): { db: LocalDatabase; report: DatabaseLoadReport } {
  const start = Date.now();
  const fileErrors: DatabaseFileError[] = [];
  const databaseDirExists = fs.existsSync(getDatabaseDir());

  const db = structuredClone(EMPTY_DATABASE);

  if (!databaseDirExists) {
    return {
      db,
      report: {
        source: "empty",
        fileErrors: [{ file: "(database/)", moduleKey: "*", message: "תיקיית database לא נמצאה" }],
        loadedAt: new Date().toISOString(),
        durationMs: Date.now() - start,
        databaseDirExists: false
      }
    };
  }

  for (const spec of MODULES) {
    const { value, error } = safeReadJsonFile(spec.file, spec.fallback);
    (db as Record<string, unknown>)[spec.key] = value;
    if (error) {
      fileErrors.push({ file: spec.file, moduleKey: String(spec.key), message: error });
    }
  }

  const source: DatabaseLoadReport["source"] =
    fileErrors.length === 0 ? "disk" : fileErrors.length < MODULES.length ? "partial" : "empty";

  return {
    db,
    report: {
      source,
      fileErrors,
      loadedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      databaseDirExists: true
    }
  };
}
