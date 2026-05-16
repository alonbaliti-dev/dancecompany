"use client";

import { useState } from "react";
import { Check, MapPin, Play, Trash2 } from "lucide-react";
import { useLegacyEvents } from "@/context/LegacyEventsContext";
import { canSeeTeacherNotes, canViewLegacyEvent } from "@/lib/legacy-events-permissions";
import {
  achievementBadgeStyle,
  achievementPlaceLabel,
  daysUntil,
  eventTypeLabel,
  formatEventDateRange,
  groupNamesForEvent,
  statusLabel,
  statusStyle
} from "@/lib/legacy-events-logic";
import type { StudioEvent } from "@/lib/types";
import { BottomSheet } from "./BottomSheet";
import { EditableTextWrapper } from "./super-admin/EditableTextWrapper";
import { Card, GhostButton, Header, PrimaryButton, SectionEyebrow, cx } from "./ui";

export function LegacyEventDetailScreen({
  event,
  onEdit,
  onBack,
  onBuyTickets
}: {
  event: StudioEvent;
  onEdit?: () => void;
  onBack?: () => void;
  onBuyTickets?: () => void;
}) {
  const {
    user,
    canManage,
    canTeach,
    addTeacherNote,
    addTeacherSuggestion,
    approveSuggestion,
    dismissSuggestion,
    deleteEvent
  } = useLegacyEvents();

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestTitle, setSuggestTitle] = useState("");

  if (!canViewLegacyEvent(user, event)) {
    return (
      <div className="pb-6">
        <Header title="אין גישה" subtitle="אירוע זה אינו ציבורי עבור החשבון שלך." />
        {onBack ? <GhostButton onClick={onBack}>חזרה</GhostButton> : null}
      </div>
    );
  }

  const showTeacherNotes = canSeeTeacherNotes(user);
  const countdown = event.status === "future" ? daysUntil(event.date) : null;

  return (
    <div className="space-y-8 pb-8">
      <div className="overflow-hidden rounded-[24px] border border-white/[0.1] bg-gradient-to-b from-white/[0.08] via-black/20 to-black/60">
        <div className="p-5 text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className={cx("rounded-full border px-2.5 py-1 text-[11px] font-semibold", statusStyle(event.status))}>{statusLabel(event.status)}</span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/50">{eventTypeLabel(event.type)}</span>
            {countdown !== null ? (
              <span className="rounded-full border border-sky-400/25 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-100">
                {countdown === 0 ? "היום" : `עוד ${countdown} ימים`}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-2xl font-semibold leading-tight text-white">{event.title}</h1>
          <p className="mt-2 text-sm text-white/50">{formatEventDateRange(event.date, event.endDate)}</p>
          {event.location ? (
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/42">
              <MapPin size={16} className="text-emerald-300/80" />
              {event.location}
            </p>
          ) : null}
        </div>
        {event.memoryVideoUrl ? (
          <div className="relative flex aspect-video items-center justify-center border-t border-white/[0.06] bg-black/50">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <Play size={48} className="relative z-10 text-white/75" strokeWidth={1.25} />
            <p className="absolute bottom-4 right-4 text-sm font-medium text-white/70">סרט זיכרון</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {onBuyTickets ? (
          <PrimaryButton className="!py-2.5 !text-sm" tone="competition" onClick={onBuyTickets}>
            <EditableTextWrapper textKey="event.buy_tickets" defaultHe="רכישת כרטיסים" as="span" />
          </PrimaryButton>
        ) : null}
        {canManage && onEdit ? <PrimaryButton className="!py-2.5 !text-sm" onClick={onEdit}>עריכת אירוע</PrimaryButton> : null}
        {canTeach ? <GhostButton className="!text-sm" onClick={() => setNoteOpen(true)}>הערת מורה</GhostButton> : null}
        {canTeach && !canManage ? <GhostButton className="!text-sm" onClick={() => setSuggestOpen(true)}>הצעה להנהלה</GhostButton> : null}
        {canManage ? (
          <GhostButton className="!text-sm !text-rose-200" onClick={() => { if (confirm("למחוק את האירוע?")) { deleteEvent(event.id); onBack?.(); } }}>
            <Trash2 size={16} className="ml-1 inline" />
            מחיקה
          </GhostButton>
        ) : null}
      </div>

      <Card animated={false}>
        <SectionEyebrow>על האירוע</SectionEyebrow>
        <p className="mt-3 text-right text-sm leading-relaxed text-white/55">{event.description}</p>
        <p className="mt-4 text-right text-xs text-white/38">קבוצות: {groupNamesForEvent(event)}</p>
      </Card>

      {event.scheduleNotes ? (
        <Card animated={false}>
          <SectionEyebrow>לוח זמנים</SectionEyebrow>
          <p className="mt-2 whitespace-pre-line text-right text-sm text-white/55">{event.scheduleNotes}</p>
        </Card>
      ) : null}

      {event.equipmentChecklist?.length ? (
        <Card animated={false}>
          <SectionEyebrow>ציוד ותלבושת</SectionEyebrow>
          <ul className="mt-3 space-y-2 text-right text-sm text-white/55">
            {event.equipmentChecklist.map((item) => (
              <li key={item} className="flex justify-end gap-2">
                <span>{item}</span>
                <Check size={16} className="shrink-0 text-white/25" />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {event.parentApprovalRequired ? (
        <Card animated={false} className="border-amber-400/15">
          <SectionEyebrow>אישור הורים</SectionEyebrow>
          <p className="mt-2 text-sm text-white/55">נדרש אישור הורה להשתתפות.</p>
          <p className="mt-1 text-lg font-semibold text-amber-100">{event.parentApprovalCount ?? 0} אישורים התקבלו</p>
        </Card>
      ) : null}

      {event.achievements.length > 0 ? (
        <div>
          <SectionEyebrow>הישגים</SectionEyebrow>
          <div className="mt-3 space-y-2">
            {event.achievements.map((a) => (
              <Card key={a.id} animated={false}>
                <div className="flex justify-end gap-2 text-right">
                  {a.place ? (
                    <span className={cx("rounded-full border px-2.5 py-1 text-[11px] font-bold", achievementBadgeStyle(a.place))}>{achievementPlaceLabel(a.place)}</span>
                  ) : null}
                  <div>
                    <p className="font-semibold text-white">{a.title}</p>
                    {a.description ? <p className="mt-1 text-sm text-white/45">{a.description}</p> : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {event.photoGalleryUrls?.length ? (
        <div>
          <SectionEyebrow>גלריית תמונות</SectionEyebrow>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {event.photoGalleryUrls.map((url, i) => (
              <div key={url} className="aspect-square rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-black/40">
                <span className="flex h-full items-center justify-center text-[10px] text-white/30">תמונה {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {showTeacherNotes && (event.teacherNotes?.length || event.pendingSuggestions?.length) ? (
        <div>
          <SectionEyebrow>הערות צוות</SectionEyebrow>
          <div className="mt-3 space-y-2">
            {event.teacherNotes?.map((n) => (
              <Card key={n.id} animated={false} className="border-sky-400/12">
                <p className="text-right text-[11px] text-white/38">{n.userName}</p>
                <p className="mt-1 text-right text-sm text-white/60">{n.body}</p>
              </Card>
            ))}
            {canManage && event.pendingSuggestions?.map((s) => (
              <Card key={s.id} animated={false} className="border-violet-400/15">
                <p className="text-right text-[11px] text-violet-200/80">הצעה מ{s.userName} · {s.kind === "achievement" ? "הישג" : "וידאו"}</p>
                <p className="mt-1 font-semibold text-white">{s.title}</p>
                <div className="mt-2 flex gap-2">
                  <PrimaryButton className="!flex-1 !py-2 !text-xs" onClick={() => approveSuggestion(event.id, s.id)}>אישור</PrimaryButton>
                  <GhostButton className="!flex-1 !text-xs" onClick={() => dismissSuggestion(event.id, s.id)}>דחייה</GhostButton>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <BottomSheet open={noteOpen} title="הערת מורה" onClose={() => setNoteOpen(false)}>
        <div className="space-y-3 text-right">
          <textarea className="min-h-[5rem] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="הערה פנימית לצוות..." />
          <PrimaryButton onClick={() => { addTeacherNote(event.id, noteBody); setNoteBody(""); setNoteOpen(false); }}>שמירה</PrimaryButton>
        </div>
      </BottomSheet>

      <BottomSheet open={suggestOpen} title="הצעה להנהלה" onClose={() => setSuggestOpen(false)}>
        <div className="space-y-3 text-right">
          <input className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none" value={suggestTitle} onChange={(e) => setSuggestTitle(e.target.value)} placeholder="כותרת ההצעה" />
          <PrimaryButton disabled={!suggestTitle.trim()} onClick={() => { addTeacherSuggestion(event.id, { kind: "achievement", title: suggestTitle.trim() }); setSuggestTitle(""); setSuggestOpen(false); }}>שליחה לאישור</PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}
