"use client";

import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type ElementType } from "react";
import { Activity, AlertTriangle, Bell, CalendarDays, CheckCircle2, ClipboardList, Clock, Database, DoorOpen, ImagePlus, MapPin, MessageCircle, Receipt, Shield, ShoppingBag, Sparkles, Trophy, Users } from "lucide-react";
import { useV6 } from "@/lib/v6/AppProvider";
import type { V6CalendarEvent, V6Group, V6Lesson, V6Role, V6Screen, V6Tab, V6User } from "@/lib/v6/types";
import { selectV6LessonsForActor } from "@/lib/domains/attendance/selectors";
import { selectV6UnreadCount, selectV6NotificationsForActor, selectV6MessagesForActor } from "@/lib/domains/messages/selectors";
import { selectV6UpcomingEvents } from "@/lib/domains/events/selectors";
import { modulesForRole } from "@/lib/v6/ui-composition";
import { currentV6HebrewWeekday, formatV6LessonDuration as formatLessonDuration, selectV6ManagementHomeViewModel, selectV6PaymentModeLabel as paymentModeLabel, selectV6ProductPriceLabel as productPrice, selectV6StudentHomeViewModel, selectV6TeacherHomeViewModel, v6LessonStatusTone as lessonStatusTone, type V6AttendanceProgress, type V6ManagementScheduleLessonRow } from "@/lib/v6/view-models";
import { applyV6ManagementTimetableEditSessionOverrides, createV6ManagementLessonDraft, createV6ManagementTimetableEditSession, discardV6ManagementTimetableEditSessionDraft, publishV6ManagementTimetableEditSession, redoV6ManagementTimetableEditSession, restoreV6ManagementTimetablePublishedOverrides, saveV6ManagementLessonDraft, selectV6ManagementLessonEndTime as managementLessonEndTime, selectV6ManagementTimetableEditingViewModel, selectV6ManagementTimetableEditSessionMeta, selectV6ManagementTimetableEditSessionTransition, selectV6ManagementTimetablePublishState, undoV6ManagementTimetableEditSession, updateV6ManagementLessonDraft, type V6ManagementLessonDraft } from "@/lib/v6/timetable-editing";
import { createV6TimetableDraftDiscardedAuditEvent, createV6TimetablePublishAttemptedAuditEvent, createV6TimetablePublishBlockedAuditEvent, createV6TimetablePublishSucceededAuditEvent, createV6TimetableRedoAuditEvent, createV6TimetableSlotEditedAuditEvent, createV6TimetableSnapshotRestoredAuditEvent, createV6TimetableUndoAuditEvent, selectV6TimetableAuditActor, selectV6TimetableAuditConflictSummary, type V6TimetableAuditEvent } from "@/lib/v6/timetable-audit";
import { createV6TimetableSnapshot, createV6TimetableSnapshotFilename, parseV6TimetableSnapshotJsonImport, serializeV6TimetableSnapshot } from "@/lib/v6/timetable-snapshot";
import { createTimetablePersistencePayload, hydrateTimetableSessionFromPersistence, type V6TimetablePersistencePayload } from "@/lib/v6/timetable-persistence";
import { createV6TimetablePersistenceRuntime } from "@/lib/v6/timetable-persistence-runtime";
import { AttachedPrimaryAction, BidiNumber, BottomSheet, Button, HeroSurface, InlineMetric, LiveActivityRow, ManagementSummaryTile, MobileInfoTile, MobileIntro, MobileList, MobileListRow, MobileScreen, MobileSection, OperationalAlertRow, RoomAllocationTile, SafeMeta, SafeTitle, SheetActions, StatusBadge, Surface, v6Control, v6Cx, type V6Tone } from "@/components/v6/design-system";
import { ManagementTimetableSection, type TimetableImportNotice } from "./management-timetable-section";
import { StudentHomeSection } from "./student-home-section";
import { TeacherHomeSection } from "./teacher-home-section";

type HomeAction = {
  icon: ElementType;
  title: string;
  subtitle: string;
  tone: V6Tone;
  onClick: () => void;
};

function roleTone(role: V6Role): V6Tone {
  if (role === "super_admin") return "admin";
  if (role === "management") return "management";
  if (role === "teacher") return "studio";
  if (role === "parent") return "classic";
  return "hiphop";
}

function roleHomeCopy(user: V6User) {
  if (user.role === "teacher") return { title: "היום בסטודיו", subtitle: "השיעור הבא, נוכחות ועדכוני הקבוצה במקום אחד.", cue: "לוח מורה", action: "לשיעור הקרוב" };
  if (user.role === "management") return { title: "היום בסטודיו", subtitle: "שיעורים, הודעות ותיאומים קרובים.", cue: "ניהול יומי", action: "ללוח השנה" };
  if (user.role === "super_admin") return { title: "היום בסטודיו", subtitle: "הודעות, לוח וכלים חשובים במקום אחד.", cue: "היום", action: "פתיחה" };
  if (user.role === "parent") return { title: "מה קורה היום", subtitle: "השיעור הבא, הודעות חשובות ותיאומים קרובים.", cue: "עדכון להורה", action: "היום הקרוב" };
  return { title: "היום שלך בסטודיו", subtitle: "השיעור הבא, עדכונים והתקדמות אישית במקום אחד.", cue: "לוח תלמידה", action: "לשיעור הקרוב" };
}

type PrimaryHomeItem = {
  label: string;
  title: string;
  cta: string;
  onClick: () => void;
};

