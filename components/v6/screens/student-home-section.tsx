"use client";

import type { ElementType, ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  Clock,
  ImagePlus,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users
} from "lucide-react";
import {
  BidiNumber,
  HeroSurface,
  MobileList,
  MobileListRow,
  MobileScreen,
  MobileSection,
  SafeMeta,
  SafeTitle,
  StatusBadge,
  v6Cx,
  v6Motion,
  v6StudentSurface,
  v6Tone,
  type V6Tone
} from "@/components/v6/design-system";
import { RecentActivitySection, useV6ActivityNavigationHandlers } from "@/components/v6/activity-center/activity-center-section";
import { V6_ACTIVITY_COPY } from "@/lib/v6/activity-center/copy";
import { selectV6ProductPriceLabel as productPrice, type V6StudentHomeViewModel } from "@/lib/v6/view-models";
import type { V6CalendarEvent, V6Group, V6Lesson, V6Screen, V6Tab, V6User } from "@/lib/v6/types";

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function studentGreetingLine(name: string) {
  const hour = new Date().getHours();
  const first = firstName(name);
  if (hour < 12) return `בוקר טוב, ${first}`;
  if (hour < 17) return `צהריים נעימים, ${first}`;
  if (hour < 21) return `ערב טוב, ${first}`;
  return `לילה טוב, ${first}`;
}

function formatEventMeta(event: V6CalendarEvent) {
  return [event.date, event.startTime].filter(Boolean).join(" · ");
}

function StudentEmptyPanel({
  icon: Icon,
  title,
  description
}: {
  icon: ElementType;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <div className={v6Cx(v6StudentSurface.empty, "rounded-[20px] p-4 text-start")} role="status">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.040] text-white/50" aria-hidden="true">
        <Icon size={17} strokeWidth={1.9} />
      </span>
      <SafeTitle as="p" className="mt-3 text-sm font-semibold tracking-[-0.016em] text-white/84">{title}</SafeTitle>
      <SafeMeta as="p" className="mt-1.5 text-xs leading-relaxed text-white/48">{description}</SafeMeta>
    </div>
  );
}

