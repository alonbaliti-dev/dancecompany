import { studioGroups as FALLBACK_GROUPS } from "@/lib/studio-groups-catalog";
import { getStudioGroupsFromDb } from "@/lib/local-db/runtime-store";
import type { StudioGroup } from "@/lib/types";

export function getStudioGroups(): StudioGroup[] {
  const fromDb = getStudioGroupsFromDb();
  return fromDb.length > 0 ? fromDb : FALLBACK_GROUPS;
}
