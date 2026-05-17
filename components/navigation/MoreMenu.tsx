"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ClipboardCheck,
  Crown,
  Database,
  Film,
  Flag,
  LayoutDashboard,
  MessageCircle,
  Mic2,
  School,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Trophy,
  UserRound,
  Users
} from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { getTone } from "@/lib/design-system/colors";
import { menuSection } from "@/lib/design-system/tokens";
import { PLATFORM_OWNER_BADGE } from "@/lib/demo/identity";
import {
  getMoreScreenSubtitle,
  showPlatformAdminMenu,
  showStudioManagementMenu,
  showStudioTeacherMenu
} from "@/lib/role-ui";
import type { FeatureFlags, StackTabId, UserProfile } from "@/lib/types";
import { RoleBadge } from "../RoleBadge";
import { Card, Header, SectionEyebrow, cx, menuRowClass, screenClass } from "../ui";

function MenuRow({
  title,
  subtitle,
  icon: Icon,
  onPress,
  disabled,
  tone = "accent"
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  tone?: import("@/lib/design-system/colors").SemanticTone;
}) {
  const t = getTone(tone);
  return (
    <button type="button" disabled={disabled} onClick={onPress} className={cx(menuRowClass, disabled && "opacity-40")}>
      <ChevronLeft className="shrink-0 text-white/22" size={20} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">{title}</p>
        {subtitle ? <p className="mt-1 text-sm text-white/42">{subtitle}</p> : null}
        {disabled ? <p className="mt-1 text-[10px] text-amber-200/70">לא זמין כרגע</p> : null}
      </div>
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
        style={{ borderColor: t.border, backgroundColor: t.soft }}
      >
        <Icon size={20} style={{ color: t.core }} />
      </span>
    </button>
  );
}

function flagRow(
  _key: keyof FeatureFlags,
  _flags: FeatureFlags,
  title: string,
  subtitle: string,
  icon: LucideIcon,
  stack: StackTabId,
  onOpenStack: (t: StackTabId) => void,
  tone?: Parameters<typeof MenuRow>[0]["tone"]
) {
  return (
    <MenuRow
      title={title}
      subtitle={subtitle}
      icon={icon}
      tone={tone}
      onPress={() => onOpenStack(stack)}
    />
  );
}

function MenuSection({ title, children, tone }: { title: string; children: React.ReactNode; tone?: Parameters<typeof MenuRow>[0]["tone"] }) {
  return (
    <section>
      <SectionEyebrow tone={tone}>{title}</SectionEyebrow>
      <div className={menuSection.block}>{children}</div>
    </section>
  );
}

