"use client";

import { useMemo } from "react";
import { Award, Calendar, CheckCircle2, Video } from "lucide-react";
import { useProductData } from "@/context/ProductDataContext";
import { useStudioOS } from "@/context/StudioOSContext";
import { levelLabelHe } from "@/context/StudioOSContext";
import { computeStudentStats } from "@/lib/insights/compute-student-stats";
import type { StackTabId, UserProfile } from "@/lib/types";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { GoalsScreen } from "./GoalsScreen";
import { Card, Divider, GhostButton, Header, Metric, Pill, RingStat, SectionEyebrow, SectionTitle, cx, screenClass } from "./ui";

const statusLabel: Record<string, string> = {
  pending_review: "ממתין לבדיקה",
  approved: "אושר",
  needs_correction: "נדרש תיקון"
};

export function ProgressHubScreen({ user, onOpenStack }: { user: UserProfile; onOpenStack?: (t: StackTabId) => void }) {
  const { gamification, filesByStudentId, videos } = useProductData();
  const { levelProgress, consistency } = useStudioOS();
  const file = filesByStudentId[user.id];
  const myVideos = useMemo(() => videos.filter((v) => v.studentId === user.id).slice(0, 6), [videos, user.id]);
  const studentStats = computeStudentStats(user);

  return (
    <div className={screenClass}>
      <Header title="התקדמות" subtitle="יעדים, נוכחות ופידבק — במבט אחד, בלי רעש." />

      <Card animated={false} tone="achievement" glow>
        <div className="flex flex-wrap items-center justify-between gap-8">
          <RingStat value={Math.min(100, Math.round((gamification.xp / (gamification.xp + 320)) * 100))} label="לרמה הבאה" size={88} tone="achievement" />
          <div className="min-w-0 flex-1 space-y-2 text-right">
            <SectionEyebrow>מצב נוכחי</SectionEyebrow>
            <p className="text-2xl font-semibold text-white">
              רמה {gamification.level} · {gamification.levelLabel}
            </p>
            <p className="text-sm text-white/45">
              {gamification.xp} XP · רצף {gamification.streakDays} ימים
              {levelProgress ? <> · {levelLabelHe(levelProgress.currentLevel)}</> : null}
            </p>
            {levelProgress && onOpenStack ? (
              <GhostButton className="mt-3 !text-[11px]" onClick={() => onOpenStack("levels")}>
                מסלול מקצועי
              </GhostButton>
            ) : null}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          <Metric title="נוכחות" value={`${studentStats.attendance}%`} icon={CheckCircle2} />
          <Metric title="חודש" value={`${studentStats.monthlyProgressPct}%`} icon={Calendar} />
          <Metric title="תגים" value={`${gamification.badges.length}`} icon={Award} />
        </div>
      </Card>

      <Card animated={false}>
        <ActivityHeatmap compact />
        <p className="mt-3 text-right text-xs text-white/40">
          עקביות {consistency.consistencyScore}% · רצף {consistency.streakDays} ימים
        </p>
      </Card>

      <div>
        <SectionEyebrow>תגים אחרונים</SectionEyebrow>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          {gamification.badges.slice(0, 4).map((b) => (
            <Pill key={b.id} tone="achievement">{b.title}</Pill>
          ))}
        </div>
      </div>

      {file ? (
        <Card animated={false}>
          <SectionEyebrow>פידבק מהמורה</SectionEyebrow>
          <p className="mt-3 text-right text-sm leading-relaxed text-white/55">{file.teacherNotes}</p>
          <Divider className="my-4 opacity-40" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">חוזקות</p>
          <ul className="mt-2 space-y-1 text-right text-sm text-white/60">
            {file.strengths.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div>
        <SectionEyebrow>סרטוני תרגול</SectionEyebrow>
        <SectionTitle className="mt-0.5">סטטוס בדיקה</SectionTitle>
        <div className="mt-3 space-y-2">
          {myVideos.length === 0 ? (
            <Card animated={false}>
              <p className="py-6 text-center text-sm text-white/38">עדיין אין העלאות — ניתן להעלות מכאן או מיעדים.</p>
            </Card>
          ) : (
            myVideos.map((v) => (
              <Card key={v.id} animated={false}>
                <div className="flex items-start justify-between gap-3 text-right">
                  <span
                    className={cx(
                      "shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold",
                      v.status === "approved" && "border-emerald-400/30 bg-emerald-500/12 text-emerald-100",
                      v.status === "pending_review" && "border-amber-400/28 bg-amber-500/10 text-amber-50",
                      v.status === "needs_correction" && "border-rose-400/28 bg-rose-500/12 text-rose-50"
                    )}
                  >
                    {statusLabel[v.status]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{v.title}</p>
                    {v.teacherFeedback ? <p className="mt-2 text-sm text-white/48">{v.teacherFeedback}</p> : null}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <GoalsScreen mode="goalsOnly" />
    </div>
  );
}
