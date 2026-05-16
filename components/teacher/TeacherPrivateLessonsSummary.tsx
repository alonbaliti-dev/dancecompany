"use client";

import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import { teacherRequestGroup, TEACHER_REQUEST_GROUP_LABELS } from "@/lib/private-lessons/availability-logic";
import { Card, GhostButton, SectionEyebrow } from "../ui";

export function TeacherPrivateLessonsSummary({ onOpenShop }: { onOpenShop?: () => void }) {
  const pl = usePrivateLessons();

  const counts = useMemo(() => {
    const c = { awaiting_teacher: 0, awaiting_student: 0, reserved: 0, not_available: 0 };
    for (const r of pl.teacherAvailabilityRequests) {
      if (r.status === "cancelled") continue;
      const g = teacherRequestGroup(r.status);
      if (g) c[g] += 1;
    }
    return c;
  }, [pl.teacherAvailabilityRequests]);

  if (!pl.user.permissions.isTeacher && !pl.user.permissions.isManagement) return null;

  const total = counts.awaiting_teacher + counts.awaiting_student;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        {onOpenShop ? (
          <GhostButton className="!text-xs !text-sky-200/80" onClick={onOpenShop}>
            פתיחה
          </GhostButton>
        ) : null}
        <div className="min-w-0 flex-1 text-right">
          <SectionEyebrow tone="teacher">בקשות לשיעורים פרטיים</SectionEyebrow>
          <p className="mt-0.5 text-sm text-white/45">
            {counts.awaiting_teacher > 0
              ? `${counts.awaiting_teacher} ממתין לעדכון זמינות`
              : total > 0
                ? `${counts.awaiting_student} ממתין לתלמיד`
                : "אין בקשות פתוחות"}
          </p>
        </div>
      </div>

      {total === 0 && counts.reserved === 0 ? (
        <Card animated={false}>
          <p className="py-4 text-center text-sm text-white/40">אין בקשות פעילות כרגע.</p>
        </Card>
      ) : (
        <Card animated={false} tone="teacher" className="border-sky-400/15">
          <div className="space-y-2 text-right text-sm text-white/50">
            {counts.awaiting_teacher > 0 ? (
              <p>
                {TEACHER_REQUEST_GROUP_LABELS.awaiting_teacher}: <span className="font-semibold text-amber-200/85">{counts.awaiting_teacher}</span>
              </p>
            ) : null}
            {counts.awaiting_student > 0 ? (
              <p>
                {TEACHER_REQUEST_GROUP_LABELS.awaiting_student}: <span className="font-semibold text-sky-200/85">{counts.awaiting_student}</span>
              </p>
            ) : null}
            {counts.reserved > 0 ? (
              <p>
                {TEACHER_REQUEST_GROUP_LABELS.reserved}: <span className="font-semibold text-emerald-200/85">{counts.reserved}</span>
              </p>
            ) : null}
          </div>
          {onOpenShop ? (
            <button type="button" onClick={onOpenShop} className="mt-3 flex w-full items-center justify-end gap-1 text-xs text-sky-200/75">
              ניהול בקשות
              <ChevronLeft size={14} />
            </button>
          ) : null}
        </Card>
      )}
    </section>
  );
}
