"use client";

import type { ChangeEvent, ElementType, ReactNode } from "react";
import { AlertCircle, CalendarDays, CalendarX, CheckCircle2, Download, History, Info, Loader2, Upload } from "lucide-react";
import {
  BidiNumber,
  Button,
  MobileList,
  MobileListRow,
  MobileSection,
  SafeMeta,
  SafeTitle,
  StatusBadge,
  WeeklyStudioDayLane,
  WeeklyStudioLessonCard,
  WeeklyStudioTimetableShell,
  v6Cx,
  v6Lovable,
  v6Motion,
  v6TimetableInteraction,
  v6TimetableSurface,
  v6Tone,
  type V6Tone,
  type WeeklyStudioDaySummary
} from "@/components/v6/design-system";
import {
  formatV6LessonDuration as formatLessonDuration,
  v6LessonStatusTone as lessonStatusTone,
  type V6ManagementDaySummary,
  type V6ManagementScheduleDay,
  type V6ManagementScheduleLessonRow
} from "@/lib/v6/view-models";
import {
  selectV6ManagementLessonDisplayTitle as managementLessonDisplayTitle,
  type V6ManagementTimetableConflictIndicator,
  type V6ManagementTimetableConflictSummary,
  type V6ManagementTimetableEditSessionMeta,
  type V6ManagementTimetablePublishState
} from "@/lib/v6/timetable-editing";
import type { V6TimetableAuditEvent } from "@/lib/v6/timetable-audit";

export type TimetableImportNotice = {
  message: string;
  tone: "success" | "error";
};

type TimetableNoticeTone = "info" | "success" | "warning" | "error";

const timetableNoticeToneStyles: Record<TimetableNoticeTone, { ring: string; icon: ElementType; iconClass: string }> = {
  info: { ring: "", icon: Info, iconClass: "text-white/58" },
  success: { ring: "ring-1 ring-emerald-100/[0.18]", icon: CheckCircle2, iconClass: "text-emerald-100/88" },
  warning: { ring: "ring-1 ring-amber-100/[0.18]", icon: AlertCircle, iconClass: "text-amber-100/88" },
  error: { ring: "ring-1 ring-rose-100/[0.22]", icon: AlertCircle, iconClass: "text-rose-100/88" }
};

function TimetableCalmNotice({ tone, title, children }: { tone: TimetableNoticeTone; title?: string; children: ReactNode }) {
  const style = timetableNoticeToneStyles[tone];
  const Icon = style.icon;
  return (
    <div className={v6Cx(v6TimetableSurface.notice, "rounded-2xl p-3.5", style.ring, v6Motion.gentle)} role={tone === "error" ? "alert" : "status"}>
      <div className="flex items-start gap-2.5">
        <span className={v6Cx("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-white/[0.050]", style.iconClass)} aria-hidden="true">
          <Icon size={15} strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1">
          {title ? <SafeMeta as="p" className={v6Lovable.eyebrow}>{title}</SafeMeta> : null}
          <SafeMeta as="p" className={v6Cx("text-xs leading-relaxed text-white/62", title && "mt-1.5")}>{children}</SafeMeta>
        </span>
      </div>
    </div>
  );
}

function TimetableEmptyPanel({
  icon: Icon,
  title,
  description,
  hint,
  tone = "management"
}: {
  icon: ElementType;
  title: ReactNode;
  description: ReactNode;
  hint?: ReactNode;
  tone?: V6Tone;
}) {
  return (
    <div className={v6Cx(v6TimetableSurface.emptyState, "rounded-2xl p-4 text-start")} role="status">
      <span className={v6Cx("grid h-10 w-10 place-items-center rounded-2xl", v6Tone[tone].soft, v6Tone[tone].text)} aria-hidden="true">
        <Icon size={17} strokeWidth={1.9} />
      </span>
      <SafeTitle as="p" className="mt-3 text-base font-semibold tracking-tight text-white/92">{title}</SafeTitle>
      <SafeMeta as="p" className="mt-1.5 text-xs leading-relaxed text-white/52">{description}</SafeMeta>
      {hint ? <SafeMeta as="p" className="mt-2 text-[11px] leading-relaxed text-white/42">{hint}</SafeMeta> : null}
    </div>
  );
}

