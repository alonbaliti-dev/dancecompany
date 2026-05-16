"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, ChevronLeft, ChevronRight, Flame, Lock, Settings, Zap } from "lucide-react";
import { authService } from "@/lib/services/auth-service";
import { usePlatform } from "@/context/PlatformContext";
import { useUserDirectory } from "@/context/UserDirectoryContext";
import { useStudioOS } from "@/context/StudioOSContext";
import { levelLabelHe } from "@/context/StudioOSContext";
import { PLATFORM_OWNER_BADGE, PLATFORM_OWNER_NAME } from "@/lib/demo/identity";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { achievementIcon } from "@/lib/insights/achievement-icons";
import { computeStudentStats } from "@/lib/insights/compute-student-stats";
import type { UserProfile } from "@/lib/types";
import { Card, Divider, Header, Metric, PrimaryButton, ProgressBar, SectionEyebrow, SectionTitle } from "./ui";

type ProfileView = "main" | "security";

function roleLabel(user: UserProfile): string {
  if (user.permissions.isSuperAdmin) return PLATFORM_OWNER_NAME;
  if (user.permissions.isManagement) return "הנהלת סטודיו";
  if (user.permissions.isTeacher) return "מורה";
  if (user.isParent) return "הורה";
  return "תלמיד";
}

