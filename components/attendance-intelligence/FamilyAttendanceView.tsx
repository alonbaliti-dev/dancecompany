"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { trendLabel } from "@/lib/attendance-intelligence/logic";
import type { StudentAttendanceSummary, UserProfile } from "@/lib/types";
import { StudentAttendanceDetail } from "./StudentAttendanceDetail";
import { Card, Header, RingStat, SectionEyebrow, cx, screenClass } from "../ui";

type FamilyCtx = {
  summaries: StudentAttendanceSummary[];
  schoolYearLabel: string;
};

export function FamilyAttendanceView({
  user,
  ctx,
  initialStudentId
}: {
  user: Pick<UserProfile, "isParent" | "type">;
  ctx: FamilyCtx;
  initialStudentId?: string | null;
}) {
  const isParent = user.isParent || user.type === "parent";
  const { summaries, schoolYearLabel } = ctx;

  const defaultId = useMemo(() => {
    if (initialStudentId && summaries.some((s) => s.studentId === initialStudentId)) {
      return initialStudentId;
    }
    if (summaries.length === 1) return summaries[0]?.studentId ?? null;
    return null;
  }, [initialStudentId, summaries]);

  const [selectedId, setSelectedId] = useState<string | null>(defaultId);
  const selected = selectedId ? summaries.find((s) => s.studentId === selectedId) : undefined;

  if (selected) {
    return (
      <div className={screenClass}>
        <StudentAttendanceDetail summary={selected} onClose={() => setSelectedId(null)} readOnly />
      </div>
    );
  }

  return (
    <div className={cx(screenClass, "pb-8")}>
      <Header
        title={isParent ? "נוכחות הילדים" : "הנוכחות שלי"}
        subtitle={`שנת לימודים ${schoolYearLabel} · מספטמבר עד היום`}
      />

      {summaries.length === 0 ? (
        <Card animated={false}>
          <p className="py-10 text-center text-sm text-white/45">אין נתוני נוכחות להצגה כרגע.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <SectionEyebrow>{isParent ? "בחרו ילד/ה לפירוט" : "סיכום"}</SectionEyebrow>
          {summaries.map((s) => (
            <button
              key={s.studentId}
              type="button"
              onClick={() => setSelectedId(s.studentId)}
              className="block w-full text-right transition active:scale-[0.99]"
            >
              <Card animated={false} className="!p-4">
                <div className="flex items-center justify-between gap-2">
                  <ChevronLeft className="text-white/25" size={20} />
                  <p className="text-sm font-semibold text-white">{s.studentName}</p>
                </div>
                <FamilyGlanceRow summary={s} schoolYearLabel={schoolYearLabel} />
                <p className="mt-3 text-center text-[11px] text-violet-200/70">לחצו לציר חיסורים מלא</p>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FamilyGlanceRow({ summary, schoolYearLabel }: { summary: StudentAttendanceSummary; schoolYearLabel: string }) {
  const TrendIcon = summary.trend === "improving" ? TrendingUp : summary.trend === "declining" ? TrendingDown : Minus;
  return (
    <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="flex items-center gap-4">
        <RingStat value={summary.attendancePct} label="נוכחות" tone="achievement" size={64} />
        <div className="flex-1 space-y-2 text-right text-sm text-white/55">
          <p>חיסורים (4 שב׳): {summary.absencesLast4Weeks}</p>
          <p>רצף חיסורים: {summary.currentStreak}</p>
          <p className="inline-flex items-center gap-1">
            <TrendIcon size={14} />
            {trendLabel(summary.trend)}
          </p>
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] text-white/32">מספטמבר · {schoolYearLabel}</p>
    </div>
  );
}
