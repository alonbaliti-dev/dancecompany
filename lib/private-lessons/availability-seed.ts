import { STUDIO_LK } from "@/lib/platform/constants";
import type { PrivateLessonAvailabilityRequest } from "@/lib/types";

export function seedPrivateLessonAvailabilityRequests(): PrivateLessonAvailabilityRequest[] {
  const now = new Date().toISOString();
  return [
    {
      id: "plar_demo_waiting",
      studioId: STUDIO_LK,
      teacherId: "u_noa",
      teacherName: "שירה מ. (דמו)",
      productId: "pl_u_noa",
      requestedByUserId: "u_maya",
      requestedByName: "מאיה כהן",
      studentId: "u_maya",
      studentName: "מאיה כהן",
      durationMinutes: 45,
      preferredTimeNotes: "אחר הצהריים בימי ג׳–ה׳",
      studentNote: "הכנה למופע — רוצה לחזק טכניקה",
      status: "waiting_for_teacher",
      paymentStatus: "not_started",
      createdAt: now,
      updatedAt: now
    }
  ];
}
