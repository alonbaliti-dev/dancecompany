"use client";

import { useState } from "react";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import { formatSuggestedSlot } from "@/lib/private-lessons/availability-logic";
import { priceLabelForDuration } from "@/lib/private-lessons/logic";
import type { PrivateLessonAvailabilityRequest } from "@/lib/types";
import { BottomSheet } from "../../BottomSheet";
import { GhostButton, PrimaryButton, cx } from "../../ui";

export function StudentSlotSelectionSheet({
  request,
  open,
  onClose,
  onPay
}: {
  request: PrivateLessonAvailabilityRequest;
  open: boolean;
  onClose: () => void;
  onPay: () => void;
}) {
  const pl = usePrivateLessons();
  const [selected, setSelected] = useState(request.selectedSlotId ?? "");
  const [otherNote, setOtherNote] = useState("");

  const slots = request.teacherSuggestedSlots ?? [];

  const confirmSlot = () => {
    if (!selected) return;
    pl.studentSelectSlot(request.id, selected);
    onPay();
  };

  const requestOther = () => {
    pl.studentRequestOtherTime(request.id, otherNote.trim() || undefined);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="בחירת מועד">
      <p className="mb-4 text-right text-sm text-white/48">
        {request.teacherName} הציע/ה את המועדים הבאים. בחרו מועד והמשיכו לתשלום מאובטח.
      </p>

      <div className="space-y-2">
        {slots.map((s) => {
          const active = selected === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(s.id)}
              className={cx(
                "w-full rounded-2xl border px-4 py-3 text-right transition active:scale-[0.99]",
                active ? "border-emerald-400/35 bg-emerald-500/[0.1]" : "border-white/[0.09] bg-white/[0.03]"
              )}
            >
              <p className="font-semibold text-white">{formatSuggestedSlot(s)}</p>
              {s.note ? <p className="mt-1 text-xs text-white/42">{s.note}</p> : null}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-right text-sm text-white/45">
        מחיר: {priceLabelForDuration(request.durationMinutes)}
      </p>

      <PrimaryButton className="mt-4" onClick={confirmSlot} disabled={!selected}>
        המשך לתשלום ושריון
      </PrimaryButton>

      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="text-right text-xs text-white/38">אף מועד לא מתאים?</p>
        <textarea
          className="mt-2 min-h-[3rem] w-full rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white"
          placeholder="מה כן מתאים לכם?"
          value={otherNote}
          onChange={(e) => setOtherNote(e.target.value)}
        />
        <GhostButton className="mt-2 w-full !text-sm" onClick={requestOther}>
          בקשה למועד אחר
        </GhostButton>
      </div>
    </BottomSheet>
  );
}
