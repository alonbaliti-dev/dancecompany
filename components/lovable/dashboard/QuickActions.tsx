"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  FileText,
  GraduationCap,
  Megaphone,
  MessageCircle,
  Navigation,
  UserMinus,
  Users,
  ClipboardCheck,
  Wallet,
  DoorOpen,
  Layers,
} from "lucide-react";
import type { QuickAction, QuickActionKey } from "@/lib/lovable/types";

const ICONS: Record<QuickActionKey, LucideIcon> = {
  schedule: CalendarDays,
  absence: UserMinus,
  contact: MessageCircle,
  navigate: Navigation,
  rollcall: ClipboardCheck,
  broadcast: Megaphone,
  notes: FileText,
  students: GraduationCap,
  attendance: Users,
  payments: Wallet,
  groups: Layers,
  rooms: DoorOpen,
};

export function QuickActions({
  actions,
  onAction,
  title = "פעולות מהירות",
}: {
  actions: QuickAction[];
  onAction?: (key: QuickActionKey) => void;
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((a) => {
          const Icon = ICONS[a.key] ?? Bell;
          return (
            <motion.button
              key={a.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction?.(a.key)}
              className="glass flex items-center gap-3 rounded-2xl p-3.5 text-right"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/25 to-rose/20 text-primary">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-foreground">
                  {a.label}
                </span>
                {a.hint && (
                  <span className="truncate text-[11px] text-muted-foreground">
                    {a.hint}
                  </span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
