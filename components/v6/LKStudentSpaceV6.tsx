"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Database,
  Download,
  Flag,
  HeartPulse,
  ImagePlus,
  Lock,
  MessageCircle,
  MoonStar,
  Plus,
  Receipt,
  School,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Upload,
  Users
} from "lucide-react";
import { V6AppProvider, useV6 } from "@/lib/v6/AppProvider";
import { permissionsFor, roleLabel } from "@/lib/v6/seed";
import {
  AISuggestionStack,
  AppShellFrame,
  BidiNumber,
  BottomNavDock,
  BottomSheet,
  Button as V6Button,
  DirectionalChevron,
  EditorialSection,
  FeedRow as V6FeedRow,
  FormField,
  HeroSurface,
  RtlText,
  SegmentedControl,
  StageImage,
  StatusBadge as V6StatusBadge,
  Surface,
  Toast as V6Toast,
  Widget,
  v6Cx,
  v6Tone,
  v6Visual,
  type V6Tone
} from "@/components/v6/design-system";
import { HomeScreen } from "@/components/v6/screens/HomeScreen";
import { selectV6LessonsForActor } from "@/lib/domains/attendance/selectors";
import { buildV6SaveAttendanceOperation } from "@/lib/domains/attendance/operations";
import { selectV6MessagesForActor, selectV6NotificationsForActor } from "@/lib/domains/messages/selectors";
import { selectV6PrivateLessonsForActor } from "@/lib/domains/private-lessons/selectors";
import { buildV6SaveProductOperation } from "@/lib/domains/shop/operations";
import { selectV6ShopProductsByCategory, selectV6FeaturedShopLanes } from "@/lib/domains/shop/selectors";
import { selectV6MediaForActor } from "@/lib/domains/media/selectors";
import { buildV6ResetPasswordOperation, buildV6UpsertUserOperation } from "@/lib/domains/users/v6-operations";
import { selectV6UsersByRole } from "@/lib/domains/users/selectors";
import { selectV6SystemIssues } from "@/lib/domains/system/selectors";
import { selectV6AIInsightsForActor } from "@/lib/domains/ai/selectors";
import { computeV6ManagementHealth, computeV6PrivateLessonCoordination, summarizeV6Audit } from "@/lib/engines/v6";
import type { V6AttendanceRecord, V6AttendanceStatus, V6MediaItem, V6Permissions, V6Product, V6Role, V6Screen, V6Tab, V6User } from "@/lib/v6/types";

type Tone = "studio" | "flamenco" | "hiphop" | "classic" | "modern" | "pointe" | "repertoire" | "management" | "admin" | "shop" | "urgent";

const tones: Record<Tone, { text: string; soft: string; border: string; glow: string; grad: string }> = {
  studio: { text: "text-emerald-100", soft: "bg-emerald-300/12", border: "border-emerald-100/16", glow: "shadow-emerald-950/20", grad: "from-emerald-300/18 via-white/[0.055] to-cyan-300/8" },
  flamenco: { text: "text-amber-100", soft: "bg-red-400/14", border: "border-amber-100/18", glow: "shadow-red-950/20", grad: "from-red-500/20 via-amber-300/10 to-black/10" },
  hiphop: { text: "text-fuchsia-100", soft: "bg-fuchsia-400/14", border: "border-fuchsia-100/18", glow: "shadow-fuchsia-950/20", grad: "from-violet-500/20 via-fuchsia-400/10 to-black/10" },
  classic: { text: "text-rose-100", soft: "bg-rose-200/12", border: "border-rose-100/18", glow: "shadow-rose-950/20", grad: "from-rose-100/16 via-slate-200/8 to-black/10" },
  modern: { text: "text-cyan-100", soft: "bg-cyan-300/12", border: "border-cyan-100/18", glow: "shadow-cyan-950/20", grad: "from-slate-400/18 via-cyan-300/8 to-black/10" },
  pointe: { text: "text-pink-100", soft: "bg-pink-200/12", border: "border-pink-100/18", glow: "shadow-pink-950/20", grad: "from-pink-200/18 via-stone-100/8 to-black/10" },
  repertoire: { text: "text-amber-100", soft: "bg-amber-300/12", border: "border-amber-100/18", glow: "shadow-amber-950/20", grad: "from-amber-300/20 via-orange-300/8 to-black/10" },
  management: { text: "text-blue-100", soft: "bg-blue-400/12", border: "border-blue-100/18", glow: "shadow-blue-950/20", grad: "from-blue-500/20 via-cyan-300/8 to-black/10" },
  admin: { text: "text-violet-100", soft: "bg-violet-300/13", border: "border-violet-100/20", glow: "shadow-violet-950/20", grad: "from-violet-300/20 via-zinc-100/8 to-black/10" },
  shop: { text: "text-yellow-100", soft: "bg-yellow-300/12", border: "border-yellow-100/18", glow: "shadow-yellow-950/20", grad: "from-yellow-300/18 via-emerald-200/8 to-black/10" },
  urgent: { text: "text-rose-100", soft: "bg-rose-500/14", border: "border-rose-100/20", glow: "shadow-rose-950/20", grad: "from-rose-500/20 via-red-300/8 to-black/10" }
};

const permissionLabels: Array<[keyof V6Permissions, string]> = [
  ["manageUsers", "ניהול משתמשים"],
  ["editCredentials", "עריכת התחברות"],
  ["editPermissions", "הרשאות"],
  ["manageAttendance", "נוכחות"],
  ["manageShop", "חנות"],
  ["managePrivateLessons", "שיעורים פרטיים"],
  ["manageMedia", "מדיה"],
  ["exportImportDb", "ייצוא/ייבוא"],
  ["viewAudit", "אודיט"]
];

const attendanceStatusLabel: Record<V6AttendanceStatus, string> = {
  present: "נוכח/ת",
  absent: "חסר/ה",
  late: "איחור",
  excused: "מוצדק",
  missing: "חסר/ה"
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

let v6ClientIdCounter = 0;

function nextV6ClientId(prefix: string) {
  v6ClientIdCounter += 1;
  return `${prefix}_${v6ClientIdCounter.toString(36)}`;
}

function toneForStyle(style?: string): Tone {
  if (style?.includes("פלמנקו")) return "flamenco";
  if (style?.includes("היפ הופ")) return "hiphop";
  if (style?.includes("קלאסי")) return "classic";
  if (style?.includes("מודרני")) return "modern";
  if (style?.includes("פוינט")) return "pointe";
  if (style?.includes("רפרטואר")) return "repertoire";
  return "studio";
}

function toneForRole(role: V6Role): Tone {
  if (role === "super_admin") return "admin";
  if (role === "management") return "management";
  if (role === "teacher") return "studio";
  if (role === "parent") return "classic";
  return "hiphop";
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header dir="rtl" className="relative isolate mx-auto w-full max-w-full overflow-hidden rounded-[30px] border border-[rgba(255,255,255,0.040)] bg-white/[0.026] p-4 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.038)]">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/34">LK Stage OS</p>
          <RtlText as="h1" className="mt-1 max-w-full text-[clamp(1.85rem,8vw,2.55rem)] font-semibold leading-[0.94] tracking-[-0.075em] text-white">{title}</RtlText>
          {subtitle ? <RtlText as="p" className="mt-2 max-w-[22rem] text-[14px] leading-relaxed text-white/58">{subtitle}</RtlText> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

function ActionCard({ icon: Icon, title, subtitle, tone, onClick }: { icon: React.ElementType; title: string; subtitle: string; tone: Tone; onClick: () => void }) {
  const t = tones[tone];
  return (
    <button dir="rtl" onClick={onClick} className="mx-auto flex min-h-[76px] w-full items-center gap-3 rounded-[26px] border border-[rgba(255,255,255,0.038)] bg-white/[0.030] p-3 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.036)] transition active:scale-[0.99]">
      <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-[17px]", t.soft, t.text)}><Icon size={17} /></span>
      <span className="min-w-0 flex-1">
        <RtlText as="span" className="block truncate text-[15px] font-semibold tracking-[-0.02em] text-white/88">{title}</RtlText>
        <RtlText as="span" className="mt-0.5 block line-clamp-1 text-[12px] leading-snug text-white/42">{subtitle}</RtlText>
      </span>
      <DirectionalChevron className="text-white/24" />
    </button>
  );
}

function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  return {
    message,
    show: (value: string) => {
      setMessage(value);
      window.setTimeout(() => setMessage(null), 2200);
    }
  };
}

function Login() {
  const { db, login } = useV6();
  const [phone, setPhone] = useState("0501110000");
  const [password, setPassword] = useState("creator2026");
  const { message, show } = useToast();
  const studio = db.studios[0];
  return (
    <main suppressHydrationWarning className="grid min-h-dynamic place-items-center overflow-x-hidden px-4 py-safe text-white sm:px-5" dir="rtl">
      <V6Toast message={message} />
      <div className={v6Cx("pointer-events-none fixed inset-0", v6Visual.canvas)} />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,247,223,0.058)_40%,transparent_56%),repeating-linear-gradient(90deg,rgba(255,255,255,0.014)_0,rgba(255,255,255,0.014)_1px,transparent_1px,transparent_9px)] opacity-56 mix-blend-screen" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 h-[42vh] w-[min(86vw,430px)] -translate-x-1/2 rounded-t-full bg-[radial-gradient(ellipse_at_center,rgba(215,181,109,0.11),rgba(100,28,63,0.09)_42%,transparent_72%)] blur-sm" />
      <div className="relative mx-auto w-full max-w-[430px]">
        <div className="mb-8 text-center">
          <div className="relative mx-auto grid h-[116px] w-[116px] place-items-center rounded-[44px] border border-[rgba(215,181,109,0.14)] bg-[radial-gradient(circle_at_50%_20%,rgba(255,247,223,0.20),rgba(215,181,109,0.08)_38%,rgba(61,16,39,0.28))] shadow-[0_34px_90px_rgba(61,16,39,0.38),0_18px_70px_rgba(215,181,109,0.12),inset_0_1px_0_rgba(255,255,255,0.14)]">
            <div className="pointer-events-none absolute inset-4 rounded-[34px] border border-[rgba(255,255,255,0.07)]" />
            <MoonStar className="text-[#fff7df]" size={36} />
          </div>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.36em] text-[#f4d58d]/62">Backstage Access</p>
          <h1 suppressHydrationWarning className="mx-auto mt-2 max-w-[22rem] text-[clamp(2.75rem,14vw,3.75rem)] font-semibold leading-[0.84] tracking-[-0.1em]">{db.editableTexts.loginTitle ?? studio?.branding.name}</h1>
          <p className="mx-auto mt-5 max-w-xs text-[15px] leading-relaxed text-white/66">{db.editableTexts.loginSubtitle ?? studio?.branding.tagline}</p>
        </div>
        <form
          className={v6Cx("relative isolate mx-auto w-full max-w-full space-y-5 overflow-hidden rounded-[38px] border border-[rgba(255,255,255,0.09)] bg-[linear-gradient(150deg,rgba(255,255,255,0.13),rgba(255,255,255,0.044)_48%,rgba(61,16,39,0.28)_100%)] p-5 shadow-[0_36px_104px_rgba(0,0,0,0.66),0_18px_58px_rgba(215,181,109,0.08),inset_0_1px_0_rgba(255,255,255,0.11)] backdrop-blur-2xl sm:p-6", v6Visual.texture)}
          onSubmit={(e) => {
            e.preventDefault();
            const result = login(phone, password);
            if (result.ok === false) show(result.reason);
          }}
        >
          <div className="relative flex min-h-12 items-center gap-3 rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-black/24 px-4 py-3 text-start text-[13px] font-bold text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.065)]"><Lock className="shrink-0 text-[#f4d58d]/80" size={16} /><span className="min-w-0 flex-1 leading-snug">כניסה מאובטחת לפי המסד</span></div>
          <FormField label="טלפון" value={phone} onChange={setPhone} />
          <FormField label="סיסמה" value={password} onChange={setPassword} type="password" />
          <div className="[&>button]:w-full"><V6Button type="submit">כניסה</V6Button></div>
        </form>
      </div>
    </main>
  );
}

