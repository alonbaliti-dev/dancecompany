"use client";

import { useCallback } from "react";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { useAppState } from "@/lib/app/AppProvider";
import { runDomainMutation } from "@/lib/domains/core/mutate";
import type { DomainActor, DomainMutationInput, DomainMutationResult } from "@/lib/domains/core/types";

export type DomainMutationCall = (
  input: Omit<DomainMutationInput, "actor"> & { actor?: DomainActor }
) => DomainMutationResult;

/**
 * Central write path: permission guard → DB mutate → audit → activity → optional sync queue.
 * Applies synchronously against current `db` (no setState side-effect for the return value).
 */
export function useDomainMutation(): DomainMutationCall {
  const { setDb, db } = useLocalDatabase();
  const { currentUser: user } = useAppState();

  return useCallback(
    (input) => {
      if (!user) return { ok: false, reason: "נדרשת התחברות" };
      const actor = input.actor ?? user;
      const result = runDomainMutation(db, { ...input, actor });
      if (result.ok) {
        setDb(result.database);
      }
      return result;
    },
    [setDb, db, user]
  );
}
