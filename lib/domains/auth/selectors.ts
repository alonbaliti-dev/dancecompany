import type { V6Database } from "@/lib/v6/types";
import type { V6AuthenticatedUser, V6LoginAttempt } from "./types";

export function selectV6AuthenticatedUser(db: V6Database, attempt: V6LoginAttempt): V6AuthenticatedUser | null {
  const credential = db.credentials.find((item) => item.phone === attempt.phone && item.password === attempt.password);
  const user = credential ? db.users.find((item) => item.id === credential.userId && item.active) : null;
  return credential && user ? { credential, user } : null;
}
