"use client";

import { type ElementType, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MessageCircle, ShoppingBag, Sparkles, Users } from "lucide-react";
import { roleLabel } from "@/lib/v6/seed";
import type { V6Tab, V6User } from "@/lib/v6/types";
import { v6Cx, v6ScreenAtmosphere, v6Tone, v6Type, v6Visual, type V6Tone } from "./tokens";
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
  return (
    <div suppressHydrationWarning className="min-h-[var(--app-height)] overflow-x-hidden bg-[#020102] text-white" dir="rtl">
      <div className={v6Cx("pointer-events-none fixed inset-0 z-0 transition-colors duration-500", v6ScreenAtmosphere[atmosphere] ?? v6Visual.canvas)} />
      <div className={v6Cx("pointer-events-none fixed inset-0 z-0 opacity-14 mix-blend-screen", v6Visual.curtain)} />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-28 bg-[linear-gradient(180deg,rgba(255,247,223,0.040),transparent)]" />
      <div className="pointer-events-none fixed bottom-[-8rem] left-1/2 z-0 h-56 w-[min(86vw,390px)] -translate-x-1/2 rounded-t-full bg-[radial-gradient(ellipse_at_center,rgba(244,213,141,0.060),rgba(100,28,63,0.045)_42%,transparent_72%)] blur-sm" />
      <div
        className="relative z-10 mx-auto w-full max-w-[430px] px-2.5 pb-[calc(5.3rem+env(safe-area-inset-bottom,0px))] pt-[calc(0.28rem+env(safe-area-inset-top,0px))] sm:px-5 md:max-w-5xl"
        style={{ minHeight: "var(--app-height)" }}
      >
        <header className="sticky top-[calc(0.22rem+env(safe-area-inset-top,0px))] z-40 mb-1 flex min-h-[32px] items-center gap-2 rounded-[13px] border border-[#f4d58d]/5 bg-[#050304]/58 px-2 py-0.5 text-start shadow-[0_5px_14px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,247,223,0.026)] backdrop-blur-xl">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className={v6Cx("grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#f4d58d]/7 text-[10px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]", v6Tone[tone].soft, v6Tone[tone].text)}>{user.name.slice(0, 1)}</div>
            <div className="min-w-0 flex-1">
              <SafeTitle as="p" className="truncate text-[11.5px] font-semibold tracking-[-0.010em] text-white/82">{user.name}</SafeTitle>
              <SafeMeta as="p" className={v6Cx("mt-px truncate text-[9px] min-[420px]:text-[10px]", v6Type.metadata)}>{roleLabel[user.role]} · {studioName}</SafeMeta>
            </div>
          </div>
          <button onClick={onLogout} className="lk-safe-control min-h-6 shrink-0 rounded-full border border-[#f4d58d]/5 bg-white/[0.014] px-2 py-0.5 text-[9px] font-semibold text-white/42 shadow-[inset_0_1px_0_rgba(255,247,223,0.020)] transition active:scale-95 hover:text-white/70">יציאה</button>
        </header>
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
    <nav dir="rtl" aria-label="ניווט ראשי" className="pointer-events-none fixed left-1/2 z-50 -translate-x-1/2" style={{ bottom: "max(0.30rem, env(safe-area-inset-bottom, 0px))", width: "min(calc(100vw - 42px), 326px)" }}>
      <div className="lk-safe-surface pointer-events-auto relative grid w-full grid-cols-5 items-stretch gap-px overflow-hidden rounded-[16px] border border-[rgba(244,213,141,0.046)] bg-[linear-gradient(180deg,rgba(14,10,10,0.66),rgba(6,4,5,0.78))] p-0.5 shadow-[0_5px_16px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,247,223,0.038)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-l from-transparent via-[#f4d58d]/14 to-transparent" />
        <div className="pointer-events-none absolute inset-x-12 bottom-0 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
        {items.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} type="button" aria-current={active ? "page" : undefined} onClick={() => onTab(item.id)} className={v6Cx("lk-safe-control relative flex min-h-[34px] min-w-0 flex-col items-center justify-center gap-px rounded-[12px] px-1 py-0.5 text-[8.5px] font-semibold transition duration-200 active:scale-95", active ? "bg-white/[0.026] text-[#fff7df] shadow-[inset_0_1px_0_rgba(255,247,223,0.042)]" : "text-white/44 hover:bg-white/[0.016] hover:text-white/68")}>
              <span className="relative grid h-[18px] w-[18px] place-items-center rounded-full transition">
                <Icon size={11.5} strokeWidth={active ? 1.85 : 1.5} />
                {item.id === "messages" && unread ? <BadgeCount value={unread > 9 ? "9+" : unread} label={`${unread} הודעות שלא נקראו`} className="absolute -left-2 -top-1 bg-rose-200 text-rose-950 shadow-[0_0_0_2px_rgba(8,5,6,0.90),0_6px_16px_rgba(244,63,94,0.18)]" /> : null}
              </span>
              <span className={v6Cx("lk-safe-meta max-w-full text-center text-[8.5px] leading-tight tracking-[-0.006em]", active ? "text-white/78" : "text-white/48")}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
