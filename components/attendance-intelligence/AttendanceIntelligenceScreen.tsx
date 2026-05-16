"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarRange,
  ChevronLeft,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  Users
} from "lucide-react";
import { useAttendanceIntelligenceOptional } from "@/context/AttendanceIntelligenceContext";
import { useToast } from "@/context/ToastContext";
import { PLATFORM_OWNER_BADGE } from "@/lib/demo/identity";
import { canViewAttendanceIntelligence, canViewAttendanceIntelligenceStaff } from "@/lib/security/permissions";
import { FamilyAttendanceView } from "./FamilyAttendanceView";
import { useDeviceLayout } from "@/context/DeviceLayoutContext";
import { riskLabel, statusLabelHe, trendLabel } from "@/lib/attendance-intelligence/logic";
import { formatHeDate } from "@/lib/attendance-intelligence/school-year";
import type { AttendanceRiskLevel, StudentAttendanceSummary } from "@/lib/types";
import { StudentAttendanceDetail } from "./StudentAttendanceDetail";
import { Card, GhostButton, Header, Metric, RingStat, SectionEyebrow, cx, screenClass } from "../ui";

type SectionId = "recent" | "streaks" | "four_weeks" | "year";

function RiskBadge({ level }: { level: AttendanceRiskLevel }) {
  return (
    <span
      className={cx(
        "rounded-full px-2 py-0.5 text-[10px] font-bold",
        level === "ok" && "bg-emerald-500/15 text-emerald-100",
        level === "watch" && "bg-amber-500/15 text-amber-100",
        level === "at_risk" && "bg-rose-500/20 text-rose-100"
      )}
    >
      {riskLabel(level)}
    </span>
  );
}

function TrendBadge({ trend }: { trend: StudentAttendanceSummary["trend"] }) {
  const Icon = trend === "improving" ? TrendingUp : trend === "declining" ? TrendingDown : Minus;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-white/45">
      <Icon size={12} />
      {trendLabel(trend)}
    </span>
  );
}