function StudentGreetingHero({
  user,
  primaryGroup,
  unread,
  todayWeekday,
  openTab
}: {
  user: V6User;
  primaryGroup?: V6Group;
  unread: number;
  todayWeekday: string;
  openTab: (tab: V6Tab) => void;
}) {
  return (
    <section dir="rtl" className={v6Cx(v6StudentSurface.greeting, "relative overflow-hidden rounded-[28px] p-4 sm:p-5", v6Motion.gentle)}>
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-[#f4d58d]/22 to-transparent" />
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <SafeMeta as="p" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">הסטודיו שלך</SafeMeta>
          <SafeTitle as="h1" className="mt-2 text-balance text-[clamp(1.35rem,5.8vw,1.85rem)] font-semibold leading-[1.12] tracking-[-0.042em] text-white">
            {studentGreetingLine(user.name)}
          </SafeTitle>
          <SafeMeta as="p" className="mt-2 text-sm leading-relaxed text-white/52">
            {primaryGroup
              ? `${primaryGroup.name} · ${primaryGroup.location ?? primaryGroup.schedule ?? "מרחב התלמידה"}`
              : "כאן תמצאי את השיעור הבא, היום שלך והעדכונים מהסטודיו."}
          </SafeMeta>
        </div>
        {unread ? (
          <button
            type="button"
            onClick={() => openTab("messages")}
            className={v6Cx(
              "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold",
              v6Motion.standard,
              v6Motion.pressSoft,
              v6Motion.focusRing,
              "touch-manipulation bg-[#f4d58d]/[0.14] text-[#f4d58d]"
            )}
            aria-label={V6_ACTIVITY_COPY.unreadHeroLabel(unread)}
          >
            <Bell size={14} strokeWidth={1.9} aria-hidden="true" />
            <BidiNumber>{unread}</BidiNumber>
          </button>
        ) : (
          <span className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-white/[0.040] px-3 text-[11px] font-medium text-white/44">
            יום {todayWeekday}
          </span>
        )}
      </div>
    </section>
  );
}

function StudentNextClassHero({
  next,
  group,
  teachers,
  nextEvent,
  openTab,
  openScreen
}: {
  next?: V6Lesson;
  group?: V6Group;
  teachers: string;
  nextEvent?: V6CalendarEvent;
  openTab: (tab: V6Tab) => void;
  openScreen: (screen: V6Screen) => void;
}) {
  if (!next) {
    return (
      <HeroSurface tone="classic" className="p-4 sm:p-5">
        <StatusBadge tone="studio">השיעור הבא</StatusBadge>
        <SafeTitle as="h2" className="mt-3 text-[clamp(1.28rem,5.2vw,1.72rem)] font-semibold leading-tight tracking-[-0.038em] text-white">
          {nextEvent ? nextEvent.title : "הלו״ז שלך יתעדכן כאן"}
        </SafeTitle>
        <SafeMeta as="p" className="mt-2 max-w-md text-[13px] leading-relaxed text-white/52">
          {nextEvent
            ? formatEventMeta(nextEvent)
            : "כשיש שיעור או אירוע משויך לקבוצה שלך, הוא יופיע כאן בראש המסך."}
        </SafeMeta>
        {nextEvent ? (
          <button
            type="button"
            onClick={() => openScreen("calendar")}
            className={v6Cx(
              "mt-4 min-h-10 rounded-full bg-[#f4d58d] px-4 text-[12px] font-semibold text-zinc-950",
              v6Motion.standard,
              v6Motion.press,
              v6Motion.focusRing,
              "touch-manipulation"
            )}
          >
            ללוח הסטודיו
          </button>
        ) : null}
      </HeroSurface>
    );
  }

  return (
    <button
      dir="rtl"
      type="button"
      onClick={() => openTab("lessons")}
      aria-label={`פתיחת השיעור הבא: ${next.title}, ${next.time}, ${next.room}`}
      className={v6Cx("group w-full text-start", v6Motion.standard, v6Motion.focusRing, "touch-manipulation rounded-[28px]")}
    >
      <HeroSurface tone="classic" className="p-4 transition-[transform,box-shadow] duration-200 motion-safe:group-hover:-translate-y-0.5 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SafeMeta as="p" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">השיעור הבא שלך</SafeMeta>
            <SafeTitle as="h2" className="mt-2 text-[clamp(1.4rem,5.8vw,2rem)] font-semibold leading-tight tracking-[-0.048em] text-white">
              {group?.name ?? next.title}
            </SafeTitle>
            <SafeMeta as="p" className="mt-1.5 text-[13px] leading-relaxed text-white/56">
              {next.title}
              {teachers ? ` · ${teachers}` : ""}
            </SafeMeta>
          </div>
          <StatusBadge tone="repertoire">{next.weekday}</StatusBadge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={v6Cx("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-white/72", v6StudentSurface.scheduleRow)}>
            <Clock size={12} strokeWidth={1.9} aria-hidden="true" />
            {next.time}
          </span>
          <span className={v6Cx("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-white/72", v6StudentSurface.scheduleRow)}>
            <MapPin size={12} strokeWidth={1.9} aria-hidden="true" />
            {next.room}
          </span>
          <span className={v6Cx("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-white/72", v6StudentSurface.scheduleRow)}>
            <Sparkles size={12} strokeWidth={1.9} aria-hidden="true" />
            {group?.danceStyle ?? group?.style ?? "מחול"}
          </span>
        </div>
      </HeroSurface>
    </button>
  );
}

function StudentTodaySchedule({
  todayWeekday,
  todaySchedule,
  openTab
}: {
  todayWeekday: string;
  todaySchedule: V6StudentHomeViewModel["todaySchedule"];
  openTab: (tab: V6Tab) => void;
}) {
  return (
    <MobileSection kicker={`יום ${todayWeekday}`} title="היום שלך" tone="classic">
      {todaySchedule.length ? (
        <div className="flex flex-col gap-2">
          {todaySchedule.map((item) => (
            <button
              key={item.id}
              type="button"
              dir="rtl"
              onClick={() => openTab("lessons")}
              aria-label={`שיעור ${item.title}, ${item.time}, ${item.room}`}
              className={v6Cx(
                "flex w-full items-center gap-3 rounded-[20px] p-3.5 text-start",
                v6Motion.standard,
                v6Motion.pressSoft,
                v6Motion.focusRing,
                "touch-manipulation",
                item.isNext ? v6StudentSurface.scheduleRowNext : v6StudentSurface.scheduleRow,
                !item.isNext && "motion-safe:hover:bg-white/[0.036]"
              )}
            >
              <span className={v6Cx("grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-[12px] font-semibold tabular-nums", v6Tone[item.tone].soft, v6Tone[item.tone].text)}>
                {item.time}
              </span>
              <span className="min-w-0 flex-1">
                <SafeTitle as="span" className="block text-sm font-semibold tracking-[-0.016em] text-white/90">{item.title}</SafeTitle>
                <SafeMeta as="span" className="mt-0.5 block text-xs text-white/46">
                  {item.room}
                  {item.danceStyle ? ` · ${item.danceStyle}` : ""}
                </SafeMeta>
              </span>
              {item.isNext ? (
                <span className="shrink-0 rounded-full bg-[#f4d58d]/[0.16] px-2.5 py-1 text-[10px] font-semibold text-[#f4d58d]">הבא</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <StudentEmptyPanel
          icon={CalendarDays}
          title="יום שקט בסטודיו"
          description="אין שיעורים משויכים להיום. אפשר לעבור ללוח השבועי ולראות מה מחכה בהמשך."
        />
      )}
    </MobileSection>
  );
}

function StudentProgressCard({
  attendance,
  attendanceRate,
  completedTasks,
  groupTasks,
  membershipStatusLabel,
  membershipTone
}: {
  attendance: V6StudentHomeViewModel["attendance"];
  attendanceRate: number;
  completedTasks: number;
  groupTasks: V6StudentHomeViewModel["groupTasks"];
  membershipStatusLabel: string;
  membershipTone: V6Tone;
}) {
  const hasAttendance = attendance.length > 0;
  const openTasks = Math.max(0, groupTasks.length - completedTasks);

  return (
    <section dir="rtl" className={v6Cx(v6StudentSurface.progress, "rounded-[24px] p-4 sm:p-5", v6Motion.gentle)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <SafeMeta as="p" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/36">הדרך שלך</SafeMeta>
          <SafeTitle as="h2" className="mt-1.5 text-base font-semibold tracking-[-0.022em] text-white/88">התקדמות והתמדה</SafeTitle>
        </div>
        <StatusBadge tone={hasAttendance ? "success" : "studio"}>{hasAttendance ? "מתעדכן" : "בהמשך"}</StatusBadge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <div className={v6Cx("rounded-[18px] p-3", v6StudentSurface.scheduleRow)}>
          <SafeMeta as="p" className="text-[10px] font-medium text-white/40">נוכחות</SafeMeta>
          <SafeTitle as="p" className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white/92">
            {hasAttendance ? (
              <>
                <BidiNumber>{attendanceRate}</BidiNumber>%
              </>
            ) : (
              "—"
            )}
          </SafeTitle>
          <SafeMeta as="p" className="mt-1 text-[10px] text-white/38">{hasAttendance ? "החודש" : "אחרי סימון"}</SafeMeta>
        </div>
        <div className={v6Cx("rounded-[18px] p-3", v6StudentSurface.scheduleRow)}>
          <SafeMeta as="p" className="text-[10px] font-medium text-white/40">משימות</SafeMeta>
          <SafeTitle as="p" className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white/92">
            <BidiNumber>{completedTasks}</BidiNumber>
            {groupTasks.length ? <span className="text-white/40"> / <BidiNumber>{groupTasks.length}</BidiNumber></span> : null}
          </SafeTitle>
          <SafeMeta as="p" className="mt-1 text-[10px] text-white/38">{openTasks ? `${openTasks} פתוחות` : "הכול סגור"}</SafeMeta>
        </div>
        <div className={v6Cx("rounded-[18px] p-3", v6StudentSurface.scheduleRow)}>
          <SafeMeta as="p" className="text-[10px] font-medium text-white/40">סטטוס</SafeMeta>
          <SafeTitle as="p" className="mt-1.5 text-sm font-semibold leading-snug tracking-[-0.02em] text-white/92">{membershipStatusLabel}</SafeTitle>
          <SafeMeta as="p" className={v6Cx("mt-1 text-[10px]", v6Tone[membershipTone].text)}>חברות בסטודיו</SafeMeta>
        </div>
      </div>
    </section>
  );
}

function StudentQuickActions({
  unread,
  openScreen,
  openTab
}: {
  unread: number;
  openScreen: (screen: V6Screen) => void;
  openTab: (tab: V6Tab) => void;
}) {
  const actions = [
    { icon: CalendarDays, label: "שיעורים", tone: "classic" as V6Tone, onClick: () => openTab("lessons") },
    { icon: MessageCircle, label: "הודעות", tone: "studio" as V6Tone, badge: unread, onClick: () => openTab("messages") },
    { icon: ImagePlus, label: "גלריה", tone: "modern" as V6Tone, onClick: () => openScreen("media") },
    { icon: Trophy, label: "זיכרונות", tone: "repertoire" as V6Tone, onClick: () => openScreen("legacy") }
  ];

  return (
    <MobileSection kicker="גישה מהירה" title="מה תרצי לפתוח" tone="modern">
      <div className="-mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              dir="rtl"
              onClick={action.onClick}
              aria-label={action.badge ? `${action.label}, ${action.badge} חדשות` : action.label}
              className={v6Cx(
                "relative flex min-h-[88px] min-w-[108px] max-w-[42vw] snap-start flex-col justify-between rounded-[20px] p-3.5 text-start",
                v6StudentSurface.quickAction,
                v6Motion.standard,
                v6Motion.pressSoft,
                v6Motion.focusRing,
                "touch-manipulation motion-safe:hover:bg-white/[0.040]"
              )}
            >
              <span className={v6Cx("grid h-10 w-10 place-items-center rounded-2xl", v6Tone[action.tone].soft, v6Tone[action.tone].text)}>
                <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <span className="text-[12px] font-semibold text-white/82">{action.label}</span>
              {action.badge ? (
                <span className="absolute left-3 top-3 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#f4d58d] px-1.5 text-[10px] font-bold text-zinc-950">
                  <BidiNumber>{action.badge}</BidiNumber>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </MobileSection>
  );
}

function StudentAcademyFeed({
  activityCenter,
  openScreen,
  openTab
}: {
  activityCenter: V6StudentHomeViewModel["activityCenter"];
  openScreen: (screen: V6Screen) => void;
  openTab: (tab: V6Tab) => void;
}) {
  const { openActivityItem, openActivityCenter } = useV6ActivityNavigationHandlers(openTab, openScreen);

  return (
    <RecentActivitySection
      kicker={activityCenter.unreadCount ? V6_ACTIVITY_COPY.unreadKicker(activityCenter.unreadCount) : "מהסטודיו"}
      title="עדכונים בשבילך"
      tone="studio"
      items={activityCenter.recent}
      unreadCount={activityCenter.unreadCount}
      emptyTitle="הכול שקט כרגע"
      emptyDescription="כשיהיו הודעות, אירועים או תזכורות מהסטודיו — הן יופיעו כאן."
      onOpenItem={openActivityItem}
      onOpenCenter={openActivityCenter}
    />
  );
}

function StudentWeekAhead({
  weekItems,
  openScreen,
  openTab
}: {
  weekItems: V6StudentHomeViewModel["weekItems"];
  openScreen: (screen: V6Screen) => void;
  openTab: (tab: V6Tab) => void;
}) {
  const weekIcon = (kind: (typeof weekItems)[number]["kind"]) => (kind === "event" ? Sparkles : CalendarDays);
  const openWeekItem = (kind: (typeof weekItems)[number]["kind"]) => {
    if (kind === "event") return openScreen("calendar");
    return openTab("lessons");
  };

  if (!weekItems.length) return null;

  return (
    <MobileSection kicker="בהמשך" title="השבוע שלך" tone="hiphop">
      <MobileList>
        {weekItems.map((item) => (
          <MobileListRow
            key={item.id}
            icon={weekIcon(item.kind)}
            title={item.title}
            subtitle={item.subtitle}
            meta={item.meta}
            tone={item.tone}
            onClick={() => openWeekItem(item.kind)}
            ariaLabel={`פתיחת ${item.title}`}
          />
        ))}
      </MobileList>
    </MobileSection>
  );
}

function StudentGroupsSection({
  studentGroupRows,
  openTab
}: {
  studentGroupRows: V6StudentHomeViewModel["studentGroupRows"];
  openTab: (tab: V6Tab) => void;
}) {
  if (studentGroupRows.length <= 1) return null;

  return (
    <MobileSection kicker="הקבוצות שלך" title="איפה את רוקדת" tone="classic">
      <MobileList>
        {studentGroupRows.map(({ group, teacherNames }) => (
          <MobileListRow
            key={group.id}
            icon={Users}
            title={group.name}
            subtitle={[group.danceStyle ?? group.style, teacherNames || undefined].filter(Boolean).join(" · ")}
            meta={group.schedule ?? group.location}
            tone="classic"
            onClick={() => openTab("lessons")}
            ariaLabel={`פתיחת שיעורי ${group.name}`}
          />
        ))}
      </MobileList>
    </MobileSection>
  );
}

function StudentShopTeaser({
  visibleProducts,
  openTab
}: {
  visibleProducts: V6StudentHomeViewModel["visibleProducts"];
  openTab: (tab: V6Tab) => void;
}) {
  if (!visibleProducts.length) return null;

  return (
    <MobileSection kicker="מהסטודיו" title="מהחנות" tone="shop">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {visibleProducts.map((product) => (
          <button
            key={product.id}
            dir="rtl"
            type="button"
            onClick={() => openTab("shop")}
            aria-label={`פתיחת מוצר בחנות: ${product.title}`}
            className={v6Cx(
              "flex min-h-[72px] w-full items-center gap-3 rounded-[20px] p-3.5 text-start",
              v6StudentSurface.quickAction,
              v6Motion.standard,
              v6Motion.pressSoft,
              v6Motion.focusRing,
              "touch-manipulation motion-safe:hover:bg-white/[0.038]"
            )}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f4d58d]/[0.12] text-yellow-50">
              <ShoppingBag size={16} strokeWidth={1.9} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <SafeTitle as="span" className="block truncate text-sm font-semibold text-white/86">{product.title}</SafeTitle>
              <SafeMeta as="span" className="mt-0.5 block truncate text-[11px] text-white/42">{product.category}</SafeMeta>
            </span>
            <SafeMeta as="span" className="shrink-0 text-[11px] font-semibold text-white/48">{productPrice(product)}</SafeMeta>
          </button>
        ))}
      </div>
    </MobileSection>
  );
}

export type StudentHomeSectionProps = {
  user: V6User;
  viewModel: V6StudentHomeViewModel;
  openScreen: (screen: V6Screen) => void;
  openTab: (tab: V6Tab) => void;
};

export function StudentHomeSection({ user, viewModel, openScreen, openTab }: StudentHomeSectionProps) {
  const {
    todayWeekday,
    next,
    nextEvent,
    attendance,
    attendanceRate,
    studentGroupRows,
    primaryGroup,
    primaryTeachers,
    homeModuleIds,
    groupTasks,
    visibleProducts,
    completedTasks,
    membershipStatusLabel,
    membershipTone,
    activityCenter,
    weekItems,
    todaySchedule,
    unread
  } = viewModel;

  return (
    <MobileScreen className="gap-7">
      <StudentGreetingHero user={user} primaryGroup={primaryGroup} unread={unread} todayWeekday={todayWeekday} openTab={openTab} />

      <StudentNextClassHero
        next={next}
        group={primaryGroup}
        teachers={primaryTeachers}
        nextEvent={nextEvent}
        openTab={openTab}
        openScreen={openScreen}
      />

      <StudentTodaySchedule todayWeekday={todayWeekday} todaySchedule={todaySchedule} openTab={openTab} />

      <StudentProgressCard
        attendance={attendance}
        attendanceRate={attendanceRate}
        completedTasks={completedTasks}
        groupTasks={groupTasks}
        membershipStatusLabel={membershipStatusLabel}
        membershipTone={membershipTone}
      />

      <StudentAcademyFeed activityCenter={activityCenter} openScreen={openScreen} openTab={openTab} />

      <StudentQuickActions unread={unread} openScreen={openScreen} openTab={openTab} />

      <StudentWeekAhead weekItems={weekItems} openScreen={openScreen} openTab={openTab} />

      <StudentGroupsSection studentGroupRows={studentGroupRows} openTab={openTab} />

      {homeModuleIds.has("shop") ? <StudentShopTeaser visibleProducts={visibleProducts} openTab={openTab} /> : null}
    </MobileScreen>
  );
}
