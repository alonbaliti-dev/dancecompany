"use client";
import { getStudioGroups } from "@/lib/studio-groups-access";

import { useState } from "react";
import { useCommunication } from "@/context/CommunicationContext";
import { isStaffChat } from "@/lib/communication-permissions";
import { visibilityLabel } from "@/lib/gallery-permissions";

import type { ChatMessage, DanceGroupChat, GalleryVisibility } from "@/lib/types";
import { BottomSheet } from "./BottomSheet";
import { PrimaryButton, SectionEyebrow } from "./ui";

export function SaveToGallerySheet({
  open,
  onClose,
  chat,
  message
}: {
  open: boolean;
  onClose: () => void;
  chat: DanceGroupChat;
  message: ChatMessage;
}) {
  const { saveMessageToGallery } = useCommunication();
  const staff = isStaffChat(chat);
  const [title, setTitle] = useState(message.body.slice(0, 48));
  const [visibility, setVisibility] = useState<GalleryVisibility>(staff ? "staff_only" : "student_group");
  const [groupId, setGroupId] = useState(chat.groupId ?? getStudioGroups()[0]?.id ?? "");
  const [notify, setNotify] = useState(false);
  const [done, setDone] = useState(false);

  const visOptions: GalleryVisibility[] = staff
    ? ["staff_only", "teachers_only", "student_group"]
    : ["student_group", "specific_students", "teachers_only"];

  const save = () => {
    saveMessageToGallery({
      messageId: message.id,
      chatId: chat.id,
      title: title.trim(),
      visibility,
      assignedGroupIds: visibility === "student_group" && groupId ? [groupId] : undefined,
      tags: staff ? ["צוות"] : ["מצ׳אט קבוצה"],
      notifyUsers: notify
    });
    setDone(true);
  };

  return (
    <BottomSheet open={open} title={done ? "נשמר" : "שמור לגלריית חומרים"} onClose={() => { setDone(false); onClose(); }}>
      {done ? (
        <div className="text-center"><PrimaryButton onClick={onClose}>סגירה</PrimaryButton></div>
      ) : (
        <div className="space-y-4 text-right">
          <input className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
          <SectionEyebrow>הרשאות</SectionEyebrow>
          <select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={visibility} onChange={(e) => setVisibility(e.target.value as GalleryVisibility)}>
            {visOptions.map((v) => (<option key={v} value={v} className="bg-zinc-900">{visibilityLabel(v)}</option>))}
          </select>
          {staff && visibility === "student_group" ? (
            <p className="text-xs text-amber-100/70">חומר בטוח לתלמידים — בחרי קבוצה.</p>
          ) : null}
          {visibility === "student_group" ? (
            <select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              {getStudioGroups().map((g) => (<option key={g.id} value={g.id} className="bg-zinc-900">{g.name}</option>))}
            </select>
          ) : null}
          {visibility === "student_group" || visibility === "specific_students" ? (
            <label className="flex justify-end gap-2 text-sm text-white/55"><span>התראה לתלמידים</span><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-emerald-400" /></label>
          ) : null}
          <PrimaryButton disabled={!title.trim()} onClick={save}>שמירה</PrimaryButton>
        </div>
      )}
    </BottomSheet>
  );
}
