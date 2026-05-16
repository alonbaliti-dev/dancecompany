import type { LocalDatabase } from "@/lib/local-db/db-types";
import type { EventOperatingMode } from "@/lib/platform-os/types";
import type { StudioEvent } from "@/lib/types";

export function getOrCreateEventMode(db: LocalDatabase, event: StudioEvent, studioId: string): EventOperatingMode {
  const existing = db.platformOs.eventOperatingModes[event.id];
  if (existing) return existing;
  return {
    eventId: event.id,
    studioId,
    backstageMode: false,
    arrivalTracking: (event.participatingStudentIds ?? []).map((studentId) => ({ studentId })),
    emergencyContacts: [],
    costumeChecklist: event.equipmentChecklist ?? [],
    equipmentChecklist: event.equipmentChecklist ?? [],
    runningOrder: [],
    liveUpdates: [],
    ticketScanPlaceholder: true,
    memoryVideoCollectionOpen: event.type === "performance",
    updatedAt: new Date().toISOString()
  };
}

export function updateEventMode(db: LocalDatabase, mode: EventOperatingMode): LocalDatabase {
  return {
    ...db,
    platformOs: {
      ...db.platformOs,
      eventOperatingModes: {
        ...db.platformOs.eventOperatingModes,
        [mode.eventId]: { ...mode, updatedAt: new Date().toISOString() }
      }
    }
  };
}

export function postLiveUpdate(
  db: LocalDatabase,
  eventId: string,
  message: string,
  createdByName: string
): LocalDatabase {
  const mode = db.platformOs.eventOperatingModes[eventId];
  if (!mode) return db;
  const update = {
    id: `live_${Date.now().toString(36)}`,
    message,
    createdAt: new Date().toISOString(),
    createdByName
  };
  return updateEventMode(db, {
    ...mode,
    liveUpdates: [update, ...mode.liveUpdates].slice(0, 50)
  });
}
