"use client";

import { CheckCircle2 } from "lucide-react";
import type { PrivateLessonAvailabilityRequest } from "@/lib/types";
import { GhostButton, Header, PrimaryButton, screenClass } from "../../ui";
import { PrivateLessonRequestStatusCard } from "./PrivateLessonRequestStatusCard";

export function PrivateLessonRequestSent({
  request,
  onViewRequests,
  onDone
}: {
  request: PrivateLessonAvailabilityRequest;
  onViewRequests: () => void;
  onDone: () => void;
}) {
  return (
    <div className={screenClass}>
      <div className="flex flex-col items-center py-6 text-center">
        <CheckCircle2 className="text-emerald-300/90" size={48} />
        <Header
          title="הבקשה נשלחה"
          subtitle="המורה יעדכן את הזמינות המוקדמת. תקבלו התראה כשיהיו מועדים לבחירה."
        />
      </div>

      <PrivateLessonRequestStatusCard request={request} />

      <PrimaryButton onClick={onViewRequests}>השיעורים הפרטיים שלי</PrimaryButton>
      <GhostButton className="w-full" onClick={onDone}>
        חזרה לבוטיק
      </GhostButton>
    </div>
  );
}
