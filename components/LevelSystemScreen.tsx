"use client";

import { useStudioOS } from "@/context/StudioOSContext";
import { PROFESSIONAL_LEVELS } from "@/lib/studio-os-constants";
import { levelLabelHe, nextLevelId } from "@/context/StudioOSContext";
import { Card, Header, PrimaryButton, ProgressBar, SectionEyebrow, cx } from "./ui";

export function LevelSystemScreen() {
  const { user, levelProgress, approveSkill, requestPromotion } = useStudioOS();
  const lp = levelProgress;
  const next = lp ? nextLevelId(lp.currentLevel) : null;

  if (!lp) {
    return (
      <div className="pb-6">
        <Header title="מסלול מקצועי" subtitle="רמות LK Universe" />
        <Card animated={false}><p className="py-8 text-center text-sm text-white/40">אין נתוני רמה לחשבון זה.</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      <Header title="מסלול מקצועי" subtitle="רמות, מיומנויות ואישור מורה — בדרך לרמה הבאה." />
      <Card animated={false} className="border-emerald-400/15 bg-gradient-to-bl from-emerald-500/[0.08] to-transparent">
        <p className="text-[11px] text-white/40">רמה נוכחית</p>
        <p className="mt-2 text-2xl font-semibold text-white">{levelLabelHe(lp.currentLevel)}</p>
        <ProgressBar value={lp.progressPct} className="mt-4" />
        <p className="mt-2 text-xs text-white/45">{lp.progressPct}% להשלמת דרישות הרמה</p>
        {next ? <p className="mt-2 text-sm text-emerald-200/80">הבא: {levelLabelHe(next)}</p> : null}
      </Card>
      <div>
        <SectionEyebrow>צ׳ק-ליסט מיומנויות</SectionEyebrow>
        <div className="mt-3 space-y-2">
          {lp.skills.map((s) => (
            <Card key={s.id} animated={false}>
              <div className="flex items-center justify-between gap-3">
                <span className={cx("text-xs", s.teacherApproved ? "text-emerald-300" : "text-white/35")}>{s.teacherApproved ? "מאושר" : "ממתין"}</span>
                <p className="flex-1 text-right font-medium text-white">{s.label}</p>
                {(user.permissions.isTeacher || user.permissions.isManagement) && !s.teacherApproved ? (
                  <button type="button" onClick={() => approveSkill(s.id)} className="text-[11px] font-semibold text-emerald-300">אישור</button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </div>
      {!user.permissions.isTeacher && !lp.promotionRequestedAt ? (
        <PrimaryButton onClick={requestPromotion}>בקשת בחינה לרמה הבאה</PrimaryButton>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2 opacity-60">
        {PROFESSIONAL_LEVELS.map((l) => (
          <span key={l.id} className={cx("rounded-full border px-2 py-0.5 text-[10px]", l.id === lp.currentLevel ? "border-emerald-400/40 text-emerald-100" : "border-white/10 text-white/40")}>{l.labelHe}</span>
        ))}
      </div>
    </div>
  );
}
