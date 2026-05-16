"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, Link2, Unlink } from "lucide-react";
import { useUserDirectory } from "@/context/UserDirectoryContext";
import { directoryVisibleToActor, canLinkParentStudent } from "@/lib/users/user-guards";
import { linkedParentNames, linkedStudentNames } from "@/lib/users/user-logic";
import type { DirectoryUser, UserProfile } from "@/lib/types";
import { Card, GhostButton, Header, SectionEyebrow, cx, screenClass } from "../ui";

export function RelationshipManagerScreen({ actor, onBack }: { actor: UserProfile; onBack?: () => void }) {
  const { users, linkParentStudent, unlinkParentStudent } = useUserDirectory();
  const [parentId, setParentId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  const visible = useMemo(() => directoryVisibleToActor(actor, users), [actor, users]);
  const parents = visible.filter((u) => u.type === "parent" && u.status !== "removed");
  const students = visible.filter((u) => u.type === "student" && u.status !== "removed");

  const selectedParent = parentId ? users.find((u) => u.id === parentId) : undefined;
  const selectedStudent = studentId ? users.find((u) => u.id === studentId) : undefined;

  function tryLink() {
    if (!parentId || !studentId || !selectedParent || !selectedStudent) return;
    if (!canLinkParentStudent(actor, selectedParent, selectedStudent)) return;
    linkParentStudent(actor, parentId, studentId);
  }

  return (
    <div className={screenClass} dir="rtl">
      {onBack ? (
        <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
          ← חזרה לניהול משתמשים
        </GhostButton>
      ) : null}

      <Header title="קישור הורים ותלמידים" subtitle="קשר הורה לילד, צפייה בכל המשפחה וניתוק קשרים." />

      <Card animated={false} className="!p-4">
        <SectionEyebrow tone="commercial">קישור חדש</SectionEyebrow>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-semibold text-white/45">בחר הורה</p>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {parents.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setParentId(p.id)}
                  className={cx(
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm",
                    parentId === p.id ? "border-emerald-400/30 bg-emerald-500/10 text-white" : "border-white/10 text-white/55"
                  )}
                >
                  <ChevronLeft size={16} className="text-white/25" />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold text-white/45">בחר תלמיד</p>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {students.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStudentId(s.id)}
                  className={cx(
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm",
                    studentId === s.id ? "border-emerald-400/30 bg-emerald-500/10 text-white" : "border-white/10 text-white/55"
                  )}
                >
                  <ChevronLeft size={16} className="text-white/25" />
                  <span>
                    {s.name}
                    {s.assignedGroups[0] ? ` · ${s.assignedGroups[0]}` : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <GhostButton className="mt-4 w-full" onClick={tryLink} disabled={!parentId || !studentId}>
          <Link2 size={16} className="ml-1 inline" />
          קישור הורה לתלמיד
        </GhostButton>
      </Card>

      <div className="mt-6 space-y-4">
        <SectionEyebrow>משפחות מקושרות</SectionEyebrow>
        {students.map((s) => {
          const pNames = linkedParentNames(s, users);
          if (!pNames.length) return null;
          return (
            <Card key={s.id} animated={false} className="!p-4">
              <p className="font-semibold text-white">{s.name}</p>
              <p className="mt-1 text-xs text-white/42">קבוצה: {s.assignedGroups[0] ?? "—"}</p>
              <div className="mt-3 space-y-2">
                {(s.linkedParentIds ?? []).map((pid) => {
                  const parent = users.find((u) => u.id === pid);
                  if (!parent) return null;
                  return (
                    <div key={pid} className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                      <button
                        type="button"
                        onClick={() => unlinkParentStudent(actor, pid, s.id)}
                        className="text-rose-200/80"
                        aria-label="ניתוק"
                      >
                        <Unlink size={16} />
                      </button>
                      <div className="text-right text-sm">
                        <p className="text-white">{parent.name}</p>
                        <p className="text-xs text-white/40" dir="ltr">
                          {parent.phone}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {parents.map((p) => {
        const kids = linkedStudentNames(p, users);
        if (!kids.length) return null;
        return (
          <Card key={p.id} animated={false} className="!mt-3 !p-4">
            <p className="text-sm text-white/55">
              <span className="font-semibold text-white">{p.name}</span> — ילדים: {kids.join(" · ")}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
