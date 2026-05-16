"use client";

import { ClipboardList, Users } from "lucide-react";
import { useProductData } from "@/context/ProductDataContext";
import type { UserProfile } from "@/lib/types";
import { SchedulePeek } from "../ScheduleScreen";
import { Header, HubLinkRow, HubTile, screenClass } from "../ui";

export function LessonsHubScreen({
  user,
  onOpenFullSchedule,
  onOpenAttendance,
  onOpenTeacher
}: {
  user: UserProfile;
  onOpenFullSchedule: () => void;
  onOpenAttendance?: () => void;
  onOpenTeacher?: () => void;
}) {
  const { attendanceSessions } = useProductData();
  const teacher = user.permissions.isTeacher;
  const mgmt = user.permissions.isManagement;
  const openAttendance = teacher
    ? attendanceSessions.filter((s) => s.teacherId === user.id && s.rows.some((r) => r.mark === null)).length
    : 0;

  return (
    <div className={screenClass}>
      <Header
        title="שיעורים"
        subtitle={mgmt ? "לוח זמנים וכיתות" : teacher ? "השיעורים שלך היום" : "השיעורים והחזרות שלך"}
      />

      {teacher || mgmt ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {onOpenAttendance ? (
            <HubTile
              icon={Users}
              title="נוכחות"
              subtitle={openAttendance > 0 ? `${openAttendance} לסימון` : "הכול סגור"}
              badge={openAttendance || undefined}
              onClick={onOpenAttendance}
              tone="teacher"
            />
          ) : null}
          {onOpenTeacher ? (
            <HubTile icon={ClipboardList} title="מרכז מורה" subtitle="משימות וכיתה" onClick={onOpenTeacher} tone="teacher" />
          ) : null}
        </div>
      ) : null}

      <SchedulePeek onOpenWeek={onOpenFullSchedule} />

      <HubLinkRow icon={ClipboardList} title="לוח שבועי מלא" subtitle="כל השיעורים והחזרות" onClick={onOpenFullSchedule} />
    </div>
  );
}
