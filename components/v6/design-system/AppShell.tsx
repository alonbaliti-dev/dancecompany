"use client";

import { type ElementType, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bell, CalendarDays, ShoppingBag, Sparkles, Users } from "lucide-react";
import { roleLabel } from "@/lib/v6/seed";
import type { V6Tab, V6User } from "@/lib/v6/types";
import { V6_ACTIVITY_COPY } from "@/lib/v6/activity-center/copy";
import { v6Cx, v6Lovable, v6Motion, v6ScreenAtmosphere, v6Tone, v6Visual, type V6Tone } from "./tokens";
import { BadgeCount, SafeMeta, SafeTitle } from "./primitives";

function roleTone(role: V6User["role"]): V6Tone {
  if (role === "super_admin") return "admin";
  if (role === "management") return "management";
  if (role === "teacher") return "studio";
  if (role === "parent") return "classic";
  return "hiphop";
}

export function AppShellFrame({ user, studioName, onLogout, children, atmosphere = "home" }: { user: V6User; studioName?: string; onLogout: () => void; children: ReactNode; atmosphere?: keyof typeof v6ScreenAtmosphere }) {
  const tone = roleTone(user.role);
  const reduceMotion = useReducedMotion();
  return (
    <div suppressHydrationWarning className="min-h-[var(--app-min-height)] overflow-x-hidden bg-[#020102] text-white [min-height:var(--app-height)]" dir="rtl">
      <div className={v6Cx("pointer-events-none fixed inset-0 z-0 transition-colors duration-500", v6ScreenAtmosphere[atmosphere] ?? v6Visual.canvas)} />
      <div className={v6Cx("pointer-events-none fixed inset-0 z-0 opacity-14 mix-blend-screen", v6Visual.curtain)} />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-32 bg-[linear-gradient(180deg,rgba(255,247,223,0.052),transparent)]" />
      <div className="pointer-events-none fixed bottom-[-7.5rem] left-1/2 z-0 h-60 w-[min(90vw,420px)] -translate-x-1/2 rounded-t-full bg-[radial-gradient(ellipse_at_center,rgba(244,213,141,0.095),rgba(100,28,63,0.060)_42%,transparent_72%)] blur-sm" />
      <div
        className="relative z-10 mx-auto w-full max-w-[430px] pb-[calc(var(--nav-bar-height)+var(--safe-bottom)+0.95rem)] pe-[max(0.5rem,var(--safe-left))] ps-[max(0.5rem,var(--safe-right))] pt-[calc(max(0.32rem,var(--safe-top))+0.12rem)] sm:px-5 md:max-w-5xl"
        style={{ minHeight: "var(--app-height)" }}
      >
        <header className="sticky top-[calc(max(0.24rem,var(--safe-top))+0.08rem)] z-40 mb-2 px-0 pb-3 pt-1 text-start">
          <div className="flex items-center justify-between gap-2">
            <div className={v6Cx(v6Lovable.card, "flex min-w-0 flex-1 items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5")}>
              <div className={v6Cx("grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br text-sm font-semibold text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]", v6Tone[tone].grad, v6Tone[tone].text)}>{user.name.slice(0, 1)}</div>
              <div className="min-w-0 flex-1">
                <SafeMeta as="p" className={v6Lovable.eyebrow}>{roleLabel[user.role]}</SafeMeta>
                <SafeTitle as="p" className="truncate text-sm font-medium text-white/90">{user.name}</SafeTitle>
              </div>
            </div>
            <button onClick={onLogout} className={v6Cx(v6Lovable.card, "lk-safe-control grid h-10 shrink-0 place-items-center rounded-full px-3 text-[10px] font-semibold text-white/58", v6Motion.standard, v6Motion.pressSoft, v6Motion.focusRing)}>יציאה</button>
          </div>
          {studioName ? (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-white/42">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" aria-hidden="true" />
              <SafeMeta as="span">{studioName}</SafeMeta>
            </div>
          ) : null}
        </header>
        <motion.main
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          layout="position"
          transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-full md:max-w-5xl"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

export function BottomNavDock({ tab, unread, onTab }: { tab: V6Tab; unread: number; onTab: (tab: V6Tab) => void }) {
  const reduceMotion = useReducedMotion();
  const items: Array<{ id: V6Tab; label: string; icon: ElementType }> = [
    { id: "dashboard", label: "בית", icon: Sparkles },
    { id: "lessons", label: "שיעורים", icon: CalendarDays },
    { id: "messages", label: "פעילות", icon: Bell },
    { id: "shop", label: "חנות", icon: ShoppingBag },
    { id: "more", label: "עוד", icon: Users }
  ];
  return (
    <nav dir="rtl" aria-label="ניווט ראשי" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3" style={{ paddingBottom: "max(0.45rem, calc(var(--safe-bottom) + 0.16rem))" }}>
      <div className={v6Cx(v6Lovable.cardStrong, "pointer-events-auto flex w-full max-w-md items-center justify-between gap-1 px-2 py-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]")}>
        {items.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onClick={() => onTab(item.id)}
              className={v6Cx("relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors", v6Motion.standard, v6Motion.pressSoft, v6Motion.focusRing, active ? "text-white/92" : "text-white/44")}
            >
              {active ? (
                <motion.span
                  layoutId="v6-bottom-nav-active"
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-white/8"
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
                />
              ) : null}
              <span className="relative flex items-center justify-center">
                <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
                {item.id === "messages" && unread ? <BadgeCount value={unread > 9 ? "9+" : unread} label={V6_ACTIVITY_COPY.unreadBadgeLabel(unread)} className="absolute -left-1.5 -top-1 min-h-4 min-w-4 bg-rose-300 px-1 text-[9px] text-zinc-950 shadow-[0_0_0_2px_rgba(8,5,6,0.92)]" /> : null}
              </span>
              <span className="relative">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
