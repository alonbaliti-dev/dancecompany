import type { V6Credential, V6Database, V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied } from "../core/v6";
import { canV6EditCredentials, canV6ManageUsers } from "./guards";

export function buildV6UpsertUserOperation(db: V6Database, actor: V6User, user: V6User, credential?: V6Credential) {
  if (!canV6ManageUsers(actor, user)) return v6Denied("אין הרשאה לניהול משתמשים");
  return v6Allowed({ exists: db.users.some((item) => item.id === user.id), user, credential });
}

export function buildV6ResetPasswordOperation(actor: V6User, target: V6User) {
  return canV6EditCredentials(actor, target) ? v6Allowed({ userId: target.id }) : v6Denied("אין הרשאה לאיפוס סיסמה");
}
