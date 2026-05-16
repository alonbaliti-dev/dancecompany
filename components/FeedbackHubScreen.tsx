"use client";

import { useState } from "react";
import { useStudioOS } from "@/context/StudioOSContext";
import { FEEDBACK_CATEGORIES } from "@/lib/studio-os-constants";
import { feedbackCategoryLabel } from "@/lib/studio-os-logic";
import type { FeedbackCategory } from "@/lib/types";
import { Card, Header, PrimaryButton, SectionEyebrow, cx } from "./ui";

export function FeedbackHubScreen() {
  const { user, feedbackForStudent, allFeedback, addFeedback } = useStudioOS();
  const [cat, setCat] = useState<FeedbackCategory>("technique");
  const [score, setScore] = useState(8);
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(true);
  const list = user.permissions.isTeacher || user.permissions.isManagement ? allFeedback : feedbackForStudent;

  return (
    <div className="space-y-8 pb-6">
      <Header title="מערכת פידבק" subtitle="טכניקה, אנרגיה, מוזיקליות — מעקב לאורך זמן." />
      {(user.permissions.isTeacher || user.permissions.isManagement) ? (
        <Card animated={false}>
          <SectionEyebrow>פידבק חדש</SectionEyebrow>
          <select className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-white" value={cat} onChange={(e) => setCat(e.target.value as FeedbackCategory)}>
            {FEEDBACK_CATEGORIES.map((c) => <option key={c.id} value={c.id} className="bg-zinc-900">{c.label}</option>)}
          </select>
          <input type="range" min={1} max={10} value={score} onChange={(e) => setScore(+e.target.value)} className="mt-3 w-full accent-emerald-400" />
          <p className="text-center text-sm text-white/50">ציון: {score}</p>
          <textarea className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-white outline-none" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          <label className="mt-2 flex justify-end gap-2 text-sm text-white/55"><span>גלוי לתלמיד</span><input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="accent-emerald-400" /></label>
          <PrimaryButton className="mt-3" disabled={!note.trim()} onClick={() => { addFeedback({ studentId: "u_maya", category: cat, score, note: note.trim(), visibleToStudent: visible }); setNote(""); }}>שמירה</PrimaryButton>
        </Card>
      ) : null}
      <div className="space-y-2">{list.map((f) => (
        <Card key={f.id} animated={false}>
          <div className="flex justify-end gap-2">
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/45">{feedbackCategoryLabel(f.category)}</span>
            <span className="text-lg font-semibold text-emerald-200">{f.score}/10</span>
          </div>
          <p className="mt-2 text-right text-sm text-white/60">{f.note}</p>
          <p className="mt-1 text-[10px] text-white/35">{f.teacherName} · {new Date(f.createdAt).toLocaleDateString("he-IL")}{!f.visibleToStudent ? " · צוות בלבד" : ""}</p>
        </Card>
      ))}</div>
    </div>
  );
}
