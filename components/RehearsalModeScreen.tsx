"use client";

import { useState } from "react";
import { useStudioOS } from "@/context/StudioOSContext";
import { Card, GhostButton, Header, PrimaryButton, SectionEyebrow } from "./ui";

export function RehearsalModeScreen({ onSendGroupUpdate }: { onSendGroupUpdate?: () => void }) {
  const { rehearsalSessions, toggleRehearsalChecklist, setRehearsalAttendance, updateRehearsal } = useStudioOS();
  const [activeId, setActiveId] = useState(rehearsalSessions[0]?.id ?? "");
  const session = rehearsalSessions.find((r) => r.id === activeId) ?? rehearsalSessions[0];

  if (!session) return <Header title="מצב חזרה" subtitle="אין חזרה פעילה" />;

  return (
    <div className="space-y-8 pb-6">
      <Header title="מצב חזרה" subtitle="נוכחות, מוזיקה, סדר הופעה וטיימר — לצוות בלבד." />
      <select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white" value={activeId} onChange={(e) => setActiveId(e.target.value)}>
        {rehearsalSessions.map((r) => <option key={r.id} value={r.id} className="bg-zinc-900">{r.title}</option>)}
      </select>
      <Card animated={false}>
        <p className="text-lg font-semibold text-white">{session.title}</p>
        {session.musicLabel ? <p className="mt-2 text-sm text-white/45">🎵 {session.musicLabel}</p> : null}
        <textarea className="mt-4 min-h-[4rem] w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none" value={session.notes} onChange={(e) => updateRehearsal(session.id, { notes: e.target.value })} placeholder="הערות חזרה..." />
      </Card>
      <div><SectionEyebrow>נוכחות</SectionEyebrow>
        <div className="mt-2 space-y-2">{session.attendance.map((a) => (
          <div key={a.studentId} className="flex justify-end gap-2">
            <button type="button" onClick={() => setRehearsalAttendance(session.id, a.studentId, true)} className="rounded-lg border border-emerald-400/30 px-3 py-1 text-xs text-emerald-100">נוכח</button>
            <button type="button" onClick={() => setRehearsalAttendance(session.id, a.studentId, false)} className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/50">חסר</button>
            <span className="flex-1 text-right text-white">{a.name}</span>
          </div>
        ))}</div></div>
      <div><SectionEyebrow>צ׳ק-ליסט</SectionEyebrow>
        <div className="mt-2 space-y-2">{session.equipmentChecklist.map((it, i) => (
          <button key={it.item} type="button" onClick={() => toggleRehearsalChecklist(session.id, i)} className="flex w-full justify-end gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/70">
            <span>{it.done ? "✓" : "○"}</span>{it.item}
          </button>
        ))}</div></div>
      <div><SectionEyebrow>סדר הופעה</SectionEyebrow>
        <ol className="mt-2 list-decimal space-y-1 pr-5 text-sm text-white/55">{session.orderOfAppearance.map((x) => <li key={x}>{x}</li>)}</ol></div>
      {onSendGroupUpdate ? <PrimaryButton onClick={onSendGroupUpdate}>עדכון מהיר לקבוצה</PrimaryButton> : null}
    </div>
  );
}
