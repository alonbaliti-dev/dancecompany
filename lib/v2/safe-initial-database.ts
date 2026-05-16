import auditLog from "@/database/v2-audit-log.json";
import attendance from "@/database/v2-attendance.json";
import classes from "@/database/v2-classes.json";
import credentials from "@/database/v2-credentials.json";
import editableTexts from "@/database/v2-editable-texts.json";
import featureFlags from "@/database/v2-feature-flags.json";
import groups from "@/database/v2-groups.json";
import messages from "@/database/v2-messages.json";
import mediaItems from "@/database/media-items.json";
import notifications from "@/database/v2-notifications.json";
import privateLessonRequests from "@/database/v2-private-lessons.json";
import products from "@/database/v2-products.json";
import studios from "@/database/v2-studios.json";
import tasks from "@/database/v2-tasks.json";
import users from "@/database/v2-users.json";
import type { V2Database } from "./types";

export const safeInitialDatabase: V2Database = {
  version: 2,
  studios,
  users,
  credentials,
  groups,
  classes,
  tasks,
  attendance,
  messages,
  notifications,
  products,
  privateLessonRequests,
  mediaItems,
  featureFlags,
  editableTexts,
  auditLog
} as V2Database;

export function cloneSafeInitialDatabase(): V2Database {
  return JSON.parse(JSON.stringify(safeInitialDatabase)) as V2Database;
}