function roleHomeActions(input: { user: V6User; unread: number; nextEventTitle?: string; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }): HomeAction[] {
  const { user, unread, nextEventTitle, openScreen, openTab } = input;
  if (user.role === "super_admin") {
    return [
      { icon: MessageCircle, title: "הודעות", subtitle: unread ? `${unread} שלא נקראו` : "מהסטודיו", tone: "studio", onClick: () => openTab("messages") },
      { icon: Shield, title: "משתמשים", subtitle: "ניהול והרשאות", tone: "management", onClick: () => openScreen("users") },
      { icon: Database, title: "מסד נתונים", subtitle: "ייצוא, ייבוא וגיבוי", tone: "admin", onClick: () => openScreen("database") },
      { icon: ShoppingBag, title: "חנות", subtitle: "מוצרים וכרטיסים", tone: "shop", onClick: () => openTab("shop") }
    ];
  }
  if (user.role === "management") {
    return [
      { icon: CalendarDays, title: "לוח שנה", subtitle: nextEventTitle ?? "אירועים וחזרות", tone: "management", onClick: () => openScreen("calendar") },
      { icon: MessageCircle, title: "הודעות", subtitle: unread ? `${unread} שלא נקראו` : "מהקבוצה", tone: "studio", onClick: () => openTab("messages") },
      { icon: Shield, title: "משתמשים", subtitle: "תלמידים וצוות", tone: "management", onClick: () => openScreen("users") },
      { icon: Receipt, title: "שיעורים פרטיים", subtitle: "בקשות ותיאומים", tone: "shop", onClick: () => openScreen("private_lessons") }
    ];
  }
  if (user.role === "teacher") {
    return [
      { icon: CalendarDays, title: "שיעורים", subtitle: "לו״ז ונוכחות", tone: "studio", onClick: () => openTab("lessons") },
      { icon: MessageCircle, title: "הודעות", subtitle: unread ? `${unread} שלא נקראו` : "מהקבוצה", tone: "studio", onClick: () => openTab("messages") },
      { icon: ImagePlus, title: "גלריה", subtitle: "תמונות וסרטונים", tone: "modern", onClick: () => openScreen("media") },
      { icon: CalendarDays, title: "לוח שנה", subtitle: nextEventTitle ?? "אירועים וחזרות", tone: "management", onClick: () => openScreen("calendar") }
    ];
  }
  if (user.role === "parent") {
    return [
      { icon: CalendarDays, title: "שיעורים", subtitle: "לו״ז ילדים", tone: "classic", onClick: () => openTab("lessons") },
      { icon: MessageCircle, title: "הודעות", subtitle: unread ? `${unread} שלא נקראו` : "מהסטודיו", tone: "studio", onClick: () => openTab("messages") },
      { icon: ImagePlus, title: "גלריה", subtitle: "תמונות וסרטונים", tone: "modern", onClick: () => openScreen("media") },
      { icon: ShoppingBag, title: "חנות", subtitle: "מוצרים וכרטיסים", tone: "shop", onClick: () => openTab("shop") }
    ];
  }
  return [
    { icon: CalendarDays, title: "שיעורים", subtitle: "לו״ז קרוב", tone: "hiphop", onClick: () => openTab("lessons") },
      { icon: MessageCircle, title: "הודעות", subtitle: unread ? `${unread} שלא נקראו` : "מהסטודיו", tone: "studio", onClick: () => openTab("messages") },
    { icon: ImagePlus, title: "גלריה", subtitle: "תמונות וסרטונים", tone: "modern", onClick: () => openScreen("media") },
    { icon: Trophy, title: "זיכרונות", subtitle: "הישגים ורגעים יפים", tone: "repertoire", onClick: () => openScreen("legacy") }
  ];
}

