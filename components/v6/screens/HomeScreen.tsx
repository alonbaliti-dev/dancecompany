"use client";

import { useMemo, type ElementType } from "react";
import { Bell, CalendarDays, Check, ClipboardList, ImagePlus, MessageCircle, Receipt, Shield, Sparkles } from "lucide-react";
import { useV6 } from "@/lib/v6/AppProvider";
import { roleLabel } from "@/lib/v6/seed";
import type { V6Role, V6Screen, V6Tab, V6User } from "@/lib/v6/types";
import { selectV6LessonsForActor, selectV6AttendanceForActor, selectV6AttendanceRate } from "@/lib/domains/attendance/selectors";
import { selectV6UnreadCount, selectV6NotificationsForActor, selectV6MessagesForActor } from "@/lib/domains/messages/selectors";
import { selectV6PrivateLessonsForActor } from "@/lib/domains/private-lessons/selectors";
import { selectV6AIInsightsForActor } from "@/lib/domains/ai/selectors";
import { computeV6AttendanceRisks, computeV6EventReadiness, computeV6ManagementHealth, computeV6PrivateLessonCoordination } from "@/lib/engines/v6";
import { ActionPill, AISuggestionStack, Button, FeedRow, HeroSurface, StatusBadge, Widget, v6Cx, v6Tone, type V6Tone } from "@/components/v6/design-system";

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
  if (user.role === "teacher") return { title: "מרכז שיעור מהיר", subtitle: "נוכחות, הודעות, מדיה ומשימות בלי עומס בזמן אמת." };
  if (user.role === "management") return { title: "מרכז שליטה", subtitle: "מה דורש טיפול עכשיו, ומה יכול להישאר רגוע." };
  if (user.role === "super_admin") return { title: "חדר מערכת", subtitle: "בריאות פלטפורמה, אודיט, AI וכלים מתקדמים במקום אחד." };
  if (user.role === "parent") return { title: "תמונת מצב רגועה", subtitle: "השיעור הבא, הודעות חשובות, מדיה ותשלומים רלוונטיים." };
  return { title: "היום שלך בסטודיו", subtitle: "שיעור הבא, משימות, מדיה והתקדמות בצורה קצרה וברורה." };
}

