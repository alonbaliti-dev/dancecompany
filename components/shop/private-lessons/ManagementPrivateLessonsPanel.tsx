"use client";

import { useMemo, useState } from "react";
import { Banknote, Clock, Users } from "lucide-react";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import {
  availabilityRequestInsights,
  availabilityRequestStatusLabel,
  filterAvailabilityRequests
} from "@/lib/private-lessons/availability-logic";
import {
  bookingPaymentLabel,
  bookingStatusLabel,
  filterPrivateLessonBookings,
  priceLabelForDuration,
  privateLessonRevenueSummary
} from "@/lib/private-lessons/logic";
import { formatPrice } from "@/lib/shop-logic";
import type {
  PrivateLessonAvailabilityRequestStatus,
  PrivateLessonBookingStatus,
  PrivateLessonPaymentStatus,
  PrivateLessonRequestPaymentStatus
} from "@/lib/types";
import { Card, GhostButton, Header, Metric, Toggle, cx, screenClass } from "../../ui";
import { PrivateLessonRequestStatusCard } from "./PrivateLessonRequestStatusCard";

export function ManagementPrivateLessonsPanel({ onBack, embedded }: { onBack?: () => void; embedded?: boolean }) {
  const pl = usePrivateLessons();
  const [tab, setTab] = useState<"requests" | "products" | "bookings">("requests");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<PrivateLessonPaymentStatus | "all">("all");
  const [bookingFilter, setBookingFilter] = useState<PrivateLessonBookingStatus | "all">("all");
  const [reqStatusFilter, setReqStatusFilter] = useState<PrivateLessonAvailabilityRequestStatus | "all">("all");
  const [reqPaymentFilter, setReqPaymentFilter] = useState<PrivateLessonRequestPaymentStatus | "all">("all");

  const studioProducts = useMemo(
    () => pl.products.filter((p) => p.studioId === pl.studioId),
    [pl.products, pl.studioId]
  );

  const filteredBookings = useMemo(
    () =>
      filterPrivateLessonBookings(pl.bookings, {
        teacherId: teacherFilter === "all" ? undefined : teacherFilter,
        paymentStatus: paymentFilter,
        bookingStatus: bookingFilter
      }),
    [pl.bookings, teacherFilter, paymentFilter, bookingFilter]
  );

  const revenue = useMemo(() => privateLessonRevenueSummary(pl.bookings), [pl.bookings]);
  const reqInsights = useMemo(() => availabilityRequestInsights(pl.availabilityRequests), [pl.availabilityRequests]);

  const filteredRequests = useMemo(
    () =>
      filterAvailabilityRequests(pl.availabilityRequests, {
        teacherId: teacherFilter === "all" ? undefined : teacherFilter,
        status: reqStatusFilter,
        paymentStatus: reqPaymentFilter
      }),
    [pl.availabilityRequests, teacherFilter, reqStatusFilter, reqPaymentFilter]
  );

  const content = (
    <>
      {!embedded && onBack ? (
        <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
          ← חזרה לניהול
        </GhostButton>
      ) : null}
      {!embedded ? <Header title="שיעורים פרטיים — ניהול" subtitle="בקשות זמינות, תשלום ושריון." /> : null}

      <div className="grid grid-cols-2 gap-3">
        <Metric title="ממתין למורה" value={String(reqInsights.waitingTeacherCount)} icon={Clock} tone="teacher" />
        <Metric title="ממתין לתשלום" value={String(reqInsights.suggestedWaitingPaymentCount)} icon={Users} />
        <Metric title="שוריין" value={String(reqInsights.reservedCount)} icon={Banknote} tone="management" />
        <Metric title="פוטנציאל" value={formatPrice(reqInsights.pendingRevenue)} icon={Banknote} />
        <Metric title="המרה" value={`${reqInsights.conversionPct}%`} icon={Users} tone="management" />
        <Metric title="לא זמין" value={String(reqInsights.unavailableCount)} icon={Clock} />
      </div>

      <div className="flex gap-2">
        <GhostButton className={cx("flex-1 !text-xs", tab === "requests" && "!border-white/20 !bg-white/10")} onClick={() => setTab("requests")}>
          בקשות
        </GhostButton>
        <GhostButton className={cx("flex-1 !text-xs", tab === "bookings" && "!border-white/20 !bg-white/10")} onClick={() => setTab("bookings")}>
          הזמנות
        </GhostButton>
        <GhostButton className={cx("flex-1 !text-xs", tab === "products" && "!border-white/20 !bg-white/10")} onClick={() => setTab("products")}>
          מורים
        </GhostButton>
      </div>

      {tab === "requests" ? (
        <>
          <select
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white"
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
          >
            <option value="all">כל המורים</option>
            {studioProducts.map((p) => (
              <option key={p.teacherId} value={p.teacherId}>
                {p.teacherName}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap justify-end gap-2">
            {(
              [
                "all",
                "waiting_for_teacher",
                "teacher_suggested_time",
                "ready_for_payment",
                "reserved",
                "not_available"
              ] as const
            ).map((s) => (
              <GhostButton
                key={s}
                className={cx("!text-[10px]", reqStatusFilter === s && "!border-white/20 !bg-white/10")}
                onClick={() => setReqStatusFilter(s)}
              >
                {s === "all" ? "סטטוס: הכל" : availabilityRequestStatusLabel(s).slice(0, 20)}
              </GhostButton>
            ))}
          </div>
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <Card animated={false}>
                <p className="py-6 text-center text-sm text-white/40">אין בקשות בפילטר זה.</p>
              </Card>
            ) : (
              filteredRequests.map((r) => (
                <PrivateLessonRequestStatusCard key={r.id} request={r}>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {(r.status === "waiting_for_teacher" || r.status === "student_requested_other_time") && (
                      <GhostButton className="!text-[10px]" onClick={() => pl.managementSendReminder(r.id)}>
                        תזכורת למורה
                      </GhostButton>
                    )}
                    <GhostButton className="!text-[10px]" onClick={() => pl.managementMarkCoordinated(r.id)}>
                      סומן כמתואם
                    </GhostButton>
                    {r.status !== "reserved" && r.status !== "cancelled" ? (
                      <GhostButton className="!text-[10px]" onClick={() => pl.cancelAvailabilityRequest(r.id)}>
                        ביטול
                      </GhostButton>
                    ) : null}
                  </div>
                </PrivateLessonRequestStatusCard>
              ))
            )}
          </div>
        </>
      ) : tab === "products" ? (
        <div className="space-y-2">
          {studioProducts.map((p) => (
            <Card key={p.id} animated={false}>
              <div className="flex items-center justify-between gap-3 text-right">
                <Toggle checked={p.isActive} onChange={(v) => pl.setTeacherProductActive(p.teacherId, v)} aria-label="פעיל" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{p.teacherName}</p>
                  <p className="text-xs text-white/42">
                    {p.teacherStyles.join(" · ")} · 30 דק׳ {priceLabelForDuration(30)} · 45 דק׳ {priceLabelForDuration(45)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <select
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white"
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
          >
            <option value="all">כל המורים</option>
            {studioProducts.map((p) => (
              <option key={p.teacherId} value={p.teacherId}>
                {p.teacherName}
              </option>
            ))}
          </select>
          <p className="text-right text-xs text-white/38">
            הכנסות משוריינים: {formatPrice(revenue.totalRevenue)} · {revenue.paidCount} שולמו
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            {(["all", "pending", "paid", "failed"] as const).map((s) => (
              <GhostButton
                key={s}
                className={cx("!text-[11px]", paymentFilter === s && "!border-white/20 !bg-white/10")}
                onClick={() => setPaymentFilter(s)}
              >
                {s === "all" ? "תשלום: הכל" : bookingPaymentLabel(s)}
              </GhostButton>
            ))}
          </div>
          <div className="space-y-3">
            {filteredBookings.map((b) => (
              <Card key={b.id} animated={false}>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {b.studentName} → {b.teacherName}
                  </p>
                  <p className="mt-1 text-xs text-white/42">
                    {b.durationMinutes} דק׳ · {formatPrice(b.price)} · {bookingPaymentLabel(b.paymentStatus)} ·{" "}
                    {bookingStatusLabel(b.bookingStatus)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );

  if (embedded) return <div className="space-y-4">{content}</div>;
  return <div className={screenClass}>{content}</div>;
}
