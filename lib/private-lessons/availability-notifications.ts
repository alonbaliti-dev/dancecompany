import type { PrivateLessonAvailabilityRequest } from "@/lib/types";
import { formatSuggestedSlot } from "./availability-logic";

export type PrivateLessonNotifyKind =
  | "request_to_teacher"
  | "teacher_suggested"
  | "student_other_time"
  | "payment_ready"
  | "reserved"
  | "unavailable"
  | "management_reminder";

export function privateLessonNotificationContent(
  kind: PrivateLessonNotifyKind,
  req: PrivateLessonAvailabilityRequest
): { title: string; body: string; priority: "normal" | "important" | "urgent" } {
  const who = req.studentName;
  const teacher = req.teacherName;
  const dur = `${req.durationMinutes} דק׳`;

  switch (kind) {
    case "request_to_teacher":
      return {
        title: "בקשה לשיעור פרטי",
        body: `${who} (${dur}) מבקש/ת שיעור עם ${teacher}. עדכנו זמינות.`,
        priority: "important"
      };
    case "teacher_suggested":
      return {
        title: "המורה הציע/ה מועדים",
        body: `${teacher} הציע/ה מועדים לשיעור פרטי של ${who}. בחרו מועד ושלמו לשריון.`,
        priority: "important"
      };
    case "student_other_time":
      return {
        title: "בקשה למועד אחר",
        body: `${who} מבקש/ת מועד אחר לשיעור פרטי (${dur}). עדכנו זמינות.`,
        priority: "important"
      };
    case "payment_ready":
      return {
        title: "מוכן לתשלום",
        body: `נבחר מועד לשיעור עם ${teacher}. השלימו תשלום לשריון.`,
        priority: "important"
      };
    case "reserved": {
      const slot = req.teacherSuggestedSlots?.find((s) => s.id === req.selectedSlotId);
      const when = slot ? formatSuggestedSlot(slot) : "מועד שסוכם";
      return {
        title: "שיעור פרטי שוריין",
        body: `${who} · ${dur} · ${when}. התשלום אושר.`,
        priority: "normal"
      };
    }
    case "unavailable":
      return {
        title: "לא נמצא מועד מתאים",
        body: "כרגע לא נמצא מועד מתאים לשיעור פרטי עם המורה. ניתן לבחור מורה אחר או לנסות שוב בהמשך.",
        priority: "normal"
      };
    case "management_reminder":
      return {
        title: "תזכורת מהנהלה",
        body: `יש בקשת שיעור פרטי ממתינה לעדכון זמינות — ${who} עם ${teacher}.`,
        priority: "urgent"
      };
    default:
      return { title: "שיעור פרטי", body: "", priority: "normal" };
  }
}
