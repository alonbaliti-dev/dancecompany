"use client";

import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { usePlatform } from "@/context/PlatformContext";
import { resolveModerationItem } from "@/lib/services/moderation-service";
import type { UserProfile } from "@/lib/types";
import { Header, screenClass } from "../ui";

export function ModerationQueueScreen({ user }: { user: UserProfile }) {
  const { db, setDb } = useLocalDatabase();
  const { activeStudioId } = usePlatform();
  const items = db.platformOs.moderationQueue.filter(
    (m) => m.studioId === (user.permissions.isSuperAdmin ? activeStudioId : user.studioId) && m.status === "open"
  );

  return (
    <div className={screenClass}>
      <Header title="תור ניהול תוכן" subtitle="דיווחים, הסרות והשהיות" />
      {items.length === 0 ? (
        <p className="text-right text-sm text-white/45">אין פריטים פתוחים בתור.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((m) => (
            <li key={m.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-right">
              <p className="text-sm text-white">{m.kind}</p>
              <p className="mt-1 text-xs text-white/45">{m.reason ?? "ללא סיבה"}</p>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  aria-label="סגירת דיווח"
                  onClick={() => setDb((prev) => resolveModerationItem(prev, m.id, user.id, "resolved"))}
                  className="rounded-lg border border-emerald-400/25 px-3 py-1 text-xs text-emerald-100/85"
                >
                  טופל
                </button>
                <button
                  type="button"
                  aria-label="דחיית דיווח"
                  onClick={() => setDb((prev) => resolveModerationItem(prev, m.id, user.id, "dismissed"))}
                  className="rounded-lg border border-white/12 px-3 py-1 text-xs text-white/60"
                >
                  דחייה
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
