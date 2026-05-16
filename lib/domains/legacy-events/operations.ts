import type { LocalDatabase } from "@/lib/local-db/db-types";
import { deriveEventStatus } from "@/lib/legacy-events-logic";
import {
  canAddTeacherLegacyContent,
  canManageLegacyEvents
} from "@/lib/legacy-events-permissions";
import { guard } from "@/lib/security/guards";
import type {
  LegacyEventFormPayload,
  LegacyTeacherNote,
  LegacyTeacherSuggestion,
  StudioAchievement,
  StudioEvent,
  UserProfile
} from "@/lib/types";
import { domainGuards } from "../core/permissions";
import type { DomainMutationInput } from "../core/types";

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function withDerivedStatus(e: StudioEvent): StudioEvent {
  return { ...e, status: deriveEventStatus(e.date, e.endDate) };
}

function mapEvents(db: LocalDatabase, fn: (events: StudioEvent[]) => StudioEvent[]): LocalDatabase {
  return { ...db, events: fn(db.events) };
}

export function buildCreateLegacyEventMutation(
  actor: UserProfile,
  payload: LegacyEventFormPayload
): DomainMutationInput | null {
  if (!canManageLegacyEvents(actor)) return null;
  const id = newId("evt");
  const row: StudioEvent = {
    ...payload,
    id,
    achievements: payload.achievements ?? [],
    teacherNotes: [],
    pendingSuggestions: [],
    status: deriveEventStatus(payload.date, payload.endDate),
    createdByUserId: actor.id,
    createdAt: new Date().toISOString()
  };
  return {
    actor,
    guard: guard(true),
    mutate: (db) => mapEvents(db, (events) => [row, ...events]),
    audit: {
      action: `אירוע נוצר: ${row.title}`,
      targetType: "event",
      targetId: id,
      severity: "info"
    },
    activity: { kind: "event", messageHe: row.title, relatedType: "event", relatedId: id }
  };
}

export function buildUpdateLegacyEventMutation(
  actor: UserProfile,
  eventId: string,
  payload: Partial<LegacyEventFormPayload>
): DomainMutationInput | null {
  if (!canManageLegacyEvents(actor)) return null;
  return {
    actor,
    guard: guard(true),
    mutate: (db) =>
      mapEvents(db, (events) =>
        events.map((e) => {
          if (e.id !== eventId) return e;
          return withDerivedStatus({ ...e, ...payload });
        })
      ),
    audit: {
      action: "אירוע עודכן",
      targetType: "event",
      targetId: eventId,
      severity: "info"
    }
  };
}

export function buildDeleteLegacyEventMutation(actor: UserProfile, eventId: string): DomainMutationInput | null {
  if (!canManageLegacyEvents(actor)) return null;
  return {
    actor,
    guard: guard(true),
    mutate: (db) => mapEvents(db, (events) => events.filter((e) => e.id !== eventId)),
    audit: {
      action: "אירוע נמחק",
      targetType: "event",
      targetId: eventId,
      severity: "warning"
    }
  };
}

export function buildAddAchievementMutation(
  actor: UserProfile,
  eventId: string,
  achievement: Omit<StudioAchievement, "id" | "eventId">
): DomainMutationInput | null {
  if (!canManageLegacyEvents(actor)) return null;
  const row: StudioAchievement = { ...achievement, id: newId("ach"), eventId };
  return {
    actor,
    guard: guard(true),
    mutate: (db) =>
      mapEvents(db, (events) =>
        events.map((e) => (e.id === eventId ? { ...e, achievements: [...e.achievements, row] } : e))
      ),
    audit: {
      action: `הישג נוסף: ${row.title}`,
      targetType: "achievement",
      targetId: row.id,
      severity: "info"
    },
    activity: { kind: "achievement", messageHe: row.title, relatedType: "achievement", relatedId: row.id }
  };
}

export function buildAddTeacherNoteMutation(
  actor: UserProfile,
  eventId: string,
  body: string
): DomainMutationInput | null {
  if (!canAddTeacherLegacyContent(actor) || !body.trim()) return null;
  const note: LegacyTeacherNote = {
    id: newId("ln"),
    userId: actor.id,
    userName: actor.name,
    body: body.trim(),
    createdAt: new Date().toISOString()
  };
  return {
    actor,
    guard: domainGuards.teacherOrManagement(actor),
    mutate: (db) =>
      mapEvents(db, (events) =>
        events.map((e) =>
          e.id === eventId ? { ...e, teacherNotes: [...(e.teacherNotes ?? []), note] } : e
        )
      ),
    audit: {
      action: "הערת מורה לאירוע",
      targetType: "event",
      targetId: eventId,
      severity: "info"
    }
  };
}

export function buildApproveSuggestionMutation(
  actor: UserProfile,
  eventId: string,
  suggestionId: string
): DomainMutationInput | null {
  if (!canManageLegacyEvents(actor)) return null;
  return {
    actor,
    guard: guard(true),
    mutate: (db) =>
      mapEvents(db, (events) =>
        events.map((e) => {
          if (e.id !== eventId) return e;
          const sug = e.pendingSuggestions?.find((s) => s.id === suggestionId);
          if (!sug) return e;
          const pending = e.pendingSuggestions?.filter((s) => s.id !== suggestionId) ?? [];
          if (sug.kind === "achievement") {
            const ach: StudioAchievement = {
              id: newId("ach"),
              title: sug.title,
              description: sug.description,
              place: sug.place,
              eventId,
              awardedAt: new Date().toISOString()
            };
            return { ...e, pendingSuggestions: pending, achievements: [...e.achievements, ach] };
          }
          return {
            ...e,
            pendingSuggestions: pending,
            memoryVideoUrl: e.memoryVideoUrl ?? `mock://legacy/${suggestionId}.mp4`,
            memoryVideoThumbnailUrl: e.memoryVideoThumbnailUrl ?? `mock://legacy/thumb/${suggestionId}.jpg`
          };
        })
      ),
    audit: {
      action: "הצעת מורה אושרה",
      targetType: "event",
      targetId: eventId,
      severity: "info"
    }
  };
}
