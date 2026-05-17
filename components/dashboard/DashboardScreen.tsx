"use client";

import { useMemo } from "react";
import {
  Bell,
  CheckSquare,
  ChevronLeft,
  ClipboardCheck,
  MessageCircle,
  School,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { useCommunication } from "@/context/CommunicationContext";
import { usePlatform } from "@/context/PlatformContext";
import { useProductData } from "@/context/ProductDataContext";
import { useStudioData } from "@/context/StudioDataContext";
import { buildDashboardMetrics, type DashboardNextAction } from "@/lib/dashboard/dashboard-metrics";
import { greetingForHour } from "@/lib/greeting-he";
import { resolveStudioDay } from "@/lib/product/studio-day";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { getTone } from "@/lib/design-system/colors";
import { timeMoodForHour } from "@/lib/theme/time-mood";
import type { MainTabId, StackTabId, UserProfile } from "@/lib/types";
import type { ShopInitialView } from "../shop/ShopScreen";
import { RolePermissionsStrip } from "../mvp/RolePermissionsStrip";
import { TodayHero } from "../today/TodayHero";
import { PrimaryButton, RingStat, cx, screenClass } from "../ui";

export function DashboardScreen({
  user,
  onOpenStack,
  onGoMain,
  onOpenShop,
  onOpenAttendanceIntelligence
}: {
  user: UserProfile;
  onOpenStack: (t: StackTabId) => void;
  onGoMain: (t: MainTabId) => void;
  onOpenShop?: (focus?: { view?: ShopInitialView; productId?: string; eventId?: string }) => void;
  onOpenAttendanceIntelligence?: (studentId?: string) => void;
}) {
  const { effectiveFlags, activeStudioId } = usePlatform();
  const { tasks, updates } = useStudioData();
  const { attendanceSessions, videos } = useProductData();
  const { unreadNotificationCount } = useCommunication();
  const { db } = useLocalDatabase();

  const studioId = user.permissions.isSuperAdmin ? activeStudioId : user.studioId;
  const now = useMemo(() => new Date(), []);
  const mood = useMemo(() => timeMoodForHour(now.getHours()), [now]);
  const firstName = user.name.split(" ")[0];

  const openAttendance = useMemo(() => {
    const hasOpenRows = (s: (typeof attendanceSessions)[number]) => s.rows.some((r) => r.mark === null);
    if (user.permissions.isManagement) return attendanceSessions.filter(hasOpenRows).length;
    if (user.permissions.isTeacher) {
      return attendanceSessions.filter((s) => s.teacherId === user.id && hasOpenRows(s)).length;
    }
    return 0;
  }, [attendanceSessions, user]);

  const metrics = useMemo(
    () =>
      buildDashboardMetrics({
        user,
        studioId,
        tasks,
        updates,
        unreadNotificationCount,
        openAttendanceSessions: openAttendance,
        pendingVideoReviews: videos.filter((v) => v.status === "pending_review").length
      }),
    [user, studioId, tasks, updates, unreadNotificationCount, openAttendance, videos]
  );

  const studioDay = useMemo(
    () =>
      resolveStudioDay({
        performanceDaysRemaining: db.platformMeta.performanceCountdown.daysRemaining,
        hasClassToday: true,
        hour: now.getHours()
      }),
    [db.platformMeta.performanceCountdown.daysRemaining, now]
  );

  const onNextAction = (action: DashboardNextAction) => {
    switch (action.kind) {
      case "task":
        onOpenStack("tasks_hub");
        break;
      case "attendance":
        onOpenStack("attendance");
        break;
      case "gallery":
        onOpenStack("gallery");
        break;
      case "practice":
        onOpenStack("practice_hub");
        break;
      default:
        onGoMain("messages");
    }
  };

  const attendanceList = Array.isArray(metrics.attendance) ? metrics.attendance : [metrics.attendance];
  const accent = getTone(metrics.nextAction.tone === "urgent" ? "urgent" : "accent");

  return (
    <div className={cx(screenClass, "space-y-5")} dir="rtl">
      <RolePermissionsStrip user={user} />

      {user.permissions.isSuperAdmin ? (
        <button
          type="button"
          onClick={() => onOpenStack("super_admin_hub")}
          className="lk-card lk-card-press w-full p-4 text-right"
        >
          <p className="premium-section-label">ניהול האפליקציה</p>
          <p className="mt-1 text-lg font-semibold text-white">מצב האפליקציה והנתונים</p>
          <p className="mt-1 text-sm text-white/45">ייצוא, ייבוא, משתמשים, אפשרויות ויומן פעולות</p>
        </button>
      ) : null}

      <TodayHero
        greeting={greetingForHour(now).title}
        firstName={firstName}
        studioDay={studioDay}
        heroGradient={mood.heroGradient}
        glowRgb={mood.glowRgb}
        primaryLabel={metrics.nextAction.label}
        primaryTone={metrics.nextAction.tone}
        onPrimary={() => onNextAction(metrics.nextAction)}
        rings={
          metrics.role === "student"
            ? [
                { value: metrics.tasks.overallPercent, label: "משימות", tone: "accent" },
                { value: attendanceList[0]?.pct ?? 100, label: "נוכחות", tone: "achievement" }
              ]
            : undefined
        }
      />

      <section>
        <p className="premium-section-label mb-3 px-1">קיצורי דרך</p>
        <div className="grid grid-cols-2 gap-2.5">
          <QuickTile
            label="הודעות"
            hint={metrics.messages.unreadCount > 0 ? `${metrics.messages.unreadCount} חדשות` : "מעודכן"}
            icon={MessageCircle}
            tone="info"
            onPress={() => onGoMain("messages")}
          />
          <QuickTile
            label="משימות"
            hint={`${metrics.tasks.active} פעילות`}
            icon={CheckSquare}
            tone="flexibility"
            onPress={() => onOpenStack("tasks_hub")}
          />
          <QuickTile label="שיעורים" hint="לוח ומערכת" icon={School} tone="teacher" onPress={() => onGoMain("lessons")} />
          {onOpenShop ? (
            <QuickTile label="בוטיק" hint="ציוד וכרטיסים" icon={ShoppingBag} tone="commercial" onPress={() => onOpenShop()} />
          ) : (
            <QuickTile label="התקדמות" hint="רמות ויעדים" icon={Sparkles} tone="achievement" onPress={() => onOpenStack("progress")} />
          )}
        </div>
      </section>

      <section className="lk-card p-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onOpenStack("notifications")}
            className="touch-icon-btn rounded-full border border-white/10 bg-white/[0.04] text-white/60"
            aria-label="התראות"
          >
            <Bell size={18} />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className="premium-section-label">סטטוס</p>
            <p className="mt-1 text-[1.05rem] font-semibold text-white">{metrics.nextAction.label}</p>
            <p className="mt-0.5 text-sm text-white/45">
              {metrics.messages.unreadCount > 0
                ? `${metrics.messages.unreadCount} הודעות · ${metrics.tasks.overdue} משימות באיחור`
                : "הכול רגוע היום"}
            </p>
          </div>
          {metrics.role === "student" ? (
            <RingStat value={metrics.tasks.overallPercent} label="%" tone="accent" size={52} />
          ) : null}
        </div>
        <PrimaryButton className="mt-4" tone={metrics.nextAction.tone} onClick={() => onNextAction(metrics.nextAction)}>
          המשך
        </PrimaryButton>
      </section>

      {metrics.role === "teacher" && metrics.teacherExtras ? (
        <section className="grid grid-cols-2 gap-2">
          <QuickTile
            label="נוכחות"
            hint={`${metrics.teacherExtras.openAttendanceSessions || 0} לסגירה`}
            icon={ClipboardCheck}
            tone="teacher"
            onPress={() => onOpenStack("attendance")}
          />
          <QuickTile
            label="מורים"
            hint="מרכז מורה"
            icon={School}
            tone="teacher"
            onPress={() => onOpenStack("teacher")}
          />
        </section>
      ) : null}

      {metrics.role === "management" && metrics.managementExtras ? (
        <button
          type="button"
          onClick={() => onOpenStack("management")}
          className="premium-tile w-full flex-row items-center justify-between"
          style={{ borderColor: accent.border }}
        >
          <ChevronLeft className="text-white/25" size={20} />
          <div>
            <p className="font-semibold text-white">לוח ניהול</p>
            <p className="mt-0.5 text-sm text-white/45">
              נוכחות {metrics.managementExtras.studioAttendanceAvg}% · משימות {metrics.managementExtras.taskCompletionPct}%
            </p>
          </div>
        </button>
      ) : null}

      {metrics.role === "student" && attendanceList[0] ? (
        <button
          type="button"
          className="premium-tile w-full"
          onClick={() => {
            if (onOpenAttendanceIntelligence) onOpenAttendanceIntelligence(attendanceList[0]?.studentId);
            else onOpenStack("attendance_intelligence");
          }}
        >
          <p className="font-semibold text-white">נוכחות עונתית · {attendanceList[0].pct}%</p>
          <p className="text-sm text-white/45">{attendanceList[0].trendLabel}</p>
        </button>
      ) : null}
    </div>
  );
}

function QuickTile({
  label,
  hint,
  icon: Icon,
  tone,
  onPress
}: {
  label: string;
  hint: string;
  icon: typeof MessageCircle;
  tone: import("@/lib/design-system/colors").SemanticTone;
  onPress: () => void;
}) {
  const t = getTone(tone);
  return (
    <button type="button" onClick={onPress} className="premium-tile w-full">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl border"
        style={{ borderColor: t.border, backgroundColor: t.soft }}
      >
        <Icon size={18} style={{ color: t.core }} strokeWidth={1.75} />
      </span>
      <span className="font-semibold text-white">{label}</span>
      <span className="text-[12px] text-white/42">{hint}</span>
    </button>
  );
}
