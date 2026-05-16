"use client";
import { getDirectoryUsers } from "@/lib/directory-store";
import { getStudioGroups } from "@/lib/studio-groups-access";

import { useMemo, useState } from "react";
import { useCommunication } from "@/context/CommunicationContext";
import { useLegacyEvents } from "@/context/LegacyEventsContext";

import type { LegacyEventNotifyTarget, StudioEvent, StudioEventType } from "@/lib/types";
import { BottomSheet } from "./BottomSheet";
import { GhostButton, PrimaryButton, SectionEyebrow } from "./ui";

const TYPES: { value: StudioEventType; label: string }[] = [
  { value: "competition", label: "תחרות" },
  { value: "performance", label: "הופעה" },
  { value: "showcase", label: "הצגה" },
  { value: "workshop", label: "סדנה" },
  { value: "camp", label: "קייטנה" },
  { value: "photoshoot", label: "צילומים" },
  { value: "other", label: "אחר" }
];

export function LegacyEventManageSheet({
  open,
  onClose,
  editEvent
}: {
  open: boolean;
  onClose: () => void;
  editEvent?: StudioEvent | null;
}) {
  const { createEvent, updateEvent } = useLegacyEvents();
  const { sendStudioUpdate } = useCommunication();
  const [title, setTitle] = useState(editEvent?.title ?? "");
  const [type, setType] = useState<StudioEventType>(editEvent?.type ?? "showcase");
  const [date, setDate] = useState(editEvent?.date?.slice(0, 10) ?? "2026-06-01");
  const [endDate, setEndDate] = useState(editEvent?.endDate?.slice(0, 10) ?? "");
  const [location, setLocation] = useState(editEvent?.location ?? "");
  const [description, setDescription] = useState(editEvent?.description ?? "");
  const [groupIds, setGroupIds] = useState<string[]>(editEvent?.participatingGroupIds ?? []);
  const [isPublic, setIsPublic] = useState(editEvent?.isPublicToStudents ?? true);
  const [parentApproval, setParentApproval] = useState(editEvent?.parentApprovalRequired ?? false);
  const [memoryUrl, setMemoryUrl] = useState(editEvent?.memoryVideoUrl ?? "");
  const [notifyTarget, setNotifyTarget] = useState<LegacyEventNotifyTarget | "">("");
  const [done, setDone] = useState(false);

  const teachers = useMemo(() => getDirectoryUsers().filter((u) => u.permissions.isTeacher || u.permissions.isManagement), []);

  const payload = () => ({
    title: title.trim(),
    type,
    status: "future" as const,
    date: new Date(date).toISOString(),
    endDate: endDate ? new Date(endDate).toISOString() : undefined,
    location: location.trim() || undefined,
    participatingGroupIds: groupIds,
    teacherIds: teachers.map((t) => t.id),
    description: description.trim(),
    parentApprovalRequired: parentApproval,
    isPublicToStudents: isPublic,
    memoryVideoUrl: memoryUrl.trim() || undefined,
    memoryVideoThumbnailUrl: memoryUrl.trim() ? `mock://legacy/thumb/${Date.now()}.jpg` : undefined
  });

  const save = () => {
    const p = payload();
    if (editEvent) updateEvent(editEvent.id, p);
    else createEvent(p);
    if (notifyTarget) {
      const map = { participants: "dance_group" as const, parents: "all_students" as const, teachers: "all_teachers" as const, studio: "studio" as const };
      const targetType = notifyTarget === "participants" && groupIds[0] ? "dance_group" : map[notifyTarget];
      sendStudioUpdate({
        targetType,
        targetGroupIds: notifyTarget === "participants" ? groupIds : undefined,
        title: `עדכון אירוע: ${title}`,
        body: description.slice(0, 120) || "פרטים בלוח הישגים והאירועים",
        priority: "important"
      });
    }
    setDone(true);
  };

  const close = () => { setDone(false); onClose(); };

  return (
    <BottomSheet open={open} title={done ? "נשמר" : editEvent ? "עריכת אירוע" : "אירוע חדש"} onClose={close}>
      {done ? (
        <div className="text-center"><PrimaryButton onClick={close}>סגירה</PrimaryButton></div>
      ) : (
        <div className="max-h-[70vh] space-y-3 overflow-y-auto text-right">
          <input className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="שם האירוע" />
          <select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={type} onChange={(e) => setType(e.target.value as StudioEventType)}>
            {TYPES.map((t) => <option key={t.value} value={t.value} className="bg-zinc-900">{t.label}</option>)}
          </select>
          <input type="date" className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="date" className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="תאריך סיום" />
          <input className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="מיקום" />
          <textarea className="min-h-[4rem] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="תיאור" />
          <SectionEyebrow>קבוצות משתתפות</SectionEyebrow>
          <div className="max-h-28 space-y-1 overflow-y-auto rounded-xl border border-white/10 p-2">
            {getStudioGroups().map((g) => (
              <label key={g.id} className="flex justify-end gap-2 py-1 text-sm text-white/70">
                <span>{g.name}</span>
                <input type="checkbox" checked={groupIds.includes(g.id)} onChange={(e) => setGroupIds((p) => (e.target.checked ? [...p, g.id] : p.filter((id) => id !== g.id)))} className="accent-emerald-400" />
              </label>
            ))}
          </div>
          <label className="flex justify-end gap-2 text-sm text-white/55"><span>ציבורי לתלמידים</span><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-emerald-400" /></label>
          <label className="flex justify-end gap-2 text-sm text-white/55"><span>דורש אישור הורים</span><input type="checkbox" checked={parentApproval} onChange={(e) => setParentApproval(e.target.checked)} className="accent-emerald-400" /></label>
          <input className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={memoryUrl} onChange={(e) => setMemoryUrl(e.target.value)} placeholder="קישור לסרטון זיכרון" />
          <SectionEyebrow>שליחת התראה</SectionEyebrow>
          <select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={notifyTarget} onChange={(e) => setNotifyTarget(e.target.value as LegacyEventNotifyTarget | "")}>
            <option value="">ללא התראה</option>
            <option value="participants">משתתפים</option>
            <option value="parents">הורים</option>
            <option value="teachers">מורים</option>
            <option value="studio">כל הסטודיו</option>
          </select>
          <PrimaryButton disabled={!title.trim()} onClick={save}>שמירה</PrimaryButton>
          <GhostButton className="w-full" onClick={close}>ביטול</GhostButton>
        </div>
      )}
    </BottomSheet>
  );
}
