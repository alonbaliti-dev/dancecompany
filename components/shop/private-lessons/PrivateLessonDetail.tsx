"use client";

import { useState } from "react";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import { parentStudentOptions } from "@/lib/private-lessons/availability-logic";
import { priceLabelForDuration } from "@/lib/private-lessons/logic";
import type { PrivateLessonDurationMinutes, PrivateLessonProduct } from "@/lib/types";
import { GhostButton, Header, PrimaryButton, SectionEyebrow, cx, screenClass } from "../../ui";
import { WarmupPolicyCard } from "./WarmupPolicyCard";

export function PrivateLessonDetail({
  product,
  onBack,
  onRequestSubmitted
}: {
  product: PrivateLessonProduct;
  onBack: () => void;
  onRequestSubmitted: (requestId: string) => void;
}) {
  const pl = usePrivateLessons();
  const students = parentStudentOptions(pl.user);
  const [duration, setDuration] = useState<PrivateLessonDurationMinutes>(30);
  const [preferredTimeNotes, setPreferredTimeNotes] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [studentId, setStudentId] = useState(students[0]?.id ?? pl.user.id);
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    setSubmitting(true);
    const req = pl.createAvailabilityRequest({
      productId: product.id,
      durationMinutes: duration,
      preferredTimeNotes: preferredTimeNotes.trim() || undefined,
      studentNote: studentNote.trim() || undefined,
      studentId: students.length ? studentId : undefined
    });
    setSubmitting(false);
    if (req) onRequestSubmitted(req.id);
  };

  return (
    <div className={screenClass}>
      <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
        ← חזרה לבוטיק
      </GhostButton>

      <Header title={product.teacherName} subtitle="בקשת שיעור פרטי · תיאום לפני תשלום" />

      <div
        className="overflow-hidden rounded-[26px] border border-white/[0.1] px-6 py-6 text-right"
        style={{
          background:
            "linear-gradient(160deg, rgba(56,189,248,0.14) 0%, rgba(16,185,129,0.1) 40%, rgba(0,0,0,0.5) 100%)"
        }}
      >
        <SectionEyebrow>סגנונות</SectionEyebrow>
        <p className="mt-2 text-sm text-white/55">{product.teacherStyles.join(" · ")}</p>
        <p className="mt-4 text-sm leading-relaxed text-white/48">{product.description}</p>
      </div>

      {students.length > 1 ? (
        <div className="space-y-2">
          <p className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">עבור מי השיעור</p>
          <select
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">משך השיעור</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {([30, 45] as const).map((minutes) => {
            const active = duration === minutes;
            return (
              <button
                key={minutes}
                type="button"
                onClick={() => setDuration(minutes)}
                className={cx(
                  "rounded-[20px] border px-4 py-4 text-right transition active:scale-[0.99]",
                  active ? "border-emerald-400/35 bg-emerald-500/[0.1]" : "border-white/[0.09] bg-white/[0.03]"
                )}
              >
                <p className="text-lg font-semibold text-white">{minutes} דק׳</p>
                <p className="mt-1 text-sm tabular-nums text-white/50">{priceLabelForDuration(minutes)}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">
          מועדים מועדפים (אופציונלי)
        </p>
        <textarea
          className="min-h-[4rem] w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white"
          placeholder="לדוגמה: אחר הצהריים בימי ג׳–ה׳"
          value={preferredTimeNotes}
          onChange={(e) => setPreferredTimeNotes(e.target.value)}
        />
        <textarea
          className="min-h-[4rem] w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white"
          placeholder="הערה למורה (אופציונלי)"
          value={studentNote}
          onChange={(e) => setStudentNote(e.target.value)}
        />
        <p className="text-right text-[11px] leading-relaxed text-white/35">
          התשלום יתבצע רק לאחר שהמורה יציע מועד ותאשרו אותו — תהליך שקוף ומקצועי.
        </p>
      </div>

      <WarmupPolicyCard policy={product.warmupPolicy} />

      {pl.canBook ? (
        <PrimaryButton onClick={submit} disabled={submitting}>
          {submitting ? "שולחים…" : "שליחת בקשה למורה"}
        </PrimaryButton>
      ) : (
        <p className="text-center text-sm text-white/40">הזמנת שיעורים פרטיים זמינה לתלמידים והורים בלבד.</p>
      )}
    </div>
  );
}