function publishStatusHelper(publishState: V6ManagementTimetablePublishState, persistenceLoading: boolean) {
  if (persistenceLoading) return "ממתינים לסיום טעינת המערכת. פרסום ייפתח אוטומטית כשהטעינה תסתיים.";
  if (publishState.phase === "blocked_by_conflicts") {
    return "יש חפיפות בזמן — מורה, חדר או קבוצה — שצריך לסדר לפני פרסום. בדקו את סימוני ההתנגשות בשיעורים.";
  }
  if (publishState.phase === "published") return "המערכת על המסך מעודכנת. עריכה חדשה תישמר קודם כטיוטה.";
  if (publishState.phase === "draft_dirty" && publishState.conflictPolicy.warningCount) {
    return "אפשר לפרסם, אבל כדאי לעבור על האזהרות לפני שמאשרים את השינויים.";
  }
  if (publishState.phase === "ready_to_publish") return "הטיוטה מוכנה. לחצו «פרסם שינויים» כדי לעדכן את המערכת על המסך.";
  return null;
}

function resolvePublishNoticeTone(message: string): TimetableNoticeTone {
  if (message.includes("אי אפשר") || message.includes("מחכים") || message.includes("לא הצלחנו") || message.includes("חסום")) return "warning";
  if (message.includes("פורסמו") || message.includes("עודכנה") || message.includes("נטען") || message.includes("שוחזר")) return "success";
  return "info";
}

function formatSnapshotImportMessage(message: string, tone: TimetableImportNotice["tone"]) {
  if (tone === "success") {
    if (message.includes("overrides")) return "המערכת שוחזרה מקובץ הגיבוי. הטיוטה אופסה והשינויים מוצגים על המסך.";
    return message;
  }

  if (message.includes("JSON")) return "הקובץ לא נקרא. בחרו קובץ גיבוי שמור מהמסך (סיומת .json).";
  if (message.includes("גרסת")) return "קובץ הגיבוי מגרסה אחרת ולא נתמך במסך הזה.";
  if (message.includes("אינו קיים במערכת הנוכחית")) return "הקובץ מכיל שיעורים שלא קיימים במערכת הנוכחית. ייבאו גיבוי מהסטודיו הזה.";
  if (message.includes("Snapshot")) return "הקובץ לא נראה כמו גיבוי מערכת תקין. בדקו שבחרתם את הקובץ הנכון.";
  return message;
}

function formatPersistenceSurfaceCopy(input: {
  persistenceNotice: string | null;
  persistenceStatusLabel: string;
  persistenceCanUseAdapter: boolean;
  persistenceLoading: boolean;
  persistenceFlagEnabled: boolean;
}) {
  if (input.persistenceLoading) return { tone: "info" as const, text: "טוענים את המערכת המפורסמת..." };

  const notice = input.persistenceNotice?.trim();
  if (notice) {
    if (notice.includes("טוענים")) return { tone: "info" as const, text: "טוענים את המערכת המפורסמת..." };
    if (notice.includes("נכשלה") || notice.includes("לא זמין") || notice.includes("לא מוגדר")) {
      return { tone: "warning" as const, text: notice.replace(/Supabase/g, "הסנכרון לענן").replace(/JSON/g, "קובץ") };
    }
    if (notice.includes("פורסמה") || notice.includes("מסונכרן") || notice.includes("נשמר")) {
      return { tone: "success" as const, text: notice.replace(/Supabase/g, "הענן").replace(/Snapshot/g, "גיבוי") };
    }
    return { tone: "info" as const, text: notice.replace(/Supabase/g, "הענן").replace(/Snapshot/g, "גיבוי") };
  }

  if (!input.persistenceFlagEnabled) {
    return { tone: "info" as const, text: "המערכת נשמרת במכשיר זה. סנכרון לענן כבוי." };
  }

  if (input.persistenceCanUseAdapter) return { tone: "success" as const, text: "סנכרון לענן פעיל למסך הניהול." };

  const label = input.persistenceStatusLabel.replace(/Supabase/g, "סנכרון לענן");
  if (label.includes("כבויה")) return { tone: "info" as const, text: "סנכרון לענן כבוי. הכל נשמר מקומית במסך." };
  if (label.includes("לא זמין") || label.includes("לא מוגדר")) return { tone: "warning" as const, text: `${label}. ממשיכים עם העותק המקומי.` };
  return { tone: "info" as const, text: label };
}

