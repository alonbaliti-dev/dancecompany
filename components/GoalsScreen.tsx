"use client";

import { useRef, useState } from "react";
import { Sparkles, Upload, Video } from "lucide-react";
import { useProductData } from "@/context/ProductDataContext";
import { useToast } from "@/context/ToastContext";
import type { GoalCategory } from "@/lib/types";
import { BottomSheet } from "./BottomSheet";
import { Card, Header, Pill, PrimaryButton, ProgressBar, SectionEyebrow, SectionTitle, GhostButton } from "./ui";

const catLabel: Record<GoalCategory, string> = {
  flexibility: "גמישות",
  attendance: "נוכחות",
  home_practice: "תרגול ביתי",
  performance_prep: "הכנה להופעה",
  custom: "אישי"
};

export function GoalsScreen({ mode = "full" }: { mode?: "full" | "goalsOnly" }) {
  const { goals, updateGoalProgress, gamification, bumpWeeklyChallenge, submitPracticeVideo } = useProductData();
  const { showToast } = useToast();
  const [sheet, setSheet] = useState(false);
  const [vTitle, setVTitle] = useState("");
  const [vNote, setVNote] = useState("");
  const [vGoal, setVGoal] = useState<string | undefined>(undefined);
  const [vFile, setVFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-10 pb-6">
      {mode === "full" ? <Header title="יעדים אישיים" subtitle="מעקב חודשי, הערות מורה והתקדמות רכה — בלי לחץ של דירוגים." /> : null}

      {mode === "full" ? (
      <Card animated={false} className="border-emerald-400/10 bg-gradient-to-bl from-emerald-500/[0.07] to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-4 text-right">
          <div>
            <SectionEyebrow>מצב משחק</SectionEyebrow>
            <p className="mt-2 text-2xl font-semibold text-white">
              רמה {gamification.level} · {gamification.levelLabel}
            </p>
            <p className="mt-1 text-sm text-white/45">
              {gamification.xp} XP · רצף {gamification.streakDays} ימים
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {gamification.badges.map((b) => (
              <Pill key={b.id} icon={Sparkles}>
                {b.title}
              </Pill>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-4 border-t border-white/[0.06] pt-5">
          <div>
            <p className="text-right text-sm font-medium text-white/55">{gamification.weeklyChallengeTitle}</p>
            <ProgressBar value={gamification.weeklyChallengeProgressPct} className="mt-2" />
          </div>
          <div>
            <p className="text-right text-sm font-medium text-white/55">{gamification.groupChallengeTitle}</p>
            <ProgressBar value={gamification.groupChallengeProgressPct} className="mt-2" />
          </div>
          <GhostButton className="w-full !text-[13px] !font-semibold" onClick={bumpWeeklyChallenge}>
            עדכון אתגר השבוע
          </GhostButton>
        </div>
      </Card>
      ) : null}

      <section className="space-y-3">
        <SectionTitle>יעדים פעילים</SectionTitle>
        <div className="mt-2 space-y-3.5">
          {goals.map((g) => (
            <Card key={g.id} animated={false}>
              <div className="text-right">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-white/48">{catLabel[g.category]}</span>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/38">יעד: {new Date(g.deadline).toLocaleDateString("he-IL")}</span>
                </div>
                <p className="mt-3 text-[1.08rem] font-semibold text-white">{g.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/48">{g.description}</p>
                {g.teacherNotes ? (
                  <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.06] px-3 py-3">
                    <p className="text-[11px] font-semibold text-emerald-200/75">הערת מורה</p>
                    <p className="mt-1 text-sm text-white/55">{g.teacherNotes}</p>
                  </div>
                ) : null}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-[11px] text-white/40">
                    <span className="tabular-nums text-white/65">{g.progressPercent}%</span>
                    <span>התקדמות</span>
                  </div>
                  <ProgressBar value={g.progressPercent} />
                  <div className="flex justify-between text-[11px] text-white/40">
                    <span className="tabular-nums text-white/65">{g.monthlyProgressPct}%</span>
                    <span>חודש נוכחי</span>
                  </div>
                  <ProgressBar value={g.monthlyProgressPct} />
                </div>
                <div className="mt-5 flex gap-2">
                  <GhostButton className="flex-1 !text-[12px] !font-semibold" onClick={() => updateGoalProgress(g.id, 6)}>
                    עדכנתי התקדמות +6%
                  </GhostButton>
                  <GhostButton className="flex-1 !text-[12px] !font-semibold" onClick={() => updateGoalProgress(g.id, 12)}>
                    קפיצה קטנה +12%
                  </GhostButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionEyebrow>תרגול בווידאו</SectionEyebrow>
        <SectionTitle className="mt-0.5">העלאת וידאו</SectionTitle>
        <Card animated={false}>
          <p className="text-right text-sm leading-relaxed text-white/48">בחרו קובץ מהמכשיר, צרפו הערה קצרה ואופציונלית קישור ליעד.</p>
          <PrimaryButton className="mt-5" onClick={() => setSheet(true)}>
            <span className="inline-flex items-center justify-center gap-2">
              <Upload size={18} />
              פתיחת טופס העלאה
            </span>
          </PrimaryButton>
        </Card>
      </section>

      <BottomSheet open={sheet} title="העלאת וידאו" onClose={() => setSheet(false)}>
        <div className="space-y-4 text-right">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">כותרת</p>
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="למשל: קומבינציה — ניסיון 2" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">הערה</p>
            <textarea className="mt-2 min-h-[4.5rem] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={vNote} onChange={(e) => setVNote(e.target.value)} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">שיוך ליעד (אופציונלי)</p>
            <select className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={vGoal ?? ""} onChange={(e) => setVGoal(e.target.value || undefined)}>
              <option value="">ללא שיוך</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id} className="bg-zinc-900">
                  {g.title}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-2xl border border-dashed border-white/14 bg-white/[0.03] px-4 py-8 text-center">
            <Video className="mx-auto text-white/25" size={36} />
            <p className="mt-3 text-sm text-white/40">{vFile ? vFile.name : "בחירת קובץ מהמכשיר"}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setVFile(file);
                  showToast(`נבחר: ${file.name}`, "success");
                }
              }}
            />
            <GhostButton className="mt-4 !text-xs" onClick={() => fileInputRef.current?.click()}>
              בחירת קובץ מהמכשיר
            </GhostButton>
          </div>
          <PrimaryButton
            onClick={() => {
              if (!vTitle.trim()) {
                showToast("נא למלא כותרת", "error");
                return;
              }
              const note = vFile ? `${vNote}\nקובץ: ${vFile.name}`.trim() : vNote;
              submitPracticeVideo({ title: vTitle.trim(), note, attachedGoalId: vGoal });
              showToast("הסרטון נשלח לבדיקת המורה", "success");
              setSheet(false);
              setVTitle("");
              setVNote("");
              setVGoal(undefined);
              setVFile(null);
            }}
          >
            שליחה לבדיקת מורה
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}
