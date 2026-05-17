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
import { ActionPill, AISuggestionStack, BidiNumber, Button, EditorialSection, FeedRow, HeroSurface, RtlText, StatusBadge, Widget, v6Cx, v6Tone, type V6Tone } from "@/components/v6/design-system";

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
  if (user.role === "teacher") return { title: "החזרה מתחילה בשקט", subtitle: "השיעור הבא, הנוכחות והקבוצה כבר מסודרים סביב פעולה אחת.", cue: "סימן למורה", action: "פתיחת שיעור" };
  if (user.role === "management") return { title: "מה דורש החלטה עכשיו", subtitle: "רק הסיכונים והבקשות שצריכים יד הנהלה עולים קדימה.", cue: "פיקוד סטודיו", action: "סקירת מצב" };
  if (user.role === "super_admin") return { title: "בריאות המוצר לפני הכול", subtitle: "אודיט, מסד והרשאות מוצגים כמו קוקפיט מוצרי רגוע.", cue: "קוקפיט מערכת", action: "פתיחת בריאות" };
  if (user.role === "parent") return { title: "הילד נראה, היום רגוע", subtitle: "השיעור הבא, הודעות חשובות ותשלום קרוב בלי עומס.", cue: "שקט להורה", action: "מה קורה היום" };
  return { title: "רגע לפני שנכנסים לסטודיו", subtitle: "השיעור הבא, ההתקדמות והעדכון החשוב מתכנסים לנקודת התחלה אחת.", cue: "מאחורי הקלעים", action: "התחלת היום" };
}

function Metric({ icon: Icon, tone, value, label, trend }: { icon: ElementType; tone: V6Tone; value: string; label: string; trend: string }) {
  return (
    <div dir="rtl" className="min-w-0 rounded-[24px] border border-[rgba(255,255,255,0.040)] bg-white/[0.032] px-3 py-3 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.040)]">
      <div className="flex items-center gap-2">
        <span className={v6Cx("grid h-8 w-8 shrink-0 place-items-center rounded-[14px]", v6Tone[tone].soft, v6Tone[tone].text)}><Icon size={14} /></span>
        <span className="min-w-0 flex-1 truncate text-[1.08rem] font-semibold tracking-[-0.04em] text-white/90"><BidiNumber>{value}</BidiNumber></span>
      </div>
      <RtlText as="p" className="mt-2 truncate text-[11px] font-semibold text-white/56">{label}</RtlText>
      <RtlText as="p" className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-white/40">{trend}</RtlText>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  return <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white/88" style={{ background: `conic-gradient(rgba(236,253,245,.88) ${value * 3.6}deg, rgba(255,255,255,.10) 0)` }}><span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-950/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]"><BidiNumber>{value}%</BidiNumber></span></div>;
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
  const primaryAction = user.role === "super_admin" ? () => openScreen("system") : user.role === "management" ? () => openScreen("users") : next ? () => openTab("lessons") : () => openScreen("private_lessons");

  return (
    <div className="space-y-4">
      <HeroSurface tone={tone} className="min-h-[342px] px-5 py-5">
        <div className="pointer-events-none absolute left-6 bottom-9 h-20 w-20 rounded-[30px] border border-white/[0.045] bg-black/12" />
        <div className="relative flex items-start gap-4">
          <div className="min-w-0 flex-1 text-start">
            <div className="flex flex-wrap items-center justify-start gap-2">
              <StatusBadge tone={tone}>{roleLabel[user.role]}</StatusBadge>
              {primaryGroup ? <RtlText as="span" className="text-[11px] font-medium text-white/48">{primaryGroup.name}</RtlText> : null}
            </div>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/38">{copy.cue}</p>
            <h1 className="mt-1 max-w-[19rem] text-[clamp(2.48rem,12vw,3.62rem)] font-semibold leading-[0.84] tracking-[-0.095em] text-white">{copy.title}</h1>
            <RtlText as="p" className="mt-4 max-w-[19rem] text-[13px] leading-relaxed text-white/68">שלום, {user.name.split(" ")[0]} · {copy.subtitle}</RtlText>
          </div>
          <ProgressRing value={attendanceRate} />
        </div>
        <div className="relative mt-8 rounded-[28px] border border-[rgba(255,255,255,0.044)] bg-black/22 p-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
          <div className="flex items-center gap-2 px-1 pb-2.5 text-start">
            <span className="min-w-0 flex-1 text-[12px] font-semibold text-white/58">{copy.action}</span>
            <RtlText as="span" className="shrink-0 text-[10px] font-semibold text-white/42">{next ? next.weekday : "היום"}</RtlText>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] [&>button]:w-full">
            <Button onClick={primaryAction}>{next ? `${next.title} · ${next.time}` : user.role === "super_admin" ? "בריאות מערכת" : "קביעת שיעור פרטי"}</Button>
            <Button variant="ghost" onClick={() => openTab("messages")}>{unread ? <><BidiNumber>{unread}</BidiNumber> עדכונים</> : "הודעות"}</Button>
          </div>
        </div>
      </HeroSurface>

      <section className="overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.034)] bg-white/[0.024] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.034)]">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">{actions.map((action) => <ActionPill key={action.title} {...action} />)}</div>
      </section>

      {operational ? (
        <Widget title={user.role === "super_admin" ? "בריאות מערכת" : "דברים לטיפול"} kicker="פיקוד יומי" icon={Sparkles} tone={user.role === "super_admin" ? "admin" : "management"}>
          <div className="grid grid-cols-2 gap-2">
            <Metric icon={Bell} tone={managementHealth.urgentCount ? "urgent" : "studio"} value={`${managementHealth.urgentCount}`} label="דחופים" trend={managementHealth.summary} />
            <Metric icon={ClipboardList} tone="management" value={`${attendanceRisks.length}`} label="נוכחות" trend="סיכונים פעילים" />
            <Metric icon={Receipt} tone="shop" value={`${coordination.needsAttention}`} label="פרטיים" trend="דורשים תיאום" />
            <Metric icon={Sparkles} tone="repertoire" value={eventReadiness ? `${eventReadiness.score}%` : "—"} label="אירוע" trend={eventReadiness?.nextAction ?? "אין אירוע"} />
          </div>
        </Widget>
      ) : null}

      <section className="grid gap-3 md:grid-cols-[1fr_1fr]">
        <Widget title="מה קורה עכשיו" kicker="פעילות ועדכונים" icon={Bell} tone={unread ? "urgent" : "modern"}>
          <div className="space-y-2">
            {feed.length ? feed.map((item) => <FeedRow key={item.id} {...item} />) : <FeedRow icon={Check} title="הכול שקט" body="אין עדכונים שמבקשים תשומת לב כרגע." meta="רגוע" tone={tone} />}
          </div>
        </Widget>
      </section>

      {aiInsights.length ? <AISuggestionStack insights={aiInsights} /> : null}
    </div>
  );
}
