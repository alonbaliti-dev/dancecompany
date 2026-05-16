/**
 * Synchronous client boot database — bundled in the JS chunk.
 * No fetch, no fs. Used as initial state before background /api/local-db/read sync.
 */
import type { LocalDatabase } from "./db-types";
import bundled from "../../public/fallback-bundle.json";

function cloneDb(db: LocalDatabase): LocalDatabase {
  if (typeof structuredClone === "function") return structuredClone(db);
  return JSON.parse(JSON.stringify(db)) as LocalDatabase;
}

const seed = bundled as LocalDatabase;

export function getSafeInitialDatabase(): LocalDatabase {
  return cloneDb(seed);
}
