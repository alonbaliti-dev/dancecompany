"use client";
import { getDirectoryUsers } from "@/lib/directory-store";
import { getStudioGroups } from "@/lib/studio-groups-access";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


import type { MainTabId, StackTabId, StudentTask, StudioUpdate, UserProfile } from "@/lib/types";
import { taskVisibleToStudent, updateVisibleToStudent } from "@/lib/studio-task-logic";

export type CommandJump = { type: "main" | "stack"; target: MainTabId | StackTabId };

export function CommandPalette({
  open,
  onClose,
  user,
  tasks,
  updates,
  onJump
}: {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  tasks: StudentTask[];
  updates: StudioUpdate[];
  onJump: (j: CommandJump) => void;
}) {
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const rows: { id: string; title: string; sub: string; jump: CommandJump; hay: string }[] = [];

    getDirectoryUsers()
      .filter((u) => !u.permissions.isManagement || u.id === user.id)
      .forEach((u) => {
        rows.push({
          id: `dir-${u.id}`,
          title: u.name,
          sub: "תלמיד / משתמש",
          jump: { type: "stack", target: "users" },
          hay: `${u.name} ${u.phone}`.toLowerCase()
        });
      });

    getStudioGroups().forEach((g) => {
      rows.push({
        id: `grp-${g.id}`,
        title: g.name,
        sub: "קבוצה",
        jump: { type: "main", target: "lessons" },
        hay: g.name.toLowerCase()
      });
    });

    tasks
      .filter((t) => taskVisibleToStudent(t, user))
      .forEach((t) => {
        rows.push({
          id: `task-${t.id}`,
          title: t.title,
          sub: "משימה",
          jump: { type: "stack", target: "tasks_hub" },
          hay: `${t.title} ${t.description}`.toLowerCase()
        });
      });

    updates
      .filter((u) => updateVisibleToStudent(u, user))
      .forEach((u) => {
        rows.push({
          id: `up-${u.id}`,
          title: u.title,
          sub: "עדכון",
          jump: { type: "main", target: "messages" },
          hay: `${u.title} ${u.body}`.toLowerCase()
        });
      });

    if (user.permissions.isTeacher || user.permissions.isManagement) {
      rows.push(
        { id: "tool-t", title: "מרכז מורה", sub: "כלי", jump: { type: "stack", target: "teacher" }, hay: "מורה" },
        { id: "tool-a", title: "נוכחות", sub: "כלי", jump: { type: "stack", target: "attendance" }, hay: "נוכחות" },
        { id: "tool-att-int", title: "מעקב נוכחות", sub: "כלי", jump: { type: "stack", target: "attendance_intelligence" }, hay: "מעקב נוכחות חיסורים" },
        { id: "tool-f", title: "תיקים דיגיטליים", sub: "כלי", jump: { type: "stack", target: "files" }, hay: "תיק" },
        { id: "tool-ai", title: "כלי AI", sub: "כלי", jump: { type: "stack", target: "ai" }, hay: "ai" }
      );
    }
    if (user.permissions.isManagement) {
      rows.push(
        { id: "tool-m", title: "ניהול", sub: "כלי", jump: { type: "stack", target: "management" }, hay: "ניהול" },
        { id: "tool-r", title: "דוחות", sub: "כלי", jump: { type: "stack", target: "reports" }, hay: "דוח" }
      );
    }

    rows.push({ id: "dash", title: "דשבורד", sub: "מרכז יומי", jump: { type: "main", target: "dashboard" }, hay: "דשבורד dashboard" });

    if (!ql) return rows.slice(0, 14);
    return rows.filter((r) => r.hay.includes(ql)).slice(0, 20);
  }, [q, user, tasks, updates]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-safe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" className="overlay-dim overlay-blur-md absolute inset-0" aria-label="סגירה" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="relative z-[71] w-full max-w-md overflow-hidden rounded-[22px] border border-white/[0.1] bg-[#0b0b0e] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
              <Search className="shrink-0 text-white/35" size={20} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="חיפוש — תלמיד, קבוצה, משימה, עדכון..."
                className="min-w-0 flex-1 bg-transparent py-2 text-right text-base text-white outline-none placeholder:text-white/30 touch-manipulation"
              />
            </div>
            <div className="max-h-[min(70vh,24rem)] overflow-y-auto overscroll-contain py-2">
              {items.length === 0 ? <p className="px-4 py-10 text-center text-sm text-white/38">לא נמצאו תוצאות</p> : null}
              {items.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onJump(r.jump);
                    onClose();
                    setQ("");
                  }}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right transition hover:bg-white/[0.04]"
                >
                  <span className="text-[11px] text-white/35">{r.sub}</span>
                  <span className="min-w-0 flex-1 font-medium text-white">{r.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