function Shell() {
  const { db, user, logout } = useV6();
  const [tab, setTab] = useState<V6Tab>("dashboard");
  const [screen, setScreen] = useState<V6Screen>("home");
  const { message, show } = useToast();
  if (!user) return <Login />;
  const studio = db.studios.find((s) => s.id === user.studioId);
  const notifications = db.notifications.filter((n) => n.userIds.includes(user.id));
  const unread = notifications.filter((n) => !n.readBy.includes(user.id)).length;
  const openScreen = (next: V6Screen) => {
    setScreen(next);
    setTab("more");
    window.scrollTo({ top: 0 });
  };
  const home = screen === "home";
  const atmosphere =
    !home && (screen === "users" || screen === "system") ? "management" :
    !home && (screen === "database" || screen === "texts" || screen === "flags" || screen === "audit" || screen === "branding") ? "admin" :
    home && tab === "shop" ? "shop" :
    home && tab === "more" && user.role === "super_admin" ? "admin" :
    home && tab === "more" && user.role === "management" ? "management" :
    "home";
  return (
    <>
      <V6Toast message={message} />
      <AppShellFrame user={user} studioName={studio?.name} onLogout={logout} atmosphere={atmosphere}>
        <div key={`${tab}-${screen}`}>
          {home && tab === "dashboard" ? <HomeScreen user={user} openScreen={openScreen} openTab={(next) => { setScreen("home"); setTab(next); window.scrollTo({ top: 0 }); }} /> : null}
          {home && tab === "lessons" ? <Lessons user={user} show={show} /> : null}
          {home && tab === "messages" ? <Messages user={user} show={show} /> : null}
          {home && tab === "shop" ? <Shop user={user} show={show} openScreen={openScreen} /> : null}
          {home && tab === "more" ? <More user={user} openScreen={openScreen} openTab={(next) => { setScreen("home"); setTab(next); window.scrollTo({ top: 0 }); }} /> : null}
          {!home && screen === "users" ? <UsersScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "private_lessons" ? <PrivateLessons user={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "media" ? <MediaScreen user={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "database" ? <DatabaseScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "texts" ? <TextsScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "flags" ? <FlagsScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "audit" ? <AuditScreen back={() => setScreen("home")} /> : null}
          {!home && screen === "system" ? <SystemScreen back={() => setScreen("home")} /> : null}
          {!home && screen === "branding" ? <BrandingScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
        </div>
      </AppShellFrame>
      <BottomNavDock tab={tab} unread={unread} onTab={(next) => { setScreen("home"); setTab(next); window.scrollTo({ top: 0 }); }} />
    </>
  );
}

function MiniSummary({ icon: Icon, tone, label, title, meta }: { icon: React.ElementType; tone: Tone; label: string; title: string; meta: string }) {
  const t = v6Tone[tone];
  const numericTitle = /^(?:V)?[₪\d%+.,-]+$/.test(title);
  return (
    <Surface tone={tone} className="flex items-center gap-3 p-3">
      <span className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-[17px]", t.soft, t.text)}><Icon size={16} /></span>
      <span className="min-w-0 flex-1 text-start">
        <RtlText as="span" className="block truncate text-[11px] font-medium text-white/42">{label}</RtlText>
        <span className="mt-0.5 block truncate text-[17px] font-semibold tracking-[-0.03em]">{numericTitle ? <BidiNumber>{title}</BidiNumber> : <RtlText>{title}</RtlText>}</span>
        <RtlText as="span" className="mt-0.5 block truncate text-[11px] font-medium text-white/38">{meta}</RtlText>
      </span>
    </Surface>
  );
}

function Lessons({ user, show }: { user: V6User; show: (message: string) => void }) {
  const { db, dispatch } = useV6();
  const lessons = selectV6LessonsForActor(db, user);
  const nextLesson = lessons[0];
  const [attendanceLessonId, setAttendanceLessonId] = useState("");
  const [classDate, setClassDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, { status: V6AttendanceStatus; note: string }>>({});
  const attendanceLesson = db.lessons.find((lesson) => lesson.id === attendanceLessonId);
  const attendanceGroup = attendanceLesson ? db.groups.find((group) => group.id === attendanceLesson.groupId) : undefined;
  const attendanceStudents = attendanceGroup ? db.users.filter((item) => attendanceGroup.studentIds.includes(item.id)) : [];
  function openAttendance(lessonId: string) {
    const lesson = db.lessons.find((item) => item.id === lessonId);
    const group = lesson ? db.groups.find((item) => item.id === lesson.groupId) : undefined;
    if (!lesson || !group) {
      show("לא נמצאה קבוצה לשיעור");
      return;
    }
    const operation = buildV6SaveAttendanceOperation(db, user, { lessonId: lesson.id, groupId: group.id, classDate, records: [] });
    if (!operation.allowed && operation.reason !== "סטטוס נוכחות או תלמיד/ה לא תקינים") {
      show(operation.reason ?? "אין הרשאה לסימון נוכחות");
      return;
    }
    const students = db.users.filter((item) => group.studentIds.includes(item.id));
    if (!students.length) {
      show("אין תלמידים משויכים לקבוצה");
      return;
    }
    const nextDraft: Record<string, { status: V6AttendanceStatus; note: string }> = {};
    students.forEach((student) => {
      const existing = db.attendance.find((record) => record.lessonId === lesson.id && record.groupId === group.id && record.classDate === classDate && record.studentId === student.id);
      nextDraft[student.id] = { status: existing?.status ?? "present", note: existing?.note ?? "" };
    });
    setAttendanceLessonId(lesson.id);
    setAttendanceDraft(nextDraft);
  }
  function setAttendanceStatus(studentId: string, status: V6AttendanceStatus) {
    setAttendanceDraft((draft) => ({ ...draft, [studentId]: { status, note: draft[studentId]?.note ?? "" } }));
  }
  function setAttendanceNote(studentId: string, note: string) {
    setAttendanceDraft((draft) => ({ ...draft, [studentId]: { status: draft[studentId]?.status ?? "present", note } }));
  }
  function markAllPresent() {
    setAttendanceDraft((draft) => Object.fromEntries(Object.entries(draft).map(([studentId, item]) => [studentId, item.status === "missing" ? { ...item, status: "present" as const } : item])));
    show("נוכחות כללית סומנה בלי למחוק חריגות");
  }
  function saveAttendance() {
    if (!attendanceLesson || !attendanceGroup) {
      show("חובה לבחור קבוצה ושיעור");
      return;
    }
    const now = new Date().toISOString();
    const records: V6AttendanceRecord[] = attendanceStudents.map((student) => {
      const draft = attendanceDraft[student.id] ?? { status: "present" as const, note: "" };
      return {
        id: `att_${attendanceLesson.id}_${classDate}_${student.id}`,
        studioId: user.studioId,
        studentId: student.id,
        lessonId: attendanceLesson.id,
        groupId: attendanceGroup.id,
        classDate,
        status: draft.status,
        note: draft.note.trim() || undefined,
        markedByUserId: user.id,
        createdAt: now,
        updatedAt: now
      };
    });
    const operation = buildV6SaveAttendanceOperation(db, user, { lessonId: attendanceLesson.id, groupId: attendanceGroup.id, classDate, records });
    if (!operation.allowed) {
      show(operation.reason ?? "לא ניתן לשמור נוכחות");
      return;
    }
    dispatch({ type: "save_attendance", actor: user, lessonId: attendanceLesson.id, groupId: attendanceGroup.id, classDate, records });
    setAttendanceLessonId("");
    show("הנוכחות נשמרה");
  }
  const attendanceEditor = attendanceLesson && attendanceGroup ? (
    <div className="space-y-4">
      <Surface tone="studio" className="p-3">
        <p className="text-[11px] font-black text-emerald-100/62">נוכחות שיעור</p>
        <h3 className="mt-1 truncate text-[18px] font-black tracking-[-0.04em]">{attendanceGroup.name} · {attendanceLesson.time}</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/48">שמירה אחת מעדכנת רשומות, תובנות נוכחות, התראות ואודיט.</p>
      </Surface>
      <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
        <V6Button onClick={saveAttendance}>שמירת נוכחות</V6Button>
        <V6Button variant="ghost" onClick={() => setAttendanceLessonId("")}>ביטול</V6Button>
      </div>
      <FormField label="תאריך שיעור" value={classDate} onChange={setClassDate} type="date" />
      <V6Button variant="ghost" onClick={markAllPresent}>סמן כולם נוכחים</V6Button>
      <div className="space-y-3">
        {attendanceStudents.map((student) => {
          const draft = attendanceDraft[student.id] ?? { status: "present" as V6AttendanceStatus, note: "" };
          return (
            <div key={student.id} className="rounded-[24px] border border-white/[0.050] bg-white/[0.030] p-3 text-start">
              <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 truncate text-[15px] font-bold">{student.name}</p>
                <V6StatusBadge tone={draft.status === "absent" || draft.status === "missing" ? "urgent" : draft.status === "late" ? "shop" : "studio"}>{attendanceStatusLabel[draft.status]}</V6StatusBadge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">{(["present", "absent", "late", "excused"] as V6AttendanceStatus[]).map((status) => <button key={status} onClick={() => setAttendanceStatus(student.id, status)} className={v6Cx("rounded-full px-3 py-2 text-xs font-black", draft.status === status ? "bg-emerald-200 text-zinc-950" : "bg-white/[0.060] text-white/58")}>{attendanceStatusLabel[status]}</button>)}</div>
              <div className="mt-3"><FormField label="הערה" value={draft.note} onChange={(value) => setAttendanceNote(student.id, value)} placeholder="למשל סיבת היעדרות או איחור" /></div>
            </div>
          );
        })}
      </div>
      <div className="sticky bottom-0 -mx-1 flex gap-2 rounded-[24px] border border-white/[0.055] bg-zinc-950/88 p-2 shadow-[0_-16px_42px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur">
        <V6Button onClick={saveAttendance}>שמירת נוכחות</V6Button>
        <V6Button variant="ghost" onClick={() => setAttendanceLessonId("")}>ביטול</V6Button>
      </div>
    </div>
  ) : null;
  return (
    <div className="space-y-4">
      <HeroSurface tone="studio" className="min-h-[220px] p-5">
        <div className="flex items-center gap-3 text-start">
          <span className="grid h-10 w-10 place-items-center rounded-[17px] bg-emerald-100/10 text-emerald-50"><CalendarDays size={20} /></span>
          <V6StatusBadge tone="studio">השיעור הקרוב</V6StatusBadge>
        </div>
        <h1 className="mt-5 max-w-[20rem] text-right text-[clamp(2.18rem,10.5vw,3.08rem)] font-semibold leading-[0.88] tracking-[-0.085em]">{nextLesson?.title ?? "אין שיעור קרוב"}</h1>
        <p className="mt-3 max-w-[20rem] text-right text-sm leading-relaxed text-white/64">{nextLesson ? `${nextLesson.weekday} · ${nextLesson.time} · ${nextLesson.room}` : "אפשר לתאם שיעור פרטי מהמסך הבא."}</p>
      </HeroSurface>
      <EditorialSection title="קצב השבוע" kicker="מערכת חזרה" tone="studio">
      <div className="space-y-2.5">
      {lessons.map((lesson) => {
        const group = db.groups.find((g) => g.id === lesson.groupId);
        const tone = toneForStyle(group?.style);
        const todayRecords = db.attendance.filter((record) => record.lessonId === lesson.id && record.classDate === classDate);
        const absentCount = todayRecords.filter((record) => record.status === "absent" || record.status === "missing").length;
        const lateCount = todayRecords.filter((record) => record.status === "late").length;
        return (
          <div key={lesson.id} className="rounded-[25px] border border-[rgba(255,255,255,0.036)] bg-white/[0.026] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
            <div className="flex flex-col gap-3 text-start sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className={v6Cx("grid h-11 w-11 shrink-0 place-items-center rounded-[18px]", v6Tone[tone].soft, v6Tone[tone].text)}><CalendarDays size={17} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <RtlText as="p" className="min-w-0 flex-1 truncate text-[16px] font-semibold tracking-[-0.02em] text-white/90">{lesson.title}</RtlText>
                  <V6StatusBadge tone={tone}>{group?.style}</V6StatusBadge>
                </div>
                <RtlText as="p" className="mt-1.5 truncate text-sm font-medium text-white/56">{lesson.weekday} · {lesson.time} · {lesson.room} · {todayRecords.length ? `${todayRecords.length} סומנו, ${absentCount} חסרים, ${lateCount} איחורים` : "טרם סומן היום"}</RtlText>
              </div>
              </div>
              {(user.permissions.manageAttendance || user.role === "super_admin") ? <div className="sm:shrink-0 [&>button]:w-full"><V6Button variant="ghost" onClick={() => openAttendance(lesson.id)}>נוכחות</V6Button></div> : null}
            </div>
          </div>
        );
      })}
      </div>
      </EditorialSection>
      {attendanceEditor ? <BottomSheet title="סימון נוכחות" onClose={() => setAttendanceLessonId("")}>{attendanceEditor}</BottomSheet> : null}
      {attendanceEditor ? <Surface tone="studio" className="hidden space-y-3 md:block">{attendanceEditor}</Surface> : null}
    </div>
  );
}

function Messages({ user, show }: { user: V6User; show: (message: string) => void }) {
  const { db, dispatch } = useV6();
  const notifications = selectV6NotificationsForActor(db, user);
  const messages = selectV6MessagesForActor(db, user);
  return (
    <div className="space-y-4">
      <HeroSurface tone={notifications.some((item) => !item.readBy.includes(user.id)) ? "urgent" : "modern"} className="min-h-[210px] p-5">
        <V6StatusBadge tone="modern">קהילה ועדכונים</V6StatusBadge>
        <h1 className="mt-4 max-w-[18rem] text-right text-[clamp(2.12rem,10vw,3rem)] font-semibold leading-[0.88] tracking-[-0.085em]">רק מה שצריך להישמע</h1>
        <p className="mt-4 max-w-[20rem] text-right text-sm leading-relaxed text-white/58">חדש עולה קדימה. השאר נשאר שקט.</p>
        <div className="mt-4"><V6Button variant="ghost" onClick={() => { dispatch({ type: "mark_all_read", userId: user.id }); show("הכול סומן כנקרא"); }}>סמן הכול כנקרא</V6Button></div>
      </HeroSurface>
      <EditorialSection title="התראות חשובות" kicker="מה דורש קריאה" tone="modern">
      <div className="space-y-2.5">
        {notifications.length ? notifications.map((item) => (
        <button key={item.id} onClick={() => { dispatch({ type: "mark_notification_read", userId: user.id, notificationId: item.id }); show("ההודעה סומנה כנקראה"); }} className="w-full">
          <V6FeedRow icon={Bell} title={item.title} body={item.body} meta={item.readBy.includes(user.id) ? "נקרא" : "חדש"} tone={item.readBy.includes(user.id) ? "studio" : "urgent"} />
        </button>
      )) : <p className="py-4 text-center text-sm text-white/45">אין התראות כרגע.</p>}
      </div>
      </EditorialSection>
      <Widget title="עדכוני סטודיו" kicker="קבוצה וקהילה" icon={MessageCircle} tone="modern">
        <div className="space-y-2">{messages.map((item) => <V6FeedRow key={item.id} icon={MessageCircle} title={item.title} body={item.body} meta="סטודיו" tone="modern" />)}</div>
      </Widget>
    </div>
  );
}

function ProductCard({ product, user, show, onPrivateLesson, onEdit }: { product: V6Product; user: V6User; show: (message: string) => void; onPrivateLesson: () => void; onEdit?: () => void }) {
  const { db, dispatch } = useV6();
  const privateLesson = product.category.includes("שיעורים");
  const ticket = product.category.includes("כרטיסים");
  const tone: V6Tone = privateLesson ? "studio" : ticket ? "repertoire" : "shop";
  const collection = privateLesson ? "Private Studio" : ticket ? "Stage Access" : "Studio Boutique";
  const image = product.featuredImageMediaId ? db.media.find((item) => item.id === product.featuredImageMediaId) : undefined;
  const action = privateLesson
    ? () => onPrivateLesson()
    : () => {
        dispatch({ type: "shop_order", actor: user, productId: product.id });
        show("הפעולה נשמרה ונשלחה התראה");
      };
  return (
    <Surface tone={tone} className="p-0">
      {image?.localPreviewUrl ? <div role="img" aria-label={product.title} className="h-40 w-full rounded-t-[29px] border-b border-[rgba(255,255,255,0.046)] bg-cover bg-center" style={{ backgroundImage: `url(${image.localPreviewUrl})` }} /> : <StageImage tone={tone} label={collection} icon={privateLesson ? Receipt : ticket ? Sparkles : ShoppingBag} className="h-40 rounded-b-none border-x-0 border-t-0" />}
      <div className="p-4 text-start">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <RtlText as="h2" className="text-[18px] font-semibold tracking-[-0.035em]">{product.title}</RtlText>
            <RtlText as="p" className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/60">{product.description}</RtlText>
          </div>
          <p className="shrink-0 text-[15px] font-semibold text-[#fff7df]/88"><BidiNumber>₪ {product.price}</BidiNumber></p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <V6Button disabled={!product.active} onClick={action}>{privateLesson ? "זמינות" : "רכישה"}</V6Button>
          {onEdit ? <V6Button variant="ghost" onClick={onEdit}>עריכה</V6Button> : null}
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-white/38">{product.active ? "זמין" : "לא פעיל"}</span>
        </div>
      </div>
    </Surface>
  );
}

function Shop({ user, show, openScreen }: { user: V6User; show: (message: string) => void; openScreen: (screen: V6Screen) => void }) {
  const { db, dispatch } = useV6();
  const [category, setCategory] = useState("הכול");
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("אביזרים");
  const [productPrice, setProductPrice] = useState("");
  const [productActive, setProductActive] = useState(true);
  const [productImageId, setProductImageId] = useState("");
  const productImageInput = useRef<HTMLInputElement>(null);
  const categories = ["הכול", "אביזרים", "כרטיסים", "פרטיים"];
  const productCategories = ["אביזרים", "כרטיסים למופעים", "שיעורים פרטיים", "ביגוד", "סדנאות"];
  const filtered = category === "פרטיים" ? selectV6ShopProductsByCategory(db, "שיעורים") : selectV6ShopProductsByCategory(db, category);
  const lanes = selectV6FeaturedShopLanes(db);
  const shopImages = db.media.filter((item) => item.mediaType === "image" && (item.visibility === "shop" || item.linkedProductId || item.localPreviewUrl));
  function openProductEditor(product?: V6Product) {
    const nextId = product?.id ?? nextV6ClientId("prod");
    setProductId(nextId);
    setProductTitle(product?.title ?? "");
    setProductDescription(product?.description ?? "");
    setProductCategory(product?.category ?? "אביזרים");
    setProductPrice(product ? String(product.price) : "");
    setProductActive(product?.active ?? true);
    setProductImageId(product?.featuredImageMediaId ?? product?.imageMediaIds[0] ?? "");
    setProductSheetOpen(true);
  }
  function uploadProductImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      show("אפשר לבחור תמונת מוצר בלבד");
      return;
    }
    const mediaId = nextV6ClientId("media");
    const media: V6MediaItem = { id: mediaId, studioId: user.studioId, uploadedByUserId: user.id, title: productTitle || "תמונת מוצר", fileName: file.name, mediaType: "image", linkedProductId: productId, visibility: "shop", localPreviewUrl: URL.createObjectURL(file), createdAt: new Date().toISOString() };
    dispatch({ type: "save_media", actor: user, media });
    setProductImageId(mediaId);
    show("התמונה נשמרה למוצר");
  }
  function saveProduct() {
    const product: V6Product = {
      id: productId || nextV6ClientId("prod"),
      studioId: user.studioId,
      title: productTitle,
      description: productDescription,
      category: productCategory,
      price: Number(productPrice),
      active: productActive,
      imageMediaIds: productImageId ? [productImageId] : [],
      featuredImageMediaId: productImageId || undefined
    };
    const operation = buildV6SaveProductOperation(db, user, product);
    if (!operation.allowed) {
      show(operation.reason ?? "לא ניתן לשמור מוצר");
      return;
    }
    dispatch({ type: "save_product", actor: user, product });
    setCategory(product.category.includes("שיעורים") ? "פרטיים" : product.category.includes("כרטיסים") ? "כרטיסים" : product.category);
    setProductSheetOpen(false);
    show("המוצר נשמר ומופיע בחנות");
  }
  const productEditor = (
    <div className="space-y-4">
      <Surface tone="shop" className="p-3">
        <p className="text-[11px] font-black text-yellow-100/62">ניהול מוצר</p>
        <h3 className="mt-1 truncate text-[18px] font-black tracking-[-0.04em]">{productTitle || "מוצר חדש"}</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/48">שמירה מעדכנת את מסד V6, האודיט והחנות באותו רגע.</p>
      </Surface>
      <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
        <V6Button onClick={saveProduct}>שמירת מוצר</V6Button>
        <V6Button variant="ghost" onClick={() => setProductSheetOpen(false)}>ביטול</V6Button>
      </div>
      <FormField label="שם מוצר" value={productTitle} onChange={setProductTitle} />
      <FormField label="תיאור" value={productDescription} onChange={setProductDescription} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-start"><span className="text-[12px] font-bold text-white/50">קטגוריה</span><select value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className="mt-2 min-h-[52px] w-full rounded-[20px] border border-transparent bg-white/[0.075] px-4 text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">{productCategories.map((item) => <option key={item} value={item} className="bg-zinc-950">{item}</option>)}</select></label>
        <FormField label="מחיר" value={productPrice} onChange={setProductPrice} type="number" />
      </div>
      <label className="block text-start"><span className="text-[12px] font-bold text-white/50">סטטוס מלאי</span><select value={productActive ? "active" : "archived"} onChange={(e) => setProductActive(e.target.value === "active")} className="mt-2 min-h-[52px] w-full rounded-[20px] border border-transparent bg-white/[0.075] px-4 text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]"><option value="active" className="bg-zinc-950">זמין בחנות</option><option value="archived" className="bg-zinc-950">מושבת / ארכיון</option></select></label>
      <input ref={productImageInput} type="file" accept="image/*" className="hidden" onChange={(event) => uploadProductImage(event.target.files?.[0])} />
      <div className="space-y-2 rounded-[24px] border border-white/[0.050] bg-white/[0.035] p-3">
        <div className="flex gap-2 [&>button]:flex-1"><V6Button variant="ghost" onClick={() => productImageInput.current?.click()}><Upload size={16} /> העלאת תמונה</V6Button></div>
        {shopImages.length ? <label className="block text-start"><span className="text-[12px] font-bold text-white/50">בחירת תמונה קיימת</span><select value={productImageId} onChange={(e) => setProductImageId(e.target.value)} className="mt-2 min-h-[48px] w-full rounded-[18px] border border-transparent bg-black/24 px-3 text-white outline-none"><option value="" className="bg-zinc-950">ללא תמונה</option>{shopImages.map((item) => <option key={item.id} value={item.id} className="bg-zinc-950">{item.title}</option>)}</select></label> : <p className="text-start text-xs text-white/44">אין עדיין תמונות מוצר שמורות.</p>}
      </div>
      <div className="sticky bottom-0 -mx-1 flex gap-2 rounded-[24px] border border-white/[0.055] bg-zinc-950/88 p-2 shadow-[0_-16px_42px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur">
        <V6Button onClick={saveProduct}>שמירת מוצר</V6Button>
        <V6Button variant="ghost" onClick={() => setProductSheetOpen(false)}>ביטול</V6Button>
      </div>
    </div>
  );
  return (
    <div className="space-y-4">
      <HeroSurface tone="shop" className="min-h-[292px] p-5">
        <V6StatusBadge tone="shop">בוטיק</V6StatusBadge>
        <h1 className="mt-4 max-w-[19rem] text-right text-[clamp(2.38rem,11.5vw,3.25rem)] font-semibold leading-[0.86] tracking-[-0.09em]">בוטיק לפני במה</h1>
        <p className="mt-4 max-w-[19rem] text-right text-[14px] leading-relaxed text-white/62">כרטיסים, שיעורים פרטיים ופריטי סטודיו. מעט, ברור, מוכן לרכישה.</p>
        <div className="mt-5"><SegmentedControl value={category} options={categories} onChange={setCategory} /></div>
      </HeroSurface>
      <EditorialSection title="מסלולים מהירים" tone="shop">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => openScreen("private_lessons")} className="min-h-[78px] rounded-[25px] border border-[rgba(255,255,255,0.036)] bg-white/[0.030] p-3 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.034)]">
          <p className="text-sm font-semibold">שיעורים פרטיים</p>
          <p className="mt-0.5 text-[11px] text-white/38"><BidiNumber>{lanes.privateLessons.length}</BidiNumber> {lanes.privateLessons.length === 1 ? "אפשרות" : "אפשרויות"}</p>
        </button>
        <button onClick={() => setCategory("כרטיסים")} className="min-h-[78px] rounded-[25px] border border-[rgba(255,255,255,0.036)] bg-white/[0.030] p-3 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.034)]">
          <p className="text-sm font-semibold">כרטיסים</p>
          <p className="mt-0.5 text-[11px] text-white/38"><BidiNumber>{lanes.tickets.length}</BidiNumber> במלאי</p>
        </button>
      </div>
      </EditorialSection>
      {productSheetOpen ? <BottomSheet title={productTitle || "מוצר חדש"} onClose={() => setProductSheetOpen(false)}>{productEditor}</BottomSheet> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((product) => <ProductCard key={product.id} product={product} user={user} show={show} onPrivateLesson={() => openScreen("private_lessons")} onEdit={(user.permissions.manageShop || user.role === "super_admin") ? () => openProductEditor(product) : undefined} />)}
      </div>
      {(user.permissions.manageShop || user.role === "super_admin") ? <ActionCard icon={Plus} title="הוספת מוצר" subtitle="ניהול מוצר ותמונות" tone="shop" onClick={() => openProductEditor()} /> : null}
      {productSheetOpen ? <Surface tone="shop" className="hidden space-y-3 md:block">{productEditor}</Surface> : null}
      <Surface tone="shop" className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-start"><CreditCard className="shrink-0 text-yellow-100/70" size={17} /><span className="min-w-0 flex-1 text-xs font-medium text-white/38">תשלום מאובטח יופעל בצד שרת</span></div>
        <div className="grid grid-cols-3 gap-1.5 rounded-[20px] bg-black/18 p-1.5 text-center text-xs font-semibold text-white/56 shadow-[inset_0_1px_0_rgba(255,255,255,0.040)]">
          {["Apple Pay", "Bit", "אשראי"].map((method) => <button key={method} onClick={() => show(`${method} נבחר כאמצעי תשלום מועדף`)} className="min-h-11 rounded-[17px] transition hover:bg-white/[0.06] active:scale-95">{method}</button>)}
        </div>
      </Surface>
    </div>
  );
}

function More({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const { db } = useV6();
  const aiInsights = useMemo(() => selectV6AIInsightsForActor(db, user).slice(0, 1), [db, user]);
  const sections = [
    { title: "מערכת", items: user.role === "super_admin" ? [{ title: "מסד נתונים", subtitle: "ייצוא, ייבוא וגיבוי", icon: Database, tone: "admin" as Tone, screen: "database" as V6Screen }, { title: "טקסטים", subtitle: "תוכן ניתן לעריכה", icon: Sparkles, tone: "repertoire" as Tone, screen: "texts" as V6Screen }, { title: "פיצ׳רים", subtitle: "דגלי יכולת", icon: Flag, tone: "admin" as Tone, screen: "flags" as V6Screen }, { title: "אודיט", subtitle: "יומן פעולות", icon: ClipboardList, tone: "management" as Tone, screen: "audit" as V6Screen }, { title: "בריאות מערכת", subtitle: "סטטוס מקומי", icon: HeartPulse, tone: "studio" as Tone, screen: "system" as V6Screen }, { title: "מיתוג", subtitle: "שם, שפה ונראות סטודיו", icon: Settings, tone: "admin" as Tone, screen: "branding" as V6Screen }] : [] },
    { title: "הסטודיו", items: [{ title: "שיעורים פרטיים", subtitle: "בקשות, מועדים ותשלום", icon: Receipt, tone: "shop" as Tone, screen: "private_lessons" as V6Screen }, { title: "מדיה וגלריה", subtitle: "תמונות, וידאו וחומרים", icon: ImagePlus, tone: "modern" as Tone, screen: "media" as V6Screen }] },
    { title: "חנות ותשלומים", items: [{ title: "בוטיק ותשלומים", subtitle: "מוצרים, כרטיסים ואמצעי תשלום", icon: ShoppingBag, tone: "shop" as Tone, tab: "shop" as V6Tab }] },
    { title: "כלים למורה", items: user.role === "teacher" || user.role === "management" || user.role === "super_admin" ? [{ title: "נוכחות וקבוצות", subtitle: "פעולות מהירות למורה", icon: School, tone: "studio" as Tone, screen: "system" as V6Screen }] : [] },
    { title: "ניהול", items: user.permissions.manageUsers || user.role === "super_admin" ? [{ title: "ניהול משתמשים", subtitle: "זהויות, קשרים והרשאות", icon: Users, tone: "management" as Tone, screen: "users" as V6Screen }] : [] }
  ].filter((s) => s.items.length);
  return (
    <div className="space-y-4">
      <HeroSurface tone={user.role === "super_admin" ? "admin" : user.role === "management" ? "management" : "modern"} className="min-h-[208px] p-5">
        <V6StatusBadge tone={user.role === "super_admin" ? "admin" : "management"}>{user.role === "super_admin" ? "קוקפיט מוצר" : "שליטה רגועה"}</V6StatusBadge>
        <h1 className="mt-4 max-w-[18rem] text-right text-[clamp(2.18rem,11vw,3.05rem)] font-semibold leading-[0.88] tracking-[-0.085em]">חדר פיקוד בלי רעש</h1>
        <p className="mt-4 max-w-[20rem] text-right text-sm leading-relaxed text-white/58">כניסות קצרות לפי כוונה. הכלים הרגישים נשארים זמינים, אבל שקטים.</p>
      </HeroSurface>
      {sections.map((section) => (
        <EditorialSection key={section.title} title={section.title} tone={section.title === "מערכת" ? "admin" : section.title === "ניהול" ? "management" : "studio"}>
          <div className={section.title === "מערכת" ? "grid gap-2 sm:grid-cols-2" : "space-y-2.5"}>
            {section.items.map((item) => <ActionCard key={item.title} icon={item.icon} title={item.title} subtitle={item.subtitle} tone={item.tone} onClick={() => "tab" in item ? openTab(item.tab) : openScreen(item.screen)} />)}
          </div>
        </EditorialSection>
      ))}
      {aiInsights.length ? <AISuggestionStack insights={aiInsights} /> : null}
    </div>
  );
}

function BackHeader({ title, back, action }: { title: string; back: () => void; action?: ReactNode }) {
  return <PageHeader title={title} action={<div className="flex gap-2">{action}<V6Button variant="ghost" onClick={back}>חזרה</V6Button></div>} />;
}

function UsersScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const [selectedId, setSelectedId] = useState(db.users[0]?.id ?? "");
  const selected = db.users.find((u) => u.id === selectedId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<V6Role | "all">("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState(selected?.name ?? "");
  const [phone, setPhone] = useState(selected?.phone ?? "");
  const [role, setRole] = useState<V6Role>(selected?.role ?? "student");
  const [permissions, setPermissions] = useState<V6Permissions>(selected?.permissions ?? permissionsFor("student"));
  const [active, setActive] = useState(selected?.active ?? true);
  const [groupIds, setGroupIds] = useState<string[]>(selected?.groupIds ?? []);
  const [linkedStudentIds, setLinkedStudentIds] = useState<string[]>(selected?.linkedStudentIds ?? []);
  const [password, setPassword] = useState("new2026");
  const queryValue = query.trim();
  const filteredUsers = selectV6UsersByRole(db, actor, filter).filter((user) => !queryValue || `${user.name} ${user.phone} ${roleLabel[user.role]}`.includes(queryValue));
  const availableStudents = db.users.filter((user) => user.role === "student" && user.id !== selectedId);
  const filterOptions: Array<{ id: V6Role | "all"; label: string }> = [
    { id: "all", label: "כולם" },
    { id: "student", label: "תלמידים" },
    { id: "parent", label: "הורים" },
    { id: "teacher", label: "מורים" },
    { id: "management", label: "הנהלה" }
  ];
  function load(user: V6User) {
    setSelectedId(user.id);
    setName(user.name);
    setPhone(user.phone);
    setRole(user.role);
    setPermissions(user.permissions);
    setActive(user.active);
    setGroupIds(user.groupIds);
    setLinkedStudentIds(user.linkedStudentIds);
    setPassword("");
    setSheetOpen(true);
  }
  function setRoleAndPermissions(nextRole: V6Role) {
    setRole(nextRole);
    setPermissions(permissionsFor(nextRole));
    if (nextRole !== "parent") setLinkedStudentIds([]);
  }
  function toggleGroup(groupId: string) {
    setGroupIds((items) => items.includes(groupId) ? items.filter((id) => id !== groupId) : [...items, groupId]);
  }
  function toggleLinkedStudent(studentId: string) {
    setLinkedStudentIds((items) => items.includes(studentId) ? items.filter((id) => id !== studentId) : [...items, studentId]);
  }
  function togglePermission(key: keyof V6Permissions) {
    if (!actor.permissions.editPermissions && actor.role !== "super_admin") {
      show("אין הרשאה לעריכת הרשאות");
      return;
    }
    setPermissions((items) => ({ ...items, [key]: !items[key] }));
  }
  function save() {
    const idValue = selectedId || nextV6ClientId("user");
    const user: V6User = { ...(selected ?? { id: idValue, studioId: actor.studioId, name: "", phone: "", role, permissions, active: true, groupIds: [], linkedStudentIds: [] }), id: idValue, studioId: actor.studioId, name, phone, role, permissions, active, groupIds: role === "parent" ? [] : groupIds, linkedStudentIds: role === "parent" ? linkedStudentIds : [] };
    const credential = selected ? undefined : { userId: idValue, phone, password };
    const operation = buildV6UpsertUserOperation(db, actor, user, credential);
    if (!operation.allowed) {
      show(operation.reason ?? "לא ניתן לשמור משתמש");
      return false;
    }
    dispatch({ type: "upsert_user", actor, user, credential });
    setSelectedId(idValue);
    setPassword("");
    show("המשתמש נשמר");
    return true;
  }
  function resetPassword() {
    if (!selected) {
      show("איפוס זמין אחרי שמירת משתמש חדש");
      return;
    }
    const operation = buildV6ResetPasswordOperation(actor, selected, password);
    if (!operation.allowed) {
      show(operation.reason ?? "לא ניתן לאפס סיסמה");
      return;
    }
    dispatch({ type: "reset_password", actor, userId: selected.id, password });
    setPassword("");
    show("סיסמה עודכנה");
  }
  const editor = (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-[rgba(255,255,255,0.050)] bg-[linear-gradient(145deg,rgba(125,211,252,0.10),rgba(255,255,255,0.018))] p-3 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.052)]">
        <p className="text-[11px] font-black text-sky-100/62">זהות והרשאות</p>
        <h3 className="mt-1 truncate text-[18px] font-black tracking-[-0.04em]">{selected?.name ?? (name || "משתמש חדש")}</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/48">שינוי תפקיד מעדכן את הרשאות המשתמש דרך אותו מסלול נתונים.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
        <V6Button onClick={() => { if (save()) setSheetOpen(false); }}>שמירה</V6Button>
        <V6Button variant="ghost" onClick={resetPassword}>איפוס סיסמה</V6Button>
      </div>
      <FormField label="שם" value={name} onChange={setName} />
      <FormField label="טלפון" value={phone} onChange={setPhone} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-start"><span className="text-[12px] font-bold text-white/50">תפקיד</span><select value={role} onChange={(e) => setRoleAndPermissions(e.target.value as V6Role)} className="mt-2 min-h-[52px] w-full rounded-[20px] border border-transparent bg-white/[0.075] px-4 text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">{Object.entries(roleLabel).map(([id, label]) => <option key={id} value={id} className="bg-zinc-950">{label}</option>)}</select></label>
        <label className="block text-start"><span className="text-[12px] font-bold text-white/50">סטטוס</span><select value={active ? "active" : "inactive"} onChange={(e) => setActive(e.target.value === "active")} className="mt-2 min-h-[52px] w-full rounded-[20px] border border-transparent bg-white/[0.075] px-4 text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]"><option value="active" className="bg-zinc-950">פעיל</option><option value="inactive" className="bg-zinc-950">מושבת</option></select></label>
      </div>
      {(role === "teacher" || role === "student") ? <div className="rounded-[24px] border border-white/[0.050] bg-white/[0.032] p-3 text-start"><p className="mb-2 text-[12px] font-bold text-white/50">{role === "teacher" ? "שיוך מורה לקבוצות" : "שיוך תלמיד/ה לקבוצות"}</p><div className="flex flex-wrap gap-2">{db.groups.map((group) => <button key={group.id} onClick={() => toggleGroup(group.id)} className={v6Cx("rounded-full px-3 py-2 text-xs font-black", groupIds.includes(group.id) ? "bg-emerald-200 text-zinc-950" : "bg-white/[0.060] text-white/58")}>{group.name}</button>)}</div></div> : null}
      {role === "parent" ? <div className="rounded-[24px] border border-white/[0.050] bg-white/[0.032] p-3 text-start"><p className="mb-2 text-[12px] font-bold text-white/50">קישור הורה לתלמיד/ה</p><div className="flex flex-wrap gap-2">{availableStudents.map((student) => <button key={student.id} onClick={() => toggleLinkedStudent(student.id)} className={v6Cx("rounded-full px-3 py-2 text-xs font-black", linkedStudentIds.includes(student.id) ? "bg-sky-200 text-zinc-950" : "bg-white/[0.060] text-white/58")}>{student.name}</button>)}</div></div> : null}
      <div className="rounded-[24px] border border-white/[0.050] bg-white/[0.032] p-3 text-start">
        <p className="mb-2 text-[12px] font-bold text-white/50">הרשאות</p>
        <div className="flex flex-wrap gap-2">{permissionLabels.map(([key, label]) => <button key={key} onClick={() => togglePermission(key)} className={v6Cx("rounded-full px-3 py-2 text-xs font-black", permissions[key] ? "bg-violet-200 text-zinc-950" : "bg-white/[0.060] text-white/58")}>{label}</button>)}</div>
      </div>
      <FormField label={selected ? "סיסמה חדשה לאיפוס" : "סיסמה ראשונית"} value={password} onChange={setPassword} />
      <div className="sticky bottom-0 -mx-1 flex gap-2 rounded-[24px] border border-white/[0.055] bg-zinc-950/88 p-2 shadow-[0_-16px_42px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur">
        <V6Button onClick={() => { if (save()) setSheetOpen(false); }}>שמירה</V6Button>
        <V6Button variant="ghost" onClick={resetPassword}>איפוס</V6Button>
        <V6Button variant="ghost" onClick={() => setSheetOpen(false)}>ביטול</V6Button>
      </div>
    </div>
  );
  return (
    <div className="space-y-5">
      <BackHeader title="ניהול משתמשים" back={back} action={<V6Button onClick={() => { setSelectedId(""); setName(""); setPhone(""); setRole("student"); setPermissions(permissionsFor("student")); setActive(true); setGroupIds([]); setLinkedStudentIds([]); setPassword("new2026"); setSheetOpen(true); }}>חדש</V6Button>} />
      <HeroSurface tone="management" className="min-h-[190px] p-5">
        <V6StatusBadge tone="management">זהויות</V6StatusBadge>
        <h2 className="mt-4 max-w-[18rem] text-right text-[clamp(1.95rem,9.5vw,2.82rem)] font-semibold leading-[0.90] tracking-[-0.078em]">להחזיק את הלהקה נכון</h2>
        <p className="mt-3 max-w-[20rem] text-right text-sm leading-relaxed text-white/56">אנשים, תפקידים והרשאות. זהות ברורה לפני כלי ניהול.</p>
      </HeroSurface>
      <EditorialSection title="חיפוש וסינון" tone="management">
      <div className="space-y-3">
        <FormField label="חיפוש" value={query} onChange={setQuery} placeholder="חיפוש לפי שם או טלפון" />
        <SegmentedControl value={filterOptions.find((item) => item.id === filter)?.label ?? "כולם"} options={filterOptions.map((item) => item.label)} onChange={(value) => setFilter(filterOptions.find((item) => item.label === value)?.id ?? "all")} />
      </div>
      </EditorialSection>
      {sheetOpen ? <BottomSheet title={selected?.name ?? "משתמש חדש"} onClose={() => setSheetOpen(false)}>{editor}</BottomSheet> : null}
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
        <EditorialSection title="אנשי הסטודיו" kicker={`${filteredUsers.length} מוצגים`} tone="management" className="lg:p-3">
          <div className="space-y-2.5">{filteredUsers.map((user) => <button key={user.id} onClick={() => load(user)} className="w-full"><UserCard user={user} active={selected?.id === user.id} /></button>)}</div>
        </EditorialSection>
        <Surface tone="management" className="hidden space-y-3 lg:block">{editor}</Surface>
      </div>
    </div>
  );
}

function UserCard({ user, active }: { user: V6User; active?: boolean }) {
  const tone = toneForRole(user.role);
  return (
    <div dir="rtl" className={v6Cx("flex items-center gap-3 rounded-[25px] border p-3 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.040)]", active ? "border-transparent bg-[linear-gradient(135deg,#fff7df,#f4d58d_58%,#dfffee)] text-zinc-950" : "border-[rgba(255,255,255,0.040)] bg-white/[0.030] text-white")}>
      <span className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-[17px] font-semibold", active ? "bg-black/10 text-zinc-950" : v6Cx(v6Tone[tone].soft, v6Tone[tone].text))}>{user.name.slice(0, 1)}</span>
      <span className="min-w-0 flex-1">
        <RtlText as="span" className="block truncate text-[15px] font-semibold tracking-[-0.020em]">{user.name}</RtlText>
        <bdi className={v6Cx("mt-1 block truncate text-left text-[12px] font-medium", active ? "text-zinc-700" : "text-white/46")}>{user.phone}</bdi>
      </span>
      <span className={v6Cx("shrink-0 text-[10px] font-semibold", active ? "text-zinc-800" : "text-white/48")}>{roleLabel[user.role]}</span>
      <DirectionalChevron className="opacity-35" />
    </div>
  );
}

function PrivateLessons({ user, show, back }: { user: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const teachers = db.users.filter((u) => u.role === "teacher");
  const students = user.role === "student" ? [user] : db.users.filter((u) => u.role === "student");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [studentId, setStudentId] = useState(students[0]?.id ?? user.id);
  const privateLessons = selectV6PrivateLessonsForActor(db, user);
  const coordination = computeV6PrivateLessonCoordination(db);
  const canRequest = Boolean(studentId && teacherId);
  function request(duration: 30 | 45) {
    if (!canRequest) {
      show("צריך לבחור תלמיד/ה ומורה לפני שליחת בקשה");
      return;
    }
    dispatch({ type: "request_private_lesson", actor: user, studentId, teacherId, duration });
    show("בקשה נשלחה");
  }
  return (
    <div className="space-y-4">
      <BackHeader title="שיעורים פרטיים" back={back} />
      <HeroSurface tone="shop" className="min-h-[214px] p-5">
        <V6StatusBadge tone={coordination.needsAttention ? "urgent" : "shop"}>{coordination.needsAttention ? "דורש תיאום" : "זמין לתיאום"}</V6StatusBadge>
        <h2 className="mt-4 max-w-[18rem] text-right text-[clamp(2.05rem,10vw,2.95rem)] font-semibold leading-[0.88] tracking-[-0.082em]">תיאום פרטי, נקי</h2>
        <p className="mt-4 max-w-[20rem] text-right text-sm leading-relaxed text-white/58">בקשה קצרה, מורה נכון, מועד מוצע. בלי טופס שמרגיש כבד.</p>
      </HeroSurface>
      <EditorialSection title="בקשת שיעור" kicker="קונסיירז׳ סטודיו" tone="shop">
      <div className="space-y-3">
        <label className="block text-start"><span className="text-xs font-black text-white/50">תלמיד/ה</span><select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-2 min-h-13 w-full rounded-[22px] border border-transparent bg-white/[0.08] px-3 text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">{students.map((s) => <option key={s.id} value={s.id} className="bg-zinc-950">{s.name}</option>)}</select></label>
        <label className="block text-start"><span className="text-xs font-black text-white/50">מורה</span><select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="mt-2 min-h-13 w-full rounded-[22px] border border-transparent bg-white/[0.08] px-3 text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">{teachers.map((t) => <option key={t.id} value={t.id} className="bg-zinc-950">{t.name}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
          <V6Button disabled={!canRequest} onClick={() => request(30)}><BidiNumber>30</BidiNumber> דקות</V6Button>
          <V6Button disabled={!canRequest} onClick={() => request(45)}><BidiNumber>45</BidiNumber> דקות</V6Button>
        </div>
        {!canRequest ? <p className="text-start text-xs text-amber-100/70">אין מספיק נתונים לשליחת בקשה. צריך תלמיד/ה ומורה פעילים.</p> : null}
      </div>
      </EditorialSection>
      <EditorialSection title="בקשות פעילות" kicker="תיאום ותשלום" tone="shop">
      <div className="space-y-3">
        {privateLessons.length ? privateLessons.map((item) => (
          <div key={item.id} className="rounded-[28px] border border-[rgba(255,255,255,0.046)] bg-[linear-gradient(145deg,rgba(244,213,141,0.070),rgba(255,255,255,0.018))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.048)]">
            <div className="flex items-start gap-3 text-start">
              <div className="min-w-0 flex-1">
                <RtlText as="h2" className="font-bold">{db.users.find((u) => u.id === item.studentId)?.name} · {item.duration} דקות</RtlText>
                <RtlText as="p" className="mt-1 text-sm text-white/55"><BidiNumber>₪ {item.price}</BidiNumber> · {item.selectedSlot ?? item.suggestedSlots[0] ?? "מועד טרם נקבע"}</RtlText>
              </div>
              <V6StatusBadge tone={item.status === "paid" ? "success" : item.status === "requested" ? "urgent" : "shop"}>{item.status === "paid" ? "שולם" : item.status === "requested" ? "מבוקש" : "בתיאום"}</V6StatusBadge>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 [&>button]:w-full">
              <V6Button variant="ghost" onClick={() => { dispatch({ type: "suggest_private_lesson", actor: user, requestId: item.id, slot: "יום שני 17:00" }); show("מועד הוצע"); }}>הצע מועד</V6Button>
              <V6Button variant="ghost" onClick={() => { dispatch({ type: "select_private_lesson", actor: user, requestId: item.id, slot: "יום שני 17:00" }); show("מועד נבחר"); }}>בחר מועד</V6Button>
              <V6Button onClick={() => { dispatch({ type: "mark_private_lesson_paid", actor: user, requestId: item.id }); show("שולם"); }}>שולם</V6Button>
            </div>
          </div>
        )) : <Surface tone="shop"><p className="text-center text-sm text-white/50">אין בקשות שיעור פרטי פתוחות כרגע.</p></Surface>}
      </div>
      </EditorialSection>
    </div>
  );
}

function MediaScreen({ user, show, back }: { user: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const input = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("חומר חדש");
  const [groupId, setGroupId] = useState(user.groupIds[0] ?? db.groups[0]?.id ?? "");
  const groups = user.role === "teacher" ? db.groups.filter((g) => user.groupIds.includes(g.id)) : db.groups;
  function save(file?: File) {
    const media: V6MediaItem = { id: nextV6ClientId("media"), studioId: user.studioId, uploadedByUserId: user.id, title, fileName: file?.name ?? "local-preview", mediaType: file?.type.startsWith("video/") ? "video" : "image", linkedGroupId: groupId, visibility: "group", localPreviewUrl: file ? URL.createObjectURL(file) : undefined, createdAt: new Date().toISOString() };
    dispatch({ type: "save_media", actor: user, media });
    show("המדיה נשמרה");
  }
  const media = selectV6MediaForActor(db, user);
  return (
    <div className="space-y-4">
      <BackHeader title="מדיה וגלריה" back={back} />
      <HeroSurface tone="modern" className="min-h-[220px] p-5">
        <div className="pointer-events-none absolute left-5 top-5 h-32 w-24 rotate-3 rounded-[38px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(34,211,238,0.08),rgba(61,16,39,0.18))]" />
        <div className="pointer-events-none absolute left-11 bottom-8 h-16 w-28 rounded-full bg-cyan-100/10 blur-2xl" />
        <V6StatusBadge tone="modern">גלריה</V6StatusBadge>
        <h2 className="mt-4 max-w-[18rem] text-right text-[clamp(2.1rem,11vw,3.1rem)] font-semibold leading-[0.86] tracking-[-0.09em]">רגעי חזרה, במה וקהילה</h2>
        <p className="mt-4 max-w-[20rem] text-right text-sm leading-relaxed text-white/64">תצוגת מדיה מטופלת כמו אלבום סטודיו, עם הרשאות וקבוצות מאחורי הקלעים.</p>
      </HeroSurface>
      <Surface tone="modern" className="space-y-3">
        <FormField label="כותרת" value={title} onChange={setTitle} />
        <label className="block text-right"><span className="text-xs text-white/46">קבוצה</span><select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="mt-2 min-h-12 w-full rounded-[18px] border border-transparent bg-white/[0.075] px-3 text-white outline-none">{groups.map((g) => <option key={g.id} value={g.id} className="bg-zinc-950">{g.name}</option>)}</select></label>
        <input ref={input} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => save(e.target.files?.[0])} />
        <div className="flex gap-2">
          <V6Button onClick={() => input.current?.click()}><Upload size={16} /> בחירת קובץ</V6Button>
          <V6Button variant="ghost" onClick={() => save()}>שמירת מטאדאטה</V6Button>
        </div>
        <p className="text-right text-xs leading-relaxed text-white/44">ב־MVP נשמרת מטאדאטה ותצוגה מקומית. בפרודקשן הקבצים יעברו לאחסון מאובטח.</p>
      </Surface>
      {media.map((item) => <Surface key={item.id} tone="modern"><h2 className="text-right font-bold">{item.title}</h2><p className="mt-1 text-right text-sm text-white/55">{item.fileName}</p></Surface>)}
    </div>
  );
}

function DatabaseScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, exportDatabase, importDatabase } = useV6();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4">
      <BackHeader title="מסד נתונים" back={back} />
      <HeroSurface tone="admin" className="min-h-[220px] p-5">
        <div className="pointer-events-none absolute left-5 top-5 h-28 w-24 rounded-[38px] border border-violet-100/10 bg-[linear-gradient(145deg,rgba(216,210,255,0.10),rgba(255,255,255,0.04),rgba(0,0,0,0.20))]" />
        <V6StatusBadge tone="admin">תפעול</V6StatusBadge>
        <h2 className="mt-4 max-w-[19rem] text-right text-[clamp(2rem,10vw,3rem)] font-semibold leading-[0.9] tracking-[-0.08em]">קוקפיט מסד מקומי</h2>
        <p className="mt-4 max-w-[21rem] text-right text-sm leading-relaxed text-white/62">ייצוא, ייבוא ובקרת נתונים מוצגים ככלי מוצר רגועים, לא כפאנל דיבאג.</p>
      </HeroSurface>
      <div className="grid gap-2 sm:grid-cols-3"><MiniSummary icon={Users} tone="management" label="משתמשים" title={`${db.users.length}`} meta="מהמסד" /><MiniSummary icon={Bell} tone="modern" label="התראות" title={`${db.notifications.length}`} meta="פעילות" /><MiniSummary icon={Database} tone="admin" label="אודיט" title={`${db.auditLog.length}`} meta="פעולות" /></div>
      <Surface tone="admin" className="space-y-3 p-4"><p className="text-right text-sm leading-relaxed text-white/58">ייצוא וייבוא משתמשים באותו מסד V6 מקומי, דרך Provider יחיד.</p><input ref={ref} type="file" accept="application/json" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const result = await importDatabase(file); show(result.ok === true ? "המסד יובא" : result.reason); }} /><div className="flex flex-wrap gap-2 [&>button]:flex-1"><V6Button onClick={exportDatabase}><Download size={16} /> ייצוא</V6Button><V6Button variant="ghost" onClick={() => ref.current?.click()}><Upload size={16} /> ייבוא</V6Button></div></Surface>
    </div>
  );
}

function TextsScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const [title, setTitle] = useState(db.editableTexts.loginTitle ?? "");
  const [prompt] = useState(db.aiPrompts.super_admin ?? "");
  return <div className="space-y-4"><BackHeader title="טקסטים ו־AI" back={back} /><HeroSurface tone="admin" className="min-h-[205px] p-5"><V6StatusBadge tone="admin">שפה מבוקרת</V6StatusBadge><h2 className="mt-4 max-w-[18rem] text-right text-[clamp(2rem,10vw,3rem)] font-semibold leading-[0.88] tracking-[-0.085em]">הקול של הסטודיו נשמר כאן</h2><p className="mt-3 max-w-[20rem] text-right text-sm leading-relaxed text-white/60">טקסטים ותבניות מופיעים כחומר מוצרי רגיש, לא כאזור ניסוי.</p></HeroSurface><EditorialSection title="טקסט כניסה" kicker="תוכן ניתן לעריכה" tone="repertoire"><div className="space-y-3"><FormField label="כותרת כניסה" value={title} onChange={setTitle} /><V6Button onClick={() => { dispatch({ type: "update_text", actor, key: "loginTitle", value: title }); show("הטקסט נשמר"); }}>שמירה</V6Button></div></EditorialSection><EditorialSection title="תבנית AI" kicker="אישור אנושי" tone="admin"><label className="block text-right"><span className="text-[11px] font-black text-white/50">תבנית למנהל מערכת</span><textarea value={prompt} readOnly className="mt-2 min-h-32 w-full rounded-[24px] border border-transparent bg-black/20 p-3 text-right text-[15px] leading-relaxed text-white/68 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]" /></label><p className="mt-3 text-right text-xs text-white/48">תבניות AI מוצגות לצפייה בלבד בשלב זה. פרסום תוכן דורש אישור אנושי.</p><div className="mt-3"><V6Button variant="ghost" onClick={() => show("עריכת תבניות AI לא מופעלת ב־V6 הנוכחי")}>למה לא נשמר?</V6Button></div></EditorialSection></div>;
}

function FlagsScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  return <div className="space-y-4"><BackHeader title="דגלי יכולת" back={back} /><HeroSurface tone="admin" className="min-h-[205px] p-5"><V6StatusBadge tone="admin">בקרת מוצר</V6StatusBadge><h2 className="mt-4 max-w-[18rem] text-right text-[clamp(2rem,10vw,3rem)] font-semibold leading-[0.88] tracking-[-0.085em]">יכולות נפתחות בזהירות</h2><p className="mt-3 max-w-[20rem] text-right text-sm leading-relaxed text-white/60">דגלים רגישים נשארים זמינים לסופר אדמין, אבל לא נראים כמו קובץ קונפיגורציה.</p></HeroSurface><EditorialSection title="דגלים פעילים" kicker="כל שינוי נרשם" tone="admin"><div className="space-y-2.5">{Object.entries(db.featureFlags).map(([key, value]) => <div key={key} className="flex items-center justify-between gap-3 rounded-[26px] border border-[rgba(255,255,255,0.046)] bg-white/[0.035] p-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]"><button onClick={() => { dispatch({ type: "update_flags", actor, flags: { [key]: !value } }); show("הדגל עודכן"); }} className={v6Cx("shrink-0 rounded-full px-3 py-1.5 text-xs font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]", value ? "bg-emerald-200 text-zinc-950" : "bg-white/10 text-white/58")}>{value ? "פעיל" : "כבוי"}</button><span className="truncate text-sm font-black tracking-[-0.02em]">{key}</span></div>)}</div></EditorialSection></div>;
}

function BrandingScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  return <div className="space-y-4"><BackHeader title="מיתוג" back={back} /><HeroSurface tone="admin" className="min-h-[190px] p-5"><V6StatusBadge tone="admin">זהות סטודיו</V6StatusBadge><h2 className="mt-4 max-w-[18rem] text-right text-[clamp(2rem,10vw,2.8rem)] font-semibold leading-[0.9] tracking-[-0.08em]">זהות סטודיו נשמרת במסד</h2><p className="mt-3 max-w-[20rem] text-right text-sm leading-relaxed text-white/60">המיתוג נשאר חלק ממערכת אחת, לא שכבת צבע על מסכים.</p></HeroSurface><Surface tone="admin"><p className="text-right text-sm text-white/58">מיתוג הסטודיו נשמר במסד ויורחב בשלב הבא.</p><div className="mt-3"><V6Button onClick={() => show("מיתוג מוכן לעריכה")}>בדיקת מיתוג</V6Button></div></Surface></div>;
}

function AuditScreen({ back }: { back: () => void }) {
  const { db } = useV6();
  const summary = summarizeV6Audit(db.auditLog);
  return <div className="space-y-4"><BackHeader title="אודיט" back={back} /><HeroSurface tone="admin" className="min-h-[205px] p-5"><V6StatusBadge tone={summary.sensitive ? "urgent" : "admin"}>{summary.sensitive ? "פעולות רגישות" : "יומן רגוע"}</V6StatusBadge><h2 className="mt-4 max-w-[18rem] text-right text-[clamp(2rem,10vw,3rem)] font-semibold leading-[0.88] tracking-[-0.085em]">מי נגע במה, בלי רעש</h2><p className="mt-3 max-w-[20rem] text-right text-sm leading-relaxed text-white/60">האודיט מוצג כזיכרון מוצרי קריא, לא כרשימת לוגים גולמית.</p></HeroSurface><div className="grid grid-cols-2 gap-2"><MiniSummary icon={ClipboardList} tone="management" label="פעולות" title={`${summary.total}`} meta="נרשמו" /><MiniSummary icon={Shield} tone="urgent" label="רגישות" title={`${summary.sensitive}`} meta="דורשות מעקב" /></div><Widget title="יומן פעולות" kicker="בקרה מערכתית" icon={ClipboardList} tone="management"><div className="space-y-2">{db.auditLog.map((item) => <V6FeedRow key={item.id} icon={Shield} title={item.action} body={`${item.actorName} · ${item.target}`} meta={new Date(item.createdAt).toLocaleDateString("he-IL")} tone="management" />)}</div></Widget></div>;
}

