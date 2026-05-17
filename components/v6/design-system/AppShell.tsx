"use client";

import { type ElementType, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MessageCircle, ShoppingBag, Sparkles, Users } from "lucide-react";
import { roleLabel } from "@/lib/v6/seed";
import type { V6Tab, V6User } from "@/lib/v6/types";
import { v6Cx, v6ScreenAtmosphere, v6Tone, v6Visual, type V6Tone } from "./tokens";
import { BadgeCount, RtlText } from "./primitives";

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
    <div suppressHydrationWarning className="min-h-[var(--app-height)] overflow-x-hidden bg-[#050304] text-white" dir="rtl">
      <div className={v6Cx("pointer-events-none fixed inset-0 z-0 transition-colors duration-500", v6ScreenAtmosphere[atmosphere] ?? v6Visual.canvas)} />
      <div className={v6Cx("pointer-events-none fixed inset-0 z-0 opacity-10 mix-blend-screen", v6Visual.curtain)} />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-36 bg-[linear-gradient(180deg,rgba(255,247,223,0.034),transparent)]" />
      <div
        className="relative z-10 mx-auto w-full max-w-[430px] px-4 pb-[calc(14rem+env(safe-area-inset-bottom,0px))] pt-[calc(0.85rem+env(safe-area-inset-top,0px))] sm:px-5 md:max-w-5xl"
        style={{ minHeight: "calc(var(--app-height) + 14rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="sticky top-[calc(0.55rem+env(safe-area-inset-top,0px))] z-40 mb-5 flex min-h-[58px] items-center gap-3 rounded-[28px] border border-[rgba(255,255,255,0.046)] bg-[rgba(8,5,6,0.70)] px-3.5 py-2 text-start shadow-[0_14px_42px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-xl">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-[18px] text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.060)]", v6Tone[tone].soft, v6Tone[tone].text)}>{user.name.slice(0, 1)}</div>
            <div className="min-w-0 flex-1">
              <RtlText as="p" className="truncate text-[15px] font-semibold tracking-[-0.020em]">{user.name}</RtlText>
              <RtlText as="p" className="truncate text-[11px] font-medium text-white/38">{roleLabel[user.role]} · {studioName}</RtlText>
            </div>
          </div>
          <button onClick={onLogout} className="min-h-10 shrink-0 rounded-full border border-[rgba(255,255,255,0.038)] bg-white/[0.030] px-3.5 py-2 text-xs font-semibold text-white/48 transition active:scale-95">יציאה</button>
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
    <nav className="fixed left-1/2 z-50 -translate-x-1/2" style={{ bottom: "max(0.58rem, env(safe-area-inset-bottom, 0px))", width: "min(calc(100vw - 24px), 404px)" }}>
      <div className="grid w-full grid-cols-5 gap-1 rounded-[31px] border border-[rgba(255,255,255,0.056)] bg-[rgba(8,5,6,0.86)] p-1.5 shadow-[0_20px_58px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.064)] backdrop-blur-xl">
        {items.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => onTab(item.id)} className={v6Cx("relative grid min-h-[50px] place-items-center rounded-[23px] text-[9.5px] font-semibold leading-none transition duration-200 active:scale-95", active ? "bg-[linear-gradient(135deg,#fff8e8,#f4d58d_58%,#dfffee)] text-zinc-950 shadow-[0_10px_24px_rgba(215,181,109,0.12),inset_0_1px_0_rgba(255,255,255,0.52)]" : "text-white/40 hover:text-white/64")}>
              <span className={v6Cx("relative grid h-6 w-6 place-items-center rounded-full", active && "bg-zinc-950/8")}>
                <Icon size={15} />
                {item.id === "messages" && unread ? <BadgeCount value={unread > 9 ? "9+" : unread} label={`${unread} הודעות שלא נקראו`} className="absolute -left-2 -top-1 bg-rose-300 text-rose-950 shadow-[0_0_0_2px_rgba(8,5,6,0.86)]" /> : null}
              </span>
              <span className="-mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
