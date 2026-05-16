"use client";

import { useState } from "react";
import { Calendar, ClipboardList, Flag, MessageCircle, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useAttendanceIntelligence } from "@/context/AttendanceIntelligenceContext";
import { useToast } from "@/context/ToastContext";
import { riskLabel, statusLabelHe, trendLabel } from "@/lib/attendance-intelligence/logic";
import { formatHeDate } from "@/lib/attendance-intelligence/school-year";
import type { StudentAttendanceSummary } from "@/lib/types";
import { GhostButton, PrimaryButton, RingStat, SectionEyebrow } from "../ui";

export function StudentAttendanceDetail({
  summary,
  onClose,
  readOnly = false,
  onOpenTasks
}: {
  summary: StudentAttendanceSummary;
  onClose: () => void;
  readOnly?: boolean;
  onOpenTasks?: () => void;
}) {
  const { getStudentRecords, flagForReview, sendParentUpdate } = useAttendanceIntelligence();
  const { showToast } = useToast();
  const [notifyBusy, setNotifyBusy] = useState(false);
  const records = getStudentRecords(summary.studentId);

  function handleParentNotify() {
    setNotifyBusy(true);
    const result = sendParentUpdate(summary.studentId);
    setNotifyBusy(false);
    if (result.ok === false) {
      showToast(result.reason, "error");
      return;
    }
    showToast(`עדכון נשלח ל־${result.recipientCount} הורים`, "success");
  }
  const absences = records.filter((r) => r.status === "absent" || r.status === "late");
  const TrendIcon = summary.trend === "improving" ? TrendingUp : summary.trend === "declining" ? TrendingDown : Minus;

  return (
    <div className="space-y-5">
      <GhostButton onClick={onClose} className="!mb-0 !px-0 !py-1 !text-sm">
        ← חזרה לרשימה
      </GhostButton>

      <div className="rounded-[24px] border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-transparent p-5 text-right">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">פרופיל נוכחות</p>
        <h2 className="mt-2 text-xl font-semibold text-white">{summary.studentName}</h2>
        <p className="mt-1 text-sm text-white/45">
          {summary.groupName} · {summary.teacherName}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-end gap-6">
          <RingStat
            value={summary.attendancePct}
            label="מסוף שנה"
            size={88}
            tone={summary.riskLevel === "at_risk" ? "danger" : summary.riskLevel === "watch" ? "warning" : "success"}
          />
          <div className="min-w-[8rem] flex-1 space-y-2">
            <div className="flex justify-between text-xs text-white/45">
              <span>{riskLabel(summary.riskLevel)}</span>
              <span>סטטוס</span>
            </div>
            <div className="flex justify-between text-xs text-white/45">
              <span className="inline-flex items-center gap-1">
                <TrendIcon size={14} />
                {trendLabel(summary.trend)}
              </span>
              <span>מגמה</span>
            </div>
            <div className="flex justify-between text-xs text-white/45">
              <span className="tabular-nums">{summary.currentStreak}</span>
              <span>חיסורים רצופים</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-right">
        {[
          { label: "נוכחות", value: summary.presentCount },
          { label: "איחורים", value: summary.lateCount },
          { label: "חיסורים", value: summary.absentCount },
          { label: "מוצדקים", value: summary.excusedCount }
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-3">
            <p className="text-lg font-semibold tabular-nums text-white">{c.value}</p>
            <p className="text-[11px] text-white/40">{c.label}</p>
          </div>
        ))}
      </div>

      <section>
        <SectionEyebrow>4 שבועות אחרונים</SectionEyebrow>
        <div className="mt-2 rounded-2xl border border-white/[0.08] px-4 py-3 text-right">
          <p className="text-sm text-white/55">
            <span className="font-semibold text-white">{summary.absencesLast4Weeks}</span> חיסורים · סה״כ {summary.totalScheduled}{" "}
            שיעורים מתחילת השנה
          </p>
          {summary.lastAttendedDate ? (
            <p className="mt-1 text-xs text-white/38">נוכחות אחרונה: {formatHeDate(summary.lastAttendedDate)}</p>
          ) : null}
        </div>
      </section>

      <section>
        <SectionEyebrow>ציר חיסורים והערות</SectionEyebrow>
        <div className="mt-2 space-y-2">
          {absences.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/40">אין חיסורים מתועדים השנה.</p>
          ) : (
            absences.slice(0, 12).map((r) => (
              <div key={r.id} className="flex gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-right">
                <Calendar className="mt-0.5 shrink-0 text-white/30" size={16} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    {formatHeDate(r.classDate)} · {r.classTitle}
                  </p>
                  <p className="mt-0.5 text-xs text-rose-200/75">{statusLabelHe(r.status)}</p>
                  {r.note ? <p className="mt-1 text-xs text-white/40">{r.note}</p> : null}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {!readOnly ? (
        <section className="space-y-2">
          <SectionEyebrow>פעולות מהירות</SectionEyebrow>
          <PrimaryButton className="!text-sm" disabled={notifyBusy} onClick={handleParentNotify}>
            <span className="inline-flex items-center justify-center gap-2">
              <MessageCircle size={18} />
              שליחת עדכון להורה
            </span>
          </PrimaryButton>
          <GhostButton className="w-full !text-sm" onClick={() => flagForReview(summary.studentId)}>
            <span className="inline-flex items-center justify-center gap-2">
              <Flag size={16} />
              סימון לבדיקה
            </span>
          </GhostButton>
          <GhostButton
            className="w-full !text-sm"
            disabled={!onOpenTasks}
            onClick={() => onOpenTasks?.()}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <ClipboardList size={16} />
              משימת חזרה במרכז המשימות
            </span>
          </GhostButton>
        </section>
      ) : null}
    </div>
  );
}
