"use client";
import { getDirectoryUsers } from "@/lib/directory-store";
import { getStudioGroups } from "@/lib/studio-groups-access";

import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Megaphone, Plus, Users } from "lucide-react";
import { useStudioData } from "@/context/StudioDataContext";

import { getDirectoryStudents, groupNameToId } from "@/lib/studio-roster";
import { parseIso, progressPercentForStudent, startOfMockToday } from "@/lib/studio-task-logic";
import type { StudentTask, StudioUpdate, TaskFrequency, UserProfile } from "@/lib/types";
import { BottomSheet } from "./BottomSheet";
import { SegmentedControl } from "./SegmentedControl";
import { Card, GhostButton, Header, PrimaryButton, ProgressBar, SectionEyebrow, SectionTitle, cx } from "./ui";

const freqs: { value: TaskFrequency; label: string }[] = [
  { value: "once", label: "חד־פעמי" },
  { value: "daily", label: "יומי" },
  { value: "weekly", label: "שבועי" },
  { value: "custom", label: "מותאם" }
];

const targets: { value: StudentTask["targetType"]; label: string }[] = [
  { value: "studio", label: "סטודיו" },
  { value: "group", label: "קבוצה" },
  { value: "personal", label: "אישי" }
];

const priorities: { value: StudioUpdate["priority"]; label: string }[] = [
  { value: "normal", label: "רגיל" },
  { value: "important", label: "חשוב" },
  { value: "urgent", label: "דחוף" }
];

