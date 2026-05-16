"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { deriveEventStatus } from "@/lib/legacy-events-logic";
import {
  canAddTeacherLegacyContent,
  canManageLegacyEvents,
  filterLegacyEventsForUser
} from "@/lib/legacy-events-permissions";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { useDomainMutation } from "@/lib/hooks/useDomainMutation";
import * as legacyOps from "@/lib/domains/legacy-events/operations";
import type {
  LegacyEventFormPayload,
  LegacyTeacherSuggestion,
  StudioAchievement,
  StudioEvent,
  UserProfile
} from "@/lib/types";

type Ctx = {
  user: UserProfile;
  events: StudioEvent[];
  visibleEvents: StudioEvent[];
  canManage: boolean;
  canTeach: boolean;
  getEvent: (id: string) => StudioEvent | undefined;
  createEvent: (payload: LegacyEventFormPayload) => string;
  updateEvent: (id: string, payload: Partial<LegacyEventFormPayload>) => void;
  deleteEvent: (id: string) => void;
  addAchievement: (eventId: string, achievement: Omit<StudioAchievement, "id" | "eventId">) => void;
  removeAchievement: (eventId: string, achievementId: string) => void;
  addTeacherNote: (eventId: string, body: string) => void;
  addTeacherSuggestion: (eventId: string, suggestion: Omit<LegacyTeacherSuggestion, "id" | "userId" | "userName" | "createdAt">) => void;
  approveSuggestion: (eventId: string, suggestionId: string) => void;
  dismissSuggestion: (eventId: string, suggestionId: string) => void;
  allAchievements: StudioAchievement[];
};

const LegacyEventsContext = createContext<Ctx | null>(null);

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function withDerivedStatus(e: StudioEvent): StudioEvent {
  return { ...e, status: deriveEventStatus(e.date, e.endDate) };
}

export function LegacyEventsProvider({ user, children }: { user: UserProfile; children: ReactNode }) {
  const { db } = useLocalDatabase();
  const mutate = useDomainMutation();
  const events = db.events;

  const visibleEvents = useMemo(
    () => filterLegacyEventsForUser(user, events).map(withDerivedStatus),
    [events, user]
  );

  const allAchievements = useMemo(
    () => visibleEvents.flatMap((e) => e.achievements),
    [visibleEvents]
  );

  const getEvent = useCallback(
    (id: string) => {
      const e = events.find((x) => x.id === id);
      return e ? withDerivedStatus(e) : undefined;
    },
    [events]
  );

  const createEvent = useCallback(
    (payload: LegacyEventFormPayload) => {
      const input = legacyOps.buildCreateLegacyEventMutation(user, payload);
      if (!input) return "";
      const result = mutate({ ...input, actor: user });
      if (!result.ok) return "";
      return result.database.events[0]?.id ?? "";
    },
    [user, mutate]
  );

  const updateEvent = useCallback(
    (id: string, payload: Partial<LegacyEventFormPayload>) => {
      const input = legacyOps.buildUpdateLegacyEventMutation(user, id, payload);
      if (input) mutate({ ...input, actor: user });
    },
    [user, mutate]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      const input = legacyOps.buildDeleteLegacyEventMutation(user, id);
      if (input) mutate({ ...input, actor: user });
    },
    [user, mutate]
  );

  const addAchievement = useCallback(
    (eventId: string, achievement: Omit<StudioAchievement, "id" | "eventId">) => {
      const input = legacyOps.buildAddAchievementMutation(user, eventId, achievement);
      if (input) mutate({ ...input, actor: user });
    },
    [user, mutate]
  );

  const removeAchievement = useCallback(
    (eventId: string, achievementId: string) => {
      if (!canManageLegacyEvents(user)) return;
      mutate({
        actor: user,
        guard: () => ({ allowed: true }),
        mutate: (d) => ({
          ...d,
          events: d.events.map((e) =>
            e.id === eventId
              ? { ...e, achievements: e.achievements.filter((a) => a.id !== achievementId) }
              : e
          )
        }),
        audit: {
          action: "הישג הוסר",
          targetType: "achievement",
          targetId: achievementId,
          severity: "warning"
        }
      });
    },
    [user, mutate]
  );

  const addTeacherNote = useCallback(
    (eventId: string, body: string) => {
      const input = legacyOps.buildAddTeacherNoteMutation(user, eventId, body);
      if (input) mutate({ ...input, actor: user });
    },
    [user, mutate]
  );

  const addTeacherSuggestion = useCallback(
    (eventId: string, suggestion: Omit<LegacyTeacherSuggestion, "id" | "userId" | "userName" | "createdAt">) => {
      if (!canAddTeacherLegacyContent(user)) return;
      const row: LegacyTeacherSuggestion = {
        ...suggestion,
        id: newId("sug"),
        userId: user.id,
        userName: user.name,
        createdAt: new Date().toISOString()
      };
      mutate({
        actor: user,
        guard: () => ({ allowed: true }),
        mutate: (d) => ({
          ...d,
          events: d.events.map((e) =>
            e.id === eventId ? { ...e, pendingSuggestions: [...(e.pendingSuggestions ?? []), row] } : e
          )
        }),
        audit: {
          action: "הצעת מורה לאירוע",
          targetType: "event",
          targetId: eventId,
          severity: "info"
        }
      });
    },
    [user, mutate]
  );

  const approveSuggestion = useCallback(
    (eventId: string, suggestionId: string) => {
      const input = legacyOps.buildApproveSuggestionMutation(user, eventId, suggestionId);
      if (input) mutate({ ...input, actor: user });
    },
    [user, mutate]
  );

  const dismissSuggestion = useCallback(
    (eventId: string, suggestionId: string) => {
      if (!canManageLegacyEvents(user)) return;
      mutate({
        actor: user,
        guard: () => ({ allowed: true }),
        mutate: (d) => ({
          ...d,
          events: d.events.map((e) =>
            e.id === eventId
              ? { ...e, pendingSuggestions: e.pendingSuggestions?.filter((s) => s.id !== suggestionId) }
              : e
          )
        }),
        audit: {
          action: "הצעת מורה נדחתה",
          targetType: "event",
          targetId: eventId,
          severity: "info"
        }
      });
    },
    [user, mutate]
  );

  const value = useMemo(
    () => ({
      user,
      events,
      visibleEvents,
      canManage: canManageLegacyEvents(user),
      canTeach: canAddTeacherLegacyContent(user),
      getEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      addAchievement,
      removeAchievement,
      addTeacherNote,
      addTeacherSuggestion,
      approveSuggestion,
      dismissSuggestion,
      allAchievements
    }),
    [
      user,
      events,
      visibleEvents,
      allAchievements,
      getEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      addAchievement,
      removeAchievement,
      addTeacherNote,
      addTeacherSuggestion,
      approveSuggestion,
      dismissSuggestion
    ]
  );

  return <LegacyEventsContext.Provider value={value}>{children}</LegacyEventsContext.Provider>;
}

export function useLegacyEvents(): Ctx {
  const x = useContext(LegacyEventsContext);
  if (!x) throw new Error("useLegacyEvents requires LegacyEventsProvider");
  return x;
}
