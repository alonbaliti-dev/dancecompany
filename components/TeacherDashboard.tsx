"use client";

import { AlertTriangle, Users } from "lucide-react";
import { computeTeacherDashboard } from "@/lib/insights/compute-teacher-dashboard";
import type { StackTabId, UserProfile } from "@/lib/types";
import { TeacherPrivateLessonsSummary } from "./teacher/TeacherPrivateLessonsSummary";
import { TeacherStudioPanel } from "./TeacherStudioPanel";
import type { ShopInitialView } from "./shop/ShopScreen";
import { Card, Divider, GhostButton, Header, ProgressBar, RingStat, SectionEyebrow, SectionTitle } from "./ui";
import { CollapsibleSection } from "./ui/CollapsibleSection";

export function TeacherDashboard({
  user,
  onNavigate,
  onSendUpdate,
  onOpenShop
}: {
  user: UserProfile;
  onNavigate?: (t: StackTabId) => void;
  onSendUpdate?: () => void;
  onOpenShop?: (focus?: { view?: ShopInitialView; adminTab?: "products" | "orders" | "private"; eventId?: string }) => void;
}) {
  const data = computeTeacherDashboard(user);

  const qa = (id: string) => {
    if (!onNavigate) return;
    if (id === "qa1") onNavigate("attendance");
    if (id === "qa5") onNavigate("attendance_intelligence");
    if (id === "qa2") onSendUpdate?.();
    if (id === "qa4") onNavigate("teacher");
    if (id === "qa3") onNavigate("files");
    if (id === "qa6") onOpenShop?.({ view: "private_teacher" });
  };

  if (!data) {
    return (
      <div className="pb-6">
        <Header title="מרכז מורה" subtitle="אין הרשאת מורה לחשבון זה." />
      </div>
    );
  }

  if (data.groups.length === 0) {
    return (
      <div className="space-y-6 pb-6">
        <Header title="מרכז מורה" subtitle="אין קבוצות משויכות לחשבון זה. פני למנהלת הסטודיו לשיוך קבוצות." />
        <Card animated={false}>
          <p className="text-right text-sm leading-relaxed text-white/48">
            כאן יופיעו לוח היום, נוכחות, תרגול ביתי ותלמידים שדורשים תשומת לב — לפי הקבוצות שהוקצו לך במערכת הניהול.
          </p>
        </Card>
      </div>
    );
  }

  const totalExp = data.todaysClasses.reduce((s, c) => s + c.expected, 0);
  const totalMark = data.todaysClasses.reduce((s, c) => s + c.marked, 0);
  const attendanceWeek = totalExp ? Math.round((totalMark / totalExp) * 100) : 82;
  const needsAttentionCount = data.studentsAtRisk.length + data.pendingReviews.reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-8 pb-6">
      <Header title="מרכז מורה" subtitle="היום בשיעורים — נוכחות, בדיקות ותלמידים שצריכים מענה מהיר." />

      <section className="space-y-3">
        <SectionTitle>פעולות מהירות</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {data.quickActions.map((a) => (
            <GhostButton key={a.id} className="!min-h-[3.35rem] w-full text-sm font-semibold" onClick={() => qa(a.id)}>
              {a.label}
            </GhostButton>
          ))}
        </div>
      </section>

      <Card animated={false}>
        <div className="flex flex-wrap items-center justify-between gap-8">
          <RingStat value={attendanceWeek || 82} label="סימון היום" size={84} />
          <div className="min-w-0 flex-1 space-y-3 text-right">
            <SectionEyebrow>לוח היום</SectionEyebrow>
            <div className="space-y-2.5">
              {data.todaysClasses.map((c) => (
                <div key={c.id} className="rounded-[14px] border border-white/[0.07] bg-white/[0.03] px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="tabular-nums text-lg font-semibold text-white">{c.time}</span>
                    <span className="text-[11px] text-white/42">
                      {c.marked}/{c.expected} נוכחים
                    </span>
                  </div>
                  <p className="mt-1 font-semibold text-white">{c.title}</p>
                  <p className="mt-1 text-sm text-white/42">
                    {c.groupName} · {c.room}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <TeacherPrivateLessonsSummary onOpenShop={onOpenShop ? () => onOpenShop({ view: "private_teacher" }) : undefined} />

      <CollapsibleSection title="דורש טיפול" count={needsAttentionCount} tone="warning" defaultOpen={needsAttentionCount > 0}>
        <div className="space-y-4">
          {data.studentsAtRisk.length > 0 ? (
            <div className="space-y-3">
              <p className="text-right text-xs font-medium text-white/40">תלמידים בסיכון</p>
              {data.studentsAtRisk.map((s) => (
                <Card key={s.id} animated={false}>
                  <div className="flex items-start gap-3 text-right">
                    <AlertTriangle className="mt-0.5 shrink-0 text-amber-300/90" size={20} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{s.name}</p>
                      <p className="mt-1 text-sm text-white/42">{s.group}</p>
                      <p className="mt-2 text-sm text-amber-200/82">{s.reason}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}
          {data.pendingReviews.length > 0 ? (
            <div className="space-y-3">
              <p className="text-right text-xs font-medium text-white/40">ממתינים לבדיקה</p>
              {data.pendingReviews.map((p) => (
                <Card key={p.id} animated={false}>
                  <div className="flex items-center justify-between gap-3 text-right">
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-sm font-semibold tabular-nums text-white">
                      {p.count}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{p.title}</p>
                      <p className="mt-1 text-sm text-white/42">{p.group}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}
          {needsAttentionCount === 0 ? (
            <p className="py-2 text-center text-sm text-white/38">אין פריטים דחופים כרגע — מצוין.</p>
          ) : null}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="הקבוצות שלי" count={data.groups.length} tone="teacher" defaultOpen>
        <div className="space-y-3">
          {data.groups.map((g) => (
            <Card key={g.id} animated={false}>
              <div className="text-right">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.05] p-2">
                    <Users className="text-emerald-200/90" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{g.name}</p>
                    <p className="mt-1 text-sm text-white/42">
                      {g.level} · {g.students} תלמידים
                    </p>
                    <p className="mt-2 text-xs text-white/38">שיעור הבא: {g.nextSession}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/42">
                    <span>נוכחות</span>
                    <span className="tabular-nums font-medium text-white/68">{g.attendancePct}%</span>
                  </div>
                  <ProgressBar value={g.attendancePct} />
                  <div className="flex items-center justify-between text-xs text-white/42">
                    <span>תרגול ביתי</span>
                    <span className="tabular-nums font-medium text-white/68">{g.practiceCompletionPct}%</span>
                  </div>
                  <ProgressBar value={g.practiceCompletionPct} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CollapsibleSection>

      <TeacherStudioPanel user={user} />

      <Divider className="opacity-45" />
    </div>
  );
}
