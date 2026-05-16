"use client";
import { getDirectoryUsers } from "@/lib/directory-store";
import { getStudioGroups } from "@/lib/studio-groups-access";

import { useMemo, useState } from "react";
import { useCommunication } from "@/context/CommunicationContext";

import { managementTargetOptions, teacherTargetOptions, formatNotificationTargetLabel } from "@/lib/notification-logic";
import { getStudentsForTeacher } from "@/lib/studio-roster";
import type { FlowPriority, NotificationTargetType, UserProfile } from "@/lib/types";
import { BottomSheet } from "./BottomSheet";
import { SegmentedControl } from "./SegmentedControl";
import { Card, GhostButton, PrimaryButton, SectionEyebrow } from "./ui";

const priorities: { value: FlowPriority; label: string }[] = [
  { value: "normal", label: "רגיל" },
  { value: "important", label: "חשוב" },
  { value: "urgent", label: "דחוף" }
];

function buildPayload(targetType: NotificationTargetType, studentIds: string[], teacherIds: string[], groupId: string) {
  if (targetType === "student" || targetType === "teacher") {
    const id = targetType === "student" ? studentIds[0] : teacherIds[0];
    return { targetType, targetUserIds: id ? [id] : [] };
  }
  if (targetType === "students" || targetType === "teachers") {
    return { targetType, targetUserIds: targetType === "students" ? studentIds : teacherIds };
  }
  if (targetType === "dance_group") {
    return { targetType, targetGroupIds: groupId ? [groupId] : [] };
  }
  return { targetType };
}

