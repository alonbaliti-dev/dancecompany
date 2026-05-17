"use client";

import { type ElementType } from "react";
import { Bell, CalendarDays, Check, ClipboardList, ImagePlus, MessageCircle, Receipt, Shield, Sparkles, Trophy } from "lucide-react";
import { useV6 } from "@/lib/v6/AppProvider";
import { roleLabel } from "@/lib/v6/seed";
import type { V6Role, V6Screen, V6Tab, V6User } from "@/lib/v6/types";
import { selectV6LessonsForActor, selectV6AttendanceForActor, selectV6AttendanceRate } from "@/lib/domains/attendance/selectors";
import { selectV6UnreadCount, selectV6NotificationsForActor, selectV6MessagesForActor } from "@/lib/domains/messages/selectors";
import { selectV6PrivateLessonsForActor } from "@/lib/domains/private-lessons/selectors";
import { selectV6UpcomingEvents } from "@/lib/domains/events/selectors";
import { computeV6AttendanceRisks, computeV6EventReadiness, computeV6ManagementHealth, computeV6PrivateLessonCoordination } from "@/lib/engines/v6";
import { ActionPill, BidiNumber, Button, FeedRow, HeroSurface, InlineMetric, OpenCluster, RtlText, SafeMeta, SafeTitle, StatusBadge, Widget, v6Cx, v6Tone, v6Type, type V6Tone } from "@/components/v6/design-system";

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
  if (user.role === "teacher") return { title: "היום בסטודיו", subtitle: "השיעור הבא, נוכחות ועדכוני הקבוצה במקום אחד.", cue: "לוח מורה", action: "פתיחת שיעור" };
  if (user.role === "management") return { title: "מה צריך טיפול היום", subtitle: "עדכונים, נוכחות ותיאומים שמבקשים החלטה.", cue: "ניהול יומי", action: "סקירת מצב" };
  if (user.role === "super_admin") return { title: "מצב האפליקציה", subtitle: "נתונים, הרשאות וכלים חשובים במקום ברור.", cue: "ניהול האפליקציה", action: "פתיחת מצב" };
  if (user.role === "parent") return { title: "מה קורה היום", subtitle: "השיעור הבא, הודעות חשובות ותיאומים קרובים.", cue: "עדכון להורה", action: "פתיחת היום" };
  return { title: "היום שלך בסטודיו", subtitle: "השיעור הבא, עדכונים והתקדמות אישית במקום אחד.", cue: "לוח תלמידה", action: "התחלת היום" };
}

