"use client";

import {
  availabilityPaymentLabel,
  availabilityRequestStatusLabel,
  formatSuggestedSlot,
  selectedSlotForRequest
} from "@/lib/private-lessons/availability-logic";
import type { PrivateLessonAvailabilityRequest } from "@/lib/types";
import { Card, SectionEyebrow, cx } from "../../ui";

const statusTone: Record<string, string> = {
  waiting_for_teacher: "text-amber-200/85",
  teacher_suggested_time: "text-sky-200/85",
  student_requested_other_time: "text-amber-200/85",
  ready_for_payment: "text-emerald-200/90",
  reserved: "text-emerald-200/90",
  not_available: "text-white/45",
  cancelled: "text-white/35"
};

export function PrivateLessonRequestStatusCard({
  request,
  className,
  children
}: {
  request: PrivateLessonAvailabilityRequest;
  className?: string;
  children?: React.ReactNode;
}) {
  const slot = selectedSlotForRequest(request);

  return (
    <Card animated={false} tone="teacher" className={cx("border-white/[0.09]", className)}>
      <div className="text-right">
        <SectionEyebrow tone="teacher">שיעור פרטי</SectionEyebrow>
        <p className="mt-1 font-semibold text-white">
          {request.teacherName} · {request.durationMinutes} דק׳
        </p>
        <p className="mt-1 text-sm text-white/45">
          {request.studentName}
          {request.requestedByName !== request.studentName ? ` · מבקש/ת: ${request.requestedByName}` : ""}
        </p>
        <p className={cx("mt-2 text-sm font-medium", statusTone[request.status] ?? "text-white/55")}>
          {availabilityRequestStatusLabel(request.status)}
        </p>
        <p className="mt-1 text-xs text-white/38">{availabilityPaymentLabel(request.paymentStatus)}</p>
        {request.preferredTimeNotes ? (
          <p className="mt-2 text-xs text-white/42">מועד מועדף: {request.preferredTimeNotes}</p>
        ) : null}
        {request.studentNote ? <p className="mt-1 text-xs text-white/42">הערה: {request.studentNote}</p> : null}
        {request.teacherSuggestedSlots && request.teacherSuggestedSlots.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {request.teacherSuggestedSlots.map((s) => (
              <li
                key={s.id}
                className={cx(
                  "rounded-xl border px-3 py-2 text-xs",
                  s.id === request.selectedSlotId
                    ? "border-emerald-400/30 bg-emerald-500/[0.08] text-emerald-100/90"
                    : "border-white/[0.08] bg-white/[0.03] text-white/50"
                )}
              >
                {formatSuggestedSlot(s)}
                {s.note ? <span className="block text-white/35">{s.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {slot && request.status === "reserved" ? (
          <p className="mt-2 text-xs text-emerald-200/75">מועד שוריין: {formatSuggestedSlot(slot)}</p>
        ) : null}
        {children}
      </div>
    </Card>
  );
}
