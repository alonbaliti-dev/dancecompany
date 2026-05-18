"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Users } from "lucide-react";
import type { ClassSession, Level } from "@/lib/lovable/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const LEVEL_TONE: Record<Level, string> = {
  "מתחילים": "bg-success/15 text-success",
  "בינוני": "bg-primary/15 text-primary",
  "מתקדם": "bg-rose/15 text-rose",
  "מקצועי": "bg-white/10 text-foreground",
};

export function ClassCard({
  session,
  onOpen,
  ctaLabel,
}: {
  session: ClassSession;
  onOpen?: (s: ClassSession) => void;
  ctaLabel?: string;
}) {
  const fill = session.enrolled / session.capacity;
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen?.(session)}
      className="glass flex w-full flex-col gap-3 rounded-3xl p-4 text-right"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-base font-semibold text-foreground">
            {session.title}
          </span>
          <span className="text-xs text-muted-foreground">
            עם {session.teacher}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${LEVEL_TONE[session.level]}`}
        >
          {session.level}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} strokeWidth={1.8} />
          {formatTime(session.startsAt)} · {session.durationMin} דק׳
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={13} strokeWidth={1.8} />
          {session.room}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={13} strokeWidth={1.8} />
          {session.enrolled}/{session.capacity}
        </span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-l from-primary to-rose"
          style={{ width: `${Math.min(100, fill * 100)}%` }}
        />
      </div>

      {ctaLabel && (
        <span className="self-start text-xs font-medium text-primary">
          {ctaLabel} ←
        </span>
      )}
    </motion.button>
  );
}
