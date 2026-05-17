import type { RoleOnboardingProgress, RoleOnboardingStep } from "@/lib/platform-os/types";
import type { UserType } from "@/lib/types";

const STEPS: Record<UserType, Omit<RoleOnboardingStep, "completed">[]> = {
  student: [
    { id: "s_dash", titleHe: "לוח בקרה", descriptionHe: "המשימות והעדכונים שלך", stackTarget: "practice_hub" },
    { id: "s_tasks", titleHe: "משימות", descriptionHe: "מעקב אחר תרגול", stackTarget: "tasks_hub" },
    { id: "s_msgs", titleHe: "הודעות", descriptionHe: "עדכונים מהסטודיו", stackTarget: "notifications" }
  ],
  parent: [
    { id: "p_child", titleHe: "סקירת ילדים", descriptionHe: "מעקב אחר התקדמות", stackTarget: "parent_peace" },
    { id: "p_consent", titleHe: "אישורים", descriptionHe: "אישורי הורים ופרטיות", stackTarget: "parent_consents" },
    { id: "p_shop", titleHe: "תשלומים", descriptionHe: "חנות ואירועים", stackTarget: "shop" }
  ],
  teacher: [
    { id: "t_att", titleHe: "נוכחות", descriptionHe: "סימון נוכחות בקבוצה", stackTarget: "attendance" },
    { id: "t_tasks", titleHe: "משימות", descriptionHe: "יצירת משימות לקבוצה", stackTarget: "tasks_hub" },
    { id: "t_chat", titleHe: "צ'אט קבוצה", descriptionHe: "תקשורת עם תלמידים", stackTarget: "group_chats" }
  ],
  management: [
    { id: "m_dash", titleHe: "לוח הנהלה", descriptionHe: "סקירת סטודיו", stackTarget: "management" },
    { id: "m_users", titleHe: "משתמשים", descriptionHe: "ניהול תלמידים והורים", stackTarget: "users" },
    { id: "m_shop", titleHe: "חנות", descriptionHe: "מוצרים והזמנות", stackTarget: "shop" }
  ],
  super_admin: [
    { id: "sa_db", titleHe: "מסד נתונים", descriptionHe: "גיבוי וייצוא", stackTarget: "backup_restore" },
    { id: "sa_hub", titleHe: "ניהול ראשי", descriptionHe: "סטודיואים ואפשרויות", stackTarget: "super_admin_hub" },
    { id: "sa_audit", titleHe: "ביקורת", descriptionHe: "יומן פעילות", stackTarget: "platform_audit" }
  ]
};

export function buildOnboardingProgress(userId: string, role: UserType): RoleOnboardingProgress {
  return {
    userId,
    role,
    steps: STEPS[role].map((s) => ({ ...s, completed: false }))
  };
}

export function completeOnboardingStep(
  progress: RoleOnboardingProgress,
  stepId: string
): RoleOnboardingProgress {
  const steps = progress.steps.map((s) => (s.id === stepId ? { ...s, completed: true } : s));
  const allDone = steps.every((s) => s.completed);
  return {
    ...progress,
    steps,
    completedAt: allDone ? new Date().toISOString() : progress.completedAt
  };
}
