"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, ChevronDown, ChevronUp, ClipboardList, Flame, Target } from "lucide-react";
import { useStudioData } from "@/context/StudioDataContext";
import {
  isDueThisWeek,
  isDueToday,
  progressPercentForStudent,
  statusForStudent,
  taskVisibleToStudent,
  updateVisibleToStudent
} from "@/lib/studio-task-logic";
import type { StudentTask, StudioUpdate, TaskFrequency, UserProfile } from "@/lib/types";
import { Card, Header, Pill, PrimaryButton, ProgressBar, RingStat, SectionEyebrow, SectionTitle, GhostButton, cx } from "./ui";

const freqLabel: Record<TaskFrequency, string> = {
  once: "חד־פעמי",
  daily: "יומי",
  weekly: "שבועי",
  custom: "מותאם"
};

const statusBadge: Record<StudentTask["status"], { label: string; className: string }> = {
  not_started: { label: "טרם התחיל", className: "border-white/12 bg-white/[0.06] text-white/48" },
  in_progress: { label: "בתהליך", className: "border-emerald-400/25 bg-emerald-400/12 text-emerald-100/95" },
  completed: { label: "הושלם", className: "border-emerald-400/30 bg-emerald-500/15 text-emerald-50" },
  overdue: { label: "באיחור", className: "border-rose-400/28 bg-rose-500/12 text-rose-100/95" }
};

const targetLabel: Record<StudentTask["targetType"], string> = {
  personal: "אישי",
  group: "קבוצה",
  studio: "סטודיו"
};

function priorityStyle(p: StudioUpdate["priority"]) {
  if (p === "urgent") return "border-rose-400/35 bg-rose-500/12 text-rose-100";
  if (p === "important") return "border-amber-400/35 bg-amber-500/12 text-amber-50";
  return "border-white/12 bg-white/[0.06] text-white/55";
}

