"use client";

import { AlertCircle, BarChart3, BookOpen, TrendingUp, Users } from "lucide-react";
import { useProductData } from "@/context/ProductDataContext";
import { Card, Divider, Header, ProgressBar, SectionEyebrow, SectionTitle } from "./ui";

export function ReportsScreen() {
  const { reports } = useProductData();

  return (
    <div className="space-y-10 pb-6">
      <Header title="דוחות הנהלה" subtitle="מבט מנהלים — מדדים רכים, ללא טבלאות עמוסות." />

      <div className="grid grid-cols-2 gap-3">
        <Card animated={false}>
          <p className="text-[11px] text-white/38">נוכחות</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-200/95">{reports.attendanceCompletionPct}%</p>
          <ProgressBar value={reports.attendanceCompletionPct} className="mt-3" />
        </Card>
        <Card animated={false}>
          <p className="text-[11px] text-white/38">משימות</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{reports.taskCompletionPct}%</p>
          <ProgressBar value={reports.taskCompletionPct} className="mt-3" />
        </Card>
        <Card animated={false} className="col-span-2">
          <p className="text-[11px] text-white/38">מעורבות בתרגול ביתי</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-sky-200/90">{reports.homePracticeEngagementPct}%</p>
          <ProgressBar value={reports.homePracticeEngagementPct} className="mt-3" />
        </Card>
      </div>

      <section className="space-y-3">
        <SectionEyebrow>מורים</SectionEyebrow>
        <SectionTitle className="mt-0.5">פעילות והשלמות</SectionTitle>
        <div className="mt-3 space-y-3">
          {reports.teacherActivity.map((t) => (
            <Card key={t.name} animated={false}>
              <div className="flex items-start justify-between gap-3 text-right">
                <BarChart3 className="mt-0.5 shrink-0 text-white/35" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="mt-1 text-[11px] font-semibold text-emerald-200/70">{t.score}</p>
                  <p className="mt-2 text-sm text-white/45">{t.detail}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>תלמידים בסיכון</SectionTitle>
        <div className="space-y-3">
          {reports.atRiskStudents.map((s) => (
            <Card key={s.name} animated={false}>
              <div className="flex gap-3 text-right">
                <Users className="mt-0.5 shrink-0 text-rose-300/75" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{s.name}</p>
                  <p className="mt-2 text-sm text-white/48">{s.reason}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>שימור והתראות</SectionTitle>
        <div className="space-y-3">
          {reports.retentionRisk.map((r) => (
            <Card key={r.segment} animated={false}>
              <div className="flex gap-3 text-right">
                <TrendingUp className="mt-0.5 shrink-0 text-amber-300/75" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{r.segment}</p>
                  <p className="mt-2 text-sm text-white/48">{r.note}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card animated={false}>
        <div className="flex items-center justify-between gap-3 text-right">
          <BookOpen className="text-white/35" size={22} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">עדכונים חשובים שלא נקראו</p>
            <p className="mt-1 text-xs text-white/40">כולל דחיפות גבוהה במערכת העדכונים</p>
          </div>
          <span className="text-xl font-semibold tabular-nums text-amber-200/90">{reports.unreadImportantUpdates}</span>
        </div>
      </Card>

      <section className="space-y-3">
        <SectionTitle>קבוצות הדורשות תשומת לב</SectionTitle>
        {reports.groupsNeedingAttention.map((g) => (
          <Card key={g.groupName} animated={false}>
            <div className="flex gap-3 text-right">
              <AlertCircle className="mt-0.5 shrink-0 text-amber-300/85" size={20} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{g.groupName}</p>
                <p className="mt-2 text-sm text-white/48">{g.reason}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Card animated={false}>
        <SectionEyebrow>תובנה שבועית</SectionEyebrow>
        <p className="mt-4 text-right text-[15px] leading-relaxed text-white/52">{reports.weeklyHebrewInsight}</p>
      </Card>

      <Divider className="opacity-40" />
    </div>
  );
}
