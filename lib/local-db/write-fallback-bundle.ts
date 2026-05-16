import fs from "fs";
import path from "path";
import type { LocalDatabase } from "./db-types";

/** Write bundled snapshot for client offline fallback (`public/fallback-bundle.json`). */
export function writePublicFallbackBundle(db: LocalDatabase): void {
  const out = path.join(process.cwd(), "public", "fallback-bundle.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(db)}\n`, "utf8");
}