function UpdateCard({
  u,
  user,
  onRead
}: {
  u: StudioUpdate;
  user: UserProfile;
  onRead: () => void;
}) {
  const [open, setOpen] = useState(false);
  const unread = !u.readByUserIds.includes(user.id);
  return (
    <Card animated={false} className={cx("!p-0 overflow-hidden", unread && "border-emerald-400/18")}>
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-4 text-right transition hover:bg-white/[0.03]"
        onClick={() => {
          setOpen((v) => !v);
          if (unread) onRead();
        }}
      >
        <div className="mt-1 shrink-0 text-white/35">{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {unread ? <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">חדש</span> : null}
            <span className={cx("rounded-full border px-2 py-0.5 text-[10px] font-semibold", priorityStyle(u.priority))}>
              {u.priority === "urgent" ? "דחוף" : u.priority === "important" ? "חשוב" : "רגיל"}
            </span>
            <span className="text-[10px] text-white/35">{new Date(u.createdAt).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}</span>
          </div>
          <p className="mt-2 font-semibold text-white">{u.title}</p>
          <p className="mt-1 text-[12px] text-white/42">מאת {u.createdByName}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
          <Bell className="text-white/55" size={18} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/[0.06]">
            <p className="px-4 py-4 text-right text-[14px] leading-relaxed text-white/55">{u.body}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}

function StudentTaskCard({
  task,
  user,
  onProgress,
  onComplete
}: {
  task: StudentTask;
  user: UserProfile;
  onProgress: () => void;
  onComplete: () => void;
}) {
  const pct = progressPercentForStudent(task, user.id);
  const st = statusForStudent(task, user.id);
  const badge = statusBadge[st];
  const done = pct >= 100 || st === "completed";
  const dueStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString("he-IL") : "ללא תאריך יעד";

  return (
    <Card animated={false} className={cx(done && "opacity-[0.88]")}>
      <div className="text-right">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className={cx("rounded-full border px-2.5 py-1 text-[10px] font-semibold", badge.className)}>{badge.label}</span>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium text-white/45">{targetLabel[task.targetType]}</span>
          <Pill icon={ClipboardList}>+{task.xpReward} XP</Pill>
        </div>
        <p className="mt-3 text-[1.08rem] font-semibold leading-snug text-white">{task.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/48">{task.description}</p>
        <p className="mt-3 text-[11px] text-white/38">
          הוקצה על ידי {task.createdByName} · {freqLabel[task.frequency]}
          {task.timesPerWeek ? ` · ${task.timesPerWeek}× בשבוע` : ""}
        </p>
        {task.relatedGoal ? (
          <p className="mt-1 flex items-center justify-end gap-1.5 text-[11px] text-emerald-200/65">
            <Target size={12} />
            יעד: {task.relatedGoal}
          </p>
        ) : null}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-white/42">
            <span className="tabular-nums font-medium text-white/65">
              {Math.min(task.targetCompletions, task.targetType === "personal" ? task.completedCount : task.perStudentCompletions?.[user.id] ?? 0)} / {task.targetCompletions}
            </span>
            <span>יעד ביצועים</span>
          </div>
          <ProgressBar value={pct} />
        </div>
        <p className="mt-3 text-[12px] text-white/40">יעד: {dueStr}</p>
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <GhostButton className="!py-3 !text-[13px] !font-semibold" disabled={done} onClick={onProgress}>
            עדכנתי ביצוע
          </GhostButton>
          <PrimaryButton className="!py-3 !text-[13px]" disabled={done} onClick={onComplete}>
            סיימתי
          </PrimaryButton>
        </div>
      </div>
    </Card>
  );
}

function sectionTitle(id: string) {
  const titles: Record<string, string> = {
    today: "היום",
    week: "השבוע",
    personal: "משימות אישיות",
    group: "משימות קבוצה",
    done: "הושלמו"
  };
  return titles[id] ?? id;
}

export function TasksScreen() {
  const { user, tasks, updates, recordTaskProgress, completeTask, markUpdateRead } = useStudioData();

  const visibleUpdates = useMemo(() => updates.filter((u) => updateVisibleToStudent(u, user)).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [updates, user]);

  const enriched = useMemo(() => {
    return tasks
      .filter((t) => taskVisibleToStudent(t, user))
      .map((t) => ({
        t,
        st: statusForStudent(t, user.id),
        pct: progressPercentForStudent(t, user.id)
      }));
  }, [tasks, user]);

  const summary = useMemo(() => {
    const active = enriched.filter((x) => x.st !== "completed" && x.pct < 100);
    const overdue = enriched.filter((x) => x.st === "overdue");
    const completedThisWeek = enriched.filter(
      (x) => x.st === "completed" && (x.t.dueDate ? isDueThisWeek(x.t.dueDate) || isDueToday(x.t.dueDate) : false)
    );
    const withGoal = enriched.filter((x) => x.t.relatedGoal);
    const goalAvg =
      withGoal.length > 0 ? Math.round(withGoal.reduce((s, x) => s + x.pct, 0) / withGoal.length) : enriched.length ? Math.round(enriched.reduce((s, x) => s + x.pct, 0) / enriched.length) : 0;
    return {
      activeCount: active.length,
      overdueCount: overdue.length,
      completedWeekCount: completedThisWeek.length,
      goalAvg
    };
  }, [enriched]);

  const today = enriched.filter((x) => x.st !== "completed" && x.pct < 100 && x.t.dueDate && isDueToday(x.t.dueDate));
  const week = enriched.filter(
    (x) =>
      x.st !== "completed" &&
      x.pct < 100 &&
      x.t.dueDate &&
      isDueThisWeek(x.t.dueDate) &&
      !isDueToday(x.t.dueDate)
  );
  const personal = enriched.filter((x) => x.t.targetType === "personal" && x.st !== "completed" && x.pct < 100);
  const group = enriched.filter((x) => x.t.targetType === "group" && x.st !== "completed" && x.pct < 100);
  const completed = enriched.filter((x) => x.st === "completed" || x.pct >= 100);

  const renderList = (list: typeof enriched) => (
    <div className="space-y-3.5">
      {list.length === 0 ? <p className="py-6 text-center text-sm text-white/38">אין פריטים בסעיף זה</p> : null}
      {list.map(({ t }) => (
        <StudentTaskCard key={t.id} task={t} user={user} onProgress={() => recordTaskProgress(t.id)} onComplete={() => completeTask(t.id)} />
      ))}
    </div>
  );

  return (
    <div className="space-y-10 pb-6">
      <Header title="משימות ועדכונים" subtitle="מה מיועד אליך, לפי קבוצות והרשאות בחשבון." />

      <Card animated={false}>
        <div className="flex flex-col items-stretch gap-8 sm:flex-row sm:items-center sm:justify-between">
          <RingStat value={summary.goalAvg} label="התקדמות ליעדים" size={84} />
          <div className="grid flex-1 grid-cols-2 gap-3 text-right">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-3">
              <p className="text-[11px] text-white/40">הושלמו השבוע</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white">{summary.completedWeekCount}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-3">
              <p className="text-[11px] text-white/40">משימות פעילות</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-200/95">{summary.activeCount}</p>
            </div>
            <div className="rounded-2xl border border-rose-400/15 bg-rose-500/[0.06] px-3 py-3">
              <p className="text-[11px] text-rose-200/55">באיחור</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-rose-100">{summary.overdueCount}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-3">
              <p className="text-[11px] text-white/40">סה״כ בטיפול</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white">{enriched.length}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-end gap-2 text-[11px] text-white/38">
            <Flame size={14} className="text-emerald-300/80" />
            <span>ממוצע התקדמות לפי משימות עם יעד מוגדר</span>
          </div>
          <ProgressBar value={summary.goalAvg} />
        </div>
      </Card>

      <section className="space-y-3">
        <SectionEyebrow>עדכונים</SectionEyebrow>
        <SectionTitle className="mt-0.5">מה חשוב לדעת</SectionTitle>
        <div className="mt-4 space-y-3">
          {visibleUpdates.length === 0 ? <p className="text-center text-sm text-white/38">אין עדכונים כרגע</p> : null}
          {visibleUpdates.map((u) => (
            <UpdateCard key={u.id} u={u} user={user} onRead={() => markUpdateRead(u.id)} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionEyebrow>{sectionTitle("today")}</SectionEyebrow>
        <SectionTitle className="mt-0.5">לטפל היום</SectionTitle>
        {renderList(today)}
      </section>

      <section className="space-y-3">
        <SectionEyebrow>{sectionTitle("week")}</SectionEyebrow>
        <SectionTitle className="mt-0.5">השבוע</SectionTitle>
        {renderList(week)}
      </section>

      <section className="space-y-3">
        <SectionTitle>{sectionTitle("personal")}</SectionTitle>
        {renderList(personal)}
      </section>

      <section className="space-y-3">
        <SectionTitle>{sectionTitle("group")}</SectionTitle>
        {renderList(group)}
      </section>

      <section className="space-y-3">
        <SectionEyebrow>ארכיון</SectionEyebrow>
        <SectionTitle className="mt-0.5">{sectionTitle("done")}</SectionTitle>
        <div className="space-y-3">
          {completed.length === 0 ? <p className="py-4 text-center text-sm text-white/38">עדיין אין משימות שהושלמו</p> : null}
          {completed.map(({ t }) => (
            <Card key={t.id} animated={false} className="opacity-[0.9]">
              <div className="flex items-start gap-3 text-right">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={22} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{t.title}</p>
                  <p className="mt-1 text-[12px] text-white/42">
                    {t.createdByName} · +{t.xpReward} XP · {freqLabel[t.frequency]}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Compact task blocks for the Practice hub (Apple Fitness–style weekly flow). */
export function PracticeTasksSection() {
  const { user, tasks, recordTaskProgress, completeTask } = useStudioData();

  const enriched = useMemo(() => {
    return tasks
      .filter((t) => taskVisibleToStudent(t, user))
      .map((t) => ({
        t,
        st: statusForStudent(t, user.id),
        pct: progressPercentForStudent(t, user.id)
      }));
  }, [tasks, user]);

  const overdue = enriched.filter((x) => x.st === "overdue");
  const today = enriched.filter((x) => x.st !== "completed" && x.pct < 100 && x.t.dueDate && isDueToday(x.t.dueDate));
  const active = enriched.filter(
    (x) => x.st !== "completed" && x.pct < 100 && (!x.t.dueDate || !isDueToday(x.t.dueDate))
  );

  const renderList = (list: typeof enriched) => (
    <div className="space-y-3">
      {list.length === 0 ? <p className="py-5 text-center text-sm text-white/36">אין פריטים כאן כרגע.</p> : null}
      {list.map(({ t }) => (
        <StudentTaskCard key={t.id} task={t} user={user} onProgress={() => recordTaskProgress(t.id)} onComplete={() => completeTask(t.id)} />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <SectionEyebrow>משימות</SectionEyebrow>
        <SectionTitle className="mt-0.5">מה שמחובר ליעדים שלך</SectionTitle>
        <p className="mt-2 text-right text-sm text-white/42">תרגול ביתי ומשימות מהמורה — מסודר לפי דחיפות.</p>
      </div>
      {overdue.length ? (
        <div>
          <p className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-200/70">באיחור</p>
          {renderList(overdue)}
        </div>
      ) : null}
      <div>
        <SectionEyebrow>היום</SectionEyebrow>
        {renderList(today)}
      </div>
      <div>
        <SectionEyebrow>בהמשך</SectionEyebrow>
        {renderList(active.filter((x) => !today.some((y) => y.t.id === x.t.id) && !overdue.some((y) => y.t.id === x.t.id)).slice(0, 6))}
      </div>
    </div>
  );
}
