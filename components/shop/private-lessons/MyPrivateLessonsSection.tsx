"use client";

import { useState } from "react";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import type { PrivateLessonAvailabilityRequest } from "@/lib/types";
import { GhostButton, Header, SectionTitle, screenClass } from "../../ui";
import { PrivateLessonRequestCheckoutFlow } from "./PrivateLessonRequestCheckoutFlow";
import { PrivateLessonRequestStatusCard } from "./PrivateLessonRequestStatusCard";
import { PrivateLessonConfirmation } from "./PrivateLessonConfirmation";
import { StudentSlotSelectionSheet } from "./StudentSlotSelectionSheet";

export function MyPrivateLessonsSection({ onBack }: { onBack: () => void }) {
  const pl = usePrivateLessons();
  const [slotSheetId, setSlotSheetId] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const slotRequest = slotSheetId ? pl.getAvailabilityRequest(slotSheetId) : undefined;
  const checkoutRequest = checkoutId ? pl.getAvailabilityRequest(checkoutId) : undefined;
  const confirmedRequest = confirmedId ? pl.getAvailabilityRequest(confirmedId) : undefined;
  const confirmedBooking = confirmedRequest?.bookingId
    ? pl.bookings.find((b) => b.id === confirmedRequest.bookingId)
    : undefined;

  if (confirmedBooking && confirmedRequest) {
    const warmup = pl.getProduct(confirmedBooking.productId)?.warmupPolicy;
    return (
      <PrivateLessonConfirmation
        booking={confirmedBooking}
        warmupPolicy={warmup}
        onDone={() => {
          setConfirmedId(null);
          setCheckoutId(null);
        }}
      />
    );
  }

  if (checkoutRequest) {
    return (
      <PrivateLessonRequestCheckoutFlow
        request={checkoutRequest}
        onBack={() => setCheckoutId(null)}
        onConfirmed={(r) => {
          setCheckoutId(null);
          setConfirmedId(r.id);
        }}
      />
    );
  }

  const openActions = (r: PrivateLessonAvailabilityRequest) => {
    if (r.status === "teacher_suggested_time") {
      return (
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <GhostButton className="!text-[11px]" onClick={() => setSlotSheetId(r.id)}>
            בחירת מועד
          </GhostButton>
          <GhostButton className="!text-[11px]" onClick={() => pl.cancelAvailabilityRequest(r.id)}>
            ביטול
          </GhostButton>
        </div>
      );
    }
    if (r.status === "ready_for_payment") {
      return (
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <GhostButton className="!text-[11px] !text-emerald-200/85" onClick={() => setCheckoutId(r.id)}>
            תשלום ושריון
          </GhostButton>
        </div>
      );
    }
    if (r.status === "waiting_for_teacher" || r.status === "student_requested_other_time") {
      return (
        <GhostButton className="mt-3 !text-[11px]" onClick={() => pl.cancelAvailabilityRequest(r.id)}>
          ביטול בקשה
        </GhostButton>
      );
    }
    return null;
  };

  return (
    <>
      <div className={screenClass}>
        <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
          ← חזרה
        </GhostButton>
        <Header title="השיעורים הפרטיים שלי" subtitle="סטטוס בקשות, מועדים מוצעים ותשלום." />

        {pl.myAvailabilityRequests.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/40">עדיין אין בקשות לשיעורים פרטיים.</p>
        ) : (
          <div className="space-y-3">
            <SectionTitle>בקשות פעילות</SectionTitle>
            {pl.myAvailabilityRequests.map((r) => (
              <PrivateLessonRequestStatusCard key={r.id} request={r}>
                {openActions(r)}
              </PrivateLessonRequestStatusCard>
            ))}
          </div>
        )}
      </div>

      {slotRequest ? (
        <StudentSlotSelectionSheet
          request={slotRequest}
          open={Boolean(slotSheetId)}
          onClose={() => setSlotSheetId(null)}
          onPay={() => {
            setSlotSheetId(null);
            setCheckoutId(slotRequest.id);
          }}
        />
      ) : null}
    </>
  );
}
