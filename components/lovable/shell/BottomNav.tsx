"use client";

import { motion } from "framer-motion";
import { Home, Calendar, Bell, User, LayoutGrid } from "lucide-react";

export type NavKey = "home" | "schedule" | "alerts" | "more" | "profile";

interface BottomNavProps {
  active: NavKey;
  onChange: (key: NavKey) => void;
  unread?: number;
}

const ITEMS: { key: NavKey; label: string; Icon: typeof Home }[] = [
  { key: "home", label: "בית", Icon: Home },
  { key: "schedule", label: "מערכת", Icon: Calendar },
  { key: "alerts", label: "התראות", Icon: Bell },
  { key: "more", label: "עוד", Icon: LayoutGrid },
  { key: "profile", label: "אני", Icon: User },
];

export function BottomNav({ active, onChange, unread = 0 }: BottomNavProps) {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 safe-bottom">
      <div className="glass-strong pointer-events-auto flex w-full max-w-md items-center justify-between gap-1 rounded-3xl px-2 py-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        {ITEMS.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-muted-foreground transition-colors"
              aria-label={label}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-2xl bg-white/8"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative flex items-center justify-center">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className={
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }
                />
                {key === "alerts" && unread > 0 && (
                  <span className="absolute -left-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose px-1 text-[9px] font-semibold text-background">
                    {unread}
                  </span>
                )}
              </span>
              <span
                className={
                  isActive
                    ? "relative text-foreground"
                    : "relative text-muted-foreground"
                }
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
