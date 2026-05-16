import { getRuntimeDatabase } from "@/lib/local-db/runtime-store";
import { buildStudentSummaries } from "@/lib/attendance-intelligence/logic";
import type { UserProfile } from "@/lib/types";
import { isManagement, isTeacherTier } from "@/lib/permissions";

export type SmartFilterId =
  | "attendance_below_80"
  | "consecutive_absences"
  | "tasks_incomplete"
  | "private_lesson_unscheduled"
  | "urgent_unread"
  | "orders_pending_pickup"
  | "videos_pending_feedback"
  | "missing_parent_consents";

export type SmartFilterResult = {
  id: SmartFilterId;
  labelHe: string;
  count: number;
  entityIds: string[];
};

export function runSmartFilters(user: UserProfile, studioId: string): SmartFilterResult[] {
  if (!isManagement(user) && !isTeacherTier(user)) return [];
  const db = getRuntimeDatabase();
  const sid = studioId;
  const records = db.attendance.intelligenceRecords.filter((r) => r.studioId === sid);
  const summaries = buildStudentSummaries(records);
  const below80 = summaries.filter((s) => s.attendancePct < 80).map((s) => s.studentId);
  const consecutive = summaries.filter((s) => s.absencesLast4Weeks >= 2).map((s) => s.studentId);

  const tasksIncomplete = db.tasks
    .filter((t) => t.studioId === sid && !t.deletedAt && t.status !== "completed")
    .map((t) => t.id);

  const plUnscheduled = db.privateLessons.bookings
    .filter(
      (b) =>
        b.studioId === sid &&
        b.paymentStatus === "paid" &&
        b.bookingStatus !== "confirmed" &&
        !b.scheduledDate
    )
    .map((b) => b.id);

  const urgentUnread = db.notifications
    .filter((n) => n.studioId === sid && n.priority === "urgent" && !(n.readByUserIds?.length))
    .map((n) => n.id);

  const pendingPickup = db.shopOrders
    .filter((o) => o.studioId === sid && o.fulfillmentStatus === "ready_for_pickup")
    .map((o) => o.id);

  const studentIds = new Set(db.users.filter((u) => u.studioId === sid && u.permissions.isStudent).map((u) => u.id));
  const pendingFeedback = db.studioOs.feedback
    .filter((f) => studentIds.has(f.studentId))
    .map((f) => f.id);
  const pendingVideos = db.productData.videos
    .filter((v) => studentIds.has(v.studentId) && v.status === "pending_review")
    .map((v) => v.id);

  const students = db.users.filter((u) => u.studioId === sid && u.permissions.isStudent);
  const missingConsents: string[] = [];
  for (const s of students) {
    const required = ["photography", "app_terms", "privacy_policy"] as const;
    for (const ct of required) {
      const ok = db.consents.records.some(
        (c) => c.studentUserId === s.id && c.consentType === ct && c.status === "approved"
      );
      if (!ok) missingConsents.push(s.id);
    }
  }

  const out: SmartFilterResult[] = [
    { id: "attendance_below_80", labelHe: "נוכחות מתחת ל־80%", count: below80.length, entityIds: below80 },
    { id: "consecutive_absences", labelHe: "חיסורים רצופים", count: consecutive.length, entityIds: consecutive },
    { id: "tasks_incomplete", labelHe: "משימות שלא הושלמו", count: tasksIncomplete.length, entityIds: tasksIncomplete },
    {
      id: "private_lesson_unscheduled",
      labelHe: "שיעורים פרטיים ששולמו ולא שובצו",
      count: plUnscheduled.length,
      entityIds: plUnscheduled
    },
    { id: "urgent_unread", labelHe: "הודעות דחופות שלא נקראו", count: urgentUnread.length, entityIds: urgentUnread },
    { id: "orders_pending_pickup", labelHe: "הזמנות ממתינות לאיסוף", count: pendingPickup.length, entityIds: pendingPickup },
    {
      id: "videos_pending_feedback",
      labelHe: "סרטונים שממתינים לפידבק",
      count: pendingVideos.length + pendingFeedback.length,
      entityIds: [...pendingVideos, ...pendingFeedback]
    },
    {
      id: "missing_parent_consents",
      labelHe: "אישורי הורים חסרים",
      count: missingConsents.length,
      entityIds: [...new Set(missingConsents)]
    }
  ];
  return out.filter((f) => f.count > 0 || isManagement(user));
}
