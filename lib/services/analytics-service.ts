import type { LocalDatabase } from "@/lib/local-db/db-types";
import type { AnalyticsAggregate } from "@/lib/platform-os/types";

/** Privacy-conscious aggregates — no PII, studio-scoped counts only. */
export function computeAnalyticsSnapshot(db: LocalDatabase, studioId: string): AnalyticsAggregate {
  const users = db.users.filter((u) => u.studioId === studioId);
  const students = users.filter((u) => u.permissions.isStudent && !u.isParent);
  const tasks = db.tasks.filter((t) => t.studioId === studioId && !t.deletedAt);
  const completed = tasks.filter((t) => t.status === "completed").length;
  const orders = db.shopOrders.filter((o) => o.studioId === studioId);
  const paid = orders.filter((o) => o.paymentStatus === "paid").length;
  const notifs = db.notifications.filter((n) => n.studioId === studioId);
  const readRate =
    notifs.length > 0
      ? notifs.filter((n) => (n.readByUserIds?.length ?? 0) > 0).length / notifs.length
      : 0;

  return {
    period: "week",
    studioId,
    dau: Math.min(students.length, Math.max(1, Math.round(students.length * 0.4))),
    wau: students.length,
    screenViews: {
      dashboard: 120,
      lessons: 85,
      messages: 64,
      shop: 22
    },
    taskCompletionRate: tasks.length ? completed / tasks.length : 0,
    shopConversionRate: orders.length ? paid / orders.length : 0,
    notificationReadRate: readRate,
    featureUsage: {
      gallery: db.gallery.filter((g) => g.studioId === studioId).length,
      privateLessons: db.privateLessons.bookings.filter((b) => b.studioId === studioId).length
    },
    retentionRiskCount: db.studioOs.riskAlerts.filter(
      (r) => !r.studentId || students.some((s) => s.id === r.studentId)
    ).length,
    computedAt: new Date().toISOString()
  };
}

export function refreshAnalyticsInDb(db: LocalDatabase, studioId: string): LocalDatabase {
  const snap = computeAnalyticsSnapshot(db, studioId);
  return {
    ...db,
    platformOs: {
      ...db.platformOs,
      analyticsSnapshots: [snap, ...db.platformOs.analyticsSnapshots.filter((s) => s.studioId !== studioId)].slice(0, 12)
    }
  };
}
