"use client";

import { AlertCircle, CalendarRange, ChevronLeft, ClipboardCheck, UserRound, Users, UsersRound } from "lucide-react";
import type { StackTabId } from "@/lib/types";
import { useProductData } from "@/context/ProductDataContext";
import { computeManagementOverview } from "@/lib/insights/compute-management-overview";
import type { UserProfile } from "@/lib/types";
import { SmartFiltersPanel } from "./platform-os/SmartFiltersPanel";
import { computeStudioHealthScore } from "@/lib/services/studio-health-score-service";
import { ManagementCommerceInsights } from "./management/ManagementCommerceInsights";
import { ManagementStudioPanel } from "./ManagementStudioPanel";
import { ShopEntryCards } from "./shop/ShopEntryCards";
import { Card, Header, Metric, ProgressBar, RingStat, SectionEyebrow, cx } from "./ui";
import { CollapsibleSection } from "./ui/CollapsibleSection";
import type { ShopInitialView } from "./shop/ShopScreen";

const sectionGap = "space-y-8";

export function ManagementDashboard({
  user,
  onOpenUsers,
  onNavigate,
  onOpenShop
}: {
  user: UserProfile;
  onOpenUsers: () => void;
  onNavigate?: (t: StackTabId) => void;
  onOpenShop?: (focus?: {
    view?: ShopInitialView;
    adminTab?: "products" | "orders" | "private";
    eventId?: string;
  }) => void;
}) {
  const m = computeManagementOverview(user.studioId, user);
  const { reports } = useProductData();
  const healthScore = computeStudioHealthScore(user, user.studioId);
  const health = healthScore.score;

  return (
    <div className={cx(sectionGap, "pb-6")}>
      <Header title="לוח בקרת הנהלה" subtitle="מה דורש טיפול היום — מכירות, מורים וסיכונים." />
      <SmartFiltersPanel user={user} studioId={user.studioId} />

      <Card animated={false} tone="management" glow>
        <div className="flex flex-wrap items-center justify-between gap-8">
          <RingStat value={health} label="בריאות סטודיו" size={92} tone="management" />
          <div className="min-w-0 flex-1 space-y-2 text-right">
            <SectionEyebrow>מדד משוקלל</SectionEyebrow>
            <p className="text-sm leading-relaxed text-white/48">
              נוכחות {reports.attendanceCompletionPct}% · משימות {reports.taskCompletionPct}% · תרגול ביתי{" "}
              {reports.homePracticeEngagementPct}%
            </p>
            {healthScore.needsAttention.length > 0 ? (
              <p className="text-xs text-amber-200/75">{healthScore.needsAttention[0]}</p>
            ) : null}
            {reports.unreadImportantUpdates > 0 ? (
              <p className="text-xs text-amber-200/75">{reports.unreadImportantUpdates} עדכונים חשובים לטיפול</p>
            ) : null}
            <p className="text-sm leading-relaxed text-emerald-100/70">{reports.weeklyHebrewInsight}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Metric title="מורים" value={m.totalTeachers} icon={UserRound} />
        <Metric title="תלמידים" value={m.totalStudents} icon={UsersRound} />
        <Metric title="קבוצות" value={m.totalGroups} icon={Users} />
        <Metric title="שיעורים השבוע" value={m.sessionsThisWeek} icon={CalendarRange} />
      </div>

      {m.alerts.length > 0 ? (
        <Card animated={false} className="border-amber-400/15 bg-amber-500/[0.06]">
          <SectionEyebrow>דחוף היום</SectionEyebrow>
          <ul className="mt-3 space-y-3">
            {m.alerts.slice(0, 3).map((a) => (
              <li key={a.id} className="flex gap-3 text-right">
                <AlertCircle className="mt-0.5 shrink-0 text-amber-300/88" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{a.title}</p>
                  <p className="mt-1 text-sm text-white/48">{a.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button type="button" onClick={onOpenUsers} className="text-right transition active:scale-[0.99]">
          <Card animated={false} className="h-full">
            <ChevronLeft className="mb-2 text-white/30" size={20} />
            <p className="font-semibold text-white">הרשאות ומשתמשים</p>
            <p className="mt-1 text-sm text-white/45">תפקידים, קבוצות ויומן שינויים</p>
          </Card>
        </button>
        {onNavigate ? (
          <button type="button" onClick={() => onNavigate("attendance_intelligence")} className="text-right transition active:scale-[0.99]">
            <Card animated={false} tone="teacher" className="h-full">
              <ClipboardCheck className="mb-2 text-sky-200/80" size={22} />
              <p className="font-semibold text-white">מעקב נוכחות</p>
              <p className="mt-1 text-sm text-white/45">חיסורים ומגמות מהשנה</p>
            </Card>
          </button>
        ) : null}
      </div>

      {onOpenShop ? (
        <ShopEntryCards
          onShop={() => onOpenShop()}
          onPrivateLessons={() => onOpenShop({ view: "browse" })}
          onTickets={() => onOpenShop({ eventId: "evt_end_year_show" })}
        />
      ) : null}

      <ManagementCommerceInsights />

      <ManagementStudioPanel user={user} />

      <CollapsibleSection title="מורים וקבוצות" count={m.teachers.length} tone="teacher">
        <div className="space-y-3">
          {m.teachers.map((t) => (
            <Card key={t.userId} animated={false}>
              <div className="text-right">
                <p className="font-semibold text-white">{t.name}</p>
                <p className="mt-1 text-sm text-white/42">
                  {t.groups} קבוצות · {t.studentsAtRisk > 0 ? `${t.studentsAtRisk} בסיכון` : "יציב"}
                </p>
                <div className="mt-3 space-y-2">
                  <ProgressBar value={t.attendancePct} />
                  <p className="text-[10px] text-white/35">נוכחות {t.attendancePct}% · משימות {t.taskCompletionPct}%</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="ניתוח נוכחות ומשימות" defaultOpen={false}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
          <RingStat value={m.averageAttendancePct} label="נוכחות ממוצעת" size={80} />
          <RingStat value={m.homeTaskCompletionPct} label="השלמת משימות" size={80} />
        </div>
        <p className="mt-4 text-right text-sm leading-relaxed text-white/45">{m.studioInsight}</p>
      </CollapsibleSection>
    </div>
  );
}
