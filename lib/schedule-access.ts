import { getScheduleFromDb } from "@/lib/local-db/runtime-store";
import type { StudioClass } from "@/lib/types";

export function getSchedule(): StudioClass[] {
  return getScheduleFromDb();
}
