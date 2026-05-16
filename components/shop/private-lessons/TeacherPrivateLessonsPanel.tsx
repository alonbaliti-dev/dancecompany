"use client";

import { useMemo, useState } from "react";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import {
  TEACHER_REQUEST_GROUP_LABELS,
  availabilityPaymentLabel,
  teacherRequestGroup,
  type TeacherRequestGroup
} from "@/lib/private-lessons/availability-logic";
import { bookingPaymentLabel, bookingStatusLabel, priceLabelForDuration } from "@/lib/private-lessons/logic";
import type { PrivateLessonAvailabilityRequest, PrivateLessonBookingStatus } from "@/lib/types";
import { Card, GhostButton, Header, SectionTitle, cx, screenClass } from "../../ui";
import { PrivateLessonRequestStatusCard } from "./PrivateLessonRequestStatusCard";
import { TeacherSuggestSlotsSheet } from "./TeacherSuggestSlotsSheet";

const GROUP_ORDER: TeacherRequestGroup[] = ["awaiting_teacher", "awaiting_student", "reserved", "not_available"];

export function TeacherPrivateLessonsPanel({ onBack }: { onBack: () => void }) {
  const pl = usePrivateLessons();
  const [suggestId, setSuggestId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PrivateLessonBookingStatus | "all">("all");

  const grouped = useMemo(() => {
    const map: Record<TeacherRequestGroup, PrivateLessonAvailabilityRequest[]> = {
      awaiting_teacher: [],
      awaiting_student: [],
      reserved: [],
      not_available: []
    };
    for (const r of pl.teacherAvailabilityRequests) {
      if (r.status === "cancelled") continue;
      const g = teacherRequestGroup(r.status);
      if (g) map[g].push(r);
    }
    return map;
  }, [pl.teacherAvailabilityRequests]);

  const suggestRequest = suggestId ? pl.getAvailabilityRequest(suggestId) : undefined;

  const legacyRows =
    statusFilter === "all" ? pl.teacherBookings : pl.teacherBookings.filter((b) => b.bookingStatus === statusFilter);

  return (
    <>
      <div className={screenClass}>
        <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
          ← חזרה לבוטיק
        </GhostButton>
        <Header title="בקשות לשיעורים פרטיים" subtitle="עדכון זמינות, מעקב תשלום ושריון." />

        {GROUP_ORDER.map((group) => {
          const rows = grouped[group];
          if (!rows.length) return null;
          return (
            <section key={group} className="space-y-3">
              <SectionTitle>{TEACHER_REQUEST_GROUP_LABELS[group]}</SectionTitle>
              {rows.map((r) => (
                <PrivateLessonRequestStatusCard key={r.id} request={r}>
                  {group === "awaiting_teacher" ? (
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      <GhostButton className="!text-[11px] !text-sky-200/85" onClick={() => setSuggestId(r.id)}>
                        עדכון זמינות
                      </GhostButton>
                      <GhostButton className="!text-[11px]" onClick={() => pl.teacherMarkUnavailable(r.id)}>
                        לא מתאפשר כרגע
                      </GhostButton>
                    </div>
                  ) : null}
                  {group === "awaiting_student" && r.paymentStatus === "not_started" ? (
                    <p className="mt-2 text-xs text-white/38">{availabilityPaymentLabel(r.paymentStatus)}</p>
                  ) : null}
                </PrivateLessonRequestStatusCard>
              ))}
            </section>
          );
        })}

        {pl.teacherAvailabilityRequests.filter((r) => r.status !== "cancelled").length === 0 ? (
          <Card animated={false}>
            <p className="py-8 text-center text-sm text-white/40">אין בקשות זמינות כרגע.</p>
          </Card>
        ) : null}

        <section className="mt-8 space-y-3">
          <SectionTitle>הזמנות קיימות (ישן)</SectionTitle>
          <div className="flex flex-wrap justify-end gap-2">
            {(["all", "requested", "confirmed", "completed", "cancelled"] as const).map((s) => (
              <GhostButton
                key={s}
                className={cx("!text-[11px]", statusFilter === s && "!border-white/20 !bg-white/10")}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "הכל" : bookingStatusLabel(s)}
              </GhostButton>
            ))}
          </div>
          {legacyRows.map((b) => (
            <Card key={b.id} animated={false} tone="teacher">
              <div className="text-right">
                <p className="font-semibold text-white">
                  {b.studentName} · {b.durationMinutes} דק׳ · {priceLabelForDuration(b.durationMinutes)}
                </p>
                <p className="mt-1 text-xs text-white/42">
                  {bookingPaymentLabel(b.paymentStatus)} · {bookingStatusLabel(b.bookingStatus)}
                </p>
              </div>
            </Card>
          ))}
        </section>
      </div>

      {suggestRequest ? (
        <TeacherSuggestSlotsSheet request={suggestRequest} open={Boolean(suggestId)} onClose={() => setSuggestId(null)} />
      ) : null}
    </>
  );
}
