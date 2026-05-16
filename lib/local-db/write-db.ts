import fs from "fs";
import { usersWithoutLegacyPasswords } from "@/lib/auth/credentials";
import { DB_FILES, dbFilePath, getDatabaseDir } from "./paths";
import type { LocalDatabase } from "./db-types";

function writeJson(fileName: string, data: unknown): void {
  const dir = getDatabaseDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dbFilePath(fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/**
 * Server-only (local dev): persist in-memory database back to `/database`.
 * NOT for Vercel production — filesystem is ephemeral. Use Supabase in production.
 */
export function writeLocalDatabaseToDisk(db: LocalDatabase): void {
  writeJson(DB_FILES.studios, db.studios);
  writeJson(DB_FILES.users, usersWithoutLegacyPasswords(db.users));
  writeJson(DB_FILES.authCredentials, db.authCredentials ?? []);
  writeJson(DB_FILES.groups, db.groups);
  writeJson(DB_FILES.classes, db.classes);
  writeJson(DB_FILES.parentsStudents, db.parentsStudents);
  writeJson(DB_FILES.tasks, db.tasks);
  writeJson(DB_FILES.attendance, db.attendance);
  writeJson(DB_FILES.messages, db.messages);
  writeJson(DB_FILES.notifications, db.notifications);
  writeJson(DB_FILES.chats, db.chats);
  writeJson(DB_FILES.gallery, db.gallery);
  writeJson(DB_FILES.events, db.events);
  writeJson(DB_FILES.achievements, db.achievements);
  writeJson(DB_FILES.shopProducts, db.shopProducts);
  writeJson(DB_FILES.shopOrders, db.shopOrders);
  writeJson(DB_FILES.privateLessons, db.privateLessons);
  writeJson(DB_FILES.teachersAvailability, db.teachersAvailability);
  writeJson(DB_FILES.editableTexts, db.editableTexts);
  writeJson(DB_FILES.featureFlags, db.featureFlags);
  writeJson(DB_FILES.branding, db.branding);
  writeJson(DB_FILES.auditLog, db.auditLog);
  writeJson(DB_FILES.studioOs, db.studioOs);
  writeJson(DB_FILES.productData, db.productData);
  writeJson(DB_FILES.faculty, db.faculty);
  writeJson(DB_FILES.studioIdentity, db.studioIdentity);
  writeJson(DB_FILES.platformMeta, db.platformMeta);
  writeJson(DB_FILES.trainings, db.trainings);
  writeJson(DB_FILES.systemSettings, db.systemSettings);
  writeJson(DB_FILES.platformOs, db.platformOs);
  writeJson(DB_FILES.seasons, db.seasons);
  writeJson(DB_FILES.consents, db.consents);
}

export function writeLocalDatabaseFile(fileName: string, data: unknown): void {
  writeJson(fileName, data);
}
