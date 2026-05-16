import { getDirectoryUsers } from "@/lib/directory-store";
import { privateLessonPriceForDuration } from "./constants";
import type {
  PrivateLessonAvailabilityRequest,
  PrivateLessonAvailabilityRequestStatus,
  PrivateLessonRequestPaymentStatus,
  PrivateLessonSuggestedSlot,
  UserProfile
} from "@/lib/types";

export function availabilityRequestStatusLabel(status: PrivateLessonAvailabilityRequestStatus): string {
  const map: Record<PrivateLessonAvailabilityRequestStatus, string> = {
    waiting_for_teacher: "ממתין לעדכון זמינות מהמורה",
    teacher_suggested_time: "המורה הציע/ה מועדים",
    student_requested_other_time: "נשלחה בקשה למועד אחר",
    ready_for_payment: "אפשר לשלם ולשריין",
    reserved: "השיעור שוריין",
    not_available: "כרגע לא נמצא מועד מתאים",
    cancelled: "בוטל"
  };
  return map[status];
}

export function availabilityPaymentLabel(status: PrivateLessonRequestPaymentStatus): string {
  const map: Record<PrivateLessonRequestPaymentStatus, string> = {
    not_started: "טרם שולם",
    pending: "ממתין לתשלום",
    paid: "שולם",
    failed: "נכשל",
    refunded: "הוחזר"
  };
  return map[status];
}

export function formatSuggestedSlot(slot: PrivateLessonSuggestedSlot): string {
  const d = new Date(`${slot.date}T${slot.startTime}`);
  const dateStr = Number.isNaN(d.getTime())
    ? slot.date
    : d.toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "short" });
  return `${dateStr} · ${slot.startTime}–${slot.endTime}`;
}

export function selectedSlotForRequest(req: PrivateLessonAvailabilityRequest): PrivateLessonSuggestedSlot | undefined {
  if (!req.selectedSlotId || !req.teacherSuggestedSlots?.length) return undefined;
  return req.teacherSuggestedSlots.find((s) => s.id === req.selectedSlotId);
}

export function requestPrice(req: Pick<PrivateLessonAvailabilityRequest, "durationMinutes">): number {
  return privateLessonPriceForDuration(req.durationMinutes);
}

export function resolveStudentForBooking(
  user: UserProfile,
  studentId?: string
): { studentId: string; studentName: string } | null {
  if (user.isParent || user.type === "parent") {
    const linked = user.linkedStudentIds ?? [];
    const children = getDirectoryUsers().filter(
      (u) =>
        u.type === "student" &&
        u.studioId === user.studioId &&
        u.status === "active" &&
        (linked.length === 0 || linked.includes(u.id))
    );
    const pick = studentId ? children.find((c) => c.id === studentId) : children[0];
    if (!pick) return null;
    return { studentId: pick.id, studentName: pick.name };
  }
  if (user.permissions.isStudent) {
    return { studentId: user.id, studentName: user.name };
  }
  return null;
}

export function parentStudentOptions(user: UserProfile): { id: string; name: string }[] {
  if (!user.isParent && user.type !== "parent") return [];
  const linked = user.linkedStudentIds ?? [];
  return getDirectoryUsers()
    .filter(
      (u) =>
        u.type === "student" &&
        u.studioId === user.studioId &&
        u.status === "active" &&
        (linked.length === 0 || linked.includes(u.id))
    )
    .map((u) => ({ id: u.id, name: u.name }));
}

export function filterAvailabilityRequests(
  requests: PrivateLessonAvailabilityRequest[],
  filters: {
    teacherId?: string;
    status?: PrivateLessonAvailabilityRequestStatus | "all";
    paymentStatus?: PrivateLessonRequestPaymentStatus | "all";
  }
): PrivateLessonAvailabilityRequest[] {
  return requests.filter((r) => {
    if (filters.teacherId && r.teacherId !== filters.teacherId) return false;
    if (filters.status && filters.status !== "all" && r.status !== filters.status) return false;
    if (filters.paymentStatus && filters.paymentStatus !== "all" && r.paymentStatus !== filters.paymentStatus) return false;
    return true;
  });
}

export type TeacherRequestGroup = "awaiting_teacher" | "awaiting_student" | "reserved" | "not_available";

export function teacherRequestGroup(status: PrivateLessonAvailabilityRequestStatus): TeacherRequestGroup | null {
  if (status === "waiting_for_teacher" || status === "student_requested_other_time") return "awaiting_teacher";
  if (status === "teacher_suggested_time" || status === "ready_for_payment") return "awaiting_student";
  if (status === "reserved") return "reserved";
  if (status === "not_available") return "not_available";
  return null;
}

export const TEACHER_REQUEST_GROUP_LABELS: Record<TeacherRequestGroup, string> = {
  awaiting_teacher: "ממתין לעדכון זמינות",
  awaiting_student: "ממתין לבחירת תלמיד",
  reserved: "שוריין ושולם",
  not_available: "לא מתאפשר כרגע"
};

export function availabilityRequestInsights(requests: PrivateLessonAvailabilityRequest[]) {
  const active = requests.filter((r) => r.status !== "cancelled");
  const waitingTeacher = active.filter(
    (r) => r.status === "waiting_for_teacher" || r.status === "student_requested_other_time"
  );
  const suggested = active.filter((r) => r.status === "teacher_suggested_time");
  const readyPay = active.filter((r) => r.status === "ready_for_payment");
  const reserved = active.filter((r) => r.status === "reserved");
  const unavailable = active.filter((r) => r.status === "not_available");
  const pendingRevenue = [...readyPay, ...suggested].reduce((s, r) => s + requestPrice(r), 0);
  const conversionDenom = active.filter((r) => r.status !== "cancelled").length;
  const conversionPct = conversionDenom ? Math.round((reserved.length / conversionDenom) * 100) : 0;

  const teachersWithoutResponse = new Set(waitingTeacher.map((r) => r.teacherId));

  return {
    waitingTeacherCount: waitingTeacher.length,
    teachersWithoutResponseCount: teachersWithoutResponse.size,
    suggestedWaitingPaymentCount: suggested.length + readyPay.length,
    reservedCount: reserved.length,
    unavailableCount: unavailable.length,
    pendingRevenue,
    conversionPct
  };
}

export function getManagementUserIds(studioId: string): string[] {
  return getDirectoryUsers()
    .filter((u) => u.studioId === studioId && (u.permissions.isManagement || u.permissions.isSuperAdmin))
    .map((u) => u.id);
}

export function canActOnAvailabilityRequest(user: UserProfile, req: PrivateLessonAvailabilityRequest): boolean {
  if (user.permissions.isManagement || user.permissions.isSuperAdmin) return true;
  if (user.permissions.isTeacher && user.id === req.teacherId) return true;
  if (req.requestedByUserId === user.id || req.studentId === user.id) return true;
  return false;
}

export function canManageAvailabilityRequests(user: UserProfile, studioId: string): boolean {
  if (user.permissions.isSuperAdmin) return true;
  return user.studioId === studioId && user.permissions.isManagement;
}