export function ManagementStudioPanel({ user }: { user: UserProfile }) {
  const { tasks, createTask, createUpdate } = useStudioData();
  const [sheet, setSheet] = useState<"none" | "studioTask" | "studioUpdate">("none");

  const teachers = useMemo(
    () => getDirectoryUsers().filter((u) => u.permissions.isTeacher && !u.permissions.isManagement),
    []
  );
  const students = useMemo(() => getDirectoryStudents(), []);

  const teacherTasks = useMemo(() => tasks.filter((t) => teachers.some((x) => x.id === t.createdByUserId)), [tasks, teachers]);

  const byTeacher = useMemo(() => {
    return teachers.map((t) => {
      const mine = teacherTasks.filter((x) => x.createdByUserId === t.id);
      const avg =
        mine.length && students.length
          ? Math.round(
              students.flatMap((s) => mine.map((task) => progressPercentForStudent(task, s.id))).reduce((a, b) => a + b, 0) /
                Math.max(1, students.length * mine.length)
            )
          : 0;
      return { teacher: t, count: mine.length, avg };
    });
  }, [teachers, teacherTasks, students]);

  const byGroup = useMemo(() => {
    return getStudioGroups().slice(0, 6).map((g) => {
      const rel = tasks.filter((t) => (t.assignedGroupIds ?? []).includes(g.id));
      const studs = students.filter((s) => s.assignedGroups.includes(g.name));
      const avg =
        rel.length && studs.length
          ? Math.round(studs.flatMap((s) => rel.map((task) => progressPercentForStudent(task, s.id))).reduce((a, b) => a + b, 0) / Math.max(1, studs.length * rel.length))
          : 0;
      return { g, avg, n: rel.length };
    });
  }, [tasks, students]);

  const alerts = useMemo(() => {
    const rows: { id: string; title: string; detail: string }[] = [];
    tasks.forEach((t) => {
      const due = parseIso(t.dueDate);
      if (due && due < startOfMockToday() && t.status !== "completed") {
        rows.push({ id: `ov-${t.id}`, title: "משימה באיחור", detail: `${t.title} · יעד: ${t.dueDate}` });
      }
    });
    byTeacher.forEach((row) => {
      if (row.count === 0) rows.push({ id: `idle-${row.teacher.id}`, title: "מורה ללא משימות פעילות", detail: `${row.teacher.name} — לא זוהו משימות פעילות` });
      else if (row.avg < 38)
        rows.push({ id: `low-${row.teacher.id}`, title: "השלמה נמוכה", detail: `${row.teacher.name}: ממוצע משוער ${row.avg}% על פי תלמידים` });
    });
    students.forEach((s) => {
      const rel = tasks.filter((task) => taskVisibleToStudentMgmt(task, s.id));
      if (!rel.length) return;
      const avg = Math.round(rel.reduce((sum, t) => sum + progressPercentForStudent(t, s.id), 0) / rel.length);
      if (avg < 32) rows.push({ id: `eng-${s.id}`, title: "מעורבות נמוכה", detail: `${s.name}: ממוצע ${avg}% על משימות פתוחות` });
    });
    return rows.slice(0, 10);
  }, [tasks, byTeacher, students]);

  return (
    <div className="space-y-8 pb-2">
      <Header title="ניהול משימות ועדכונים" subtitle="רמת סטודיו — יצירה, מעקב ואנליטיקה." />

      <div className="grid grid-cols-2 gap-3">
        <GhostButton className="!flex !min-h-[3.5rem] !flex-col !items-center !justify-center !gap-1" onClick={() => setSheet("studioTask")}>
          <Plus size={18} className="text-emerald-200/85" />
          <span className="text-[12px] font-semibold">משימת סטודיו</span>
        </GhostButton>
        <GhostButton className="!flex !min-h-[3.5rem] !flex-col !items-center !justify-center !gap-1" onClick={() => setSheet("studioUpdate")}>
          <Megaphone size={18} className="text-sky-200/85" />
          <span className="text-[12px] font-semibold">עדכון לסטודיו</span>
        </GhostButton>
      </div>

      <section className="space-y-3">
        <SectionEyebrow>אנליטיקה</SectionEyebrow>
        <SectionTitle className="mt-0.5">משימות שיצרו מורים</SectionTitle>
        <div className="mt-3 space-y-3">
          {byTeacher.map(({ teacher, count, avg }) => (
            <Card key={teacher.id} animated={false}>
              <div className="flex items-center justify-between gap-3 text-right">
                <BarChart3 className="shrink-0 text-emerald-300/70" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{teacher.name}</p>
                  <p className="mt-1 text-[12px] text-white/42">{count} משימות במערכת</p>
                </div>
                <span className="text-lg font-semibold tabular-nums text-emerald-200/90">{avg}%</span>
              </div>
              <ProgressBar value={Math.min(100, avg)} className="mt-4" />
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>השלמה לפי קבוצה</SectionTitle>
        <div className="space-y-3">
          {byGroup.map(({ g, avg, n }) => (
            <Card key={g.id} animated={false}>
              <div className="text-right">
                <p className="font-semibold text-white">{g.name}</p>
                <p className="mt-1 text-[12px] text-white/42">{n} משימות משויכות</p>
                <ProgressBar value={avg} className="mt-4" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>תלמידים — ממוצע התקדמות</SectionTitle>
        <div className="space-y-2.5">
          {students.map((s) => {
            const rel = tasks.filter((task) => taskVisibleToStudentMgmt(task, s.id));
            const avg = rel.length ? Math.round(rel.reduce((sum, t) => sum + progressPercentForStudent(t, s.id), 0) / rel.length) : 0;
            return (
              <Card key={s.id} animated={false} className="!py-3.5">
                <div className="flex items-center justify-between gap-3 text-right">
                  <Users className="shrink-0 text-white/35" size={18} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{s.name}</p>
                    <p className="text-[11px] text-white/38">{rel.length} משימות רלוונטיות</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-white/75">{avg}%</span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>התראות מערכת</SectionTitle>
        <div className="space-y-3">
          {alerts.map((a) => (
            <Card key={a.id} animated={false}>
              <div className="flex gap-3 text-right">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-300/88" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{a.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/48">{a.detail}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <MgmtTaskSheet
        open={sheet === "studioTask"}
        user={user}
        onClose={() => setSheet("none")}
        onSave={(d) => {
          createTask(d);
          setSheet("none");
        }}
      />
      <MgmtUpdateSheet
        open={sheet === "studioUpdate"}
        user={user}
        onClose={() => setSheet("none")}
        onSave={(d) => {
          createUpdate(d);
          setSheet("none");
        }}
      />
    </div>
  );
}

function taskVisibleToStudentMgmt(task: StudentTask, studentId: string): boolean {
  if (task.targetType === "studio") return true;
  if (task.targetType === "personal") return task.assignedStudentIds?.includes(studentId) ?? false;
  const s = getDirectoryStudents().find((x) => x.id === studentId);
  if (!s) return false;
  const gids = new Set(s.assignedGroups.map((n) => groupNameToId(n)).filter(Boolean) as string[]);
  return (task.assignedGroupIds ?? []).some((id) => gids.has(id));
}

function fieldClass() {
  return "mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-base text-white outline-none focus:border-emerald-400/35 touch-manipulation";
}

function MgmtTaskSheet({
  open,
  user,
  onClose,
  onSave
}: {
  open: boolean;
  user: UserProfile;
  onClose: () => void;
  onSave: (d: Omit<StudentTask, "id" | "progressPercent" | "status">) => void;
}) {
  const [target, setTarget] = useState<StudentTask["targetType"]>("studio");
  const [titleV, setTitleV] = useState("");
  const [desc, setDesc] = useState("");
  const [freq, setFreq] = useState<TaskFrequency>("once");
  const [nTarget, setNTarget] = useState(1);
  const [xp, setXp] = useState(20);
  const [due, setDue] = useState("2026-05-20");
  const [gid, setGid] = useState(getStudioGroups()[0]?.id ?? "");
  const [sid, setSid] = useState(getDirectoryStudents()[0]?.id ?? "");

  if (!open) return null;

  return (
    <BottomSheet open={open} title="משימת סטודיו" onClose={onClose}>
      <div className="space-y-5 text-right">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">יעד</p>
          <SegmentedControl options={targets} value={target} onChange={(v) => setTarget(v as StudentTask["targetType"])} />
        </div>
        {target === "group" ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">קבוצה</p>
            <select className={fieldClass()} value={gid} onChange={(e) => setGid(e.target.value)}>
              {getStudioGroups().map((g) => (
                <option key={g.id} value={g.id} className="bg-zinc-900">
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {target === "personal" ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תלמיד</p>
            <select className={fieldClass()} value={sid} onChange={(e) => setSid(e.target.value)}>
              {getDirectoryStudents().map((s) => (
                <option key={s.id} value={s.id} className="bg-zinc-900">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">כותרת</p>
          <input className={fieldClass()} value={titleV} onChange={(e) => setTitleV(e.target.value)} placeholder="כותרת" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תיאור</p>
          <textarea className={cx(fieldClass(), "min-h-[5rem] resize-none")} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תדירות</p>
          <SegmentedControl options={freqs} value={freq} onChange={(v) => setFreq(v as TaskFrequency)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">יעד ביצועים</p>
            <input type="number" min={1} className={fieldClass()} value={nTarget} onChange={(e) => setNTarget(+e.target.value)} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">XP</p>
            <input type="number" min={0} className={fieldClass()} value={xp} onChange={(e) => setXp(+e.target.value)} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תאריך יעד</p>
          <input type="date" className={fieldClass()} value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <PrimaryButton
          onClick={() =>
            onSave({
              studioId: user.studioId,
              title: titleV.trim() || "משימה",
              description: desc.trim() || "—",
              targetType: target,
              assignedGroupIds: target === "group" ? [gid] : undefined,
              assignedStudentIds: target === "personal" ? [sid] : undefined,
              createdByUserId: user.id,
              createdByName: user.name,
              startDate: "2026-05-14",
              dueDate: due,
              frequency: freq,
              targetCompletions: Math.max(1, nTarget),
              completedCount: 0,
              perStudentCompletions: target === "studio" || target === "group" ? {} : undefined,
              timesPerWeek: freq === "weekly" ? 3 : undefined,
              xpReward: xp
            })
          }
        >
          פרסום משימה
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}

function MgmtUpdateSheet({
  open,
  user,
  onClose,
  onSave
}: {
  open: boolean;
  user: UserProfile;
  onClose: () => void;
  onSave: (d: Omit<StudioUpdate, "id" | "readByUserIds" | "studioId">) => void;
}) {
  const [ut, setUt] = useState<StudioUpdate["targetType"]>("studio");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [pr, setPr] = useState<StudioUpdate["priority"]>("normal");
  const [gid, setGid] = useState(getStudioGroups()[0]?.id ?? "");
  const [sid, setSid] = useState(getDirectoryStudents()[0]?.id ?? "");

  if (!open) return null;

  return (
    <BottomSheet open={open} title="עדכון לסטודיו" onClose={onClose}>
      <div className="space-y-5 text-right">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">יעד</p>
          <SegmentedControl options={targets} value={ut} onChange={(v) => setUt(v as StudioUpdate["targetType"])} />
        </div>
        {ut === "group" ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">קבוצה</p>
            <select className={fieldClass()} value={gid} onChange={(e) => setGid(e.target.value)}>
              {getStudioGroups().map((g) => (
                <option key={g.id} value={g.id} className="bg-zinc-900">
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {ut === "personal" ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תלמיד</p>
            <select className={fieldClass()} value={sid} onChange={(e) => setSid(e.target.value)}>
              {getDirectoryStudents().map((s) => (
                <option key={s.id} value={s.id} className="bg-zinc-900">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">כותרת</p>
          <input className={fieldClass()} value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תוכן</p>
          <textarea className={cx(fieldClass(), "min-h-[5.5rem] resize-none")} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">עדיפות</p>
          <SegmentedControl options={priorities} value={pr} onChange={(v) => setPr(v as StudioUpdate["priority"])} />
        </div>
        <PrimaryButton
          onClick={() =>
            onSave({
              title: headline.trim() || "עדכון",
              body: body.trim() || "—",
              targetType: ut,
              assignedGroupIds: ut === "group" ? [gid] : undefined,
              assignedStudentIds: ut === "personal" ? [sid] : undefined,
              createdByUserId: user.id,
              createdByName: user.name,
              createdAt: new Date().toISOString(),
              priority: pr
            })
          }
        >
          פרסום עדכון
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}
