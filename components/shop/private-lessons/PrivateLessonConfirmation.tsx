"use client";

import { ShieldCheck } from "lucide-react";
import { bookingPaymentLabel, bookingStatusLabel, priceLabelForDuration } from "@/lib/private-lessons/logic";
import type { PrivateLessonBooking } from "@/lib/types";
import { GhostButton, Header, PrimaryButton, screenClass } from "../../ui";
import { WarmupPolicyCard } from "./WarmupPolicyCard";

export function PrivateLessonConfirmation({
  booking,
  warmupPolicy,
  onDone
}: {
  booking: PrivateLessonBooking;
  warmupPolicy?: string;
  onDone: () => void;
}) {
  return (
    <div className={screenClass}>
      <div className="overflow-hidden rounded-[26px] border border-emerald-400/25 bg-gradient-to-b from-emerald-500/12 to-black/40 px-6 py-8 text-right">
        <div className="flex items-center justify-end gap-2 text-emerald-200">
          <ShieldCheck size={28} />
          <p className="text-lg font-semibold text-white">הבקשה נשלחה</p>
        </div>
        <p className="mt-3 text-sm text-white/50">
          מורה: {booking.teacherName} · {booking.durationMinutes} דק׳ · {priceLabelForDuration(booking.durationMinutes)}
        </p>
        <p className="mt-2 text-sm text-white/45">
          תשלום: {bookingPaymentLabel(booking.paymentStatus)} · סטטוס: {bookingStatusLabel(booking.bookingStatus)}
        </p>
        {booking.requestedDate ? (
          <p className="mt-2 text-sm text-white/45">
            מועד מבוקש: {booking.requestedDate}
            {booking.requestedTime ? ` · ${booking.requestedTime}` : ""}
          </p>
        ) : null}
        {booking.notes ? <p className="mt-2 text-xs text-white/38">הערה: {booking.notes}</p> : null}
        <p className="mt-3 text-xs text-white/35">בקשה #{booking.id.slice(-8)}</p>
      </div>

      <WarmupPolicyCard policy={warmupPolicy} />

      <div className="rounded-[20px] border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3 text-right">
        <p className="text-sm font-semibold text-amber-100/90">תזכורת חימום</p>
        <p className="mt-1 text-xs leading-relaxed text-white/50">
          מומלץ להגיע מחוממים. אם לא — המורה יוביל חימום בתוך זמן השיעור שנרכש.
        </p>
      </div>

      <PrimaryButton onClick={onDone}>חזרה לבוטיק</PrimaryButton>
      <GhostButton className="w-full !text-white/50" onClick={onDone}>
        סגירה
      </GhostButton>
    </div>
  );
}
