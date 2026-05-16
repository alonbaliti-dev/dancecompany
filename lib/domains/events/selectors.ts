import type { V6Database } from "@/lib/v6/types";

export function selectV6UpcomingEvents(db: V6Database) {
  return [...db.events].sort((a, b) => a.date.localeCompare(b.date));
}

export function selectV6PrimaryEvent(db: V6Database) {
  return selectV6UpcomingEvents(db)[0];
}