const timetableAuditActionCopy: Record<V6TimetableAuditEvent["action"], { title: string; tone: V6Tone }> = {
  slot_edited: { title: "שיעור עודכן", tone: "management" },
  undo: { title: "ביטול שינוי", tone: "modern" },
  redo: { title: "החזרת שינוי", tone: "modern" },
  draft_discarded: { title: "טיוטה נמחקה", tone: "urgent" },
  publish_attempted: { title: "ניסיון פרסום", tone: "management" },
  publish_blocked_by_conflicts: { title: "פרסום חסום", tone: "urgent" },
  publish_succeeded: { title: "טיוטה פורסמה", tone: "success" },
  snapshot_restored: { title: "Snapshot שוחזר", tone: "success" }
};

const timetableAuditFieldCopy: Record<string, string> = {
  displayTitle: "שם",
  room: "חלל",
  teacherId: "מזהה מורה",
  teacherName: "מורה",
  durationMinutes: "משך",
  status: "סטטוס"
};

function formatTimetableAuditTime(occurredAt: string) {
  return new Intl.DateTimeFormat("he-IL", { hour: "2-digit", minute: "2-digit" }).format(new Date(occurredAt));
}

function timetableAuditSubtitle(event: V6TimetableAuditEvent) {
  if (event.action === "slot_edited") {
    const fields = event.metadata.changedFields?.map((field) => timetableAuditFieldCopy[field.field] ?? field.field).join(", ");
    return [event.metadata.lesson?.title ?? event.metadata.lesson?.groupName, fields ? `שדות: ${fields}` : undefined].filter(Boolean).join(" · ");
  }

  if (event.action === "publish_blocked_by_conflicts") {
    return `${event.metadata.conflicts?.blockingCount ?? event.metadata.conflicts?.totalCount ?? 0} התנגשויות חוסמות`;
  }

  if (event.action === "draft_discarded") {
    return `${event.metadata.session?.unsavedEditCountBefore ?? event.metadata.session?.unsavedEditCount ?? 0} שינויים נמחקו מהטיוטה`;
  }

  if (event.action === "snapshot_restored") {
    return event.metadata.note ?? "המערכת המפורסמת שוחזרה מקובץ מקומי";
  }

  const editCount = event.metadata.session?.unsavedEditCountAfter ?? event.metadata.session?.unsavedEditCount;
  return typeof editCount === "number" ? `${editCount} שינויים בטיוטה` : "תועד מקומית";
}

type TimetableStatusSummaryProps = {
  publishState: V6ManagementTimetablePublishState;
  publishTone: V6Tone;
  persistenceLoading?: boolean;
};

export function TimetableStatusSummary({ publishState, publishTone, persistenceLoading = false }: TimetableStatusSummaryProps) {
  const statusHelper = publishStatusHelper(publishState, persistenceLoading);
  return (
    <div className="flex min-w-0 flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
      <div className="min-w-0">
        <SafeMeta as="p" className={v6Lovable.eyebrow}>טיוטה ופרסום</SafeMeta>
        <SafeTitle as="p" className="mt-1.5 break-words text-base font-semibold tracking-tight text-white/92">
          {publishState.label}
        </SafeTitle>
        <SafeMeta as="p" className="mt-1.5 text-xs leading-relaxed text-white/52">
          {publishState.description}
        </SafeMeta>
        {statusHelper ? <SafeMeta as="p" className="mt-2 text-[11px] leading-relaxed text-white/42">{statusHelper}</SafeMeta> : null}
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 min-[380px]:items-end">
        {persistenceLoading ? (
          <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-white/[0.060] px-2.5 text-[11px] font-medium text-white/62" aria-live="polite">
            <Loader2 size={12} strokeWidth={1.9} className="motion-safe:animate-spin" aria-hidden="true" />
            טוענים
          </span>
        ) : null}
        <StatusBadge tone={publishTone}>
          {publishState.phase === "blocked_by_conflicts" ? "חסום" : publishState.phase === "published" ? "פורסם" : "טיוטה"}
        </StatusBadge>
      </div>
    </div>
  );
}

type TimetableActivityPanelProps = {
  auditEvents: V6TimetableAuditEvent[];
  persistenceCanUseAdapter: boolean;
};

