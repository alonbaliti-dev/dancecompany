"use client";

import { type ElementType, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, MessageCircle, ShoppingBag, Sparkles, Users } from "lucide-react";
import { roleLabel } from "@/lib/v6/seed";
import type { V6Tab, V6User } from "@/lib/v6/types";
import { v6Cx, v6Motion, v6ScreenAtmosphere, v6Tone, v6Type, v6Visual, type V6Tone } from "./tokens";
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
        <header className="sticky top-[calc(max(0.24rem,var(--safe-top))+0.08rem)] z-40 mb-2 flex min-h-[40px] items-center gap-2 rounded-[18px] border border-[#f4d58d]/[0.055] bg-[linear-gradient(180deg,rgba(12,8,9,0.72),rgba(5,3,4,0.56))] px-2.5 py-1 text-start shadow-[0_10px_28px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,247,223,0.045)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-[#f4d58d]/14 to-transparent" />
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className={v6Cx("grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#f4d58d]/10 text-[10px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.060)]", v6Tone[tone].soft, v6Tone[tone].text)}>{user.name.slice(0, 1)}</div>
            <div className="min-w-0 flex-1">
              <SafeTitle as="p" className="truncate text-[12.5px] font-semibold leading-tight tracking-[-0.014em] text-white/88">{user.name}</SafeTitle>
              <SafeMeta as="p" className={v6Cx("mt-0.5 truncate text-[9.5px] min-[420px]:text-[10px]", v6Type.metadata)}>{roleLabel[user.role]} · {studioName}</SafeMeta>
            </div>
          </div>
          <button onClick={onLogout} className={v6Cx("lk-safe-control min-h-8 shrink-0 rounded-full border border-[#f4d58d]/[0.065] bg-white/[0.020] px-2.5 py-1 text-[10px] font-semibold text-white/50 shadow-[inset_0_1px_0_rgba(255,247,223,0.035)] hover:text-white/78", v6Motion.standard, v6Motion.pressSoft, v6Motion.focusRing)}>יציאה</button>
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
    { id: "messages", label: "הודעות", icon: MessageCircle },
    { id: "shop", label: "חנות", icon: ShoppingBag },
    { id: "more", label: "עוד", icon: Users }
  ];
  return (
    <nav
      dir="rtl"
      aria-label="ניווט ראשי"
      className="pointer-events-none fixed left-1/2 z-50 -translate-x-1/2"
      style={{ bottom: "max(0.45rem, calc(var(--safe-bottom) + 0.16rem))", width: "min(calc(100vw - 28px - var(--safe-left) - var(--safe-right)), 360px)" }}
    >
      <div className="lk-safe-surface pointer-events-auto relative grid w-full grid-cols-5 items-stretch gap-1 overflow-hidden rounded-[25px] border border-[rgba(244,213,141,0.074)] bg-[linear-gradient(180deg,rgba(22,16,17,0.76),rgba(7,5,6,0.82))] p-1.5 shadow-[0_16px_46px_rgba(0,0,0,0.36),0_8px_28px_rgba(244,213,141,0.026),inset_0_1px_0_rgba(255,247,223,0.065)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-[#f4d58d]/22 to-transparent" />
        <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-l from-transparent via-white/12 to-transparent" />
        <div className="pointer-events-none absolute inset-x-3 bottom-1 h-6 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,247,223,0.050),transparent_72%)]" />
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
              className={v6Cx("lk-safe-control group relative flex min-h-[46px] min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-[19px] px-1.5 py-1 text-[9px] font-semibold", v6Motion.standard, v6Motion.pressSoft, v6Motion.focusRing, active ? "text-[#fff7df]" : "text-white/43 hover:bg-white/[0.018] hover:text-white/68")}
            >
              {active ? (
                <motion.span
                  layoutId="v6-bottom-nav-active"
                  className="pointer-events-none absolute inset-0 rounded-[19px] border border-[#f4d58d]/[0.075] bg-[linear-gradient(180deg,rgba(255,247,223,0.090),rgba(255,255,255,0.026))] shadow-[inset_0_1px_0_rgba(255,247,223,0.075)]"
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 430, damping: 34, mass: 0.55 }}
                />
              ) : null}
              <span className={v6Cx("pointer-events-none absolute top-1 h-0.5 w-5 rounded-full bg-[#f4d58d] transition-opacity duration-200", active ? "opacity-70" : "opacity-0")} />
              <span className={v6Cx("relative grid h-5 w-5 place-items-center rounded-full transition-transform duration-200", active ? "scale-105 text-[#fff7df]" : "text-white/50 group-hover:text-white/72 motion-safe:group-hover:-translate-y-0.5")}>
                <Icon size={15.5} strokeWidth={active ? 2.05 : 1.65} />
                {item.id === "messages" && unread ? <BadgeCount value={unread > 9 ? "9+" : unread} label={`${unread} הודעות שלא נקראו`} className="absolute -left-2.5 -top-1.5 min-h-[15px] min-w-[15px] bg-rose-200 px-1 text-[8.5px] text-rose-950 shadow-[0_0_0_2px_rgba(8,5,6,0.92),0_6px_16px_rgba(244,63,94,0.20)]" /> : null}
              </span>
              <span className={v6Cx("lk-safe-meta relative max-w-full text-center text-[9px] leading-tight tracking-[-0.006em]", active ? "text-white/82" : "text-white/48")}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