function SignalLine({ icon: Icon, tone, value, label, trend }: { icon: ElementType; tone: V6Tone; value: string; label: string; trend: string }) {
  return (
    <div dir="rtl" className="lk-safe-row flex items-start gap-3 border-b border-[#f4d58d]/[0.045] py-3 last:border-b-0">
      <span className={v6Cx("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={13} strokeWidth={1.9} /></span>
      <div className="min-w-0 flex-1 text-start">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="shrink-0 text-[1.18rem] font-semibold leading-tight tracking-[-0.050em] text-white/88"><BidiNumber>{value}</BidiNumber></span>
          <SafeMeta as="p" className="min-w-0 flex-1 text-[12px] font-semibold text-white/58">{label}</SafeMeta>
        </div>
        <SafeMeta as="p" className="mt-1 text-[11px] text-white/38">{trend}</SafeMeta>
      </div>
    </div>
  );
}

export function HomeScreen({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const { db } = useV6();
  const lessons = selectV6LessonsForActor(db, user);
  const next = lessons[0];
  const attendance = selectV6AttendanceForActor(db, user);
  const countedAttendance = attendance.filter((item) => item.status !== "excused");
  const hasAttendance = countedAttendance.length > 0;
  const attendanceRate = selectV6AttendanceRate(db, user);
  const unread = selectV6UnreadCount(db, user);
  const notifications = selectV6NotificationsForActor(db, user);
  const messages = selectV6MessagesForActor(db, user);
  const privateLessons = selectV6PrivateLessonsForActor(db, user);
  const events = selectV6UpcomingEvents(db, user);
  const nextEvent = events[0];
  const managementHealth = computeV6ManagementHealth(db);
  const coordination = computeV6PrivateLessonCoordination(db);
  const attendanceRisks = computeV6AttendanceRisks(db);
  const eventReadiness = computeV6EventReadiness(db)[0];
  const copy = roleHomeCopy(user);
  const tone = roleTone(user.role);
  const primaryGroup = db.groups.find((group) => user.groupIds.includes(group.id));
  const tasks = db.tasks.filter((task) => user.role === "management" || user.role === "super_admin" || user.groupIds.includes(task.groupId));
  const actions: HomeAction[] = [
    { icon: CalendarDays, title: "לוח שנה", subtitle: nextEvent ? `${nextEvent.title} · ${nextEvent.date}` : "אירועים וחזרות", tone: "management", onClick: () => openScreen("calendar") },
    { icon: MessageCircle, title: "הודעות", subtitle: unread ? `${unread} שלא נקראו` : "עדכוני קבוצה", tone: "studio", onClick: () => openTab("messages") },
    { icon: Receipt, title: "שיעורים פרטיים", subtitle: "בקשות ותיאומים", tone: "shop", onClick: () => openScreen("private_lessons") },
    user.permissions.manageMedia || user.role === "super_admin" || user.role === "teacher" ? { icon: ImagePlus, title: "גלריה", subtitle: "תמונות וסרטונים", tone: "modern", onClick: () => openScreen("media") } : null,
    { icon: Trophy, title: "זיכרונות", subtitle: "הישגים ורגעים יפים", tone: "repertoire", onClick: () => openScreen("legacy") },
    user.permissions.manageUsers || user.role === "super_admin" ? { icon: Shield, title: "משתמשים", subtitle: "ניהול והרשאות", tone: "management", onClick: () => openScreen("users") } : null
  ].filter(Boolean) as HomeAction[];
  const feed = [
    ...notifications.slice(0, 2).map((item) => ({ id: item.id, icon: Bell, title: item.title, body: item.body, meta: item.readBy.includes(user.id) ? "נקרא" : "חדש", tone: item.readBy.includes(user.id) ? "studio" as V6Tone : "urgent" as V6Tone })),
    ...messages.slice(0, 1).map((item) => ({ id: item.id, icon: MessageCircle, title: item.title, body: item.body, meta: "סטודיו", tone: "modern" as V6Tone })),
    ...tasks.slice(0, 1).map((item) => ({ id: item.id, icon: ClipboardList, title: item.title, body: "משימה פתוחה לקבוצה שלך.", meta: "משימה", tone: "repertoire" as V6Tone })),
    ...events.slice(0, 1).map((item) => ({ id: item.id, icon: CalendarDays, title: item.title, body: item.parentInstructions ?? item.adultInstructions ?? "אירוע קרוב בלוח הסטודיו.", meta: item.date, tone: item.status === "needs_attention" ? "urgent" as V6Tone : "management" as V6Tone }))
  ].slice(0, 4);
  const operational = user.role === "management" || user.role === "super_admin" || user.role === "teacher";
  const primaryAction = user.role === "super_admin" ? () => openScreen("system") : user.role === "management" ? () => openScreen("calendar") : next ? () => openTab("lessons") : nextEvent ? () => openScreen("calendar") : () => openScreen("private_lessons");

  return (
    <div className="space-y-4">
      <HeroSurface tone={tone} className="px-5 py-6">
        <div className="relative">
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1 text-start">
              <div className="lk-safe-badge-group">
                <StatusBadge tone={tone}>{roleLabel[user.role]}</StatusBadge>
                {primaryGroup ? <RtlText as="span" className={v6Type.metadata}>{primaryGroup.name}</RtlText> : null}
              </div>
              <p className={v6Cx("mt-6", v6Type.kicker)}>{copy.cue}</p>
              <SafeTitle as="h1" className="mt-2 max-w-[19rem] text-[clamp(2.0rem,8.8vw,2.8rem)] font-semibold leading-[1.04] tracking-[-0.058em] text-white">{copy.title}</SafeTitle>
            </div>
            <div className="lk-safe-surface w-full max-w-full rounded-[24px] border border-white/[0.045] bg-black/[0.14] px-3 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,247,223,0.045)] sm:w-auto sm:min-w-[6.5rem] sm:shrink">
              <p className="lk-safe-meta text-[10px] font-semibold text-white/42">נוכחות</p>
              <p className="mt-1 break-words text-[17px] font-semibold leading-tight text-white/88">{hasAttendance ? <><BidiNumber>{attendanceRate}</BidiNumber>%</> : "—"}</p>
            </div>
          </div>

          <div className="mt-6 max-w-[22rem] text-start">
            <RtlText as="p" className={v6Cx(v6Type.statement)}>שלום {user.name.split(" ")[0]}</RtlText>
            <SafeMeta as="p" className="mt-2 text-[15px] leading-relaxed text-white/64">{copy.subtitle}</SafeMeta>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button onClick={primaryAction}>{next ? `${next.title} · ${next.time}` : nextEvent ? nextEvent.title : user.role === "super_admin" ? "מצב האפליקציה" : "קביעת שיעור פרטי"}</Button>
              <Button variant="ghost" onClick={() => openTab("messages")}>{unread ? <><BidiNumber>{unread}</BidiNumber> עדכונים</> : "הודעות"}</Button>
            </div>
          </div>
        </div>

        <div className="relative mt-5 rounded-[30px] bg-black/[0.10] p-2 shadow-[inset_0_1px_0_rgba(255,247,223,0.024)]">
          <div className="grid gap-2 sm:grid-cols-2">{actions.map((action) => <ActionPill key={action.title} {...action} />)}</div>
        </div>
      </HeroSurface>

      {operational ? (
        <OpenCluster tone={user.role === "super_admin" ? "admin" : "management"} className="px-5 py-4">
          <div className="mb-2 flex flex-wrap items-end gap-3 px-1">
            <div className="min-w-0 flex-1 text-start">
              <p className={v6Type.kicker}>מה חשוב היום</p>
              <SafeTitle as="h2" className="mt-1 text-[18px] font-semibold tracking-[-0.040em] text-white/86">{user.role === "super_admin" ? "מצב האפליקציה" : "דברים לטיפול"}</SafeTitle>
            </div>
            <Sparkles className="text-[#f4d58d]/55" size={17} strokeWidth={1.8} />
          </div>
          <div className="divide-y divide-[#f4d58d]/[0.045]">
            <SignalLine icon={Bell} tone={managementHealth.urgentCount ? "urgent" : "studio"} value={`${managementHealth.urgentCount}`} label="דחופים" trend={managementHealth.summary} />
            <SignalLine icon={ClipboardList} tone="management" value={`${attendanceRisks.length}`} label="נוכחות" trend="צריך לשים לב" />
            <SignalLine icon={Receipt} tone="shop" value={`${coordination.needsAttention}`} label="פרטיים" trend="דורשים תיאום" />
            <SignalLine icon={Sparkles} tone="repertoire" value={eventReadiness ? `${eventReadiness.score}%` : "—"} label="אירוע" trend={eventReadiness?.nextAction ?? "אין אירוע"} />
          </div>
        </OpenCluster>
      ) : null}

      <section>
        <Widget title="מה קורה עכשיו" kicker="פעילות ועדכונים" icon={Bell} tone={unread ? "urgent" : "modern"}>
          <div className="mb-4 grid grid-cols-2 gap-2 px-1 sm:grid-cols-4">
            <InlineMetric tone={tone} label="נוכחות" value={hasAttendance ? <><BidiNumber>{attendanceRate}</BidiNumber>%</> : "—"} meta={hasAttendance ? "נתון קיים" : "טרם נמדד"} />
            <InlineMetric tone={unread ? "urgent" : "modern"} label="עדכונים" value={<BidiNumber>{unread}</BidiNumber>} meta={unread ? "לקריאה" : "אין חדש"} />
            <InlineMetric tone="shop" label="פרטיים" value={<BidiNumber>{privateLessons.length}</BidiNumber>} meta="תיאומים" />
            <InlineMetric tone="repertoire" label="אירועים" value={<BidiNumber>{events.length}</BidiNumber>} meta="קרובים" />
          </div>
          <div className="space-y-2">
            {feed.length ? feed.map((item) => <FeedRow key={item.id} {...item} />) : <FeedRow icon={Check} title="הכול שקט" body="אין עדכונים שמבקשים תשומת לב כרגע." meta="רגוע" tone={tone} />}
          </div>
        </Widget>
      </section>
    </div>
  );
}
