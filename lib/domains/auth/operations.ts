import type { V6Database } from "@/lib/v6/types";
import { v6Allowed, v6Denied } from "../core/v6";
import { selectV6AuthenticatedUser } from "./selectors";
import type { V6LoginAttempt } from "./types";

export function buildV6LoginOperation(db: V6Database, attempt: V6LoginAttempt) {
  const auth = selectV6AuthenticatedUser(db, attempt);
  return auth ? v6Allowed({ userId: auth.user.id }) : v6Denied("טלפון או סיסמה לא נכונים");
}