export function TimetableActivityPanel({ auditEvents, persistenceCanUseAdapter }: TimetableActivityPanelProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 px-0.5">
        <SafeMeta as="p" className={v6Lovable.eyebrow}>פעילות מערכת אחרונה</SafeMeta>
        <SafeMeta as="span" className="text-[11px] font-medium text-white/42">{persistenceCanUseAdapter ? "סנכרון לענן" : "מקומי במסך"}</SafeMeta>
      </div>
      {auditEvents.length ? (
      <MobileList>
        {auditEvents.slice(0, 3).map((event) => {
          const actionCopy = timetableAuditActionCopy[event.action];
          return (
            <MobileListRow
              key={event.id}
              icon={History}
              title={actionCopy.title}
              subtitle={timetableAuditSubtitle(event)}
              tone={actionCopy.tone}
              trailing={<SafeMeta as="span" className="text-[11px] font-semibold text-white/42">{formatTimetableAuditTime(event.occurredAt)}</SafeMeta>}
              surfaceClassName={v6Cx(v6TimetableSurface.activityRow, v6TimetableInteraction.activityRow)}
            />
          );
        })}
      </MobileList>
      ) : (
        <TimetableEmptyPanel
          icon={History}
          title="עדיין אין פעילות להצגה"
          description="אחרי עריכת שיעור, פרסום, מחיקת טיוטה או ייבוא גיבוי — הפעולות האחרונות יופיעו כאן."
          hint="הפעילות נשמרת במסך זה לצורך מעקב מהיר."
          tone="modern"
        />
      )}
    </div>
  );
}