function StudentRow({
  summary,
  active,
  onSelect,
  onNotify,
  onFlag,
  showLastAbsence
}: {
  summary: StudentAttendanceSummary;
  active: boolean;
  onSelect: () => void;
  onNotify: () => void;
  onFlag: () => void;
  showLastAbsence?: boolean;
}) {
  const alert4w = summary.absencesLast4Weeks >= 3;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cx(
        "w-full rounded-[20px] border px-4 py-3.5 text-right transition active:scale-[0.99]",
        active ? "border-emerald-400/30 bg-emerald-500/[0.08]" : "border-white/[0.08] bg-white/[0.03] hover:border-white/14"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <ChevronLeft className="mt-1 shrink-0 text-white/25" size={18} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <RiskBadge level={summary.riskLevel} />
            {alert4w ? (
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-100">4 שב׳</span>
            ) : null}
            <p className="font-semibold text-white">{summary.studentName}</p>
          </div>
          <p className="mt-1 text-xs text-white/42">
            {summary.groupName} · {summary.teacherName}
          </p>
          {showLastAbsence && summary.lastAbsence ? (
            <p className="mt-2 text-xs text-rose-200/75">
              {formatHeDate(summary.lastAbsence.classDate)} · {summary.lastAbsence.classTitle} ·{" "}
              {statusLabelHe(summary.lastAbsence.status)}
              {summary.lastAbsence.note ? ` — ${summary.lastAbsence.note}` : ""}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap justify-end gap-3 text-[11px] text-white/38">
            <span className="tabular-nums">{summary.attendancePct}% נוכחות</span>
            <TrendBadge trend={summary.trend} />
            {summary.currentStreak >= 2 ? (
              <span className="text-amber-200/80">{summary.currentStreak} רצופים</span>
            ) : null}
          </div>
        </div>
      </div>
      {(summary.currentStreak >= 2 || alert4w) && (
        <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-white/[0.06] pt-3" onClick={(e) => e.stopPropagation()}>
          <GhostButton className="!text-[10px] !py-1" onClick={onNotify}>
            <MessageCircle size={12} className="ml-1 inline" />
            עדכון להורה
          </GhostButton>
          <GhostButton className="!text-[10px] !py-1" onClick={onFlag}>
            סימון לבדיקה
          </GhostButton>
        </div>
      )}
    </div>
  );
}

export function AttendanceIntelligenceScreen({
  user,
  initialStudentId,
  onOpenTasks
}: {
  user: import("@/lib/types").UserProfile;
  initialStudentId?: string | null;
  onOpenTasks?: () => void;
}) {
  const ctx = useAttendanceIntelligenceOptional();
  const { showToast } = useToast();
  const { layoutMode } = useDeviceLayout();
  const isWide = layoutMode === "desktop" || layoutMode === "tablet";
  const [section, setSection] = useState<SectionId>("recent");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<AttendanceRiskLevel | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const summaries = ctx?.summaries ?? [];

  const teachers = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of summaries) map.set(s.teacherId, s.teacherName);
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [summaries]);

  const filtered = useMemo(() => {
    let list = summaries;
    if (groupFilter !== "all") list = list.filter((s) => s.groupId === groupFilter);
    if (teacherFilter !== "all") list = list.filter((s) => s.teacherId === teacherFilter);
    if (riskFilter !== "all") list = list.filter((s) => s.riskLevel === riskFilter);
    return list;
  }, [summaries, groupFilter, teacherFilter, riskFilter]);

  const sectionList = useMemo(() => {
    if (section === "recent") {
      return [...filtered]
        .filter((s) => s.lastAbsence)
        .sort((a, b) => (b.lastAbsence!.classDate > a.lastAbsence!.classDate ? 1 : -1));
    }
    if (section === "streaks") {
      return filtered.filter((s) => s.currentStreak >= 2).sort((a, b) => b.currentStreak - a.currentStreak);
    }
    if (section === "four_weeks") {
      return [...filtered].sort((a, b) => b.absencesLast4Weeks - a.absencesLast4Weeks);
    }
    return [...filtered].sort((a, b) => a.attendancePct - b.attendancePct);
  }, [filtered, section]);

  if (!ctx || !canViewAttendanceIntelligence(user)) {
    return (
      <div className={screenClass}>
        <Header title="מעקב נוכחות" subtitle="אין הרשאה לצפות בנתוני נוכחות." />
      </div>
    );
  }

  if (!canViewAttendanceIntelligenceStaff(user)) {
    return <FamilyAttendanceView user={user} ctx={ctx} initialStudentId={initialStudentId} />;
  }

  const { groups, overview, schoolYearLabel, sendParentUpdate, flagForReview } = ctx;
  const userCtx = ctx.user;

  function notifyParents(studentId: string) {
    const result = sendParentUpdate(studentId);
    if (result.ok === false) {
      showToast(result.reason, "error");
      return;
    }
    showToast(`עדכון נשלח ל־${result.recipientCount} הורים`, "success");
  }

  const selected = selectedId ? summaries.find((s) => s.studentId === selectedId) : undefined;

  const sections: { id: SectionId; label: string }[] = [
    { id: "recent", label: "מי החסיר לאחרונה" },
    { id: "streaks", label: "חיסורים רצופים" },
    { id: "four_weeks", label: "4 שבועות" },
    { id: "year", label: "מתחילת השנה" }
  ];

  return (
    <div className={cx(screenClass, "pb-8")}>
      <Header
        title="מעקב נוכחות"
        subtitle={`שנת לימודים ${schoolYearLabel} · ספטמבר–יולי · מחושב עד היום`}
      />
      {userCtx.permissions.isSuperAdmin ? (
        <p className="-mt-4 text-right text-[11px] text-violet-200/70">{PLATFORM_OWNER_BADGE} · סטודיו פעיל</p>
      ) : null}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Card animated={false} className="!p-4">
          <RingStat value={overview.avg} label="נוכחות ממוצעת" size={64} tone="teacher" />
        </Card>
        <Metric title="בסיכון" value={overview.atRisk} icon={AlertTriangle} />
        <Metric title="חיסורים (4 שב׳)" value={overview.absences4w} icon={CalendarRange} />
        <Metric title="רצופים (2+)" value={overview.streakAlerts} icon={Users} />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar" dir="rtl">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={cx(
              "shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition",
              section === s.id ? "border-white/25 bg-white/12 text-white" : "border-white/10 text-white/45"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <select
          className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="all">כל הקבוצות</option>
          {groups.map((g) => (
            <option key={g.groupId} value={g.groupId}>
              {g.groupName}
            </option>
          ))}
        </select>
        {userCtx.permissions.isManagement || userCtx.permissions.isSuperAdmin ? (
          <select
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white"
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
          >
            <option value="all">כל המורים</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        ) : null}
        <select
          className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as AttendanceRiskLevel | "all")}
        >
          <option value="all">כל הסיכונים</option>
          <option value="ok">תקין</option>
          <option value="watch">לשים לב</option>
          <option value="at_risk">בסיכון</option>
        </select>
      </div>

      {section === "year" && groups.length > 0 ? (
        <div className="space-y-2">
          <SectionEyebrow>נוכחות לפי קבוצה</SectionEyebrow>
          {groups.map((g) => (
            <Card key={g.groupId} animated={false}>
              <div className="flex items-center justify-between gap-3 text-right">
                <span className="text-sm font-semibold tabular-nums text-emerald-200/90">{g.averageAttendancePct}%</span>
                <div>
                  <p className="font-semibold text-white">{g.groupName}</p>
                  <p className="text-xs text-white/40">
                    {g.teacherName} · {g.studentCount} תלמידים · {g.atRiskCount} בסיכון
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <div className={cx(isWide && "grid grid-cols-1 gap-6 lg:grid-cols-2")}>
        <div className="space-y-2">
          <SectionEyebrow>{sections.find((s) => s.id === section)?.label}</SectionEyebrow>
          {sectionList.length === 0 ? (
            <Card animated={false}>
              <p className="py-8 text-center text-sm text-white/40">אין תלמידים בפילטר זה.</p>
            </Card>
          ) : (
            sectionList.map((s) => (
              <StudentRow
                key={s.studentId}
                summary={s}
                active={selectedId === s.studentId}
                showLastAbsence={section === "recent"}
                onSelect={() => setSelectedId(s.studentId)}
                onNotify={() => notifyParents(s.studentId)}
                onFlag={() => flagForReview(s.studentId)}
              />
            ))
          )}
        </div>

        {isWide ? (
          <div className="lg:sticky lg:top-24 lg:self-start">
            {selected ? (
              <StudentAttendanceDetail summary={selected} onClose={() => setSelectedId(null)} onOpenTasks={onOpenTasks} />
            ) : (
              <Card animated={false}>
                <p className="py-16 text-center text-sm text-white/40">בחרו תלמיד לפרטי נוכחות מלאים</p>
              </Card>
            )}
          </div>
        ) : selected ? (
          <StudentAttendanceDetail summary={selected} onClose={() => setSelectedId(null)} onOpenTasks={onOpenTasks} />
        ) : null}
      </div>
    </div>
  );
}
