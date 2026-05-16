"use client";

import { useEffect, useState } from "react";
import { useEventOperatingMode } from "@/context/EventOperatingModeContext";
import { useLegacyEvents } from "@/context/LegacyEventsContext";
import type { UserProfile } from "@/lib/types";
import { isManagement, isTeacherTier } from "@/lib/permissions";
import { Header, screenClass, PrimaryButton } from "../ui";

export function EventCommandCenterScreen({ user }: { user: UserProfile }) {
  const { events } = useLegacyEvents();
  const { getMode, ensureMode, toggleBackstage, postLiveUpdate: postLive } = useEventOperatingMode();
  const [eventId, setEventId] = useState(
    events.find((e) => e.status === "current" || e.type === "performance")?.id ?? events[0]?.id ?? ""
  );
  const [note, setNote] = useState("");
  const event = events.find((e) => e.id === eventId);

  useEffect(() => {
    if (event) ensureMode(event);
  }, [event, ensureMode]);

  const mode = event ? getMode(event) : null;

  if (!event || !mode) {
    return (
      <div className={screenClass}>
        <Header title="מרכז מופע" subtitle="מצב תפעול לאירועים ומופע שנתי" />
        <p className="text-right text-sm text-white/45">אין אירוע פעיל לתפעול.</p>
      </div>
    );
  }

  const mgmt = isManagement(user);
  const teacher = isTeacherTier(user);

  return (
    <div className={screenClass}>
      <Header title="מרכז מופע" subtitle={event.title} />
      <select
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-right text-sm text-white"
        aria-label="בחירת אירוע"
      >
        {events.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title}
          </option>
        ))}
      </select>

      {(mgmt || teacher) && (
        <label className="flex items-center justify-end gap-2 text-sm text-white/70">
          <span>מצב מאחורי הקלעים</span>
          <input
            type="checkbox"
            checked={mode.backstageMode}
            onChange={(e) => toggleBackstage(eventId, e.target.checked)}
          />
        </label>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-right">
        <p className="text-xs text-white/40">הגעה</p>
        <p className="mt-1 text-2xl font-semibold text-white">
          {mode.arrivalTracking.filter((a) => a.arrivedAt).length} / {mode.arrivalTracking.length}
        </p>
      </div>

      {mgmt && (
        <>
          <p className="text-right text-xs font-medium text-white/45">רשימת ציוד</p>
          <ul className="text-right text-sm text-white/60">
            {mode.equipmentChecklist.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </>
      )}

      <div>
        <p className="text-right text-xs text-white/45">עדכונים חיים</p>
        <ul className="mt-2 space-y-2">
          {mode.liveUpdates.map((u) => (
            <li key={u.id} className="rounded-xl border border-white/8 px-3 py-2 text-right text-sm text-white/70">
              {u.message}
              <span className="block text-[10px] text-white/35">{u.createdByName}</span>
            </li>
          ))}
        </ul>
        {(mgmt || teacher) && (
          <>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="הודעה מהירה לצוות/הורים"
              className="mt-2 w-full rounded-xl border border-white/12 bg-black/30 p-3 text-right text-sm text-white"
              rows={2}
            />
            <PrimaryButton
              className="mt-2 w-full"
              onClick={() => {
                if (!note.trim()) return;
                if (postLive(eventId, note.trim())) setNote("");
              }}
            >
              פרסום עדכון
            </PrimaryButton>
          </>
        )}
      </div>

      {!mgmt && !teacher && (
        <p className="text-right text-sm text-white/55">
          הגעה: לפי הודעת הסטודיו · מה להביא: תלבושת, נעליים, מים
        </p>
      )}
    </div>
  );
}