export function SendUpdateSheet({ open, onClose, user }: { open: boolean; onClose: () => void; user: UserProfile }) {
  const { sendStudioUpdate } = useCommunication();
  const mgmt = user.permissions.isManagement;
  const targetOptions = mgmt ? managementTargetOptions() : teacherTargetOptions();
  const [step, setStep] = useState<"edit" | "preview" | "done">("edit");
  const [targetType, setTargetType] = useState<NotificationTargetType>(mgmt ? "all_students" : "dance_group");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [teacherIds, setTeacherIds] = useState<string[]>([]);
  const [groupId, setGroupId] = useState(getStudioGroups()[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<FlowPriority>("important");
  const [pinToChat, setPinToChat] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const groupOptions = useMemo(() => (mgmt ? getStudioGroups() : getStudioGroups().filter((g) => user.assignedGroups.includes(g.name))), [user, mgmt]);
  const studentOptions = useMemo(() => {
    if (mgmt) return getDirectoryUsers().filter((u) => !u.permissions.isTeacher && !u.permissions.isManagement && !u.isParent);
    return getStudentsForTeacher(user);
  }, [user, mgmt]);
  const teacherOptions = useMemo(() => getDirectoryUsers().filter((u) => u.permissions.isTeacher && !u.permissions.isManagement), []);

  const targetLabel = useMemo(() => {
    const p = buildPayload(targetType, studentIds, teacherIds, groupId);
    return formatNotificationTargetLabel({ targetType: p.targetType, targetUserIds: p.targetUserIds, targetGroupIds: p.targetGroupIds });
  }, [targetType, studentIds, teacherIds, groupId]);

  const reset = () => { setStep("edit"); setTitle(""); setBody(""); setPriority("important"); setPinToChat(false); setSentCount(0); setStudentIds([]); setTeacherIds([]); };
  const handleClose = () => { reset(); onClose(); };
  const handleSend = () => {
    const base = buildPayload(targetType, studentIds, teacherIds, groupId);
    setSentCount(sendStudioUpdate({ ...base, title: title.trim(), body: body.trim(), priority, pinToGroupChat: pinToChat && targetType === "dance_group" }).recipientCount);
    setStep("done");
  };

  const needsGroup = targetType === "dance_group";
  const needsSingleStudent = targetType === "student";
  const needsMultiStudents = targetType === "students";
  const needsSingleTeacher = targetType === "teacher";
  const needsMultiTeachers = targetType === "teachers";
  const canPreview = Boolean(title.trim() && body.trim() && (!needsGroup || groupId) && (!needsSingleStudent || studentIds[0]) && (!needsMultiStudents || studentIds.length) && (!needsSingleTeacher || teacherIds[0]) && (!needsMultiTeachers || teacherIds.length));

  return (
    <BottomSheet open={open} title={step === "preview" ? "תצוגה מקדימה" : step === "done" ? "נשלח" : "שליחת התראה"} onClose={handleClose}>
      {step === "edit" ? (
        <div className="space-y-4 text-right">
          <SectionEyebrow>יעד</SectionEyebrow>
          <select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={targetType} onChange={(e) => setTargetType(e.target.value as NotificationTargetType)}>
            {targetOptions.map((o) => (<option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>))}
          </select>
          {needsGroup ? (<select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={groupId} onChange={(e) => setGroupId(e.target.value)}>{groupOptions.map((g) => (<option key={g.id} value={g.id} className="bg-zinc-900">{g.name}</option>))}</select>) : null}
          {needsSingleStudent ? (<select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={studentIds[0] ?? ""} onChange={(e) => setStudentIds(e.target.value ? [e.target.value] : [])}><option value="">בחרי תלמיד/ה</option>{studentOptions.map((s) => (<option key={s.id} value={s.id} className="bg-zinc-900">{s.name}</option>))}</select>) : null}
          {needsMultiStudents ? (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-2">
              {studentOptions.map((s) => (
                <label key={s.id} className="flex items-center justify-end gap-2 rounded-lg px-2 py-1.5 text-sm text-white/70">
                  <span>{s.name}</span>
                  <input type="checkbox" checked={studentIds.includes(s.id)} onChange={(e) => setStudentIds((prev) => (e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)))} className="accent-emerald-400" />
                </label>
              ))}
            </div>
          ) : null}
          {needsSingleTeacher ? (
            <select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={teacherIds[0] ?? ""} onChange={(e) => setTeacherIds(e.target.value ? [e.target.value] : [])}>
              <option value="">בחרי מורה</option>
              {teacherOptions.map((t) => (<option key={t.id} value={t.id} className="bg-zinc-900">{t.name}</option>))}
            </select>
          ) : null}
          {needsMultiTeachers ? (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-2">
              {teacherOptions.map((tr) => (
                <label key={tr.id} className="flex items-center justify-end gap-2 rounded-lg px-2 py-1.5 text-sm text-white/70">
                  <span>{tr.name}</span>
                  <input type="checkbox" checked={teacherIds.includes(tr.id)} onChange={(e) => setTeacherIds((prev) => (e.target.checked ? [...prev, tr.id] : prev.filter((id) => id !== tr.id)))} className="accent-emerald-400" />
                </label>
              ))}
            </div>
          ) : null}
          <input className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="כותרת" />
          <textarea className="min-h-[5rem] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={body} onChange={(e) => setBody(e.target.value)} placeholder="תוכן" />
          <SegmentedControl<FlowPriority> value={priority} onChange={setPriority} options={priorities} />
          {needsGroup ? (<label className="flex items-center justify-end gap-2 text-sm text-white/55"><span>נעיצה בצ׳אט</span><input type="checkbox" checked={pinToChat} onChange={(e) => setPinToChat(e.target.checked)} className="accent-emerald-400" /></label>) : null}
          <PrimaryButton disabled={!canPreview} onClick={() => setStep("preview")}>תצוגה מקדימה</PrimaryButton>
        </div>
      ) : null}
      {step === "preview" ? (
        <div className="space-y-4 text-right">
          <Card animated={false}>
            <p className="text-[11px] text-white/40">יעד: {targetLabel}</p>
            <p className="mt-3 text-lg font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
          </Card>
          <div className="flex gap-2">
            <GhostButton className="flex-1" onClick={() => setStep("edit")}>חזרה</GhostButton>
            <PrimaryButton className="flex-1" onClick={handleSend}>שליחה</PrimaryButton>
          </div>
        </div>
      ) : null}
      {step === "done" ? (
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold text-emerald-100">ההתראה נשלחה</p>
          <p className="text-sm text-white/45">{sentCount} נמענים</p>
          <PrimaryButton onClick={handleClose}>סגירה</PrimaryButton>
        </div>
      ) : null}
    </BottomSheet>
  );
}
