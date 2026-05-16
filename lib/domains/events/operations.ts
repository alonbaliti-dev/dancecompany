import type { LocalDatabase } from "@/lib/local-db/db-types";
import type { EventOperatingMode } from "@/lib/platform-os/types";
import {
  getOrCreateEventMode,
  postLiveUpdate,
  updateEventMode
} from "@/lib/services/event-operating-mode-service";
import type { StudioEvent, UserProfile } from "@/lib/types";
import { domainGuards } from "../core/permissions";
import type { DomainMutationInput } from "../core/types";

export function readEventMode(db: LocalDatabase, event: StudioEvent, studioId: string): EventOperatingMode {
  const existing = db.platformOs.eventOperatingModes[event.id];
  if (existing) return existing;
  return getOrCreateEventMode(db, event, studioId);
}

export function buildEnsureEventModeMutation(
  actor: UserProfile,
  event: StudioEvent
): DomainMutationInput {
  return {
    actor,
    guard: domainGuards.eventOperatingMode(actor),
    mutate: (db) => {
      if (db.platformOs.eventOperatingModes[event.id]) return db;
      return updateEventMode(db, getOrCreateEventMode(db, event, actor.studioId));
    }
  };
}

export function buildToggleBackstageMutation(
  actor: UserProfile,
  eventId: string,
  enabled: boolean
): DomainMutationInput {
  return {
    actor,
    guard: domainGuards.eventOperatingMode(actor),
    mutate: (db) => {
      const mode = db.platformOs.eventOperatingModes[eventId];
      if (!mode) return db;
      return updateEventMode(db, { ...mode, backstageMode: enabled });
    },
    audit: {
      action: enabled ? "מצב חלק אחורי הופעל" : "מצב חלק אחורי כובה",
      targetType: "event",
      targetId: eventId,
      severity: "info"
    }
  };
}

export function buildCheckInArrivalMutation(
  actor: UserProfile,
  eventId: string,
  studentId: string
): DomainMutationInput {
  return {
    actor,
    guard: domainGuards.eventOperatingMode(actor),
    mutate: (db) => {
      const mode = db.platformOs.eventOperatingModes[eventId];
      if (!mode) return db;
      return updateEventMode(db, {
        ...mode,
        arrivalTracking: mode.arrivalTracking.map((a) =>
          a.studentId === studentId
            ? { ...a, arrivedAt: new Date().toISOString(), checkedInBy: actor.id }
            : a
        )
      });
    },
    audit: {
      action: "צ'ק-אין הגעה להופעה",
      targetType: "event",
      targetId: eventId,
      severity: "info"
    },
    activity: {
      kind: "event",
      messageHe: "תלמיד/ה הגיע/ה להופעה",
      relatedType: "event",
      relatedId: eventId,
      targetUserIds: [studentId]
    }
  };
}

export function buildPostLiveUpdateMutation(
  actor: UserProfile,
  eventId: string,
  message: string
): DomainMutationInput {
  return {
    actor,
    guard: domainGuards.eventOperatingMode(actor),
    mutate: (db) => postLiveUpdate(db, eventId, message, actor.name),
    audit: {
      action: "עדכון חי מההופעה",
      targetType: "event",
      targetId: eventId,
      severity: "info"
    },
    activity: {
      kind: "event",
      messageHe: message.slice(0, 120),
      relatedType: "event",
      relatedId: eventId,
      visibility: "studio"
    }
  };
}

export function buildToggleMemoryCollectionMutation(
  actor: UserProfile,
  eventId: string,
  open: boolean
): DomainMutationInput {
  return {
    actor,
    guard: domainGuards.management(actor),
    mutate: (db) => {
      const mode = db.platformOs.eventOperatingModes[eventId];
      if (!mode) return db;
      return updateEventMode(db, { ...mode, memoryVideoCollectionOpen: open });
    },
    audit: {
      action: open ? "איסוף זיכרונות נפתח" : "איסוף זיכרונות נסגר",
      targetType: "event",
      targetId: eventId,
      severity: "info"
    }
  };
}

export function buildUpdateRunningOrderMutation(
  actor: UserProfile,
  eventId: string,
  runningOrder: EventOperatingMode["runningOrder"]
): DomainMutationInput {
  return {
    actor,
    guard: domainGuards.eventOperatingMode(actor),
    mutate: (db) => {
      const mode = db.platformOs.eventOperatingModes[eventId];
      if (!mode) return db;
      return updateEventMode(db, { ...mode, runningOrder });
    },
    audit: {
      action: "סדר הופעה עודכן",
      targetType: "event",
      targetId: eventId,
      severity: "info"
    }
  };
}