function primaryHomeItem(input: { user: V6User; copy: ReturnType<typeof roleHomeCopy>; next?: { title: string; time: string; weekday?: string }; nextEvent?: { title: string }; unread: number; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }): PrimaryHomeItem {
  const { user, copy, next, nextEvent, unread, openScreen, openTab } = input;
  if ((user.role === "student" || user.role === "teacher") && next) {
    return { label: "שיעור קרוב", title: `${next.title} · ${next.time}`, cta: copy.action, onClick: () => openTab("lessons") };
  }
  if (user.role === "parent" && next) {
    return { label: "שיעור קרוב", title: `${next.title} · ${next.time}`, cta: "שיעורים", onClick: () => openTab("lessons") };
  }
  if ((user.role === "management" || user.role === "super_admin") && nextEvent) {
    return { label: "בלוח", title: nextEvent.title, cta: "לוח שנה", onClick: () => openScreen("calendar") };
  }
  if (unread) {
    return { label: "הודעות", title: `${unread} עדכונים`, cta: "הודעות", onClick: () => openTab("messages") };
  }
  if (nextEvent) {
    return { label: "בלוח", title: nextEvent.title, cta: "לוח שנה", onClick: () => openScreen("calendar") };
  }
  return { label: "שיעורים פרטיים", title: "קביעת שיעור פרטי", cta: "פתיחה", onClick: () => openScreen("private_lessons") };
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function formatEventMeta(event: V6CalendarEvent) {
  return [event.date, event.startTime].filter(Boolean).join(" · ");
}


function StudentHomeScreen({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const { db } = useV6();
  const viewModel = useMemo(() => selectV6StudentHomeViewModel(db, user), [db, user]);
  return <StudentHomeSection user={user} viewModel={viewModel} openScreen={openScreen} openTab={openTab} />;
}


function TeacherHomeScreen({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const { db } = useV6();
  const viewModel = useMemo(() => selectV6TeacherHomeViewModel(db, user), [db, user]);
  return <TeacherHomeSection user={user} viewModel={viewModel} openScreen={openScreen} openTab={openTab} />;
}

function ManagementHomeScreen({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const { db } = useV6();
  const today = useMemo(() => currentV6HebrewWeekday(), []);
  const timetableImportInputId = useId();
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(today);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [timetableSession, setTimetableSession] = useState(() => createV6ManagementTimetableEditSession());
  const [lessonDraft, setLessonDraft] = useState<V6ManagementLessonDraft | null>(null);
  const [timetablePublishNotice, setTimetablePublishNotice] = useState<string | null>(null);
  const [timetableExportNotice, setTimetableExportNotice] = useState<string | null>(null);
  const [timetableImportNotice, setTimetableImportNotice] = useState<TimetableImportNotice | null>(null);
  const [timetablePersistenceNotice, setTimetablePersistenceNotice] = useState<string | null>(null);
  const [timetablePersistenceOnline, setTimetablePersistenceOnline] = useState(true);
  const [timetablePersistenceLoading, setTimetablePersistenceLoading] = useState(false);
  const [timetableAuditEvents, setTimetableAuditEvents] = useState<V6TimetableAuditEvent[]>([]);
  const viewModel = useMemo(() => selectV6ManagementHomeViewModel(db, user, today), [db, today, user]);
  const { lessons, unread, todayLessons, liveLesson, liveGroup, liveLessonSummary, liveActivitySummary, activeGroups, activeGroupRows, teachers, teachingStaffRows, rooms, scheduleLessonRows, daySummaries, scheduleDays, roomLoads, paidProducts, privateLessonProducts, openTasks, attentionItems, systemRows, paymentsEnabled } = viewModel;
  const { groupsById } = viewModel.indexes;
  const lessonOverrides = timetableSession.currentOverrides;
  const timetableAuditActor = useMemo(() => selectV6TimetableAuditActor(user), [user]);
  const timetableSessionMeta = useMemo(() => selectV6ManagementTimetableEditSessionMeta(timetableSession), [timetableSession]);
  const timetableSessionDirtyRef = useRef(timetableSessionMeta.isDirty);
  const timetablePersistenceLoadRequestRef = useRef(0);
  const {
    localScheduleLessonRows,
    localDaySummaries,
    selectedDay,
    visibleScheduleDays,
    selectedLesson,
    roomOptions,
    statusOptions,
    durationOptions,
    timetableConflictSummary,
    timetableConflictMetadata,
    timetableConflictCountsByDay,
    timetableConflictIndicatorsByLessonId
  } = useMemo(
    () => selectV6ManagementTimetableEditingViewModel({
      scheduleLessonRows,
      daySummaries,
      scheduleDays,
      rooms,
      lessonOverrides,
      lessonDraft,
      selectedScheduleDay,
      selectedLessonId,
      today
    }),
    [daySummaries, lessonDraft, lessonOverrides, rooms, scheduleDays, scheduleLessonRows, selectedLessonId, selectedScheduleDay, today]
  );
  const timetablePublishState = useMemo(
    () => selectV6ManagementTimetablePublishState({ session: timetableSession, conflictMetadata: timetableConflictMetadata }),
    [timetableConflictMetadata, timetableSession]
  );
  const timetablePublishTone: V6Tone = timetablePublishState.phase === "blocked_by_conflicts" ? "urgent" : timetablePublishState.phase === "published" ? "success" : "management";
  const timetablePersistenceRuntime = useMemo(() => createV6TimetablePersistenceRuntime({ db, user }), [db, user]);
  const timetablePersistenceCanUseAdapter = timetablePersistenceRuntime.status === "ready" && timetablePersistenceOnline;
  const timetableCanPublishNow = timetablePublishState.canPublish && !timetablePersistenceLoading;
  const timetablePersistenceScope = timetablePersistenceRuntime.scope ?? {
    academyId: user.studioId,
    timetableId: `${user.studioId}:management-weekly`,
    academyName: undefined
  };
  const timetableSourceLabel = timetablePersistenceScope.academyName
    ? `${timetablePersistenceScope.academyName} · מערכת שבועית`
    : "מערכת שבועית לניהול";
  const createTimetablePersistencePayloadForSession = (input: {
    session: typeof timetableSession;
    auditEvents: V6TimetableAuditEvent[];
    timestamp?: string;
    publishedAt?: string;
    draftUpdatedAt?: string;
    snapshot?: Parameters<typeof createTimetablePersistencePayload>[0]["snapshot"];
  }): V6TimetablePersistencePayload => {
    const timestamp = input.timestamp ?? new Date().toISOString();
    const editingViewModel = selectV6ManagementTimetableEditingViewModel({
      scheduleLessonRows,
      daySummaries,
      scheduleDays,
      rooms,
      lessonOverrides: input.session.currentOverrides,
      lessonDraft,
      selectedScheduleDay,
      selectedLessonId,
      today
    });
    return createTimetablePersistencePayload({
      academyId: timetablePersistenceScope.academyId,
      timetableId: timetablePersistenceScope.timetableId,
      sourceLabel: timetableSourceLabel,
      source: timetablePersistenceCanUseAdapter ? "future-supabase" : "frontend-local",
      versionLabel: "v6-management-weekly-runtime",
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: input.publishedAt,
      draftUpdatedAt: input.draftUpdatedAt,
      session: input.session,
      auditEvents: input.auditEvents,
      conflictMetadata: editingViewModel.timetableConflictMetadata,
      snapshot: input.snapshot
    });
  };
  const persistTimetableState = async (input: {
    operation: "save_draft" | "publish";
    session: typeof timetableSession;
    previousAuditEvents: V6TimetableAuditEvent[];
    newAuditEvents?: V6TimetableAuditEvent[];
    snapshot?: Parameters<typeof createTimetablePersistencePayload>[0]["snapshot"];
  }) => {
    if (!timetablePersistenceCanUseAdapter || !timetablePersistenceRuntime.context) return;

    const timestamp = new Date().toISOString();
    const payload = createTimetablePersistencePayloadForSession({
      session: input.session,
      auditEvents: input.previousAuditEvents,
      timestamp,
      publishedAt: input.operation === "publish" ? timestamp : undefined,
      draftUpdatedAt: input.operation === "save_draft" ? timestamp : undefined,
      snapshot: input.snapshot
    });
    const write = input.operation === "publish"
      ? await timetablePersistenceRuntime.adapter.publishTimetable({ ...timetablePersistenceRuntime.context, payload })
      : await timetablePersistenceRuntime.adapter.saveDraft({ ...timetablePersistenceRuntime.context, payload });

    if (write.ok === false) {
      setTimetablePersistenceNotice(`השמירה בענן לא הצליחה: ${write.error.message}`);
      setTimetablePersistenceOnline(false);
      return;
    }

    for (const event of input.newAuditEvents ?? []) {
      const audit = await timetablePersistenceRuntime.adapter.appendAuditEvent({
        ...timetablePersistenceRuntime.context,
        event
      });
      if (audit.ok === false) {
        setTimetablePersistenceNotice(`יומן הפעילות בענן לא נשמר: ${audit.error.message}`);
        setTimetablePersistenceOnline(false);
        return;
      }
    }

    setTimetablePersistenceNotice(input.operation === "publish" ? "המערכת פורסמה ונשמרה בענן." : "הטיוטה נשמרה בענן.");
  };
  useEffect(() => {
    timetableSessionDirtyRef.current = timetableSessionMeta.isDirty;
  }, [timetableSessionMeta.isDirty]);
  useEffect(() => {
    if (timetablePersistenceRuntime.status !== "ready" || !timetablePersistenceRuntime.context) {
      timetablePersistenceLoadRequestRef.current += 1;
      setTimetablePersistenceLoading(false);
      if (timetablePersistenceRuntime.flagEnabled && timetablePersistenceRuntime.status === "unavailable") {
        setTimetablePersistenceOnline(false);
        setTimetablePersistenceNotice("הסנכרון לענן לא זמין. ממשיכים עם העותק המקומי במסך.");
      }
      return;
    }

    let active = true;
    const loadRequestId = timetablePersistenceLoadRequestRef.current + 1;
    timetablePersistenceLoadRequestRef.current = loadRequestId;
    setTimetablePersistenceOnline(true);
    setTimetablePersistenceLoading(true);
    setTimetablePersistenceNotice("טוענים את המערכת המפורסמת...");
    timetablePersistenceRuntime.adapter.loadTimetable(timetablePersistenceRuntime.context).then((result) => {
      if (!active || loadRequestId !== timetablePersistenceLoadRequestRef.current) return;
      setTimetablePersistenceLoading(false);
      if (result.ok === false) {
        setTimetablePersistenceOnline(false);
        setTimetablePersistenceNotice(`לא הצלחנו לטעון מהענן. ממשיכים עם העותק המקומי: ${result.error.message}`);
        return;
      }
      if (!result.value) {
        setTimetablePersistenceNotice("אין עדיין מערכת שמורה בענן. ממשיכים עם מה שיש במסך.");
        return;
      }
      if (timetableSessionDirtyRef.current) {
        setTimetablePersistenceNotice("הענן נטען, אבל הטיוטה המקומית נשמרה כדי לא לדרוס שינויים שלא פורסמו.");
        return;
      }

      const hydrated = hydrateTimetableSessionFromPersistence(result.value);
      setTimetableSession(hydrated.session);
      setTimetableAuditEvents([...hydrated.auditEvents].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 8));
      setTimetablePublishNotice("נטענה המערכת המפורסמת מהענן.");
      setTimetablePersistenceNotice("המערכת מסונכרנת למסך הניהול.");
    }).catch((error) => {
      if (!active || loadRequestId !== timetablePersistenceLoadRequestRef.current) return;
      setTimetablePersistenceLoading(false);
      const message = error instanceof Error ? error.message : "שגיאה לא ידועה";
      setTimetablePersistenceOnline(false);
      setTimetablePersistenceNotice(`לא הצלחנו לטעון מהענן. ממשיכים עם העותק המקומי: ${message}`);
    });

    return () => {
      active = false;
    };
  }, [timetablePersistenceRuntime]);
  const createTimetableAuditContext = (session = timetableSession) => {
    const sessionMeta = selectV6ManagementTimetableEditSessionMeta(session);
    const editingViewModel = selectV6ManagementTimetableEditingViewModel({
      scheduleLessonRows,
      daySummaries,
      scheduleDays,
      rooms,
      lessonOverrides: session.currentOverrides,
      lessonDraft,
      selectedScheduleDay,
      selectedLessonId,
      today
    });
    const publishState = selectV6ManagementTimetablePublishState({ session, conflictMetadata: editingViewModel.timetableConflictMetadata });
    return {
      sessionMeta,
      publishState,
      conflicts: selectV6TimetableAuditConflictSummary({
        metadata: editingViewModel.timetableConflictMetadata,
        policy: publishState.conflictPolicy
      })
    };
  };
  const appendTimetableAuditEvents = (...events: V6TimetableAuditEvent[]) => {
    if (!events.length) return;
    setTimetableAuditEvents((current) => [...events].reverse().concat(current).slice(0, 8));
  };
  const openLessonEditor = (row: V6ManagementScheduleLessonRow) => {
    setSelectedLessonId(row.lesson.id);
    setLessonDraft(lessonOverrides[row.lesson.id] ?? createV6ManagementLessonDraft(row));
  };
  const closeLessonEditor = () => {
    setSelectedLessonId(null);
    setLessonDraft(null);
  };
  const saveLessonDraft = () => {
    if (!selectedLessonId || !lessonDraft) return;
    const nextOverrides = saveV6ManagementLessonDraft({ currentOverrides: timetableSession.currentOverrides, lessonId: selectedLessonId, draft: lessonDraft, fallbackTitle: selectedLesson?.lesson.title || "" });
    const nextSession = applyV6ManagementTimetableEditSessionOverrides(timetableSession, nextOverrides);
    const editedOverride = nextOverrides[selectedLessonId];
    if (nextSession !== timetableSession && editedOverride) {
      const nextContext = createTimetableAuditContext(nextSession);
      const sessionTransition = selectV6ManagementTimetableEditSessionTransition({ previousMeta: timetableSessionMeta, nextSession });
      const beforeOverride = timetableSession.currentOverrides[selectedLessonId] ?? (selectedLesson ? createV6ManagementLessonDraft(selectedLesson) : undefined);
      const editEvent = createV6TimetableSlotEditedAuditEvent({
        actor: timetableAuditActor,
        lesson: {
          lessonId: selectedLessonId,
          title: editedOverride.displayTitle,
          groupId: selectedLesson?.group?.id,
          groupName: selectedLesson?.group?.name,
          day: selectedLesson?.day,
          startTime: selectedLesson?.lesson.time,
          endTime: selectedLesson ? managementLessonEndTime(selectedLesson, editedOverride.durationMinutes) : undefined,
          room: editedOverride.room,
          teacherName: editedOverride.teacherName
        },
        before: beforeOverride,
        after: editedOverride,
        session: sessionTransition,
        conflicts: nextContext.conflicts
      });
      const blockedEvent = nextContext.publishState.conflictPolicy.hasBlockingConflicts
        ? createV6TimetablePublishBlockedAuditEvent({
          actor: timetableAuditActor,
          session: {
            unsavedEditCount: nextContext.sessionMeta.unsavedEditCount,
            isDirty: nextContext.sessionMeta.isDirty,
            canUndo: nextContext.sessionMeta.canUndo,
            canRedo: nextContext.sessionMeta.canRedo
          },
          conflicts: nextContext.conflicts
        })
        : undefined;
      const newAuditEvents = [editEvent, blockedEvent].filter((event): event is V6TimetableAuditEvent => Boolean(event));
      appendTimetableAuditEvents(...newAuditEvents);
      void persistTimetableState({
        operation: "save_draft",
        session: nextSession,
        previousAuditEvents: timetableAuditEvents,
        newAuditEvents
      });
    }
    setTimetableSession(nextSession);
    setTimetablePublishNotice("השינוי נשמר בטיוטה. אפשר לפרסם אחרי בדיקת התנגשויות.");
    closeLessonEditor();
  };
  const undoTimetableDraft = () => {
    const nextSession = undoV6ManagementTimetableEditSession(timetableSession);
    if (nextSession !== timetableSession) {
      const nextContext = createTimetableAuditContext(nextSession);
      const sessionTransition = selectV6ManagementTimetableEditSessionTransition({ previousMeta: timetableSessionMeta, nextSession });
      const undoEvent = createV6TimetableUndoAuditEvent({
        actor: timetableAuditActor,
        session: sessionTransition,
        conflicts: nextContext.conflicts
      });
      appendTimetableAuditEvents(undoEvent);
      void persistTimetableState({
        operation: "save_draft",
        session: nextSession,
        previousAuditEvents: timetableAuditEvents,
        newAuditEvents: [undoEvent]
      });
    }
    closeLessonEditor();
    setTimetableSession(nextSession);
  };
  const redoTimetableDraft = () => {
    const nextSession = redoV6ManagementTimetableEditSession(timetableSession);
    if (nextSession !== timetableSession) {
      const nextContext = createTimetableAuditContext(nextSession);
      const sessionTransition = selectV6ManagementTimetableEditSessionTransition({ previousMeta: timetableSessionMeta, nextSession });
      const redoEvent = createV6TimetableRedoAuditEvent({
        actor: timetableAuditActor,
        session: sessionTransition,
        conflicts: nextContext.conflicts
      });
      appendTimetableAuditEvents(redoEvent);
      void persistTimetableState({
        operation: "save_draft",
        session: nextSession,
        previousAuditEvents: timetableAuditEvents,
        newAuditEvents: [redoEvent]
      });
    }
    closeLessonEditor();
    setTimetableSession(nextSession);
  };
  const discardTimetableDraft = () => {
    if (typeof window === "undefined") return;
    if (timetableSessionMeta.isDirty && !window.confirm("לאפס את טיוטת המערכת? השינויים המקומיים יימחקו.")) return;
    const nextSession = discardV6ManagementTimetableEditSessionDraft(timetableSession);
    if (timetableSessionMeta.isDirty) {
      const sessionTransition = selectV6ManagementTimetableEditSessionTransition({ previousMeta: timetableSessionMeta, nextSession });
      const discardedEvent = createV6TimetableDraftDiscardedAuditEvent({
        actor: timetableAuditActor,
        session: sessionTransition
      });
      appendTimetableAuditEvents(discardedEvent);
      void persistTimetableState({
        operation: "save_draft",
        session: nextSession,
        previousAuditEvents: timetableAuditEvents,
        newAuditEvents: [discardedEvent]
      });
    }
    closeLessonEditor();
    setTimetableSession(nextSession);
    setTimetablePublishNotice("הטיוטה נמחקה וחזרנו למערכת המפורסמת.");
  };
  const publishTimetableDraft = () => {
    if (timetablePersistenceLoading) {
      setTimetablePublishNotice("מחכים לסיום טעינת המערכת לפני פרסום הטיוטה.");
      return;
    }

    const currentContext = createTimetableAuditContext(timetableSession);
    const attemptedEvent = createV6TimetablePublishAttemptedAuditEvent({
      actor: timetableAuditActor,
      session: {
        unsavedEditCount: timetableSessionMeta.unsavedEditCount,
        isDirty: timetableSessionMeta.isDirty,
        canUndo: timetableSessionMeta.canUndo,
        canRedo: timetableSessionMeta.canRedo
      },
      conflicts: currentContext.conflicts
    });
    if (!timetablePublishState.canPublish) {
      const blockedEvent = timetablePublishState.conflictPolicy.hasBlockingConflicts
        ? createV6TimetablePublishBlockedAuditEvent({
          actor: timetableAuditActor,
          session: {
            unsavedEditCount: timetableSessionMeta.unsavedEditCount,
            isDirty: timetableSessionMeta.isDirty,
            canUndo: timetableSessionMeta.canUndo,
            canRedo: timetableSessionMeta.canRedo
          },
          conflicts: currentContext.conflicts
        })
        : undefined;
      const newAuditEvents = [attemptedEvent, blockedEvent].filter((event): event is V6TimetableAuditEvent => Boolean(event));
      appendTimetableAuditEvents(...newAuditEvents);
      void persistTimetableState({
        operation: "save_draft",
        session: timetableSession,
        previousAuditEvents: timetableAuditEvents,
        newAuditEvents
      });
      setTimetablePublishNotice(timetablePublishState.conflictPolicy.hasBlockingConflicts ? "אי אפשר לפרסם לפני פתרון ההתנגשויות החוסמות." : "אין שינויים בטיוטה לפרסום.");
      return;
    }
    const nextSession = publishV6ManagementTimetableEditSession(timetableSession);
    const nextContext = createTimetableAuditContext(nextSession);
    const sessionTransition = selectV6ManagementTimetableEditSessionTransition({ previousMeta: timetableSessionMeta, nextSession });
    const succeededEvent = createV6TimetablePublishSucceededAuditEvent({
      actor: timetableAuditActor,
      session: sessionTransition,
      conflicts: nextContext.conflicts
    });
    const newAuditEvents = [attemptedEvent, succeededEvent];
    appendTimetableAuditEvents(...newAuditEvents);
    void persistTimetableState({
      operation: "publish",
      session: nextSession,
      previousAuditEvents: timetableAuditEvents,
      newAuditEvents
    });
    closeLessonEditor();
    setTimetableSession(nextSession);
    setTimetablePublishNotice("השינויים פורסמו והמערכת על המסך עודכנה.");
  };
  const exportPublishedTimetableSnapshot = async () => {
    try {
      if (typeof window === "undefined" || typeof document === "undefined") {
        setTimetableExportNotice("ייצוא גיבוי זמין רק בדפדפן.");
        return;
      }

      const generatedAt = new Date().toISOString();
      const sourceLabel = timetablePersistenceCanUseAdapter ? timetableSourceLabel : "מערכת שבועית מפורסמת מקומית";
      const snapshot = createV6TimetableSnapshot({
        generatedAt,
        sourceLabel,
        scheduleLessonRows,
        session: timetableSession,
        auditEvents: timetableAuditEvents,
        persistence: {
          academyId: timetablePersistenceScope.academyId,
          timetableId: timetablePersistenceScope.timetableId,
          source: timetablePersistenceCanUseAdapter ? "future-supabase" : "frontend-local",
          createdAt: generatedAt,
          updatedAt: generatedAt,
          publishedAt: generatedAt
        }
      });
      const blob = new Blob([serializeV6TimetableSnapshot(snapshot)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = createV6TimetableSnapshotFilename(generatedAt);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setTimetableExportNotice(`קובץ הגיבוי יורד עם ${snapshot.published.lessonCount} שיעורים מהמערכת המפורסמת.`);
      if (timetablePersistenceCanUseAdapter && timetablePersistenceRuntime.context && timetablePersistenceRuntime.supabaseAdapter) {
        const persisted = await timetablePersistenceRuntime.supabaseAdapter.createSnapshot({
          ...timetablePersistenceRuntime.context,
          snapshot
        });
        setTimetablePersistenceNotice(persisted.ok === true ? "הגיבוי נשמר גם בענן." : `הגיבוי לא נשמר בענן: ${persisted.error.message}`);
      }
    } catch {
      setTimetableExportNotice("לא הצלחנו לייצא כרגע. נסו שוב בעוד רגע.");
    }
  };
  const importPublishedTimetableSnapshot = async (event: ChangeEvent<HTMLInputElement>) => {
    if (typeof window === "undefined") {
      setTimetableImportNotice({ tone: "error", message: "ייבוא גיבוי זמין רק בדפדפן." });
      return;
    }

    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    const isJsonFile = file.name.toLocaleLowerCase().endsWith(".json") && (!file.type || file.type === "application/json");
    if (!isJsonFile) {
      setTimetableImportNotice({ tone: "error", message: "אפשר לייבא רק קובץ גיבוי מסוג JSON." });
      return;
    }

    let imported: ReturnType<typeof parseV6TimetableSnapshotJsonImport>;
    try {
      imported = parseV6TimetableSnapshotJsonImport(await file.text(), {
        knownLessonIds: scheduleLessonRows.map((row) => row.lesson.id)
      });
    } catch {
      setTimetableImportNotice({ tone: "error", message: "לא הצלחנו לקרוא את הקובץ מהמכשיר." });
      return;
    }
    if (imported.ok === false) {
      setTimetableImportNotice({ tone: "error", message: imported.error });
      return;
    }

    const nextSession = restoreV6ManagementTimetablePublishedOverrides(imported.overrides);
    const nextContext = createTimetableAuditContext(nextSession);
    const sessionTransition = selectV6ManagementTimetableEditSessionTransition({ previousMeta: timetableSessionMeta, nextSession });
    const note = `${imported.summary.overrideCount} overrides · ${imported.summary.sourceLabel}`;
    const restoredEvent = createV6TimetableSnapshotRestoredAuditEvent({
      actor: timetableAuditActor,
      session: sessionTransition,
      conflicts: nextContext.conflicts,
      note
    });
    appendTimetableAuditEvents(restoredEvent);
    void persistTimetableState({
      operation: "publish",
      session: nextSession,
      previousAuditEvents: timetableAuditEvents,
      newAuditEvents: [restoredEvent]
    });
    closeLessonEditor();
    setTimetableSession(nextSession);
    setTimetablePublishNotice("המערכת המפורסמת שוחזרה מקובץ הגיבוי והטיוטה אופסה.");
    setTimetableImportNotice({ tone: "success", message: `יובא בהצלחה: ${imported.summary.lessonCount} שיעורים מהגיבוי.` });
    setTimetableExportNotice(null);
  };

  const attentionIcon = (kind: (typeof attentionItems)[number]["kind"]) => {
    if (kind === "event") return AlertTriangle;
    if (kind === "student") return Users;
    if (kind === "attendance") return CheckCircle2;
    return ClipboardList;
  };
  const openAttentionItem = (kind: (typeof attentionItems)[number]["kind"]) => {
    if (kind === "event") return openScreen("calendar");
    if (kind === "student") return openScreen("users");
    return openTab("lessons");
  };

  return (
    <MobileScreen>
      <MobileIntro
        kicker="מרכז ניהול"
        title="הפעימה התפעולית של הסטודיו"
        subtitle={`שלום ${firstName(user.name)} · ${todayLessons.length ? `${todayLessons.length} שיעורים היום` : `${lessons.length} שיעורים במערכת`}`}
        tone="management"
      />

      <MobileSection kicker="מתעדכן בזמן אמת" title="מה קורה היום בסטודיו" tone="management">
        <div className="grid grid-cols-2 gap-2">
          <ManagementSummaryTile icon={CalendarDays} label="היום" value={<BidiNumber>{todayLessons.length}</BidiNumber>} meta="שיעורים" tone="management" />
          <ManagementSummaryTile icon={Users} label="קבוצות" value={<BidiNumber>{activeGroups.length}</BidiNumber>} meta="פעילות" tone="studio" />
          <ManagementSummaryTile icon={DoorOpen} label="חללים" value={<BidiNumber>{rooms.length}</BidiNumber>} meta="זמינים במערכת" tone="repertoire" />
          <ManagementSummaryTile icon={AlertTriangle} label="לטיפול" value={<BidiNumber>{attentionItems.length}</BidiNumber>} meta={attentionItems.length ? "פתוחים" : "אין כרגע"} tone={attentionItems.length ? "urgent" : "success"} />
        </div>
      </MobileSection>

      <MobileSection kicker={liveLesson ? `${liveLesson.time} · ${liveLesson.room}` : "סטטוס חי"} title="פעילות חיה" tone="studio">
        <div className="space-y-2">
          <LiveActivityRow icon={Activity} title={liveLesson ? liveGroup?.name ?? liveLesson.title : "אין שיעור פעיל להצגה"} subtitle={liveLesson ? liveActivitySummary : "מערכת השיעורים ריקה כרגע"} meta={liveLesson?.weekday} stateLabel={liveLesson ? "כעת" : "רגוע"} tone={liveLesson ? "studio" : "success"} pulse={Boolean(liveLesson)} onClick={() => openTab("lessons")} ariaLabel="פתיחת שיעורי הסטודיו" />
          <LiveActivityRow icon={Bell} title={unread ? `${unread} הודעות שלא נקראו` : "אין הודעות חדשות"} subtitle={systemRows[0]?.title ?? "הודעות מערכת וקבוצות"} meta="תקשורת" stateLabel={unread ? "לטיפול" : "שקט"} tone={unread ? "urgent" : "modern"} pulse={Boolean(unread)} onClick={() => openTab("messages")} ariaLabel="פתיחת הודעות" />
          <LiveActivityRow icon={ClipboardList} title={openTasks.length ? `${openTasks.length} משימות פתוחות` : "אין משימות פתוחות"} subtitle={openTasks[0]?.title ?? "משימות קבוצתיות יוצגו כאן"} meta="מעקב" stateLabel={openTasks.length ? "הבא" : "מסודר"} tone={openTasks.length ? "repertoire" : "success"} onClick={() => openTab("lessons")} ariaLabel="פתיחת משימות ושיעורים" />
        </div>
      </MobileSection>

      <ManagementTimetableSection
        localScheduleLessonRows={localScheduleLessonRows}
        localDaySummaries={localDaySummaries}
        visibleScheduleDays={visibleScheduleDays}
        selectedDay={selectedDay}
        roomCount={rooms.length}
        conflictSummary={timetableConflictSummary}
        conflictCountsByDay={timetableConflictCountsByDay}
        conflictIndicatorsByLessonId={timetableConflictIndicatorsByLessonId}
        sessionMeta={timetableSessionMeta}
        publishState={timetablePublishState}
        publishTone={timetablePublishTone}
        canPublishNow={timetableCanPublishNow}
        importInputId={timetableImportInputId}
        publishNotice={timetablePublishNotice}
        exportNotice={timetableExportNotice}
        importNotice={timetableImportNotice}
        persistenceFlagEnabled={timetablePersistenceRuntime.flagEnabled}
        persistenceNotice={timetablePersistenceNotice}
        persistenceStatusLabel={timetablePersistenceRuntime.statusLabel}
        persistenceCanUseAdapter={timetablePersistenceCanUseAdapter}
        persistenceLoading={timetablePersistenceLoading}
        auditEvents={timetableAuditEvents}
        onSelectDay={setSelectedScheduleDay}
        onOpenLesson={openLessonEditor}
        onUndoDraft={undoTimetableDraft}
        onRedoDraft={redoTimetableDraft}
        onDiscardDraft={discardTimetableDraft}
        onPublishDraft={publishTimetableDraft}
        onExportSnapshot={exportPublishedTimetableSnapshot}
        onImportSnapshot={importPublishedTimetableSnapshot}
      />

      {selectedLesson && lessonDraft ? (
        <BottomSheet title="עריכת שיעור שבועי" onClose={closeLessonEditor}>
          <div className="space-y-2.5">
            <Surface tone={selectedLesson.tone} variant="elevated" className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <SafeMeta as="p" className="text-[11px] font-semibold text-white/40">שיעור קבוע · עריכה מקומית</SafeMeta>
                  <SafeTitle as="h2" className="mt-2 text-[clamp(1.45rem,5.8vw,1.95rem)] font-semibold leading-tight tracking-[-0.042em] text-white">
                    {lessonDraft.displayTitle}
                  </SafeTitle>
                  <SafeMeta as="p" className="mt-1.5 text-xs leading-relaxed text-white/54">
                    {[selectedLesson.danceStyle, selectedLesson.group?.ageGroup, lessonDraft.teacherName || "צוות לא משויך"].filter(Boolean).join(" · ")}
                  </SafeMeta>
                </div>
                <StatusBadge tone={lessonStatusTone(lessonDraft.status)}>{lessonDraft.status}</StatusBadge>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <InlineMetric label="זמן" value={`${selectedLesson.lesson.time}-${managementLessonEndTime(selectedLesson, lessonDraft.durationMinutes)}`} meta={formatLessonDuration(lessonDraft.durationMinutes)} tone="management" className="px-2 py-1.5" />
                <InlineMetric label="חלל" value={lessonDraft.room} meta="הקצאה" tone="repertoire" className="px-2 py-1.5" />
                <InlineMetric label="רוסטר" value={<BidiNumber>{selectedLesson.studentCount}</BidiNumber>} meta="תלמידות" tone={selectedLesson.studentCount ? "studio" : "urgent"} className="px-2 py-1.5" />
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <InlineMetric label="סגנון" value={selectedLesson.danceStyle} meta="שפת צבע" tone={selectedLesson.tone} className="px-2 py-1.5" />
                <InlineMetric label="צוות" value={lessonDraft.teacherName || "לא משויך"} meta="מורה" tone={lessonDraft.teacherName ? "modern" : "urgent"} className="px-2 py-1.5" />
              </div>
            </Surface>

            <Surface tone="management" variant="glass" className="space-y-3.5 p-3.5">
              <div>
                <SafeTitle as="h3" className="text-sm font-semibold text-white/84">פרטים לעריכה</SafeTitle>
                <SafeMeta as="p" className="mt-1.5 text-xs leading-relaxed text-white/50">
                  השינויים נשמרים בתצוגה המקומית של המסך בלבד ומתעדכנים מיד אחרי שמירה.
                </SafeMeta>
              </div>

              <label className="block space-y-1.5">
                <SafeMeta as="span" className="block text-[11px] font-semibold text-white/44">שם/פרט תצוגה</SafeMeta>
                <input
                  dir="rtl"
                  value={lessonDraft.displayTitle}
                  onChange={(event) => setLessonDraft((current) => updateV6ManagementLessonDraft(current, { displayTitle: event.target.value }))}
                  className={v6Cx(v6Control.field, "text-start font-semibold")}
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1.5">
                  <SafeMeta as="span" className="block text-[11px] font-semibold text-white/44">חלל</SafeMeta>
                  <select
                    dir="rtl"
                    value={lessonDraft.room}
                    onChange={(event) => setLessonDraft((current) => updateV6ManagementLessonDraft(current, { room: event.target.value }))}
                    className={v6Cx(v6Control.field, "text-start font-semibold")}
                  >
                    {roomOptions.map((room) => <option key={room} value={room}>{room}</option>)}
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <SafeMeta as="span" className="block text-[11px] font-semibold text-white/44">משך</SafeMeta>
                  <select
                    dir="rtl"
                    value={lessonDraft.durationMinutes}
                    onChange={(event) => setLessonDraft((current) => updateV6ManagementLessonDraft(current, { durationMinutes: Number(event.target.value) }))}
                    className={v6Cx(v6Control.field, "text-start font-semibold")}
                  >
                    {durationOptions.map((duration) => <option key={duration} value={duration}>{formatLessonDuration(duration)}</option>)}
                  </select>
                </label>
              </div>

              <label className="block space-y-1.5">
                <SafeMeta as="span" className="block text-[11px] font-semibold text-white/44">מורה</SafeMeta>
                <select
                  dir="rtl"
                  value={lessonDraft.teacherName ? lessonDraft.teacherId || "__current" : "__none"}
                  onChange={(event) => {
                    const nextTeacherId = event.target.value;
                    if (nextTeacherId === "__current") return;
                    if (nextTeacherId === "__none") {
                      setLessonDraft((current) => updateV6ManagementLessonDraft(current, { teacherId: "", teacherName: "" }));
                      return;
                    }
                    const teacher = teachers.find((item) => item.id === nextTeacherId);
                    setLessonDraft((current) => updateV6ManagementLessonDraft(current, { teacherId: nextTeacherId, teacherName: teacher?.displayName ?? "" }));
                  }}
                  className={v6Cx(v6Control.field, "text-start font-semibold")}
                >
                  {lessonDraft.teacherName && !lessonDraft.teacherId ? <option value="__current">{lessonDraft.teacherName}</option> : null}
                  <option value="__none">ללא צוות משויך</option>
                  {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.displayName}</option>)}
                </select>
              </label>

              <label className="block space-y-1.5">
                <SafeMeta as="span" className="block text-[11px] font-semibold text-white/44">סטטוס</SafeMeta>
                <select
                  dir="rtl"
                  value={lessonDraft.status}
                  onChange={(event) => setLessonDraft((current) => updateV6ManagementLessonDraft(current, { status: event.target.value }))}
                  className={v6Cx(v6Control.field, "text-start font-semibold")}
                >
                  {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </Surface>

            <SheetActions>
              <Button variant="ghost" onClick={closeLessonEditor}>ביטול</Button>
              <Button onClick={saveLessonDraft}>שמירה מקומית</Button>
            </SheetActions>
          </div>
        </BottomSheet>
      ) : null}

      <MobileSection kicker={`${activeGroups.length} קבוצות`} title="קבוצות פעילות" tone="studio">
        <MobileList>
          {activeGroupRows.slice(0, 5).map(({ group, teacherNames, rosterSize }) => (
            <MobileListRow key={group.id} icon={Users} title={group.name} subtitle={[group.danceStyle ?? group.style, teacherNames].filter(Boolean).join(" · ")} meta={<><BidiNumber>{rosterSize}</BidiNumber> תלמידות</>} tone="studio" onClick={() => openTab("lessons")} ariaLabel={`פתיחת קבוצת ${group.name}`} />
          ))}
          {!activeGroups.length ? <MobileListRow icon={Users} title="אין קבוצות פעילות" subtitle="קבוצות עם שיעורים או תלמידות יופיעו כאן" tone="studio" /> : null}
        </MobileList>
      </MobileSection>

      <MobileSection kicker={`${roomLoads.length} חללים`} title="סטודיואים וחדרים" tone="repertoire">
        {roomLoads.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {roomLoads.map((room) => (
              <RoomAllocationTile
                key={room.room}
                room={room.room}
                next={room.next ? `${room.next.weekday} · ${room.next.time} · ${groupsById.get(room.next.groupId)?.name ?? room.next.title}` : "אין שיעור משויך"}
                groupCount={room.groupCount}
                active={Boolean(room.next)}
                onClick={() => openTab("lessons")}
                ariaLabel={`פתיחת חדר ${room.room}`}
              />
            ))}
          </div>
        ) : (
          <MobileList>
            <MobileListRow icon={DoorOpen} title="אין חדרים משויכים" subtitle="חדרים יופיעו מתוך שיעורים וקבוצות קיימים" tone="repertoire" />
          </MobileList>
        )}
      </MobileSection>

      <MobileSection kicker={`${teachers.length} מורות ומורים`} title="צוות ההוראה" tone="modern">
        <MobileList>
          {teachingStaffRows.slice(0, 5).map(({ teacher, subtitle, meta }) => <MobileListRow key={teacher.id} icon={Users} title={teacher.displayName} subtitle={subtitle} meta={meta} tone="modern" onClick={() => openScreen("users")} ariaLabel={`פתיחת פרטי צוות עבור ${teacher.displayName}`} />)}
          {!teachers.length ? <MobileListRow icon={Users} title="אין צוות משויך" subtitle="שיוך מורות לקבוצות יופיע כאן" tone="modern" /> : null}
        </MobileList>
      </MobileSection>

      <MobileSection kicker={attentionItems.length ? `${attentionItems.length} לטיפול` : "אין חסמים ידועים"} title="חריגות ותשומת לב" tone={attentionItems.length ? "urgent" : "success"}>
        {attentionItems.length ? (
          <MobileList>
            {attentionItems.map((item) => (
              <OperationalAlertRow
                key={item.id}
                icon={attentionIcon(item.kind)}
                title={item.title}
                subtitle={item.subtitle}
                meta={item.meta}
                tone={item.tone}
                onClick={() => openAttentionItem(item.kind)}
                ariaLabel={`פתיחת טיפול: ${item.title}`}
              />
            ))}
          </MobileList>
        ) : (
          <Surface tone="success" variant="quiet" className="p-3">
            <SafeMeta as="p" className="text-[11px] leading-relaxed text-white/52">אין חריגות פתוחות לפי נוכחות, סטטוס תלמידות, משימות ואירועים קיימים.</SafeMeta>
          </Surface>
        )}
      </MobileSection>

      <MobileSection kicker={paymentsEnabled ? "גבייה פעילה" : "מעקב בלבד"} title="תשלומים ומעקב" tone="shop">
        <MobileList>
          <MobileListRow icon={Receipt} title={paymentsEnabled ? "תשלומים פעילים במערכת" : "תשלומים עדיין לא פעילים"} subtitle="לא נוספה לוגיקת גבייה או תשלום" meta={paymentsEnabled ? "פעיל" : "כבוי"} tone={paymentsEnabled ? "success" : "shop"} onClick={() => openTab("shop")} ariaLabel="פתיחת חנות ומעקב תשלומים" />
          {paidProducts.slice(0, 2).map((product) => <MobileListRow key={product.id} icon={ShoppingBag} title={product.title} subtitle={product.category} meta={paymentModeLabel(product)} tone="shop" onClick={() => openTab("shop")} ariaLabel={`פתיחת מוצר ${product.title}`} />)}
          {privateLessonProducts.slice(0, 1).map((product) => <MobileListRow key={product.id} icon={Receipt} title={product.title} subtitle="שיעורים פרטיים ובקשות" meta={paymentModeLabel(product)} tone="shop" onClick={() => openScreen("private_lessons")} ariaLabel="פתיחת שיעורים פרטיים" />)}
        </MobileList>
      </MobileSection>

      <MobileSection kicker={unread ? `${unread} חדשים` : "תקשורת"} title="הודעות מערכת" tone="management">
        <MobileList>
          {systemRows.length ? systemRows.map((item) => <MobileListRow key={item.id} icon={item.kind === "notification" ? Bell : MessageCircle} title={item.title} subtitle={item.subtitle} meta={item.meta} tone={item.tone} onClick={() => openTab("messages")} ariaLabel={`פתיחת הודעה: ${item.title}`} />) : <MobileListRow icon={MessageCircle} title="אין הודעות להצגה" subtitle="הודעות ועדכוני מערכת יופיעו כאן" tone="management" />}
        </MobileList>
      </MobileSection>
    </MobileScreen>
  );
}

export function HomeScreen({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  if (user.role === "student") return <StudentHomeScreen user={user} openScreen={openScreen} openTab={openTab} />;
  if (user.role === "teacher") return <TeacherHomeScreen user={user} openScreen={openScreen} openTab={openTab} />;
  if (user.role === "management") return <ManagementHomeScreen user={user} openScreen={openScreen} openTab={openTab} />;

  return <RoleHomeScreen user={user} openScreen={openScreen} openTab={openTab} />;
}

function RoleHomeScreen({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const { db } = useV6();
  const lessons = selectV6LessonsForActor(db, user);
  const next = lessons[0];
  const unread = selectV6UnreadCount(db, user);
  const notifications = selectV6NotificationsForActor(db, user);
  const messages = selectV6MessagesForActor(db, user);
  const events = selectV6UpcomingEvents(db, user);
  const nextEvent = events[0];
  const copy = roleHomeCopy(user);
  const tone = roleTone(user.role);
  const homeModuleIds = new Set(modulesForRole(user.role).map((module) => module.id));
  const primaryGroup = db.groups.find((group) => user.groupIds.includes(group.id));
  const tasks = db.tasks.filter((task) => user.role === "management" || user.role === "super_admin" || user.groupIds.includes(task.groupId));
  const actions = roleHomeActions({ user, unread, nextEventTitle: nextEvent?.title, openScreen, openTab }).slice(0, 4);
  const feed = [
    ...notifications.slice(0, 2).map((item) => ({ id: item.id, icon: Bell, title: item.title, body: item.body, meta: item.readBy.includes(user.id) ? "נקרא" : "לא נקרא", tone: item.readBy.includes(user.id) ? "studio" as V6Tone : "urgent" as V6Tone })),
    ...messages.slice(0, 1).map((item) => ({ id: item.id, icon: MessageCircle, title: item.title, body: item.body, meta: "סטודיו", tone: "modern" as V6Tone })),
    ...tasks.slice(0, 1).map((item) => ({ id: item.id, icon: ClipboardList, title: item.title, body: "משימה פתוחה לקבוצה שלך.", meta: "משימה", tone: "repertoire" as V6Tone })),
    ...events.slice(0, 1).map((item) => ({ id: item.id, icon: CalendarDays, title: item.title, body: item.parentInstructions ?? item.adultInstructions ?? "בלוח הסטודיו.", meta: item.date, tone: item.status === "needs_attention" ? "urgent" as V6Tone : "management" as V6Tone }))
  ].slice(0, 3);
  const primary = primaryHomeItem({ user, copy, next, nextEvent, unread, openScreen, openTab });

  return (
    <MobileScreen>
      <MobileIntro
        kicker={copy.cue}
        title={copy.title}
        subtitle={`שלום ${user.name.split(" ")[0]}${primaryGroup ? ` · ${primaryGroup.name}` : ""}`}
        tone={tone}
        action={
          <AttachedPrimaryAction
            label={primary.label}
            title={primary.title}
            cta={primary.cta}
            onClick={primary.onClick}
          />
        }
      />

      {homeModuleIds.has("updates") || homeModuleIds.has("schedule") ? <MobileSection>
        <MobileList>
          {homeModuleIds.has("schedule") && next ? <MobileListRow icon={CalendarDays} title={next.title} subtitle={`${next.weekday} · ${next.room}`} meta={next.time} tone={tone} onClick={() => openTab("lessons")} /> : null}
          {homeModuleIds.has("updates") ? <MobileListRow icon={Bell} title={unread ? `${unread} עדכונים` : "הודעות"} subtitle={unread ? "לא נקראו" : "מהסטודיו"} tone="urgent" onClick={() => openTab("messages")} /> : null}
          {homeModuleIds.has("schedule") ? <MobileListRow icon={CalendarDays} title={nextEvent ? nextEvent.title : next ? next.title : "לוח שנה"} subtitle={nextEvent ? "בלוח" : next ? `${next.time} · ${next.weekday}` : "לוח שנה"} tone="management" onClick={nextEvent ? () => openScreen("calendar") : next ? () => openTab("lessons") : () => openScreen("calendar")} /> : null}
          {feed.map((item) => <MobileListRow key={item.id} icon={item.icon} title={item.title} subtitle={item.body} meta={item.meta} tone={item.tone} />)}
        </MobileList>
      </MobileSection> : null}

      {homeModuleIds.has("quick-actions") ? <MobileSection kicker="קיצורים" title="עכשיו" tone={tone}>
        <MobileList>
          {actions.map((action) => <MobileListRow key={action.title} icon={action.icon} title={action.title} subtitle={action.subtitle} tone={action.tone} onClick={action.onClick} />)}
        </MobileList>
      </MobileSection> : null}
    </MobileScreen>
  );
}
