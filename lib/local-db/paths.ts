import path from "path";

/** Project-root `/database` folder (editable local DB). */
export function getDatabaseDir(): string {
  return path.join(process.cwd(), "database");
}

export function dbFilePath(fileName: string): string {
  return path.join(getDatabaseDir(), fileName);
}

export const DB_FILES = {
  studios: "studios.json",
  users: "users.json",
  authCredentials: "auth-credentials.json",
  groups: "groups.json",
  classes: "classes.json",
  parentsStudents: "parents-students.json",
  tasks: "tasks.json",
  attendance: "attendance.json",
  messages: "messages.json",
  notifications: "notifications.json",
  chats: "chats.json",
  gallery: "gallery.json",
  events: "events.json",
  achievements: "achievements.json",
  shopProducts: "shop-products.json",
  shopOrders: "shop-orders.json",
  privateLessons: "private-lessons.json",
  teachersAvailability: "teachers-availability.json",
  editableTexts: "editable-texts.json",
  featureFlags: "feature-flags.json",
  branding: "branding.json",
  auditLog: "audit-log.json",
  studioOs: "studio-os.json",
  productData: "product-data.json",
  studioIdentity: "studio-identity.json",
  faculty: "faculty.json",
  platformMeta: "platform-meta.json",
  trainings: "trainings.json",
  systemSettings: "system-settings.json",
  platformOs: "platform-os.json",
  seasons: "seasons.json",
  consents: "consents.json"
} as const;