function Metric({ icon: Icon, tone, value, label, trend }: { icon: ElementType; tone: V6Tone; value: string; label: string; trend: string }) {
  return (
    <div className="min-w-0 rounded-[23px] bg-white/[0.058] px-3 py-3 text-right shadow-[0_12px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-2">
        <span className={v6Cx("grid h-8 w-8 shrink-0 place-items-center rounded-full", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={15} /></span>
        <span className="truncate text-[1.05rem] font-black tracking-[-0.04em] text-white">{value}</span>
      </div>
      <p className="mt-2 truncate text-[11px] font-bold text-white/58">{label}</p>
      <p className="mt-0.5 truncate text-[10px] text-white/36">{trend}</p>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  return <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-[11px] font-black text-white" style={{ background: `conic-gradient(rgba(167,243,208,.95) ${value * 3.6}deg, rgba(255,255,255,.10) 0)` }}><span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-950">{value}%</span></div>;
}

export function HomeScreen({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const { db } = useV6();
  const lessons = selectV6LessonsForActor(db, user);
  const next = lessons[0];
  const attendance = selectV6AttendanceForActor(db, user);
  const attendanceRate = selectV6AttendanceRate(db, user) || (user.role === "student" ? 78 : 92);
  const unread = selectV6UnreadCount(db, user);
  const notifications = selectV6NotificationsForActor(db, user);
  const messages = selectV6MessagesForActor(db, user);
  const privateLessons = selectV6PrivateLessonsForActor(db, user);
  const aiInsights = useMemo(() => selectV6AIInsightsForActor(db, user).slice(0, 3), [db, user]);
  const managementHealth = computeV6ManagementHealth(db);
  const coordination = computeV6PrivateLessonCoordination(db);
  const attendanceRisks = computeV6AttendanceRisks(db);
  const eventReadiness = computeV6EventReadiness(db)[0];
  const copy = roleHomeCopy(user);
  const tone = roleTone(user.role);
  const primaryGroup = db.groups.find((group) => user.groupIds.includes(group.id));
  const tasks = db.tasks.filter((task) => user.role === "management" || user.role === "super_admin" || user.groupIds.includes(task.groupId));
  const actions: HomeAction[] = [
    user.permissions.manageMedia || user.role === "super_admin" || user.role === "teacher" ? { icon: ImagePlus, title: "מדיה", subtitle: "העלאה", tone: "modern", onClick: () => openScreen("media") } : null,
    { icon: MessageCircle, title: "הודעות", subtitle: "קבוצה", tone: "studio", onClick: () => openTab("messages") },
    { icon: Receipt, title: "פרטי", subtitle: "שיעור", tone: "shop", onClick: () => openScreen("private_lessons") },
    user.permissions.manageUsers || user.role === "super_admin" ? { icon: Shield, title: "משתמשים", subtitle: "ניהול", tone: "management", onClick: () => openScreen("users") } : null
  ].filter(Boolean) as HomeAction[];
  const feed = [
    ...notifications.slice(0, 2).map((item) => ({ id: item.id, icon: Bell, title: item.title, body: item.body, meta: item.readBy.includes(user.id) ? "נקרא" : "חדש", tone: item.readBy.includes(user.id) ? "studio" as V6Tone : "urgent" as V6Tone })),
    ...messages.slice(0, 1).map((item) => ({ id: item.id, icon: MessageCircle, title: item.title, body: item.body, meta: "סטודיו", tone: "modern" as V6Tone })),
    ...tasks.slice(0, 1).map((item) => ({ id: item.id, icon: ClipboardList, title: item.title, body: "משימה פתוחה לפי קבוצה והרשאות", meta: "משימה", tone: "repertoire" as V6Tone }))
  ].slice(0, 4);
  const operational = user.role === "management" || user.role === "super_admin" || user.role === "teacher";

  return (
    <div className="space-y-4">
      <HeroSurface tone={tone}>
        <div className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full bg-white/12 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <ProgressRing value={attendanceRate} />
          <div className="min-w-0 text-right">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <StatusBadge tone={tone}>{roleLabel[user.role]}</StatusBadge>
              {primaryGroup ? <span className="rounded-full bg-black/16 px-2.5 py-1 text-[11px] font-bold text-white/58">{primaryGroup.name}</span> : null}
            </div>
            <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/45">LK Student Space</p>
            <h1 className="mt-1 max-w-[15rem] text-[2.1rem] font-semibold leading-[0.98] tracking-[-0.07em] text-white">היי {user.name.split(" ")[0]}</h1>
            <p className="mt-3 max-w-[18rem] text-[13px] leading-relaxed text-white/64">{copy.subtitle}</p>
          </div>
        </div>
        <div className="relative mt-5 rounded-[24px] bg-black/18 p-2.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <div className="flex items-center justify-between gap-2 px-1 pb-2">
            <span className="text-[12px] font-bold text-white/58">{copy.title}</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black text-emerald-100">Live</span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button onClick={() => next ? openTab("lessons") : openScreen("private_lessons")}>{next ? `${next.title} · ${next.time}` : "קביעת שיעור פרטי"}</Button>
            <Button variant="ghost" onClick={() => openTab("messages")}>הודעות</Button>
          </div>
        </div>
      </HeroSurface>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Metric icon={Check} tone={tone} value={attendance.length ? `${attendanceRate}%` : "חדש"} label="נוכחות" trend={attendance.length ? "מעקב פעיל" : "טרם סומן"} />
        <Metric icon={Bell} tone={unread ? "urgent" : "modern"} value={unread ? `${unread}` : "0"} label="עדכונים" trend={unread ? "דורש קריאה" : "רגוע"} />
        <Metric icon={CalendarDays} tone={tone} value={next ? next.time : "—"} label="שיעור הבא" trend={next ? next.weekday : "אין היום"} />
        <Metric icon={Receipt} tone="shop" value={`${privateLessons.length}`} label="פרטיים" trend={coordination.needsAttention ? "בטיפול" : "זמינות"} />
        <Metric icon={ClipboardList} tone="repertoire" value={`${tasks.length}`} label="משימות" trend={tasks.length ? "פתוחות" : "נקי"} />
      </div>

      <section className="overflow-hidden rounded-[29px] bg-[linear-gradient(135deg,rgba(255,255,255,0.072),rgba(255,255,255,0.032))] px-3 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.075)] backdrop-blur-2xl">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">{actions.map((action) => <ActionPill key={action.title} {...action} />)}</div>
      </section>

      {operational ? (
        <Widget title={user.role === "super_admin" ? "בריאות מערכת" : "דברים לטיפול"} kicker="פיקוד יומי" icon={Sparkles} tone={user.role === "super_admin" ? "admin" : "management"}>
          <div className="grid grid-cols-2 gap-2">
            <Metric icon={Bell} tone={managementHealth.urgentCount ? "urgent" : "studio"} value={`${managementHealth.urgentCount}`} label="דחופים" trend={managementHealth.summary} />
            <Metric icon={ClipboardList} tone="management" value={`${attendanceRisks.length}`} label="נוכחות" trend="סיכונים פעילים" />
            <Metric icon={Receipt} tone="shop" value={`${coordination.needsAttention}`} label="פרטיים" trend="דורש תיאום" />
            <Metric icon={Sparkles} tone="repertoire" value={eventReadiness ? `${eventReadiness.score}%` : "—"} label="אירוע" trend={eventReadiness?.nextAction ?? "אין אירוע"} />
          </div>
        </Widget>
      ) : null}

      <section className="grid gap-3 md:grid-cols-[1.04fr_0.96fr]">
        <Widget title="מה קורה עכשיו" kicker="פעילות ועדכונים" icon={Bell} tone={unread ? "urgent" : "modern"}>
          <div className="space-y-2">{feed.map((item) => <FeedRow key={item.id} {...item} />)}</div>
        </Widget>
        <Widget title="הקרוב ביותר" kicker="היום והשבוע" icon={CalendarDays} tone={tone}>
          <div className="space-y-2">
            <FeedRow icon={CalendarDays} title={next?.title ?? "אין שיעור קרוב"} body={next ? `${next.weekday} · ${next.time} · ${next.room}` : "אפשר לפתוח שיעור פרטי או הודעות"} meta="שיעור" tone={tone} />
            <FeedRow icon={Sparkles} title={eventReadiness?.title ?? "אירועי סטודיו"} body={eventReadiness?.nextAction ?? "אין אירוע קרוב"} meta="אירוע" tone="repertoire" />
          </div>
        </Widget>
      </section>

      <AISuggestionStack insights={aiInsights} />
    </div>
  );
}