export function MoreMenu({
  user,
  onOpenStack,
  onOpenSearch,
  onOpenShop
}: {
  user: UserProfile;
  onOpenStack: (t: StackTabId) => void;
  onOpenSearch: () => void;
  onOpenShop?: () => void;
}) {
  const { effectiveFlags } = usePlatform();
  const platformAdmin = showPlatformAdminMenu(user);
  const studioTeacher = showStudioTeacherMenu(user);
  const studioMgmt = showStudioManagementMenu(user);

  return (
    <div className={cx(screenClass, menuSection.wrap)}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <Header title="עוד" subtitle={getMoreScreenSubtitle(user)} />
        <RoleBadge user={user} className="shrink-0" />
      </div>
      <p className="-mt-4 mb-2 text-right text-[13px] leading-relaxed text-white/40">
        כלים לפי תפקיד — המסכים הראשיים נשארים פשוטים.
      </p>

      <Card animated={false} className="!p-0 overflow-hidden">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full min-h-[3.25rem] touch-manipulation items-center justify-between gap-3 px-4 py-4 text-right active:bg-white/[0.05]"
        >
          <Search className="text-white/35" size={22} />
          <div className="flex-1">
            <p className="premium-section-label">חיפוש</p>
            <p className="mt-1 font-semibold text-white">משימה, קבוצה או עדכון</p>
          </div>
        </button>
      </Card>

      <MenuSection title="חיוני" tone="accent">
        <MenuRow title="משימות" subtitle="תרגול ביתי ומעקב" icon={CheckSquare} tone="flexibility" onPress={() => onOpenStack("tasks_hub")} />
        {flagRow("gallery", effectiveFlags, "גלריה", "סרטונים וחומרים", Film, "gallery", onOpenStack, "rehearsal")}
        {flagRow("achievementsBoard", effectiveFlags, "אירועים", "מופעים וארכיון", Trophy, "legacy_board", onOpenStack, "competition")}
        {flagRow("achievementsBoard", effectiveFlags, "הישגים", "לוח מורשת והצגות", Trophy, "studio_legacy", onOpenStack, "achievement")}
        {flagRow("studioIdentity", effectiveFlags, "צוות", "מורים והנהלה", Users, "studio_faculty", onOpenStack, "accent")}
        <MenuRow title="נוכחות" subtitle="סימון ומעקב" icon={ClipboardCheck} tone="teacher" onPress={() => onOpenStack("attendance_intelligence")} />
        <MenuRow title="לוח שנה" subtitle="שיעורים ואירועים" icon={CalendarDays} tone="competition" onPress={() => onOpenStack("calendar_hub")} />
      </MenuSection>

      {studioTeacher ? (
        <MenuSection title="כלים למורה" tone="teacher">
          <MenuRow title="למורה" subtitle="היום בכיתה" icon={School} tone="teacher" onPress={() => onOpenStack("teacher")} />
          <MenuRow title="נוכחות בשיעור" subtitle="סימון מהיר" icon={Users} onPress={() => onOpenStack("attendance")} />
          <MenuRow title="תיקים דיגיטליים" subtitle="הערות לתלמידים" icon={ClipboardCheck} onPress={() => onOpenStack("files")} />
          <MenuRow title="מצב חזרה" subtitle="הופעה וסדר במה" icon={Mic2} tone="competition" onPress={() => onOpenStack("rehearsal_mode")} />
        </MenuSection>
      ) : null}

      {studioMgmt ? (
        <MenuSection title="ניהול סטודיו" tone="management">
          <MenuRow title="ניהול" subtitle="מה דורש תשומת לב" icon={LayoutDashboard} onPress={() => onOpenStack("management")} />
          <MenuRow title="ניהול משתמשים" subtitle="תלמידים, הורים, מורים" icon={Users} onPress={() => onOpenStack("users")} />
          {flagRow("reports", effectiveFlags, "דוחות", "נוכחות ומעורבות", BarChart3, "reports", onOpenStack, "achievement")}
          <MenuRow title="הגדרות סטודיו" subtitle="פרטים ומדיניות" icon={Settings} onPress={() => onOpenStack("studio_settings")} />
        </MenuSection>
      ) : null}

      {platformAdmin ? (
        <MenuSection title="ניהול האפליקציה">
          <p className="mb-2 px-1 text-right text-[10px] font-medium tracking-wide text-violet-200/70">{PLATFORM_OWNER_BADGE}</p>
          <MenuRow title="ניהול ראשי" subtitle="מסד נתונים, ייצוא וייבוא" icon={Database} onPress={() => onOpenStack("super_admin_hub")} />
          <MenuRow title="סטודיואים ותכונות" subtitle="ניהול והפעלה" icon={Crown} onPress={() => onOpenStack("creator_dashboard")} />
          <MenuRow title="אפשרויות" subtitle="הפעלה לפי סטודיו" icon={Flag} onPress={() => onOpenStack("feature_flags")} />
          <MenuRow title="מצב האפליקציה" subtitle="פתיחה וסנכרון" icon={Shield} onPress={() => onOpenStack("system_status")} />
          <MenuRow title="עריכת טקסטים" subtitle="תוויות בממשק" icon={Sparkles} onPress={() => onOpenStack("text_editor")} />
          <MenuRow title="סטודיואים" subtitle="מיתוג והפעלה" icon={Building2} onPress={() => onOpenStack("studios_admin")} />
        </MenuSection>
      ) : null}

      <MenuSection title="חשבון">
        <MenuRow title="צ׳אטים קבוצתיים" subtitle="שיח עם הקבוצה" icon={MessageCircle} tone="info" onPress={() => onOpenStack("group_chats")} />
        <MenuRow title="התראות" subtitle="מרכז עדכונים" icon={Bell} onPress={() => onOpenStack("notifications")} />
        {onOpenShop ? (
          <MenuRow title="בוטיק LK" subtitle="גם מהתפריט התחתון" icon={ShoppingBag} tone="commercial" onPress={onOpenShop} />
        ) : null}
        <MenuRow title="פרופיל" subtitle="פרטים ואבטחה" icon={UserRound} onPress={() => onOpenStack("profile")} />
        <MenuRow title="הגדרות" subtitle="תצוגה ואישי" icon={Settings} onPress={() => onOpenStack("settings")} />
      </MenuSection>
    </div>
  );
}
