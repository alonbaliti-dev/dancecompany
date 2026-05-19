"use client";

import type { ElementType, ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  MessageCircle,
  Users
} from "lucide-react";
import {
  BidiNumber,
  HeroSurface,
  MobileInfoTile,
  MobileList,
  MobileListRow,
  MobileScreen,
  MobileSection,
  SafeMeta,
  SafeTitle,
  StatusBadge,
  v6Cx,
  v6Lovable,
  v6Motion,
  v6TeacherSurface,
  v6Tone,
  type V6Tone
} from "@/components/v6/design-system";
import { RecentActivitySection, useV6ActivityNavigationHandlers } from "@/components/v6/activity-center/activity-center-section";
import { V6_ACTIVITY_COPY } from "@/lib/v6/activity-center/copy";
import type { V6AttendanceProgress, V6TeacherHomeViewModel } from "@/lib/v6/view-models";
import type { V6Group, V6Lesson, V6Screen, V6Tab, V6User } from "@/lib/v6/types";

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function teacherGreetingLine(name: string) {
  const hour = new Date().getHours();
  const first = firstName(name);
  if (hour < 12) return `בוקר טוב, ${first}`;
  if (hour < 17) return `צהריים נעימים, ${first}`;
  if (hour < 21) return `ערב טוב, ${first}`;
  return `לילה טוב, ${first}`;
}

function TeacherEmptyPanel({
  icon: Icon,
  title,
  description
}: {
  icon: ElementType;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <div className={v6Cx(v6TeacherSurface.empty, "rounded-[18px] p-4 text-start")} role="status">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.036] text-white/48" aria-hidden="true">
        <Icon size={16} strokeWidth={1.9} />
      </span>
      <SafeTitle as="p" className="mt-3 text-sm font-semibold tracking-[-0.014em] text-white/82">{title}</SafeTitle>
      <SafeMeta as="p" className="mt-1.5 text-xs leading-relaxed text-white/46">{description}</SafeMeta>
    </div>
  );
}

function TeacherGreetingHero({
  user,
  todayWeekday,
  openAttendanceCount,
  completeAttendanceCount,
  teacherGroupsCount,
  unread,
  openTab
}: {
  user: V6User;
  todayWeekday: string;
  openAttendanceCount: number;
  completeAttendanceCount: number;
  teacherGroupsCount: number;
  unread: number;
  openTab: (tab: V6Tab) => void;
}) {
  const statusLine = openAttendanceCount
    ? `${openAttendanceCount} רוסטרים ממתינים לסימון`
    : completeAttendanceCount
      ? "הנוכחות להיום מסודרת"
      : teacherGroupsCount
        ? `${teacherGroupsCount} קבוצות משויכות`
        : "אין שיעורים משויכים כרגע";

  return (
    <section dir="rtl" className={v6Cx(v6Lovable.hero, "p-5", v6Motion.gentle)}>
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-l from-transparent via-sky-300/20 to-transparent" />
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <SafeMeta as="p" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/36">לוח מורה</SafeMeta>
          <SafeTitle as="h1" className="mt-2 text-[clamp(1.22rem,5.2vw,1.68rem)] font-semibold leading-[1.14] tracking-[-0.036em] text-white">
            {teacherGreetingLine(user.name)}
          </SafeTitle>
          <SafeMeta as="p" className="mt-2 text-sm leading-relaxed text-white/50">
            יום {todayWeekday} · {statusLine}
          </SafeMeta>
        </div>
        {unread ? (
          <button
            type="button"
            onClick={() => openTab("messages")}
            className={v6Cx(
              "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold",
              v6Motion.standard,
              v6Motion.pressSoft,
              v6Motion.focusRing,
              "touch-manipulation bg-sky-300/[0.12] text-sky-100"
            )}
            aria-label={V6_ACTIVITY_COPY.unreadHeroLabel(unread)}
          >
            <Bell size={14} strokeWidth={1.9} aria-hidden="true" />
            <BidiNumber>{unread}</BidiNumber>
          </button>
        ) : (
          <span className="inline-flex min-h-8 shrink-0 items-center rounded-full bg-white/[0.034] px-3 text-[11px] font-medium text-white/42">
            יום {todayWeekday}
          </span>
        )}
      </div>
    </section>
  );
}