export function ProfileScreen({
  user,
  onUserUpdate,
  onOpenNotifications,
  onOpenSettings
}: {
  user: UserProfile;
  onUserUpdate: (next: UserProfile) => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
}) {
  const { levelProgress } = useStudioOS();
  const { db } = useLocalDatabase();
  const studentStats = computeStudentStats(user);
  const [view, setView] = useState<ProfileView>("main");

  if (view === "security") {
    return <ProfileSecurity user={user} onBack={() => setView("main")} onUserUpdate={onUserUpdate} />;
  }

  return (
    <div className="space-y-8 pb-6">
      <Header title="פרופיל" subtitle="התקדמות, רמה והגדרות חשבון." />

      <div className="flex flex-col items-center text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.12] to-white/[0.03] text-3xl font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {user.avatarInitial}
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">{user.name}</h2>
        <p className="mt-1 text-base text-white/50">{roleLabel(user)}</p>
        {user.permissions.isSuperAdmin ? (
          <span className="mt-2 inline-block rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-[10px] font-semibold tracking-wide text-violet-100/90">
            {PLATFORM_OWNER_BADGE}
          </span>
        ) : null}
        {levelProgress ? (
          <span className="mt-3 inline-block rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
            {levelLabelHe(levelProgress.currentLevel)}
          </span>
        ) : null}
        {(user.permissions.isTeacher || user.permissions.isManagement) && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {user.permissions.isTeacher ? (
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-200/90">הרשאות מורה</span>
            ) : null}
            {user.permissions.isManagement ? (
              <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-white/55">ניהול סטודיו</span>
            ) : null}
          </div>
        )}
        <p className="mt-2 text-sm text-white/45">
          {user.assignedGroups[0] ?? "ללא קבוצה"} · {studentStats.level}
        </p>

      </div>

      <div className="flex gap-3">
        <Metric title="נוכחות" value={`${studentStats.attendance}%`} icon={CheckCircle2} />
        <Metric title="רצף" value={`${studentStats.streak} ימים`} icon={Flame} />
        <Metric title="XP" value={studentStats.xp} icon={Zap} />
      </div>

      <Card animated={false}>
        <SectionEyebrow>חודש נוכחי</SectionEyebrow>
        <div className="mt-3 text-right">
          <p className="text-sm text-white/50">התקדמות כללית</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-white">{studentStats.monthlyProgressPct}%</p>
        </div>
        <ProgressBar value={studentStats.monthlyProgressPct} className="mt-4" />
        <p className="mt-3 text-right text-xs text-white/40">עוד {studentStats.xpToNextLevel} XP לשלב הבא</p>
      </Card>

      <div>
        <SectionTitle>הישגים</SectionTitle>
        <div className="mt-4 space-y-3">
          {db.achievements.map((item) => {
            const Icon = achievementIcon(item.icon);
            return (
              <Card key={item.id} animated={false}>
                <div className="flex items-center gap-4 text-right">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    <Icon className="text-emerald-300/90" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-white/45">{item.body}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle>הגדרות</SectionTitle>
        <Card className="mt-4 !p-0 divide-y divide-white/[0.06]" animated={false}>
          <button
            type="button"
            onClick={() => onOpenNotifications?.()}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-right transition hover:bg-white/[0.04]"
          >
            <ChevronLeft className="text-white/25" size={18} />
            <span className="flex flex-1 items-center justify-end gap-3">
              <span className="text-sm font-medium text-white">התראות</span>
              <Bell className="text-white/45" size={20} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => setView("security")}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-right transition hover:bg-white/[0.04]"
          >
            <ChevronLeft className="text-white/25" size={18} />
            <span className="flex flex-1 items-center justify-end gap-3">
              <span className="text-sm font-medium text-white">אבטחה וסיסמה</span>
              <Lock className="text-white/45" size={20} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => onOpenSettings?.()}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-right transition hover:bg-white/[0.04]"
          >
            <ChevronLeft className="text-white/25" size={18} />
            <span className="flex flex-1 items-center justify-end gap-3">
              <span className="text-sm font-medium text-white">הגדרות חשבון</span>
              <Settings className="text-white/45" size={20} />
            </span>
          </button>
        </Card>
        <p className="mt-3 text-right text-xs text-white/35">תפקיד והרשאות מוגדרים על ידי ההנהלה במערכת</p>
      </div>

      <Divider />
    </div>
  );
}

function ProfileSecurity({
  user,
  onBack,
  onUserUpdate
}: {
  user: UserProfile;
  onBack: () => void;
  onUserUpdate: (next: UserProfile) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { appendAudit } = usePlatform();
  const { changeOwnPassword } = useUserDirectory();
  const [error, setError] = useState<"current" | "length" | "mismatch" | "rate_limited" | null>(null);
  const [success, setSuccess] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = authService.changePassword({
      user,
      currentPassword,
      newPassword,
      confirmPassword
    });
    if (result.kind === "failure") {
      setError(result.reason);
      return;
    }
    if (!changeOwnPassword(user, newPassword)) {
      setError("current");
      return;
    }
    if (result.auditEntry) {
      appendAudit({
        studioId: result.auditEntry.studioId,
        actorUserId: result.auditEntry.actorUserId,
        actorName: result.auditEntry.actorName,
        action: result.auditEntry.action,
        targetType: result.auditEntry.targetType,
        targetId: result.auditEntry.targetId,
        severity: result.auditEntry.severity
      });
    }
    onUserUpdate({ ...user, passwordLastChangedAt: result.passwordLastChangedAt });
    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="space-y-8 pb-6">
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-right text-[13px] font-medium text-emerald-200/80 transition hover:text-emerald-100">
        <ChevronRight className="shrink-0 opacity-70" size={18} />
        חזרה לפרופיל
      </button>

      <Header title="אבטחה" subtitle="טלפון, סיסמה ועדכונים אחרונים." />

      <Card animated={false} className="space-y-3 text-right">
        <SectionEyebrow>מזהה התחברות</SectionEyebrow>
        <p className="text-lg font-semibold tabular-nums tracking-wide text-white" dir="ltr">
          {user.phone}
        </p>
        <p className="text-[12px] text-white/42">ההתחברות לפי מספר הטלפון — לא ניתן לשנות כאן</p>
      </Card>

      <Card animated={false} className="space-y-2 text-right">
        <SectionEyebrow>שינוי סיסמה אחרון</SectionEyebrow>
        <p className="text-[15px] font-medium text-white">{user.passwordLastChangedAt}</p>
      </Card>

      {success ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[22px] border border-emerald-400/25 bg-emerald-500/[0.1] px-5 py-4 text-right">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={22} />
            <div>
              <p className="font-semibold text-emerald-50">הסיסמה עודכנה בהצלחה</p>
              <p className="mt-1 text-[13px] text-emerald-100/75">מעכשיו ניתן להתחבר עם הסיסמה החדשה</p>
            </div>
          </div>
        </motion.div>
      ) : null}

      <form onSubmit={submit} className="space-y-4">
        <SectionTitle>שינוי סיסמה</SectionTitle>
        <Card animated={false} className="!p-5 space-y-4">
          <div>
            <label htmlFor="sec-current" className="mb-2 block text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">
              סיסמה נוכחית
            </label>
            <input
              id="sec-current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setError(null);
                setSuccess(false);
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 px-4 text-[15px] text-white outline-none focus:border-emerald-400/35"
            />
          </div>
          <div>
            <label htmlFor="sec-new" className="mb-2 block text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">
              סיסמה חדשה
            </label>
            <input
              id="sec-new"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError(null);
                setSuccess(false);
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 px-4 text-[15px] text-white outline-none focus:border-emerald-400/35"
            />
          </div>
          <div>
            <label htmlFor="sec-confirm" className="mb-2 block text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">
              אימות סיסמה חדשה
            </label>
            <input
              id="sec-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
                setSuccess(false);
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 px-4 text-[15px] text-white outline-none focus:border-emerald-400/35"
            />
          </div>

          {error === "current" ? <p className="text-right text-[13px] text-rose-300/95">הסיסמה הנוכחית שגויה</p> : null}
          {error === "length" ? <p className="text-right text-[13px] text-rose-300/95">הסיסמה החדשה חייבת להכיל לפחות 6 תווים</p> : null}
          {error === "mismatch" ? <p className="text-right text-[13px] text-rose-300/95">האימות אינו תואם לסיסמה החדשה</p> : null}

          <PrimaryButton type="submit">עדכון סיסמה</PrimaryButton>
        </Card>
      </form>
    </div>
  );
}
