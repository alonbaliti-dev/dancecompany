"use client";

import { useMemo } from "react";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import type { LocalDatabase } from "@/lib/local-db/db-types";

/** Read-only slice of the central database — contexts should not duplicate this state. */
export function useDatabaseSlice<T>(selector: (db: LocalDatabase) => T): T {
  const { db } = useLocalDatabase();
  return useMemo(() => selector(db), [db, selector]);
}