type TimetableDraftToolbarProps = {
  sessionMeta: V6ManagementTimetableEditSessionMeta;
  publishState: V6ManagementTimetablePublishState;
  publishTone: V6Tone;
  canPublishNow: boolean;
  importInputId: string;
  publishNotice: string | null;
  exportNotice: string | null;
  importNotice: TimetableImportNotice | null;
  persistenceFlagEnabled: boolean;
  persistenceNotice: string | null;
  persistenceStatusLabel: string;
  persistenceCanUseAdapter: boolean;
  persistenceLoading?: boolean;
  auditEvents: V6TimetableAuditEvent[];
  onUndoDraft: () => void;
  onRedoDraft: () => void;
  onDiscardDraft: () => void;
  onPublishDraft: () => void;
  onExportSnapshot: () => void;
  onImportSnapshot: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function TimetableDraftToolbar({
  sessionMeta,
  publishState,
  publishTone,
  canPublishNow,
  importInputId,
  publishNotice,
  exportNotice,
  importNotice,
  persistenceFlagEnabled,
  persistenceNotice,
  persistenceStatusLabel,
  persistenceCanUseAdapter,
  persistenceLoading = false,
  auditEvents,
  onUndoDraft,
  onRedoDraft,
  onDiscardDraft,
  onPublishDraft,
  onExportSnapshot,
  onImportSnapshot
}: TimetableDraftToolbarProps) {
  const persistenceSurface = formatPersistenceSurfaceCopy({
    persistenceNotice,
    persistenceStatusLabel,
    persistenceCanUseAdapter,
    persistenceLoading,
    persistenceFlagEnabled
  });
  const showDraftCleanHint = !sessionMeta.isDirty && !sessionMeta.canUndo && !sessionMeta.canRedo;
  const showUndoRedoHint = !sessionMeta.canUndo && !sessionMeta.canRedo && sessionMeta.isDirty;
  const showPublishHint = !canPublishNow && sessionMeta.isDirty && !persistenceLoading;

  return (
    <div className="flex flex-col gap-3">
      <div className={v6Cx(v6TimetableSurface.toolbar, "flex min-w-0 flex-col gap-3.5 rounded-2xl p-4", v6Motion.gentle)}>
        <TimetableStatusSummary publishState={publishState} publishTone={publishTone} persistenceLoading={persistenceLoading} />
        <div className={v6Cx("grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 [&>button]:min-h-11 [&>button]:whitespace-normal [&>button]:px-3 [&>button]:leading-snug", v6TimetableInteraction.toolbarActions)}>
          <Button variant="ghost" disabled={!sessionMeta.canUndo} onClick={onUndoDraft}>בטל</Button>
          <Button variant="ghost" disabled={!sessionMeta.canRedo} onClick={onRedoDraft}>חזור</Button>
          <Button variant="danger" disabled={!publishState.canDiscard} onClick={onDiscardDraft}>מחק טיוטה</Button>
          <Button disabled={!canPublishNow} onClick={onPublishDraft}>פרסם שינויים</Button>
        </div>
        {showDraftCleanHint || showUndoRedoHint || showPublishHint ? (
          <SafeMeta as="p" className="text-[11px] leading-relaxed text-white/42">
            {showPublishHint && publishState.phase === "blocked_by_conflicts"
              ? "פרסום חסום עד סידור ההתנגשויות החוסמות."
              : showPublishHint
                ? "פרסום ייפתח כשהטיוטה מוכנה ואין טעינה פעילה."
                : showUndoRedoHint
                  ? "אין עוד שלבים לביטול או החזרה בטיוטה הנוכחית."
                  : "אין שינויים שלא פורסמו. עריכה חדשה תיפתח כטיוטה."}
          </SafeMeta>
        ) : null}
        <div className={v6Cx("grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 [&>button]:min-h-11 [&>button]:whitespace-normal [&>button]:px-3 [&>button]:leading-snug", v6TimetableInteraction.toolbarActions)}>
          <Button variant="ghost" onClick={onExportSnapshot}><Download size={12} strokeWidth={1.9} aria-hidden="true" /> ייצוא Snapshot</Button>
          <input id={importInputId} type="file" accept=".json,application/json" className="peer sr-only" onChange={onImportSnapshot} />
          <label
            htmlFor={importInputId}
            className={v6Cx(
              "lk-safe-control inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-3 text-center text-[13px] font-semibold leading-snug",
              v6Motion.standard,
              v6Motion.press,
              v6Motion.focusRing,
              "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#f4d58d]/35 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#050304]",
              v6TimetableInteraction.ghostAction
            )}
          >
            <Upload size={12} strokeWidth={1.9} aria-hidden="true" /> ייבוא Snapshot
          </label>
        </div>
        <div className="space-y-2">
          {publishState.conflictPolicy.warningCount ? (
            <SafeMeta as="p" className="text-xs leading-relaxed text-amber-50/72">
              <BidiNumber>{publishState.conflictPolicy.warningCount}</BidiNumber> אזהרות לבדיקה — לא חוסמות פרסום, אבל כדאי לעבור עליהן.
            </SafeMeta>
          ) : null}
          {!persistenceLoading ? (
            <TimetableCalmNotice tone={persistenceSurface.tone} title="שמירה וסנכרון">
              {persistenceSurface.text}
            </TimetableCalmNotice>
          ) : null}
        </div>
      </div>
      {publishNotice ? (
        <TimetableCalmNotice tone={resolvePublishNoticeTone(publishNotice)} title="פרסום">
          {publishNotice.replace(/Supabase/g, "הענן")}
        </TimetableCalmNotice>
      ) : null}
      {exportNotice ? (
        <TimetableCalmNotice tone={exportNotice.includes("לא") ? "warning" : "success"} title="ייצוא גיבוי">
          {exportNotice.replace(/JSON/g, "קובץ").replace(/Snapshot/g, "גיבוי")}
        </TimetableCalmNotice>
      ) : null}
      {importNotice ? (
        <TimetableCalmNotice tone={importNotice.tone === "success" ? "success" : "error"} title={importNotice.tone === "success" ? "ייבוא גיבוי" : "ייבוא לא הצליח"}>
          {formatSnapshotImportMessage(importNotice.message, importNotice.tone)}
        </TimetableCalmNotice>
      ) : null}
      <TimetableActivityPanel auditEvents={auditEvents} persistenceCanUseAdapter={persistenceCanUseAdapter} />
    </div>
  );
}

type TimetableTimelineCardProps = {
  visibleScheduleDays: V6ManagementScheduleDay[];
  selectedDay: string;
  hasLessonsInWeek: boolean;
  conflictCountsByDay: Record<string, number>;
  conflictIndicatorsByLessonId: Record<string, V6ManagementTimetableConflictIndicator[]>;
  onOpenLesson: (row: V6ManagementScheduleLessonRow) => void;
};

export function TimetableTimelineCard({
  visibleScheduleDays,
  selectedDay,
  hasLessonsInWeek,
  conflictCountsByDay,
  conflictIndicatorsByLessonId,
  onOpenLesson
}: TimetableTimelineCardProps) {
  if (!visibleScheduleDays.length) {
    return (
      <TimetableEmptyPanel
        icon={CalendarX}
        title={`אין שיעורים ביום ${selectedDay}`}
        description="בחרו יום אחר בפס העליון, או ערכו שיעור קיים ביום אחר ושייכו אותו ליום הזה."
        hint={hasLessonsInWeek ? "יש שיעורים בימים אחרים השבוע — אפשר לעבור אליהם מהבחירה למעלה." : "כשיתווספו שיעורים למערכת, הם יופיעו כאן."}
        tone="management"
      />
    );
  }

  return (
    <>
      {visibleScheduleDays.map((day) => (
        <WeeklyStudioDayLane
          key={day.day}
          day={day.day}
          isToday={day.isToday}
          lessonCount={day.rows.length}
          conflictCount={conflictCountsByDay[day.day] ?? 0}
          rooms={day.rooms}
          totalStudents={day.totalStudents}
          densityLabel={day.densityLabel}
        >
          {day.rows.map((row) => (
            <WeeklyStudioLessonCard
              key={row.lesson.id}
              groupName={managementLessonDisplayTitle(row)}
              groupMeta={[row.group?.ageGroup, row.group?.schedule].filter(Boolean).join(" · ")}
              danceStyle={row.danceStyle}
              teacher={row.teacherNames || "צוות לא משויך"}
              room={row.roomName}
              startTime={row.lesson.time}
              endTime={row.endTime}
              durationLabel={formatLessonDuration(row.durationMinutes)}
              durationMinutes={row.durationMinutes}
              studentCount={row.studentCount}
              status={row.status}
              statusTone={lessonStatusTone(row.status)}
              tone={row.tone}
              conflictIndicators={conflictIndicatorsByLessonId[row.lesson.id]}
              onClick={() => onOpenLesson(row)}
              ariaLabel={`פתיחת עריכה מקומית לשיעור ${managementLessonDisplayTitle(row)}, ${row.lesson.time} עד ${row.endTime}, ${row.roomName}, ${row.teacherNames || "ללא צוות משויך"}`}
            />
          ))}
        </WeeklyStudioDayLane>
      ))}
    </>
  );
}

type TimetableDaySelectorProps = {
  weekLabel: ReactNode;
  lessonCount: number;
  roomCount: number;
  localDaySummaries: V6ManagementDaySummary[];
  selectedDay: string;
  conflictSummary: V6ManagementTimetableConflictSummary[];
  conflictCountsByDay: Record<string, number>;
  actions: ReactNode;
  children: ReactNode;
  onSelectDay: (day: string) => void;
};

export function TimetableDaySelector({
  weekLabel,
  lessonCount,
  roomCount,
  localDaySummaries,
  selectedDay,
  conflictSummary,
  conflictCountsByDay,
  actions,
  children,
  onSelectDay
}: TimetableDaySelectorProps) {
  const daySummaries: WeeklyStudioDaySummary[] = localDaySummaries.map((day) => ({
    ...day,
    conflictCount: conflictCountsByDay[day.day] ?? 0,
    isActive: day.day === selectedDay,
    onClick: day.lessonCount ? () => onSelectDay(day.day) : undefined
  }));

  return (
    <WeeklyStudioTimetableShell
      weekLabel={weekLabel}
      lessonCount={lessonCount}
      roomCount={roomCount}
      conflictSummary={conflictSummary}
      daySummaries={daySummaries}
      actions={actions}
    >
      {children}
    </WeeklyStudioTimetableShell>
  );
}

type ManagementTimetableSectionProps = {
  localScheduleLessonRows: V6ManagementScheduleLessonRow[];
  localDaySummaries: V6ManagementDaySummary[];
  visibleScheduleDays: V6ManagementScheduleDay[];
  selectedDay: string;
  roomCount: number;
  conflictSummary: V6ManagementTimetableConflictSummary[];
  conflictCountsByDay: Record<string, number>;
  conflictIndicatorsByLessonId: Record<string, V6ManagementTimetableConflictIndicator[]>;
  sessionMeta: V6ManagementTimetableEditSessionMeta;
  publishState: V6ManagementTimetablePublishState;
  publishTone: V6Tone;
  canPublishNow: boolean;
  importInputId: string;
  publishNotice: string | null;
  exportNotice: string | null;
  importNotice: TimetableImportNotice | null;
  persistenceFlagEnabled: boolean;
  persistenceNotice: string | null;
  persistenceStatusLabel: string;
  persistenceCanUseAdapter: boolean;
  persistenceLoading?: boolean;
  auditEvents: V6TimetableAuditEvent[];
  onSelectDay: (day: string) => void;
  onOpenLesson: (row: V6ManagementScheduleLessonRow) => void;
  onUndoDraft: () => void;
  onRedoDraft: () => void;
  onDiscardDraft: () => void;
  onPublishDraft: () => void;
  onExportSnapshot: () => void;
  onImportSnapshot: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ManagementTimetableSection({
  localScheduleLessonRows,
  localDaySummaries,
  visibleScheduleDays,
  selectedDay,
  roomCount,
  conflictSummary,
  conflictCountsByDay,
  conflictIndicatorsByLessonId,
  sessionMeta,
  publishState,
  publishTone,
  canPublishNow,
  importInputId,
  publishNotice,
  exportNotice,
  importNotice,
  persistenceFlagEnabled,
  persistenceNotice,
  persistenceStatusLabel,
  persistenceCanUseAdapter,
  persistenceLoading = false,
  auditEvents,
  onSelectDay,
  onOpenLesson,
  onUndoDraft,
  onRedoDraft,
  onDiscardDraft,
  onPublishDraft,
  onExportSnapshot,
  onImportSnapshot
}: ManagementTimetableSectionProps) {
  return (
    <MobileSection tone="management">
      {localScheduleLessonRows.length ? (
        <TimetableDaySelector
          weekLabel={sessionMeta.isDirty ? `טיוטה מקומית · ${sessionMeta.unsavedEditCount} שינויים` : "מערכת מפורסמת מקומית. הקשה על שיעור פותחת עריכה."}
          lessonCount={localScheduleLessonRows.length}
          roomCount={roomCount}
          conflictSummary={conflictSummary}
          localDaySummaries={localDaySummaries}
          selectedDay={selectedDay}
          conflictCountsByDay={conflictCountsByDay}
          onSelectDay={onSelectDay}
          actions={
            <TimetableDraftToolbar
              sessionMeta={sessionMeta}
              publishState={publishState}
              publishTone={publishTone}
              canPublishNow={canPublishNow}
              importInputId={importInputId}
              publishNotice={publishNotice}
              exportNotice={exportNotice}
              importNotice={importNotice}
              persistenceFlagEnabled={persistenceFlagEnabled}
              persistenceNotice={persistenceNotice}
              persistenceStatusLabel={persistenceStatusLabel}
              persistenceCanUseAdapter={persistenceCanUseAdapter}
              persistenceLoading={persistenceLoading}
              auditEvents={auditEvents}
              onUndoDraft={onUndoDraft}
              onRedoDraft={onRedoDraft}
              onDiscardDraft={onDiscardDraft}
              onPublishDraft={onPublishDraft}
              onExportSnapshot={onExportSnapshot}
              onImportSnapshot={onImportSnapshot}
            />
          }
        >
          <TimetableTimelineCard
            visibleScheduleDays={visibleScheduleDays}
            selectedDay={selectedDay}
            hasLessonsInWeek={localScheduleLessonRows.length > 0}
            conflictCountsByDay={conflictCountsByDay}
            conflictIndicatorsByLessonId={conflictIndicatorsByLessonId}
            onOpenLesson={onOpenLesson}
          />
        </TimetableDaySelector>
      ) : (
        <TimetableEmptyPanel
          icon={CalendarDays}
          title="אין עדיין מערכת שבועית להצגה"
          description="כשיש שיעורים במערכת הסטודיו, הם יופיעו כאן לעריכה, פרסום ומעקב התנגשויות."
          hint="אפשר גם לייבא גיבוי מערכת שמור, אם קיים כזה מהעבר."
          tone="management"
        />
      )}
    </MobileSection>
  );
}