function TeacherNextSessionHero({
  next,
  group,
  marked,
  totalStudents,
  progress,
  openTab
}: {
  next?: V6Lesson;
  group?: V6Group;
  marked: number;
  totalStudents: number;
  progress: V6AttendanceProgress;
  openTab: (tab: V6Tab) => void;
}) {
  if (!next) {
    return (
      <HeroSurface tone="studio" className="p-4">
        <StatusBadge tone="studio">השיעור הבא</StatusBadge>
        <SafeTitle as="h2" className="mt-3 text-[clamp(1.28rem,5vw,1.72rem)] font-semibold leading-tight tracking-[-0.038em] text-white">
          אין שיעור קרוב משויך
        </SafeTitle>
        <SafeMeta as="p" className="mt-2 text-[13px] leading-relaxed text-white/52">
          כששיעור משויך לקבוצות שלך, הוא יופיע כאן עם חדר, שעה ומעבר לסימון נוכחות.
        </SafeMeta>
      </HeroSurface>
    );
  }

  const heroTitle = group?.name ?? next.title;
  const heroMeta = group?.name ? `${next.title} · ${next.weekday}` : next.weekday;

  return (
    <button
      dir="rtl"
      type="button"
      onClick={() => openTab("lessons")}
      aria-label={`פתיחת סימון נוכחות עבור ${heroTitle}, ${next.time}, ${progress.statusLabel}`}
      className={v6Cx("w-full text-start", v6Motion.standard, v6Motion.focusRing, "touch-manipulation rounded-[24px]")}
    >
      <HeroSurface tone="studio" className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SafeMeta as="p" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/38">השיעור הבא לסימון</SafeMeta>
            <SafeTitle as="h2" className="mt-2 text-[clamp(1.38rem,5.6vw,1.92rem)] font-semibold leading-tight tracking-[-0.044em] text-white">
              {heroTitle}
            </SafeTitle>
            <SafeMeta as="p" className="mt-1.5 text-[13px] leading-relaxed text-white/54">{heroMeta}</SafeMeta>
          </div>
          <StatusBadge tone={progress.tone}>{progress.statusLabel}</StatusBadge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MobileInfoTile icon={Clock} label="שעה" value={next.time} tone="studio" />
          <MobileInfoTile icon={MapPin} label="אולפן" value={next.room} tone="modern" />
          <MobileInfoTile
            icon={CheckCircle2}
            label="נוכחות"
            value={
              totalStudents ? (
                <>
                  <BidiNumber>{Math.min(marked, totalStudents)}</BidiNumber>/<BidiNumber>{totalStudents}</BidiNumber>
                </>
              ) : (
                "חסר"
              )
            }
            tone={progress.tone}
          />
        </div>

        <div className="mt-3 grid min-h-11 grid-cols-[1fr_auto] items-center gap-2 rounded-[14px] border border-sky-300/10 bg-black/12 px-3 py-2">
          <SafeMeta as="span" className="text-[11px] font-semibold text-white/56">
            {progress.complete
              ? "הרוסטר מסומן — אפשר לבדוק פרטים"
              : progress.remaining
                ? `נשארו ${progress.remaining} תלמידים לסימון`
                : "פתחי את השיעור כדי לבנות רוסטר"}
          </SafeMeta>
          <span className="inline-flex min-h-8 items-center justify-center rounded-full bg-[#f4d58d] px-3 text-[11px] font-semibold text-zinc-950">
            סימון נוכחות
          </span>
        </div>
      </HeroSurface>
    </button>
  );
}

