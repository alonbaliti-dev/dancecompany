"use client";

import { useMemo } from "react";
import { Bell, ShieldAlert } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { useStudioData } from "@/context/StudioDataContext";
import { useProductData } from "@/context/ProductDataContext";
import { compareUpdatesForInbox } from "@/lib/flow-priority";
import { isDueToday, statusForStudent, taskVisibleToStudent, updateVisibleToStudent } from "@/lib/studio-task-logic";
import type { UserProfile } from "@/lib/types";

export function NotificationCenterSheet({
  open,
  onClose,
  user,
  onOpenPractice,
  onOpenStudio,
  onOpenAttendance
}: {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  onOpenPractice: () => void;
  onOpenStudio: () => void;
  onOpenAttendance: () => void;
}) {
  const { tasks, updates } = useStudioData();
  const { attendanceSessions, reports } = useProductData();
  const teacherTier = user.permissions.isTeacher || user.permissions.isManagement;

  const rows = useMemo(() => {
    const r: { id: string; title: string; body: string; tone: "urgent" | "info"; onPress?: () => void }[] = [];

    updates
      .filter((u) => updateVisibleToStudent(u, user))
      .filter((u) => !u.readByUserIds.includes(user.id))
      .sort((a, b) => compareUpdatesForInbox(a, b, user.id))
      .slice(0, 6)
      .forEach((u) => {
        r.push({
          id: u.id,
          title: u.title,
          body: u.priority === "urgent" ? "עדכון דחוף שלא נקרא" : "עדכון חדש",
          tone: u.priority === "urgent" ? "urgent" : "info",
          onPress: onOpenStudio
        });
      });

    tasks
      .filter((t) => taskVisibleToStudent(t, user))
      .filter((t) => statusForStudent(t, user.id) === "overdue")
      .slice(0, 4)
      .forEach((t) => {
        r.push({
          id: `t-${t.id}`,
          title: t.title,
          body: "משימה באיחור",
          tone: "urgent",
          onPress: onOpenPractice
        });
      });

    tasks
      .filter((t) => taskVisibleToStudent(t, user))
      .filter((t) => statusForStudent(t, user.id) !== "completed" && t.dueDate && isDueToday(t.dueDate))
      .slice(0, 3)
      .forEach((t) => {
        r.push({
          id: `td-${t.id}`,
          title: t.title,
          body: "יעד להיום",
          tone: "info",
          onPress: onOpenPractice
        });
      });

    if (teacherTier) {
      const open = attendanceSessions.filter((s) => s.teacherId === user.id && s.rows.some((x) => x.mark === null)).length;
      if (open)
        r.push({
          id: "att",
          title: "נוכחות פתוחה",
          body: `${open} שיעורים מחכים לסימון`,
          tone: "urgent",
          onPress: onOpenAttendance
        });
    }

    if (user.permissions.isManagement && reports.unreadImportantUpdates > 0) {
      r.push({
        id: "mgmt-up",
        title: "עדכונים חשובים שלא טופלו",
        body: `${reports.unreadImportantUpdates} פריטים בדוחות`,
        tone: "urgent",
        onPress: onOpenStudio
      });
    }

    return r;
  }, [user, tasks, updates, attendanceSessions, reports.unreadImportantUpdates, teacherTier, onOpenStudio, onOpenPractice, onOpenAttendance]);

  return (
    <BottomSheet open={open} title="התראות" onClose={onClose}>
      <div className="space-y-2.5 text-right">
        {rows.length === 0 ? <p className="py-10 text-center text-sm text-white/40">אין התראות פתוחות — נשמור על הקצב הטוב.</p> : null}
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => {
              row.onPress?.();
              onClose();
            }}
            className="flex w-full items-start gap-3 rounded-[16px] border border-white/[0.07] bg-white/[0.03] px-3 py-3.5 text-right transition hover:bg-white/[0.05]"
          >
            <span className="mt-0.5 shrink-0 text-white/30">
              {row.tone === "urgent" ? <ShieldAlert size={20} className="text-rose-200/85" /> : <Bell size={20} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{row.title}</p>
              <p className="mt-1 text-sm text-white/45">{row.body}</p>
            </div>
          </button>
        ))}
        <p className="pt-2 text-center text-[11px] text-white/32">התראות נשמרות במכשיר זה.</p>
      </div>
    </BottomSheet>
  );
}
