"use client";

import { type ElementType, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MessageCircle, ShoppingBag, Sparkles, Users } from "lucide-react";
import { roleLabel } from "@/lib/v6/seed";
import type { V6Tab, V6User } from "@/lib/v6/types";
import { v6Cx, v6ScreenAtmosphere, v6Surface, v6Tone, v6Type, v6Visual, type V6Tone } from "./tokens";
import { BadgeCount, SafeMeta, SafeTitle, SurfaceContent } from "./primitives";

function roleTone(role: V6User["role"]): V6Tone {
  if (role === "super_admin") return "admin";
  if (role === "management") return "management";
  if (role === "teacher") return "studio";
  if (role === "parent") return "classic";
  return "hiphop";
}

export function AppShellFrame({ user, studioName, onLogout, children, atmosphere = "home" }: { user: V6User; studioName?: string; onLogout: () => void; children: ReactNode; atmosphere?: keyof typeof v6ScreenAtmosphere }) {
  const tone = roleTone(user.role);
  return (
    <div suppressHydrationWarning className="min-h-[var(--app-height)] overflow-x-hidden bg-[#030203] text-white" dir="rtl">
      <div className={v6Cx("pointer-events-none fixed inset-0 z-0 transition-colors duration-500", v6ScreenAtmosphere[atmosphere] ?? v6Visual.canvas)} />
      <div className={v6Cx("pointer-events-none fixed inset-0 z-0 opacity-12 mix-blend-screen", v6Visual.curtain)} />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-44 bg-[linear-gradient(180deg,rgba(255,247,223,0.052),transparent)]" />
      <div className="pointer-events-none fixed bottom-[-8rem] left-1/2 z-0 h-64 w-[min(88vw,410px)] -translate-x-1/2 rounded-t-full bg-[radial-gradient(ellipse_at_center,rgba(244,213,141,0.08),rgba(100,28,63,0.06)_42%,transparent_72%)] blur-sm" />
      <div
        className="relative z-10 mx-auto w-full max-w-[430px] px-4 pb-[calc(13.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(0.9rem+env(safe-area-inset-top,0px))] sm:px-5 md:max-w-5xl"
        style={{ minHeight: "var(--app-height)" }}
      >
        <div className={v6Cx("lk-safe-surface sticky top-[calc(0.55rem+env(safe-area-inset-top,0px))] z-40 mb-6 rounded-[32px] border px-3.5 py-2 text-start", v6Surface.base)}>
          <SurfaceContent className="flex min-h-[62px] items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.052)]", v6Tone[tone].soft, v6Tone[tone].text)}>{user.name.slice(0, 1)}</div>
            <div className="min-w-0 flex-1">
              <SafeTitle as="p" className="text-[15px] font-semibold tracking-[-0.020em] text-white/90">{user.name}</SafeTitle>
              <SafeMeta as="p" className={v6Cx("mt-0.5", v6Type.metadata)}>{roleLabel[user.role]} · {studioName}</SafeMeta>
            </div>
          </div>
          <button onClick={onLogout} className="lk-safe-control min-h-10 shrink-0 rounded-full bg-white/[0.026] px-3.5 py-2 text-xs font-semibold text-white/48 transition active:scale-95">יציאה</button>
          </SurfaceContent>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="mx-auto w-full max-w-full md:max-w-5xl">
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function BottomNavDock({ tab, unread, onTab }: { tab: V6Tab; unread: number; onTab: (tab: V6Tab) => void }) {
  const items: Array<{ id: V6Tab; label: string; icon: ElementType }> = [
    { id: "dashboard", label: "בית", icon: Sparkles },
    { id: "lessons", label: "שיעורים", icon: CalendarDays },
    { id: "messages", label: "הודעות", icon: MessageCircle },
    { id: "shop", label: "חנות", icon: ShoppingBag },
    { id: "more", label: "עוד", icon: Users }
  ];
  return (
    <nav dir="rtl" aria-label="ניווט ראשי" className="pointer-events-none fixed left-1/2 z-50 -translate-x-1/2" style={{ bottom: "max(0.62rem, env(safe-area-inset-bottom, 0px))", width: "min(calc(100vw - 24px), 398px)" }}>
      <div className="lk-safe-surface pointer-events-auto relative grid w-full grid-cols-5 items-stretch gap-1 overflow-hidden rounded-[28px] border border-[rgba(244,213,141,0.10)] bg-[rgba(8,5,6,0.91)] p-1.5 shadow-[0_20px_58px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,247,223,0.080)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-l from-transparent via-[#f4d58d]/18 to-transparent" />
        {items.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} type="button" aria-current={active ? "page" : undefined} onClick={() => onTab(item.id)} className={v6Cx("lk-safe-control relative flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-[22px] px-1.5 py-1 text-[10px] font-semibold transition duration-200 active:scale-95", active ? "bg-[linear-gradient(180deg,rgba(244,213,141,0.18),rgba(255,247,223,0.060))] text-[#fff7df] shadow-[inset_0_1px_0_rgba(255,247,223,0.14)]" : "text-white/62 hover:text-white/78")}>
              <span className={v6Cx("relative grid h-7 w-7 place-items-center rounded-full transition", active && "bg-[#f4d58d]/8")}>
                <Icon size={15} strokeWidth={active ? 2.1 : 1.75} />
                {item.id === "messages" && unread ? <BadgeCount value={unread > 9 ? "9+" : unread} label={`${unread} הודעות שלא נקראו`} className="absolute -left-2 -top-1 bg-rose-200 text-rose-950 shadow-[0_0_0_2px_rgba(8,5,6,0.86)]" /> : null}
              </span>
              <span className={v6Cx("lk-safe-meta max-w-full text-center text-[10px] leading-tight tracking-[-0.01em]", active ? "text-white/94" : "text-white/66")}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
