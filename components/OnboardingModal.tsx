"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck2, PlayCircle, TrendingUp } from "lucide-react";
import { PrimaryButton, GhostButton } from "./ui";

const STORAGE_KEY = "lk_ss_onboard_v2";

export function OnboardingModal({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "ברוכים הבאים ל-LK",
      body: "מרחב אישי לתלמידים ולהורים של LK Dance School בכפר ויתקין — שיעורים, חזרות וקהילה במקום אחד.",
      icon: CalendarCheck2
    },
    {
      title: "תנועה עם משמעות",
      body: "תרגול ביתי, משימות מהמורה ופידבק — מחוברים לצמיחה אמנותית, לביטחון ולחיבור רגשי לריקוד.",
      icon: PlayCircle
    },
    {
      title: "מהחזרה ועד הבמה",
      body: "מעקב רגוע אחרי התקדמות, זיכרונות מההופעות ועדכונים מהסטודיו — בלי רעש מיותר.",
      icon: TrendingUp
    }
  ];

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    onDone();
  };

  const s = slides[step];
  const Icon = s.icon;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="overlay-dim overlay-blur-md absolute inset-0" aria-hidden />
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="relative z-[81] m-4 w-full max-w-md overflow-hidden rounded-[26px] border border-white/[0.1] bg-[#09090b] p-6 shadow-[0_32px_100px_rgba(0,0,0,0.55)]"
          style={{ paddingBottom: "max(1.25rem, var(--safe-bottom))" }}
        >
          <motion.div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-amber-400/25 bg-gradient-to-b from-red-900/40 to-amber-500/10">
              <Icon className="text-amber-200" size={30} strokeWidth={1.6} />
            </div>
            <h2 className="mt-5 text-[1.35rem] font-semibold leading-snug text-white">{s.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/48">{s.body}</p>
            <div className="mt-6 flex w-full justify-center gap-1.5">
              {slides.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-amber-300/90" : "w-1.5 bg-white/18"}`} />
              ))}
            </div>
          </motion.div>
          <motion.div className="mt-8 flex flex-col gap-2.5">
            {step < slides.length - 1 ? (
              <PrimaryButton
                onClick={() => {
                  setStep((x) => x + 1);
                }}
              >
                הבא
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={finish}>בואו נרקוד</PrimaryButton>
            )}
            <GhostButton className="w-full !text-[13px]" onClick={finish}>
              דילוג
            </GhostButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function readOnboardingDone(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}
