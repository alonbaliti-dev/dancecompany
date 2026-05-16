"use client";

import { Banknote, ClipboardList, ShoppingBag, Ticket, UserRound } from "lucide-react";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import { useShop } from "@/context/ShopContext";
import { buildCommerceInsightsHe, buildCommerceOverview } from "@/lib/commerce-insights";
import { formatPrice } from "@/lib/shop-logic";
import { Card, Metric, SectionEyebrow, SectionTitle } from "../ui";

export function ManagementCommerceInsights() {
  const shop = useShop();
  const pl = usePrivateLessons();

  const overview = buildCommerceOverview(shop.studioOrders, shop.products, pl.bookings, pl.availabilityRequests);
  const insights = buildCommerceInsightsHe(overview, shop.studioOrders, shop.products);

  return (
    <section className="space-y-4">
      <div className="text-right">
        <SectionEyebrow tone="commercial">חנות ורכישות</SectionEyebrow>
        <SectionTitle className="mt-0.5">תובנות מכירות</SectionTitle>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric title="הכנסות" value={formatPrice(overview.totalRevenue)} icon={Banknote} tone="management" />
        <Metric title="ממתין" value={formatPrice(overview.pendingRevenue)} icon={Banknote} tone="teacher" />
        <Metric title="שולם" value={String(overview.paidOrderCount)} icon={ShoppingBag} />
        <Metric title="כרטיסים" value={String(overview.ticketSalesCount)} icon={Ticket} tone="competition" />
        <Metric title="שיעורים פרטיים" value={String(overview.privateLessonCount)} icon={UserRound} tone="teacher" />
        <Metric title="לאיסוף" value={String(overview.readyForPickup)} icon={ClipboardList} />
      </div>

      {insights.length > 0 ? (
        <Card animated={false} tone="management" className="border-violet-400/12 bg-violet-500/[0.05]">
          <SectionEyebrow>תובנות חכמות</SectionEyebrow>
          <ul className="mt-3 space-y-2 text-right">
            {insights.map((line) => (
              <li key={line} className="text-sm leading-relaxed text-white/55">
                {line}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {overview.revenueByTeacher.length > 0 ? (
        <Card animated={false}>
          <SectionEyebrow>שיעורים פרטיים לפי מורה</SectionEyebrow>
          <div className="mt-3 space-y-2">
            {overview.revenueByTeacher.slice(0, 4).map((t) => (
              <div key={t.teacherId} className="flex items-center justify-between gap-2 text-right text-sm">
                <span className="tabular-nums text-emerald-200/85">{formatPrice(t.revenue)}</span>
                <span className="text-white/55">
                  {t.teacherName} · {t.count} שיעורים
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

    </section>
  );
}
