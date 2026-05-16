import { END_YEAR_EVENT_ID } from "@/lib/shop-logic";
import { privateLessonRevenueSummary } from "@/lib/private-lessons/logic";
import { availabilityRequestInsights } from "@/lib/private-lessons/availability-logic";
import { formatPrice } from "@/lib/shop-logic";
import type { PrivateLessonAvailabilityRequest, PrivateLessonBooking, ShopOrder, ShopProduct } from "@/lib/types";

export type CommerceOverview = {
  totalRevenue: number;
  pendingRevenue: number;
  paidOrderCount: number;
  pendingOrderCount: number;
  failedOrderCount: number;
  ticketSalesCount: number;
  privateLessonCount: number;
  privateLessonUnscheduled: number;
  privateLessonPendingTeacher: number;
  plWaitingTeacher: number;
  plAwaitingPayment: number;
  plReserved: number;
  plUnavailable: number;
  plPendingRevenue: number;
  plConversionPct: number;
  readyForPickup: number;
  topProductTitle: string | null;
  topProductCount: number;
  revenueByTeacher: { teacherId: string; teacherName: string; revenue: number; count: number }[];
};

export function buildCommerceOverview(
  orders: ShopOrder[],
  products: ShopProduct[],
  privateBookings: PrivateLessonBooking[],
  availabilityRequests: PrivateLessonAvailabilityRequest[] = []
): CommerceOverview {
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const pendingOrders = orders.filter((o) => o.paymentStatus === "pending");
  const failedOrders = orders.filter((o) => o.paymentStatus === "failed");

  const ticketProductIds = new Set(products.filter((p) => p.category === "event_ticket").map((p) => p.id));
  const ticketSalesCount = paidOrders.filter((o) => o.items.some((i) => ticketProductIds.has(i.productId))).length;

  const productCounts = new Map<string, number>();
  for (const o of paidOrders) {
    for (const item of o.items) {
      productCounts.set(item.productId, (productCounts.get(item.productId) ?? 0) + item.quantity);
    }
  }
  let topProductTitle: string | null = null;
  let topProductCount = 0;
  for (const [pid, count] of productCounts) {
    if (count > topProductCount) {
      topProductCount = count;
      topProductTitle = products.find((p) => p.id === pid)?.title ?? pid;
    }
  }

  const plSummary = privateLessonRevenueSummary(privateBookings);
  const plReq = availabilityRequestInsights(availabilityRequests);
  const privateLessonUnscheduled = privateBookings.filter(
    (b) => b.paymentStatus === "paid" && b.bookingStatus === "requested" && !b.requestedDate
  ).length;
  const privateLessonPendingTeacher = privateBookings.filter(
    (b) => b.bookingStatus === "requested" && b.paymentStatus === "paid"
  ).length;

  const teacherMap = new Map<string, { teacherName: string; revenue: number; count: number }>();
  for (const b of privateBookings.filter((x) => x.paymentStatus === "paid")) {
    const row = teacherMap.get(b.teacherId) ?? { teacherName: b.teacherName, revenue: 0, count: 0 };
    row.revenue += b.price;
    row.count += 1;
    teacherMap.set(b.teacherId, row);
  }

  return {
    totalRevenue: paidOrders.reduce((s, o) => s + o.totalPrice, 0) + plSummary.totalRevenue,
    pendingRevenue: pendingOrders.reduce((s, o) => s + o.totalPrice, 0) + plSummary.pendingTotal,
    paidOrderCount: paidOrders.length + plSummary.paidCount,
    pendingOrderCount: pendingOrders.length + plSummary.pendingCount,
    failedOrderCount: failedOrders.length,
    ticketSalesCount,
    privateLessonCount: privateBookings.length,
    privateLessonUnscheduled,
    privateLessonPendingTeacher,
    plWaitingTeacher: plReq.waitingTeacherCount,
    plAwaitingPayment: plReq.suggestedWaitingPaymentCount,
    plReserved: plReq.reservedCount,
    plUnavailable: plReq.unavailableCount,
    plPendingRevenue: plReq.pendingRevenue,
    plConversionPct: plReq.conversionPct,
    readyForPickup: orders.filter((o) => o.fulfillmentStatus === "ready_for_pickup").length,
    topProductTitle,
    topProductCount,
    revenueByTeacher: [...teacherMap.entries()]
      .map(([teacherId, v]) => ({ teacherId, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
  };
}

export function buildCommerceInsightsHe(
  overview: CommerceOverview,
  orders: ShopOrder[],
  products: ShopProduct[]
): string[] {
  const insights: string[] = [];
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const ticketIds = new Set(products.filter((p) => p.relatedEventId === END_YEAR_EVENT_ID).map((p) => p.id));
  const ticketsThisWeek = orders.filter(
    (o) =>
      o.paymentStatus === "paid" &&
      +new Date(o.createdAt) >= weekAgo &&
      o.items.some((i) => ticketIds.has(i.productId))
  ).length;
  if (ticketsThisWeek > 0) {
    insights.push(`נמכרו ${ticketsThisWeek} כרטיסים למופע סוף השנה השבוע.`);
  }

  if (overview.plWaitingTeacher > 0) {
    insights.push(
      `${overview.plWaitingTeacher} בקשות שיעור פרטי ממתינות לעדכון זמינות מהמורה${overview.plWaitingTeacher > 1 ? "" : ""}.`
    );
  }
  if (overview.plAwaitingPayment > 0) {
    insights.push(
      `${overview.plAwaitingPayment} בקשות עם מועדים מוצעים — פוטנציאל ${formatPrice(overview.plPendingRevenue)}.`
    );
  }
  if (overview.plUnavailable > 0) {
    insights.push(`${overview.plUnavailable} בקשות סומנו כלא זמינות — כדאי לעקוב אחרי ביקוש.`);
  }
  if (overview.plConversionPct > 0 && overview.plReserved > 0) {
    insights.push(`המרה מבקשה לשריון: ${overview.plConversionPct}% (${overview.plReserved} שוריינו).`);
  }
  if (overview.privateLessonUnscheduled > 0) {
    insights.push(`יש ${overview.privateLessonUnscheduled} שיעורים פרטיים ששולמו ועדיין לא תואמו.`);
  }

  if (overview.topProductTitle && overview.topProductCount > 0) {
    insights.push(`המוצר הכי נמכר: ${overview.topProductTitle} (${overview.topProductCount} יח׳).`);
  }

  if (overview.readyForPickup > 0) {
    insights.push(`${overview.readyForPickup} הזמנות ממתינות לאיסוף.`);
  }

  if (overview.pendingOrderCount > 0) {
    insights.push(`${overview.pendingOrderCount} תשלומים ממתינים לאישור.`);
  }

  const staleTeacher = overview.revenueByTeacher.length === 0 && overview.privateLessonCount > 0;
  if (overview.privateLessonPendingTeacher === 1) {
    insights.push("מורה אחד עדיין לא אישר בקשת שיעור פרטי.");
  } else if (staleTeacher && overview.privateLessonCount > 0) {
    insights.push("יש בקשות שיעור פרטי שדורשות תיאום עם המורה.");
  }

  return insights.slice(0, 5);
}
