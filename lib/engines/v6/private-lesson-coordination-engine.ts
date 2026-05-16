import type { V6Database } from "@/lib/v6/types";

export function computeV6PrivateLessonCoordination(db: V6Database) {
  const requested = db.privateLessons.filter((item) => item.status === "requested");
  const awaitingTeacher = db.privateLessons.filter((item) => item.status === "requested" || item.status === "teacher_suggested");
  const awaitingPayment = db.privateLessons.filter((item) => item.status === "slot_selected" || item.status === "payment_open");
  const confirmed = db.privateLessons.filter((item) => item.status === "paid");
  return {
    requested: requested.length,
    awaitingTeacher: awaitingTeacher.length,
    awaitingPayment: awaitingPayment.length,
    confirmed: confirmed.length,
    needsAttention: awaitingTeacher.length + awaitingPayment.length
  };
}