function TeacherTodayFlow({
  todayWeekday,
  todayTeachingFlow,
  openTab
}: {
  todayWeekday: string;
  todayTeachingFlow: V6TeacherHomeViewModel["todayTeachingFlow"];
  openTab: (tab: V6Tab) => void;
}) {
  return (
    <MobileSection kicker={`יום ${todayWeekday}`} title="זרימת ההוראה היום" tone="studio">
      {todayTeachingFlow.length ? (
        <div className="flex flex-col gap-2">
          {todayTeachingFlow.map((item) => (
            <button
              key={item.id}
              type="button"
              dir="rtl"
              onClick={() => openTab("lessons")}
              aria-label={`שיעור ${item.title}, ${item.time}, ${item.progress.statusLabel}`}
              className={v6Cx(
                "flex w-full items-center gap-3 rounded-[18px] p-3.5 text-start",
                v6Motion.standard,
                v6Motion.pressSoft,
                v6Motion.focusRing,
                "touch-manipulation",
                item.isNext ? v6TeacherSurface.flowRowActive : v6TeacherSurface.flowRow,
                !item.isNext && "motion-safe:hover:bg-white/[0.032]"
              )}
            >
              <span
                className={v6Cx(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[11px] font-semibold tabular-nums",
                  v6Tone[item.tone].soft,
                  v6Tone[item.tone].text
                )}
              >
                {item.time}
              </span>
              <span className="min-w-0 flex-1">
                <SafeTitle as="span" className="block text-sm font-semibold tracking-[-0.014em] text-white/88">
                  {item.title}
                </SafeTitle>
                <SafeMeta as="span" className="mt-0.5 block text-xs text-white/44">
                  {item.room}
                  {item.rosterSize ? (
                    <>
                      {" "}
                      · <BidiNumber>{item.marked}</BidiNumber>/<BidiNumber>{item.rosterSize}</BidiNumber> מסומנים
                    </>
                  ) : null}
                </SafeMeta>
              </span>
              <span
                className={v6Cx(
                  "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                  item.progress.complete ? "bg-emerald-400/14 text-emerald-100" : "bg-[#f4d58d]/16 text-[#f4d58d]"
                )}
              >
                {item.isNext ? "הבא" : item.progress.statusLabel}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <TeacherEmptyPanel
          icon={CalendarDays}
          title="אין שיעורים להיום"
          description="כשיש שיעורים משויכים ליום הנוכחי, הם יופיעו כאן לפי סדר הזמן."
        />
      )}
    </MobileSection>
  );
}

function TeacherAttendanceShortcuts({
  groupRows,
  openAttendanceCount,
  teacherGroupsCount,
  teacherStudentsCount,
  openTab
}: {
  groupRows: V6TeacherHomeViewModel["groupRows"];
  openAttendanceCount: number;
  teacherGroupsCount: number;
  teacherStudentsCount: number;
  openTab: (tab: V6Tab) => void;
}) {
  const shortcutRows = groupRows.filter((row) => row.progress.needsAction).length
    ? groupRows.filter((row) => row.progress.needsAction)
    : groupRows;

  return (
    <MobileSection
      kicker={openAttendanceCount ? `${openAttendanceCount} פתוחים` : "נוכחות"}
      title="קיצורי סימון"
      tone={openAttendanceCount ? "urgent" : "studio"}
    >
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          { label: "קבוצות", value: teacherGroupsCount, meta: "משויכות" },
          { label: "תלמידים", value: teacherStudentsCount, meta: "ברוסטרים" },
          { label: "פתוחות", value: openAttendanceCount, meta: "לסימון", urgent: openAttendanceCount > 0 }
        ].map((metric) => (
          <div key={metric.label} className={v6Cx("rounded-[16px] p-3", v6TeacherSurface.metric)}>
            <SafeMeta as="p" className="text-[10px] font-medium text-white/38">{metric.label}</SafeMeta>
            <SafeTitle as="p" className={v6Cx("mt-1 text-lg font-semibold tracking-[-0.02em]", metric.urgent ? "text-[#f4d58d]" : "text-white/90")}>
              <BidiNumber>{metric.value}</BidiNumber>
            </SafeTitle>
            <SafeMeta as="p" className="mt-1 text-[10px] text-white/36">{metric.meta}</SafeMeta>
          </div>
        ))}
      </div>

      {shortcutRows.length ? (
        <MobileList>
          {shortcutRows.map(({ lesson, group, progress, rosterSize, marked }) => (
            <MobileListRow
              key={lesson.id}
              icon={CheckCircle2}
              title={group?.name ?? lesson.title}
              subtitle={[lesson.title, lesson.room].filter(Boolean).join(" · ")}
              meta={lesson.time}
              tone={progress.tone}
              trailing={
                <span
                  className={v6Cx(
                    "inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-[9.5px] font-semibold",
                    progress.complete ? "bg-emerald-400/14 text-emerald-100" : "bg-[#f4d58d] text-zinc-950"
                  )}
                >
                  {rosterSize ? (
                    <>
                      <BidiNumber>{marked}</BidiNumber>/<BidiNumber>{rosterSize}</BidiNumber>
                    </>
                  ) : (
                    progress.statusLabel
                  )}
                </span>
              }
              onClick={() => openTab("lessons")}
              ariaLabel={`פתיחת נוכחות לקבוצת ${group?.name ?? lesson.title}, ${lesson.time}`}
            />
          ))}
        </MobileList>
      ) : (
        <TeacherEmptyPanel
          icon={CheckCircle2}
          title="אין רוסטרים לסימון"
          description="כשיש קבוצות משויכות, הן יופיעו כאן עם מצב הנוכחות והמעבר המהיר לסימון."
        />
      )}
    </MobileSection>
  );
}

function TeacherAlertsSection({
  activityCenter,
  openScreen,
  openTab
}: {
  activityCenter: V6TeacherHomeViewModel["activityCenter"];
  openScreen: (screen: V6Screen) => void;
  openTab: (tab: V6Tab) => void;
}) {
  const { openActivityItem, openActivityCenter } = useV6ActivityNavigationHandlers(openTab, openScreen);

  return (
    <RecentActivitySection
      kicker={activityCenter.unreadCount ? V6_ACTIVITY_COPY.unreadKicker(activityCenter.unreadCount) : V6_ACTIVITY_COPY.calmKicker}
      title="עדכונים ופעילות"
      tone="modern"
      items={activityCenter.recent}
      unreadCount={activityCenter.unreadCount}
      emptyTitle="אין עדכונים פעילים"
      emptyDescription="הודעות מהסטודיו, תזכורות נוכחות ושינויים בלוח יופיעו כאן."
      onOpenItem={openActivityItem}
      onOpenCenter={openActivityCenter}
    />
  );
}

function TeacherPreparationSection({
  nextTransitionTitle,
  nextTransitionSubtitle,
  nextTransitionMeta,
  groupTasks,
  openTab
}: {
  nextTransitionTitle: string;
  nextTransitionSubtitle: string;
  nextTransitionMeta?: string;
  groupTasks: V6TeacherHomeViewModel["groupTasks"];
  openTab: (tab: V6Tab) => void;
}) {
  const prepTasks = groupTasks.slice(0, 2);

  return (
    <MobileSection kicker="לפני השיעור" title="הכנה ותזכורות" tone="repertoire">
      <MobileList>
        <MobileListRow
          icon={MapPin}
          title={nextTransitionTitle}
          subtitle={nextTransitionSubtitle}
          meta={nextTransitionMeta}
          tone="management"
          onClick={() => openTab("lessons")}
          ariaLabel="פתיחת לוח השיעורים למעבר הבא"
        />
        {prepTasks.length ? (
          prepTasks.map((task) => (
            <MobileListRow
              key={task.id}
              icon={ClipboardList}
              title={task.title}
              subtitle="משימה פתוחה לקבוצה שלך"
              meta="לפני שיעור"
              tone="repertoire"
              onClick={() => openTab("lessons")}
              ariaLabel={`פתיחת משימה: ${task.title}`}
            />
          ))
        ) : (
          <MobileListRow
            icon={ClipboardList}
            title="אין משימות פתוחות"
            subtitle="כשתיפתח משימה לקבוצה, היא תופיע כאן."
            tone="studio"
            onClick={() => openTab("lessons")}
            ariaLabel="פתיחת משימות"
          />
        )}
      </MobileList>
    </MobileSection>
  );
}

function TeacherAttentionSection({
  attentionStudents,
  openTab
}: {
  attentionStudents: V6TeacherHomeViewModel["attentionStudents"];
  openTab: (tab: V6Tab) => void;
}) {
  return (
    <MobileSection kicker="תשומת לב" title="תלמידים לבדיקה" tone={attentionStudents.length ? "urgent" : "studio"}>
      {attentionStudents.length ? (
        <MobileList>
          {attentionStudents.map(({ student, subtitle, meta }) => (
            <MobileListRow
              key={student.id}
              icon={Users}
              title={student.name}
              subtitle={subtitle}
              meta={meta}
              tone="urgent"
              onClick={() => openTab("lessons")}
              ariaLabel={`פתיחת שיעורים לבדיקת ${student.name}`}
            />
          ))}
        </MobileList>
      ) : (
        <TeacherEmptyPanel
          icon={Users}
          title="אין תלמידים מסומנים"
          description="לפי הנוכחות והסטטוסים הנוכחיים, אין תלמידים שדורשים בדיקה לפני השיעור."
        />
      )}
    </MobileSection>
  );
}

function TeacherQuickActions({
  unread,
  openAttendanceCount,
  openTab
}: {
  unread: number;
  openAttendanceCount: number;
  openTab: (tab: V6Tab) => void;
}) {
  const actions = [
    { icon: CheckCircle2, label: "נוכחות", tone: "studio" as V6Tone, badge: openAttendanceCount || undefined, onClick: () => openTab("lessons") },
    { icon: CalendarDays, label: "שיעורים", tone: "management" as V6Tone, onClick: () => openTab("lessons") },
    { icon: MessageCircle, label: "הודעות", tone: "modern" as V6Tone, badge: unread || undefined, onClick: () => openTab("messages") },
    { icon: Users, label: "קבוצות", tone: "repertoire" as V6Tone, onClick: () => openTab("lessons") }
  ];

  return (
    <MobileSection kicker="גישה מהירה" title="פעולות מורה" tone="studio">
      <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              dir="rtl"
              onClick={action.onClick}
              aria-label={action.badge ? `${action.label}, ${action.badge} פתוחים` : action.label}
              className={v6Cx(
                "relative flex min-h-[84px] min-w-[100px] max-w-[40vw] snap-start flex-col justify-between rounded-[18px] p-3 text-start",
                v6TeacherSurface.quickAction,
                v6Motion.standard,
                v6Motion.pressSoft,
                v6Motion.focusRing,
                "touch-manipulation motion-safe:hover:bg-white/[0.034]"
              )}
            >
              <span className={v6Cx("grid h-9 w-9 place-items-center rounded-xl", v6Tone[action.tone].soft, v6Tone[action.tone].text)}>
                <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <span className="text-[12px] font-semibold text-white/80">{action.label}</span>
              {action.badge ? (
                <span className="absolute left-2.5 top-2.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#f4d58d] px-1.5 text-[10px] font-bold text-zinc-950">
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

export type TeacherHomeSectionProps = {
  user: V6User;
  viewModel: V6TeacherHomeViewModel;
  openScreen: (screen: V6Screen) => void;
  openTab: (tab: V6Tab) => void;
};

export function TeacherHomeSection({ user, viewModel, openScreen, openTab }: TeacherHomeSectionProps) {
  const {
    todayWeekday,
    next,
    nextGroup,
    nextAttendance,
    nextAttendanceSummary,
    nextAttendanceProgress,
    nextTransitionTitle,
    nextTransitionSubtitle,
    nextTransitionMeta,
    groupTasks,
    groupRows,
    openAttendanceCount,
    completeAttendanceCount,
    teacherGroups,
    teacherStudents,
    attentionStudents,
    activityCenter,
    todayTeachingFlow,
    unread
  } = viewModel;

  return (
    <MobileScreen className="gap-7">
      <TeacherGreetingHero
        user={user}
        todayWeekday={todayWeekday}
        openAttendanceCount={openAttendanceCount}
        completeAttendanceCount={completeAttendanceCount}
        teacherGroupsCount={teacherGroups.length}
        unread={unread}
        openTab={openTab}
      />

      <TeacherNextSessionHero
        next={next}
        group={nextGroup}
        marked={nextAttendance.length}
        totalStudents={nextAttendanceSummary?.totalStudents ?? 0}
        progress={nextAttendanceProgress}
        openTab={openTab}
      />

      <TeacherTodayFlow todayWeekday={todayWeekday} todayTeachingFlow={todayTeachingFlow} openTab={openTab} />

      <TeacherAttendanceShortcuts
        groupRows={groupRows}
        openAttendanceCount={openAttendanceCount}
        teacherGroupsCount={teacherGroups.length}
        teacherStudentsCount={teacherStudents.length}
        openTab={openTab}
      />

      <TeacherAlertsSection activityCenter={activityCenter} openScreen={openScreen} openTab={openTab} />

      <TeacherPreparationSection
        nextTransitionTitle={nextTransitionTitle}
        nextTransitionSubtitle={nextTransitionSubtitle}
        nextTransitionMeta={nextTransitionMeta}
        groupTasks={groupTasks}
        openTab={openTab}
      />

      <TeacherAttentionSection attentionStudents={attentionStudents} openTab={openTab} />

      <TeacherQuickActions unread={unread} openAttendanceCount={openAttendanceCount} openTab={openTab} />
    </MobileScreen>
  );
}
