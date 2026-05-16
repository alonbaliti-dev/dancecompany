"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import type { PrivateLessonAvailabilityRequest } from "@/lib/types";
import { BottomSheet } from "../../BottomSheet";
import { GhostButton, PrimaryButton } from "../../ui";

type SlotDraft = { date: string; startTime: string; endTime: string };

const emptySlot = (): SlotDraft => ({ date: "", startTime: "", endTime: "" });

export function TeacherSuggestSlotsSheet({
  request,
  open,
  onClose
}: {
  request: PrivateLessonAvailabilityRequest;
  open: boolean;
  onClose: () => void;
}) {
  const pl = usePrivateLessons();
  const [slots, setSlots] = useState<SlotDraft[]>([emptySlot(), emptySlot()]);
  const [note, setNote] = useState("");

  const valid = slots.filter((s) => s.date && s.startTime && s.endTime);

  const submit = () => {
    if (!valid.length) return;
    pl.teacherSuggestSlots(request.id, valid, note.trim() || undefined);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="עדכון זמינות">
      <p className="mb-4 text-right text-sm text-white/48">
        {request.studentName} · {request.durationMinutes} דק׳
        {request.preferredTimeNotes ? ` · ${request.preferredTimeNotes}` : ""}
      </p>

      <div className="space-y-4">
        {slots.map((slot, i) => (
          <div key={i} className="space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-white/35 disabled:opacity-30"
                onClick={() => setSlots((prev) => prev.filter((_, j) => j !== i))}
                disabled={slots.length <= 1}
              >
                <Trash2 size={16} />
              </button>
              <span className="text-xs font-medium text-white/40">מועד {i + 1}</span>
            </div>
            <input
              type="date"
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-white"
              value={slot.date}
              onChange={(e) =>
                setSlots((prev) => prev.map((s, j) => (j === i ? { ...s, date: e.target.value } : s)))
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-white"
                value={slot.startTime}
                onChange={(e) =>
                  setSlots((prev) => prev.map((s, j) => (j === i ? { ...s, startTime: e.target.value } : s)))
                }
              />
              <input
                type="time"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-white"
                value={slot.endTime}
                onChange={(e) =>
                  setSlots((prev) => prev.map((s, j) => (j === i ? { ...s, endTime: e.target.value } : s)))
                }
              />
            </div>
          </div>
        ))}
      </div>

      <GhostButton className="mt-3 w-full !text-sm" onClick={() => setSlots((prev) => [...prev, emptySlot()])}>
        <span className="inline-flex items-center gap-1">
          <Plus size={14} />
          הוספת מועד
        </span>
      </GhostButton>

      <textarea
        className="mt-4 min-h-[3.5rem] w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white"
        placeholder="הערה לתלמיד (אופציונלי)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <PrimaryButton className="mt-5" onClick={submit} disabled={!valid.length}>
        שליחת מועדים לתלמיד
      </PrimaryButton>
    </BottomSheet>
  );
}
