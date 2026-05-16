"use client";

import { type ElementType, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MessageCircle, ShoppingBag, Sparkles, Users } from "lucide-react";
import { roleLabel } from "@/lib/v6/seed";
import type { V6Tab, V6User } from "@/lib/v6/types";
import { v6Cx, v6Tone, type V6Tone } from "./tokens";

function roleTone(role: V6User["role"]): V6Tone {
  if (role === "super_admin") return "admin";
  if (role === "management") return "management";
  if (role === "teacher") return "studio";
  if (role === "parent") return "classic";
  return "hiphop";
}

export function AppShellFrame({ user, studioName, onLogout, children }: { user: V6User; studioName?: string; onLogout: () => void; children: ReactNode }) {
  const tone = roleTone(user.role);
  return (
    <div suppressHydrationWarning className="h-[var(--app-height)] overflow-x-hidden overflow-y-auto bg-[#040405] text-white scroll-touch" dir="rtl">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_90%_40%_at_50%_-12%,rgba(52,211,153,0.14),transparent_56%),radial-gradient(ellipse_52%_36%_at_0%_74%,rgba(217,70,239,0.08),transparent_56%),#040405]" />
      <div className="relative z-10 mx-auto box-border min-h-dynamic w-full max-w-[430px] px-4 pb-[calc(10.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(0.8rem+env(safe-area-inset-top,0px))] sm:px-5 md:max-w-5xl">
        <div className="sticky top-[calc(0.55rem+env(safe-area-inset-top,0px))] z-40 mb-5 flex min-h-[58px] items-center justify-between gap-3 rounded-[28px] border border-white/[0.06] bg-zinc-950/58 px-3.5 py-2.5 shadow-[0_14px_42px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
          <button onClick={onLogout} className="min-h-11 rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-white/62 transition active:scale-95">יציאה</button>
          <div className="flex min-w-0 items-center gap-2.5 text-right">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-[11px] text-white/46">{roleLabel[user.role]} · {studioName}</p>
            </div>
            <div className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-[17px] text-sm font-black", v6Tone[tone].soft, v6Tone[tone].text)}>{user.name.slice(0, 1)}</div>
          </div>
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
      <div className="grid w-full grid-cols-5 gap-1 rounded-[28px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(39,39,42,0.54),rgba(9,9,11,0.78))] p-1.5 shadow-[0_18px_46px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.075)] backdrop-blur-2xl">
        {items.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => onTab(item.id)} className={v6Cx("relative grid min-h-[46px] place-items-center rounded-[21px] text-[9.5px] font-black leading-none transition active:scale-95", active ? "bg-[linear-gradient(135deg,#fff7ed,#d6fff0_54%,#9ae6dd)] text-zinc-950 shadow-[0_9px_20px_rgba(45,212,191,0.16)]" : "text-white/44 hover:text-white/68")}>
              <span className={v6Cx("grid h-5 w-5 place-items-center rounded-full", active && "bg-zinc-950/8")}><Icon size={14} /></span>
              <span className="-mt-0.5">{item.label}</span>
              {item.id === "messages" && unread ? <span className="absolute right-3 top-1.5 h-2 w-2 rounded-full bg-rose-300 shadow-[0_0_14px_rgba(253,164,175,0.9)]" /> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
