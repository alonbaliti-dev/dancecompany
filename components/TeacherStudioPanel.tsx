"use client";
import { getStudioGroups } from "@/lib/studio-groups-access";

import { useEffect, useMemo, useState } from "react";
import { Megaphone, Pencil, Plus, Users } from "lucide-react";
import { useStudioData } from "@/context/StudioDataContext";

import { getStudentsForTeacher } from "@/lib/studio-roster";
import { canTeacherEditTask, progressPercentForStudent } from "@/lib/studio-task-logic";
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

const priorities: { value: StudioUpdate["priority"]; label: string }[] = [
  { value: "normal", label: "רגיל" },
  { value: "important", label: "חשוב" },
  { value: "urgent", label: "דחוף" }
];

export function TeacherStudioPanel({ user }: { user: UserProfile }) {
  const { tasks, createTask, updateTask, createUpdate } = useStudioData();
  const [sheet, setSheet] = useState<"none" | "taskGroup" | "taskPersonal" | "editTask" | "updateGroup" | "updatePersonal">("none");
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  const myGroupOptions = useMemo(
    () => getStudioGroups().filter((g) => user.assignedGroups.includes(g.name)),
    [user.assignedGroups]
  );
  const students = useMemo(() => getStudentsForTeacher(user), [user]);
  const editableTasks = useMemo(() => tasks.filter((t) => canTeacherEditTask(user, t)), [tasks, user]);

  const tasksByGroup = useMemo(() => {
    const map = new Map<string, StudentTask[]>();
    for (const g of myGroupOptions) {
      map.set(
        g.id,
        tasks.filter((t) => t.targetType === "group" && (t.assignedGroupIds ?? []).includes(g.id) && canTeacherEditTask(user, t))
      );
    }
    return map;
  }, [tasks, myGroupOptions, user]);

  const behind = useMemo(() => {
    return students
      .map((s) => {
        const rel = tasks.filter(
          (t) =>
            canTeacherEditTask(user, t) &&
            (t.targetType === "personal"
              ? Boolean(t.assignedStudentIds?.includes(s.id))
              : (t.assignedGroupIds ?? []).some((gid) => {
                  const gn = getStudioGroups().find((x) => x.id === gid)?.name;
                  return Boolean(gn && s.assignedGroups.includes(gn));
                }))
        );
        if (!rel.length) return { s, avg: 100 };
        const avg = Math.round(rel.reduce((sum, t) => sum + progressPercentForStudent(t, s.id), 0) / rel.length);
        return { s, avg };
      })
      .filter((x) => x.avg < 45)
      .sort((a, b) => a.avg - b.avg);
  }, [students, tasks, user]);

  return (
    <div className="space-y-8 pb-2">
      <Header title="משימות ועדכונים" subtitle="יצירה ועריכה לפי הקבוצות המשויכות לך." />

      <div className="grid grid-cols-2 gap-3">
        <GhostButton className="!flex !min-h-[3.5rem] !flex-col !items-center !justify-center !gap-1 !py-3" onClick={() => setSheet("taskGroup")}>
          <Plus size={18} className="text-emerald-200/85" />
          <span className="text-[12px] font-semibold">משימת קבוצה</span>
        </GhostButton>
        <GhostButton className="!flex !min-h-[3.5rem] !flex-col !items-center !justify-center !gap-1 !py-3" onClick={() => setSheet("taskPersonal")}>
          <Users size={18} className="text-sky-200/85" />
          <span className="text-[12px] font-semibold">משימה אישית</span>
        </GhostButton>
        <GhostButton className="!flex !min-h-[3.5rem] !flex-col !items-center !justify-center !gap-1 !py-3" onClick={() => setSheet("updateGroup")}>
          <Megaphone size={18} className="text-amber-200/85" />
          <span className="text-[12px] font-semibold">עדכון לקבוצה</span>
        </GhostButton>
        <GhostButton className="!flex !min-h-[3.5rem] !flex-col !items-center !justify-center !gap-1 !py-3" onClick={() => setSheet("updatePersonal")}>
          <Megaphone size={17} className="text-violet-200/85" />
          <span className="text-[12px] font-semibold">עדכון אישי</span>
        </GhostButton>
      </div>

      <section className="space-y-3">
        <SectionEyebrow>מעקב</SectionEyebrow>
        <SectionTitle className="mt-0.5">התקדמות לפי קבוצה</SectionTitle>
        <div className="mt-3 space-y-3">
          {myGroupOptions.map((g) => {
            const list = tasksByGroup.get(g.id) ?? [];
            const avg =
              list.length && students.length
                ? Math.round(
                    students
                      .filter((s) => s.assignedGroups.includes(g.name))
                      .flatMap((s) => list.map((t) => progressPercentForStudent(t, s.id)))
                      .reduce((a, b) => a + b, 0) /
                    Math.max(
                      1,
                      students.filter((s) => s.assignedGroups.includes(g.name)).length * Math.max(1, list.length)
                    )
                  )
                : 0;
            return (
              <Card key={g.id} animated={false}>
                <div className="text-right">
                  <p className="font-semibold text-white">{g.name}</p>
                  <p className="mt-1 text-[12px] text-white/42">{list.length} משימות פעילות · ממוצע התקדמות משוער {avg}%</p>
                  <ProgressBar value={Math.min(100, avg)} className="mt-4" />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>תלמידים במעקב מורה</SectionTitle>
        <div className="space-y-3">
          {behind.length === 0 ? (
            <Card animated={false}>
              <p className="text-right text-sm text-white/45">אין תלמידים מתחת לסף ההתקדמות.</p>
            </Card>
          ) : (
            behind.map(({ s, avg }) => (
              <Card key={s.id} animated={false}>
                <div className="flex items-center justify-between gap-3 text-right">
                  <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-100">{avg}%</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{s.name}</p>
                    <p className="mt-1 text-[12px] text-white/42">{s.assignedGroups.join(" · ")}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>שיעור השלמה למשימה</SectionTitle>
        <div className="space-y-3">
          {editableTasks.slice(0, 8).map((t) => {
            const studs = students.filter((s) =>
              t.targetType === "group"
                ? (t.assignedGroupIds ?? []).some((gid) => {
                    const gn = getStudioGroups().find((x) => x.id === gid)?.name;
                    return Boolean(gn && s.assignedGroups.includes(gn));
                  })
                : Boolean(t.assignedStudentIds?.includes(s.id))
            );
            const first = t.assignedStudentIds?.[0];
            const avg =
              studs.length > 0
                ? Math.round(studs.reduce((sum, s) => sum + progressPercentForStudent(t, s.id), 0) / studs.length)
                : first
                  ? progressPercentForStudent(t, first)
                  : 0;
            return (
              <Card key={t.id} animated={false}>
                <div className="text-right">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      className="shrink-0 rounded-xl border border-white/10 p-2 text-white/55 transition hover:bg-white/[0.06]"
                      onClick={() => {
                        setEditTaskId(t.id);
                        setSheet("editTask");
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{t.title}</p>
                      <p className="mt-1 text-[11px] text-white/38">{t.targetType === "group" ? "קבוצה" : "אישי"}</p>
                    </div>
                  </div>
                  <ProgressBar value={avg} className="mt-4" />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <TaskFormSheet
        open={sheet === "taskGroup"}
        title="משימת קבוצה חדשה"
        user={user}
        mode="group"
        groups={myGroupOptions}
        students={students}
        onClose={() => setSheet("none")}
        onCreate={(draft) => {
          createTask(draft);
          setSheet("none");
        }}
      />
      <TaskFormSheet
        open={sheet === "taskPersonal"}
        title="משימה אישית לתלמיד"
        user={user}
        mode="personal"
        groups={myGroupOptions}
        students={students}
        onClose={() => setSheet("none")}
        onCreate={(draft) => {
          createTask(draft);
          setSheet("none");
        }}
      />
      <TaskFormSheet
        open={sheet === "editTask"}
        title="עריכת משימה"
        user={user}
        mode="edit"
        groups={myGroupOptions}
        students={students}
        initial={tasks.find((t) => t.id === editTaskId)}
        onClose={() => {
          setSheet("none");
          setEditTaskId(null);
        }}
        onUpdate={(id, patch) => {
          updateTask(id, patch);
          setSheet("none");
          setEditTaskId(null);
        }}
      />

      <UpdateFormSheet
        open={sheet === "updateGroup"}
        title="עדכון לקבוצה"
        mode="group"
        user={user}
        groups={myGroupOptions}
        students={students}
        onClose={() => setSheet("none")}
        onSave={(u) => {
          createUpdate(u);
          setSheet("none");
        }}
      />
      <UpdateFormSheet
        open={sheet === "updatePersonal"}
        title="עדכון אישי"
        mode="personal"
        user={user}
        groups={myGroupOptions}
        students={students}
        onClose={() => setSheet("none")}
        onSave={(u) => {
          createUpdate(u);
          setSheet("none");
        }}
      />
    </div>
  );
}

function fieldClass() {
  return "mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-base text-white outline-none placeholder:text-white/30 focus:border-emerald-400/35 touch-manipulation";
}

function TaskFormSheet({
  open,
  title,
  user,
  mode,
  groups,
  students,
  initial,
  onClose,
  onCreate,
  onUpdate
}: {
  open: boolean;
  title: string;
  user: UserProfile;
  mode: "group" | "personal" | "edit";
  groups: { id: string; name: string }[];
  students: UserProfile[];
  initial?: StudentTask;
  onClose: () => void;
  onCreate?: (draft: Omit<StudentTask, "id" | "progressPercent" | "status">) => void;
  onUpdate?: (id: string, patch: Partial<StudentTask>) => void;
}) {
  const [titleV, setTitleV] = useState("");
  const [desc, setDesc] = useState("");
  const [freq, setFreq] = useState<TaskFrequency>("once");
  const [target, setTarget] = useState(1);
  const [xp, setXp] = useState(25);
  const [due, setDue] = useState("2026-05-18");
  const [gid, setGid] = useState(groups[0]?.id ?? "");
  const [sid, setSid] = useState(students[0]?.id ?? "");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitleV(initial.title);
      setDesc(initial.description);
      setFreq(initial.frequency);
      setTarget(initial.targetCompletions);
      setXp(initial.xpReward);
      setDue(initial.dueDate ?? "2026-05-20");
      setGid(initial.assignedGroupIds?.[0] ?? groups[0]?.id ?? "");
      setSid(initial.assignedStudentIds?.[0] ?? students[0]?.id ?? "");
    } else if (mode !== "edit") {
      setTitleV("");
      setDesc("");
      setFreq("once");
      setTarget(1);
      setXp(25);
      setDue("2026-05-18");
      setGid(groups[0]?.id ?? "");
      setSid(students[0]?.id ?? "");
    }
  }, [initial, open, mode, groups, students]);

  if (!open) return null;

  const submit = () => {
    if (mode === "edit" && initial && onUpdate) {
      onUpdate(initial.id, {
        title: titleV.trim() || "משימה",
        description: desc.trim() || "—",
        frequency: freq,
        targetCompletions: Math.max(1, target),
        xpReward: xp,
        dueDate: due,
        assignedGroupIds: initial.targetType === "group" ? [gid] : undefined,
        assignedStudentIds: initial.targetType === "personal" ? [sid] : undefined,
        timesPerWeek: freq === "weekly" ? 3 : undefined
      });
      return;
    }
    const base = {
      studioId: user.studioId,
      title: titleV.trim() || "משימה חדשה",
      description: desc.trim() || "—",
      targetType: mode === "personal" ? ("personal" as const) : ("group" as const),
      assignedStudentIds: mode === "personal" ? [sid] : undefined,
      assignedGroupIds: mode === "group" ? [gid] : undefined,
      createdByUserId: user.id,
      createdByName: user.name,
      startDate: "2026-05-14",
      dueDate: due,
      frequency: freq,
      targetCompletions: Math.max(1, target),
      completedCount: 0,
      perStudentCompletions: mode === "group" ? ({} as Record<string, number>) : undefined,
      timesPerWeek: freq === "weekly" ? 3 : undefined,
      xpReward: xp,
      relatedGoal: undefined as string | undefined
    };
    if (mode === "personal" && onCreate) {
      onCreate({ ...base, targetType: "personal", assignedStudentIds: [sid], assignedGroupIds: undefined, completedCount: 0 });
    } else if (onCreate) {
      onCreate({ ...base, targetType: "group", assignedGroupIds: [gid], assignedStudentIds: undefined, completedCount: 0, perStudentCompletions: {} });
    }
  };

  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      <div className="space-y-5 text-right">
        {mode !== "personal" && mode !== "edit" ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">קבוצה</p>
            <select className={fieldClass()} value={gid} onChange={(e) => setGid(e.target.value)}>
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-zinc-900">
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {mode === "personal" ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תלמיד</p>
            <select className={fieldClass()} value={sid} onChange={(e) => setSid(e.target.value)}>
              {students.map((s) => (
                <option key={s.id} value={s.id} className="bg-zinc-900">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {mode === "edit" && initial?.targetType === "personal" ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תלמיד</p>
            <select className={fieldClass()} value={sid} onChange={(e) => setSid(e.target.value)}>
              {students.map((s) => (
                <option key={s.id} value={s.id} className="bg-zinc-900">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {mode === "edit" && initial?.targetType === "group" ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">קבוצה</p>
            <select className={fieldClass()} value={gid} onChange={(e) => setGid(e.target.value)}>
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-zinc-900">
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">כותרת</p>
          <input className={fieldClass()} value={titleV} onChange={(e) => setTitleV(e.target.value)} placeholder="כותרת המשימה" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תיאור</p>
          <textarea className={cx(fieldClass(), "min-h-[5.5rem] resize-none")} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="הנחיות ברורות לתלמידים" />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תדירות</p>
          <SegmentedControl options={freqs} value={freq} onChange={(v) => setFreq(v as TaskFrequency)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">יעד ביצועים</p>
            <input type="number" min={1} className={fieldClass()} value={target} onChange={(e) => setTarget(+e.target.value)} />
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
        <PrimaryButton onClick={submit}>{mode === "edit" ? "שמירת שינויים" : "יצירת משימה"}</PrimaryButton>
      </div>
    </BottomSheet>
  );
}

function UpdateFormSheet({
  open,
  title,
  mode,
  user,
  groups,
  students,
  onClose,
  onSave
}: {
  open: boolean;
  title: string;
  mode: "group" | "personal";
  user: UserProfile;
  groups: { id: string; name: string }[];
  students: UserProfile[];
  onClose: () => void;
  onSave: (u: Omit<StudioUpdate, "id" | "readByUserIds" | "studioId">) => void;
}) {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [pr, setPr] = useState<StudioUpdate["priority"]>("normal");
  const [gid, setGid] = useState(groups[0]?.id ?? "");
  const [sid, setSid] = useState(students[0]?.id ?? "");

  if (!open) return null;

  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      <div className="space-y-5 text-right">
        {mode === "group" ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">קבוצה</p>
            <select className={fieldClass()} value={gid} onChange={(e) => setGid(e.target.value)}>
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-zinc-900">
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תלמיד</p>
            <select className={fieldClass()} value={sid} onChange={(e) => setSid(e.target.value)}>
              {students.map((s) => (
                <option key={s.id} value={s.id} className="bg-zinc-900">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">כותרת</p>
          <input className={fieldClass()} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="נושא העדכון" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">תוכן</p>
          <textarea className={cx(fieldClass(), "min-h-[6rem] resize-none")} value={body} onChange={(e) => setBody(e.target.value)} placeholder="גוף ההודעה" />
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
              targetType: mode === "group" ? "group" : "personal",
              assignedGroupIds: mode === "group" ? [gid] : undefined,
              assignedStudentIds: mode === "personal" ? [sid] : undefined,
              createdByUserId: user.id,
              createdByName: user.name,
              createdAt: new Date().toISOString(),
              priority: pr
            })
          }
        >
          שליחת עדכון
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}