function SystemScreen({ back }: { back: () => void }) {
  const { db, sync } = useV6();
  const issues = selectV6SystemIssues(db);
  const health = computeV6ManagementHealth(db);
  return <div className="space-y-4"><BackHeader title="בריאות מערכת" back={back} /><HeroSurface tone={issues.length ? "urgent" : "studio"} className="p-5"><V6StatusBadge tone={issues.length ? "urgent" : "success"}>{issues.length ? "דורש בדיקה" : "תקין"}</V6StatusBadge><h2 className="mt-4 text-right text-[clamp(2rem,10vw,3rem)] font-semibold leading-[0.92] tracking-[-0.08em]">{health.summary}</h2><p className="mt-4 text-right text-sm leading-relaxed text-white/64">פתיחה מיידית, מסד מקומי וסטטוס סנכרון מוצגים ללא פאנלים גולמיים.</p></HeroSurface><div className="grid gap-2 sm:grid-cols-3"><MiniSummary icon={Check} tone="studio" label="פתיחה" title="מיידית" meta={sync} /><MiniSummary icon={Database} tone="admin" label="גרסה" title={`V${db.version}`} meta="מסד מקומי" /><MiniSummary icon={HeartPulse} tone={issues.length ? "urgent" : "modern"} label="סטטוס" title={issues.length ? `${issues.length} לבדיקה` : "תקין"} meta={issues.length ? "מנוע אבחון" : "ללא חסימות"} /></div><Widget title="בדיקות מערכת" kicker="תפעול יומי" icon={HeartPulse} tone={issues.length ? "urgent" : "studio"}><div className="space-y-2">{issues.length ? issues.map((issue) => <V6FeedRow key={issue.id} icon={HeartPulse} title={issue.title} body={issue.body} meta={issue.severity === "critical" ? "קריטי" : "בדיקה"} tone={issue.severity === "critical" ? "urgent" : "management"} />) : <V6FeedRow icon={CheckCircle2} title="אין חסימות פעילות" body="המערכת מוכנה לפתיחה ושימוש יומי." meta="תקין" tone="studio" />}</div></Widget></div>;
}

export function LKStudentSpaceV6() {
  return <V6AppProvider><Shell /></V6AppProvider>;
}
