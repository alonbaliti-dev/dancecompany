"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { useDomainMutation } from "@/lib/hooks/useDomainMutation";
import * as eventOps from "@/lib/domains/events/operations";
import type { EventOperatingMode } from "@/lib/platform-os/types";
import type { StudioEvent, UserProfile } from "@/lib/types";

type Ctx = {
  user: UserProfile;
  getMode: (event: StudioEvent) => EventOperatingMode;
  ensureMode: (event: StudioEvent) => void;
  toggleBackstage: (eventId: string, enabled: boolean) => boolean;
  checkInArrival: (eventId: string, studentId: string) => boolean;
  postLiveUpdate: (eventId: string, message: string) => boolean;
  toggleMemoryCollection: (eventId: string, open: boolean) => boolean;
  updateRunningOrder: (eventId: string, order: EventOperatingMode["runningOrder"]) => boolean;
};

const EventOperatingModeContext = createContext<Ctx | null>(null);

export function EventOperatingModeProvider({ user, children }: { user: UserProfile; children: ReactNode }) {
  const mutate = useDomainMutation();
  const { db } = useLocalDatabase();

  const getMode = useCallback(
    (event: StudioEvent) => eventOps.readEventMode(db, event, user.studioId),
    [db, user.studioId]
  );

  const ensureMode = useCallback(
    (event: StudioEvent) => {
      mutate(eventOps.buildEnsureEventModeMutation(user, event));
    },
    [mutate, user]
  );

  const toggleBackstage = useCallback(
    (eventId: string, enabled: boolean) => {
      const r = mutate(eventOps.buildToggleBackstageMutation(user, eventId, enabled));
      return r.ok;
    },
    [mutate, user]
  );

  const checkInArrival = useCallback(
    (eventId: string, studentId: string) => {
      const r = mutate(eventOps.buildCheckInArrivalMutation(user, eventId, studentId));
      return r.ok;
    },
    [mutate, user]
  );

  const postLiveUpdate = useCallback(
    (eventId: string, message: string) => {
      const r = mutate(eventOps.buildPostLiveUpdateMutation(user, eventId, message));
      return r.ok;
    },
    [mutate, user]
  );

  const toggleMemoryCollection = useCallback(
    (eventId: string, open: boolean) => {
      const r = mutate(eventOps.buildToggleMemoryCollectionMutation(user, eventId, open));
      return r.ok;
    },
    [mutate, user]
  );

  const updateRunningOrder = useCallback(
    (eventId: string, order: EventOperatingMode["runningOrder"]) => {
      const r = mutate(eventOps.buildUpdateRunningOrderMutation(user, eventId, order));
      return r.ok;
    },
    [mutate, user]
  );

  const value = useMemo(
    () => ({
      user,
      getMode,
      ensureMode,
      toggleBackstage,
      checkInArrival,
      postLiveUpdate,
      toggleMemoryCollection,
      updateRunningOrder
    }),
    [
      user,
      getMode,
      ensureMode,
      toggleBackstage,
      checkInArrival,
      postLiveUpdate,
      toggleMemoryCollection,
      updateRunningOrder
    ]
  );

  return <EventOperatingModeContext.Provider value={value}>{children}</EventOperatingModeContext.Provider>;
}

export function useEventOperatingMode(): Ctx {
  const ctx = useContext(EventOperatingModeContext);
  if (!ctx) throw new Error("useEventOperatingMode requires EventOperatingModeProvider");
  return ctx;
}
