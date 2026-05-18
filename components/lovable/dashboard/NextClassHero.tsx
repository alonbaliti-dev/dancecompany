"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Sparkles } from "lucide-react";
import type { ClassSession } from "@/lib/lovable/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function minutesUntil(iso: string) {
  const diff = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (diff <= 0) return "מתקיים עכשיו";
  if (diff < 60) return `בעוד ${diff} דק׳`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `בעוד ${h}ש׳ ${m}ד׳`;
}

export function NextClassHero({
  session,
  onOpen,
  eyebrow = "השיעור הבא שלך",
}: {
  session: ClassSession;
  onOpen?: (s: ClassSession) => void;
  eyebrow?: string;
}) {
  const start = formatTime(session.startsAt);
  const countdown = minutesUntil(session.startsAt);

  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={() => onOpen?.(session)}
      className="glass-strong relative w-full overflow-hidden rounded-[28px] p-5 text-right"
    >
      <div
        aria-hidden
        className="absolute -left-20 -top-20 h-56 w-56 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.13 80 / 35%), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -right-10 h-56 w-56 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.74 0.13 15 / 28%), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold text-foreground">
            <Sparkles size={11} className="text-primary" />
            {countdown}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] tracking-wide text-muted-foreground">
            {session.style}
          </span>
          <h2 className="text-[24px] font-semibold leading-tight tracking-tight">
            {session.title}
          </h2>
          <span className="text-sm text-muted-foreground">
            עם {session.teacher}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <HeroStat icon={<Clock size={13} />} label="שעה" value={start} />
          <HeroStat icon={<MapPin size={13} />} label="אולפן" value={session.room} />
          <HeroStat label="משך" value={`${session.durationMin} דק׳`} />
        </div>
      </div>
    </motion.button>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-2xl px-3 py-2.5 text-right">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[10px] uppercase tracking-[0.14em]">{label}</span>
        {icon}
      </div>
      <div className="mt-1 text-sm font-semibold tracking-tight text-foreground">
        {value}
      </div>
    </div>
  );
}
