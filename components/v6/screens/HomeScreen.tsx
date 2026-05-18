"use client";

import { type ElementType } from "react";
import { Bell, CalendarDays, ClipboardList, Database, ImagePlus, MessageCircle, Receipt, Shield, ShoppingBag, Sparkles, Trophy } from "lucide-react";
import { useV6 } from "@/lib/v6/AppProvider";
import type { V6Role, V6Screen, V6Tab, V6User } from "@/lib/v6/types";
import { selectV6LessonsForActor } from "@/lib/domains/attendance/selectors";
import { selectV6UnreadCount, selectV6NotificationsForActor, selectV6MessagesForActor } from "@/lib/domains/messages/selectors";
import { selectV6UpcomingEvents } from "@/lib/domains/events/selectors";
import { modulesForRole } from "@/lib/v6/ui-composition";
import { ActionPill, AttachedPrimaryAction, MobileIntro, MobileList, MobileListRow, MobileScreen, MobileSection, type V6Tone } from "@/components/v6/design-system";

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

export function HomeScreen({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
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
  ].slice(0, 1);
  const primary = primaryHomeItem({ user, copy, next, nextEvent, unread, openScreen, openTab });

  return (
    <MobileScreen>
      <MobileIntro
        kicker={copy.cue}
        title={copy.title}
        subtitle={`שלום ${user.name.split(" ")[0]}${primaryGroup ? ` · ${primaryGroup.name}` : ""}`}
        icon={Sparkles}
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
          {homeModuleIds.has("updates") ? <MobileListRow icon={Bell} title={unread ? `${unread} עדכונים` : "הודעות"} subtitle={unread ? "לא נקראו" : "מהסטודיו"} tone="urgent" onClick={() => openTab("messages")} /> : null}
          {homeModuleIds.has("schedule") ? <MobileListRow icon={CalendarDays} title={nextEvent ? nextEvent.title : next ? next.title : "לוח שנה"} subtitle={nextEvent ? "בלוח" : next ? `${next.time} · ${next.weekday}` : "לוח שנה"} tone="management" onClick={nextEvent ? () => openScreen("calendar") : next ? () => openTab("lessons") : () => openScreen("calendar")} /> : null}
          {feed.map((item) => <MobileListRow key={item.id} icon={item.icon} title={item.title} subtitle={item.body} meta={item.meta} tone={item.tone} />)}
        </MobileList>
      </MobileSection> : null}

      {homeModuleIds.has("quick-actions") ? <MobileSection kicker="קיצורים" title="עכשיו" tone={tone}>
        <div className="grid grid-cols-2 gap-1.5">{actions.map((action) => <ActionPill key={action.title} {...action} />)}</div>
      </MobileSection> : null}
    </MobileScreen>
  );
}
