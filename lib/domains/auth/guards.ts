import type { V6Database } from "@/lib/v6/types";
import type { V6LoginAttempt } from "./types";
import { selectV6AuthenticatedUser } from "./selectors";

export function canV6Login(db: V6Database, attempt: V6LoginAttempt) {
  return Boolean(selectV6AuthenticatedUser(db, attempt));
}
