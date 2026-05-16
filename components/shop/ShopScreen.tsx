"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import {
  END_YEAR_EVENT_ID,
  formatPrice,
  fulfillmentStatusLabel,
  paymentMethodLabel,
  paymentStatusLabel,
  stockLabel,
  categoryLabel,
  filterOrders
} from "@/lib/shop-logic";
import type {
  ShopFulfillmentStatus,
  ShopPaymentStatus,
  ShopProduct,
  ShopProductCategory,
  ShopProductFormPayload,
  ShopStockStatus
} from "@/lib/types";
import { BottomSheet } from "../BottomSheet";
import { ShopBoutiqueHome } from "./boutique/ShopBoutiqueHome";
import { ShopProductDetail } from "./boutique/ShopProductDetail";
import { ShopCartView } from "./boutique/ShopCartView";
import { PaymentCheckoutFlow } from "./checkout/PaymentCheckoutFlow";
import { listPaymentAuditsForOrder } from "@/lib/payments/payment-service";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import { bookingPaymentLabel, bookingStatusLabel, priceLabelForDuration } from "@/lib/private-lessons/logic";
import type { PrivateLessonBooking } from "@/lib/types";
import { PrivateLessonConfirmation } from "./private-lessons/PrivateLessonConfirmation";
import { PrivateLessonDetail } from "./private-lessons/PrivateLessonDetail";
import { MyPrivateLessonsSection } from "./private-lessons/MyPrivateLessonsSection";
import { PrivateLessonRequestSent } from "./private-lessons/PrivateLessonRequestSent";
import { PrivateLessonRequestStatusCard } from "./private-lessons/PrivateLessonRequestStatusCard";
import { ManagementPrivateLessonsPanel } from "./private-lessons/ManagementPrivateLessonsPanel";
import { TeacherPrivateLessonsPanel } from "./private-lessons/TeacherPrivateLessonsPanel";
import { Card, GhostButton, Header, PrimaryButton, Toggle, cx, screenClass } from "../ui";

type ShopView =
  | "browse"
  | "detail"
  | "cart"
  | "checkout"
  | "orders"
  | "admin"
  | "private_detail"
  | "private_request_sent"
  | "private_my"
  | "private_confirm"
  | "private_teacher";

const STOCK_OPTS: ShopStockStatus[] = ["in_stock", "low_stock", "sold_out", "preorder"];
const CAT_OPTS: ShopProductCategory[] = ["studio_wear", "dance_shoes", "dance_socks", "accessories", "event_ticket", "workshop", "digital"];

export type ShopInitialView = ShopView;

export function ShopScreen({
  initialProductId,
  initialEventId,
  initialView,
  initialAdminTab
}: {
  initialProductId?: string;
  initialEventId?: string;
  initialView?: ShopInitialView;
  initialAdminTab?: "products" | "orders" | "private";
}) {
  const shop = useShop();
  const pl = usePrivateLessons();
  const [view, setView] = useState<ShopView>(initialView ?? "browse");
  const [productId, setProductId] = useState<string | null>(initialProductId ?? null);
  const [privateProductId, setPrivateProductId] = useState<string | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<PrivateLessonBooking | null>(null);
  const [adminTab, setAdminTab] = useState<"products" | "orders" | "private">(initialAdminTab ?? "products");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [orderFilters, setOrderFilters] = useState<{ payment: ShopPaymentStatus | "all"; fulfillment: ShopFulfillmentStatus | "all"; eventId: string }>({
    payment: "all",
    fulfillment: "all",
    eventId: initialEventId ?? ""
  });

  useEffect(() => {
    if (initialEventId) shop.setFocusEventId(initialEventId);
  }, [initialEventId, shop]);

  useEffect(() => {
    if (!initialProductId) return;
    if (initialView === "private_detail" || initialProductId.startsWith("pl_")) {
      setPrivateProductId(initialProductId);
      setView("private_detail");
      return;
    }
    setProductId(initialProductId);
    setView(initialView ?? "detail");
  }, [initialProductId, initialView]);

  const product = productId ? shop.getProduct(productId) : undefined;
  const privateProduct = privateProductId ? pl.getProduct(privateProductId) : undefined;

  const adminOrders = useMemo(
    () =>
      filterOrders(shop.studioOrders, shop.products, {
        paymentStatus: orderFilters.payment,
        fulfillmentStatus: orderFilters.fulfillment,
        eventId: orderFilters.eventId || undefined
      }),
    [shop.studioOrders, shop.products, orderFilters]
  );

  const openDetail = (id: string) => {
    setProductId(id);
    setView("detail");
  };

  const openPrivateDetail = (id: string) => {
    setPrivateProductId(id);
    setView("private_detail");
  };

  const submittedRequest = submittedRequestId ? pl.getAvailabilityRequest(submittedRequestId) : undefined;

  if (view === "private_confirm" && confirmedBooking) {
    const warmup = pl.getProduct(confirmedBooking.productId)?.warmupPolicy;
    return (
      <PrivateLessonConfirmation
        booking={confirmedBooking}
        warmupPolicy={warmup}
        onDone={() => {
          setConfirmedBooking(null);
          setSubmittedRequestId(null);
          setPrivateProductId(null);
          setView("browse");
        }}
      />
    );
  }

  if (view === "private_request_sent" && submittedRequest) {
    return (
      <PrivateLessonRequestSent
        request={submittedRequest}
        onViewRequests={() => setView("private_my")}
        onDone={() => {
          setSubmittedRequestId(null);
          setPrivateProductId(null);
          setView("browse");
        }}
      />
    );
  }

  if (view === "private_my") {
    return <MyPrivateLessonsSection onBack={() => setView("browse")} />;
  }

  if (view === "private_detail" && privateProduct) {
    return (
      <PrivateLessonDetail
        product={privateProduct}
        onBack={() => setView("browse")}
        onRequestSubmitted={(requestId) => {
          setSubmittedRequestId(requestId);
          setView("private_request_sent");
        }}
      />
    );
  }

  if (view === "private_teacher") {
    return <TeacherPrivateLessonsPanel onBack={() => setView("browse")} />;
  }

  if (view === "detail" && product) {
    return (
      <ShopProductDetail
        product={product}
        onBack={() => setView("browse")}
        onCart={() => setView("cart")}
        myEventOrder={product.relatedEventId ? shop.myOrderForEvent(product.relatedEventId) : undefined}
      />
    );
  }

  if (view === "cart") {
    return <ShopCartView onBack={() => setView("browse")} onCheckout={() => setView("checkout")} />;
  }

  if (view === "checkout") {
    return (
      <PaymentCheckoutFlow
        onBack={() => setView("cart")}
        onOrders={() => setView("orders")}
      />
    );
  }

  if (view === "orders") {
    return (
      <OrdersView onBack={() => setView("browse")} onMyPrivate={pl.canBook ? () => setView("private_my") : undefined} />
    );
  }

  if (view === "admin" && (shop.canManageShop || pl.canManage)) {
    return (
      <AdminView
        tab={adminTab}
        onTab={setAdminTab}
        orders={adminOrders}
        filters={orderFilters}
        onFilters={setOrderFilters}
        formOpen={formOpen}
        editId={editId}
        onOpenForm={(id) => {
          setEditId(id);
          setFormOpen(true);
        }}
        onCloseForm={() => {
          setFormOpen(false);
          setEditId(null);
        }}
        onBack={() => setView("browse")}
      />
    );
  }

  const showTeacherPrivate = pl.user.permissions.isTeacher || pl.user.permissions.isManagement;

  return (
    <ShopBoutiqueHome
      onProduct={(id) => openDetail(id)}
      onPrivateLesson={(id) => openPrivateDetail(id)}
      onCart={() => setView("cart")}
      onOrders={() => setView("orders")}
      onAdmin={shop.canManageShop || pl.canManage ? () => setView("admin") : undefined}
      onTeacherPrivate={showTeacherPrivate ? () => setView("private_teacher") : undefined}
      onMyPrivateLessons={pl.canBook ? () => setView("private_my") : undefined}
    />
  );
}

function OrdersView({ onBack, onMyPrivate }: { onBack: () => void; onMyPrivate?: () => void }) {
  const shop = useShop();
  const pl = usePrivateLessons();
  const empty = shop.myOrders.length === 0 && pl.myBookings.length === 0 && pl.myAvailabilityRequests.length === 0;
  return (
    <div className={screenClass}>
      <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
        ← חזרה לבוטיק
      </GhostButton>
      <Header title="ההזמנות שלי" subtitle="כרטיסים, בגדים, ציוד ושיעורים פרטיים." />
      {pl.canBook && onMyPrivate ? (
        <GhostButton className="mb-3 w-full !text-sm" onClick={onMyPrivate}>
          השיעורים הפרטיים שלי
        </GhostButton>
      ) : null}
      {pl.myAvailabilityRequests.length > 0 ? (
        <div className="mb-4 space-y-2">
          <p className="text-right text-xs font-medium text-white/40">בקשות שיעור פרטי</p>
          {pl.myAvailabilityRequests.slice(0, 3).map((r) => (
            <PrivateLessonRequestStatusCard key={r.id} request={r} />
          ))}
          {pl.myAvailabilityRequests.length > 3 && onMyPrivate ? (
            <GhostButton className="w-full !text-xs" onClick={onMyPrivate}>
              כל הבקשות ({pl.myAvailabilityRequests.length})
            </GhostButton>
          ) : null}
        </div>
      ) : null}
      {empty ? (
        <Card animated={false}>
          <p className="py-8 text-center text-sm text-white/40">עדיין אין הזמנות.</p>
        </Card>
      ) : null}
      {pl.myBookings.map((b) => (
        <Card key={b.id} animated={false} tone="teacher">
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-200/70">שיעור פרטי</p>
            <p className="mt-1 font-semibold text-white">
              {b.teacherName} · {b.durationMinutes} דק׳ · {priceLabelForDuration(b.durationMinutes)}
            </p>
            <p className="mt-1 text-xs text-white/42">
              {bookingPaymentLabel(b.paymentStatus)} · {bookingStatusLabel(b.bookingStatus)}
            </p>
            {b.requestedDate ? (
              <p className="mt-1 text-[11px] text-white/35">
                מועד מבוקש: {b.requestedDate}
                {b.requestedTime ? ` · ${b.requestedTime}` : ""}
              </p>
            ) : null}
            <p className="mt-2 text-[11px] text-amber-200/70">תזכורת: מומלץ להגיע מחוממים לשיעור.</p>
          </div>
        </Card>
      ))}
      {shop.myOrders.map((o) => (
          <Card key={o.id} animated={false}>
            <div className="text-right">
              <p className="font-semibold text-white">{formatPrice(o.totalPrice)}</p>
              <p className="mt-1 text-xs text-white/42">
                {new Date(o.createdAt).toLocaleDateString("he-IL")} · {paymentStatusLabel(o.paymentStatus)} · {fulfillmentStatusLabel(o.fulfillmentStatus)}
              </p>
              {o.paymentMethod ? <p className="mt-1 text-[11px] text-white/35">{paymentMethodLabel(o.paymentMethod)}</p> : null}
            </div>
          </Card>
        ))}
    </div>
  );
}

function AdminView({
  tab,
  onTab,
  orders,
  filters,
  onFilters,
  formOpen,
  editId,
  onOpenForm,
  onCloseForm,
  onBack
}: {
  tab: "products" | "orders" | "private";
  onTab: (t: "products" | "orders" | "private") => void;
  orders: ReturnType<typeof useShop>["studioOrders"];
  filters: { payment: ShopPaymentStatus | "all"; fulfillment: ShopFulfillmentStatus | "all"; eventId: string };
  onFilters: (f: { payment: ShopPaymentStatus | "all"; fulfillment: ShopFulfillmentStatus | "all"; eventId: string }) => void;
  formOpen: boolean;
  editId: string | null;
  onOpenForm: (id: string | null) => void;
  onCloseForm: () => void;
  onBack: () => void;
}) {
  const shop = useShop();
  const { showToast } = useToast();
  const editProduct = editId ? shop.products.find((p) => p.id === editId) : undefined;

  return (
    <div className={screenClass}>
      <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
        ← חנות
      </GhostButton>
      <Header title="ניהול חנות" subtitle="מוצרים, מלאי והזמנות לסטודיו שלך בלבד." />

      {shop.canViewPlatformAnalytics ? (
        <Card animated={false} className="border-violet-400/15 bg-violet-500/[0.06]">
          <p className="text-right text-xs font-semibold text-violet-100/90">תובנות תשלומים (פלטפורמה)</p>
          <p className="mt-1 text-right text-[11px] text-white/45">
            {shop.studioOrders.filter((o) => o.paymentStatus === "paid").length} שולמו ·{" "}
            {shop.studioOrders.filter((o) => o.paymentStatus === "pending").length} ממתינים ·{" "}
            {shop.studioOrders.filter((o) => o.paymentStatus === "failed").length} נכשלו
          </p>
        </Card>
      ) : null}

      <div className="flex gap-2">
        <GhostButton className={cx("flex-1", tab === "products" && "!border-white/20 !bg-white/10")} onClick={() => onTab("products")}>
          מוצרים
        </GhostButton>
        <GhostButton className={cx("flex-1", tab === "orders" && "!border-white/20 !bg-white/10")} onClick={() => onTab("orders")}>
          הזמנות
        </GhostButton>
        <GhostButton className={cx("flex-1", tab === "private" && "!border-white/20 !bg-white/10")} onClick={() => onTab("private")}>
          שיעורים פרטיים
        </GhostButton>
      </div>

      {tab === "private" ? <ManagementPrivateLessonsPanel embedded /> : null}

      {tab === "products" ? (
        <>
          <PrimaryButton onClick={() => onOpenForm(null)}>מוצר חדש</PrimaryButton>
          <div className="space-y-2">
            {shop.products
              .filter((p) => p.studioId === shop.user.studioId)
              .map((p) => (
                <Card key={p.id} animated={false}>
                  <div className="flex items-center justify-between gap-3 text-right">
                    <Toggle checked={p.isActive} onChange={(v) => shop.setProductActive(p.id, v)} aria-label="פעיל" />
                    <button type="button" className="min-w-0 flex-1" onClick={() => onOpenForm(p.id)}>
                      <p className="font-semibold text-white">{p.title}</p>
                      <p className="text-xs text-white/40">
                        {formatPrice(p.price)} · {stockLabel(p.stockStatus)} {!p.isActive ? "· מושבת" : ""}
                      </p>
                    </button>
                  </div>
                </Card>
              ))}
          </div>
        </>
      ) : tab === "orders" ? (
        <>
          <div className="flex flex-wrap justify-end gap-2">
            <GhostButton
              className="!text-xs"
              onClick={() => {
                if (shop.exportStudioOrders()) {
                  showToast("קובץ הזמנות הורד למכשיר", "success");
                }
              }}
            >
              <span className="inline-flex items-center gap-1">
                <Download size={14} />
                ייצוא הזמנות
              </span>
            </GhostButton>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {(["all", "pending", "paid", "failed"] as const).map((status) => (
              <GhostButton
                key={status}
                className={cx("!text-[11px]", filters.payment === status && "!border-white/20 !bg-white/10")}
                onClick={() => onFilters({ ...filters, payment: status })}
              >
                {status === "all" ? "כל התשלומים" : paymentStatusLabel(status)}
              </GhostButton>
            ))}
          </div>
          <select
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white"
            value={filters.eventId}
            onChange={(e) => onFilters({ ...filters, eventId: e.target.value })}
          >
            <option value="">כל האירועים</option>
            <option value={END_YEAR_EVENT_ID}>מופע סוף שנה</option>
          </select>
          <div className="space-y-3">
            {orders.map((o) => {
              const audits = listPaymentAuditsForOrder(o.id);
              return (
                <Card key={o.id} animated={false}>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {o.userName} · {formatPrice(o.totalPrice)}
                    </p>
                    <p className="mt-1 text-xs text-white/42">
                      {paymentStatusLabel(o.paymentStatus)} · {fulfillmentStatusLabel(o.fulfillmentStatus)}
                      {o.paymentMethod ? ` · ${paymentMethodLabel(o.paymentMethod)}` : ""}
                    </p>
                    {audits.length > 0 ? (
                      <p className="mt-1 text-[10px] text-white/32">
                        אחרון: {audits[0]!.action} · {new Date(audits[0]!.createdAt).toLocaleString("he-IL")}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      {o.paymentStatus !== "paid" ? (
                        <GhostButton className="!text-[11px]" onClick={() => shop.sendPaymentReminder(o.id)}>
                          תזכורת תשלום
                        </GhostButton>
                      ) : null}
                      {o.paymentStatus === "pending" ? (
                        <GhostButton className="!text-[11px]" onClick={() => shop.updateOrderPayment(o.id, "failed")}>
                          סמן נכשל
                        </GhostButton>
                      ) : null}
                      <GhostButton className="!text-[11px]" onClick={() => shop.updateOrderPayment(o.id, "paid")}>
                        סמן שולם
                      </GhostButton>
                      <GhostButton className="!text-[11px]" onClick={() => shop.updateOrderFulfillment(o.id, "ready_for_pickup")}>
                        מוכן לאיסוף
                      </GhostButton>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      ) : null}

      <ProductFormSheet open={formOpen} product={editProduct} onClose={onCloseForm} />
    </div>
  );
}

function ProductFormSheet({ open, product, onClose }: { open: boolean; product?: ShopProduct; onClose: () => void }) {
  const shop = useShop();
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState<ShopProductCategory>(product?.category ?? "studio_wear");
  const [price, setPrice] = useState(String(product?.price ?? 99));
  const [stockStatus, setStockStatus] = useState<ShopStockStatus>(product?.stockStatus ?? "in_stock");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [sizes, setSizes] = useState(product?.availableSizes?.join(", ") ?? "");
  const [colors, setColors] = useState(product?.availableColors?.join(", ") ?? "");

  const save = () => {
    const payload: ShopProductFormPayload = {
      title,
      description,
      category,
      price: Number(price) || 0,
      tags: product?.tags ?? [],
      stockStatus,
      isActive,
      availableSizes: sizes ? sizes.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      availableColors: colors ? colors.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      relatedEventId: product?.relatedEventId
    };
    if (product) shop.updateProduct(product.id, payload);
    else shop.createProduct(payload);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={product ? "עריכת מוצר" : "מוצר חדש"}>
      <div className="space-y-3 pb-4">
        <input className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white" placeholder="שם" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="min-h-[4rem] w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white" placeholder="תיאור" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white" value={category} onChange={(e) => setCategory(e.target.value as ShopProductCategory)}>
          {CAT_OPTS.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
        <input className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white" placeholder="מחיר" value={price} onChange={(e) => setPrice(e.target.value)} />
        <select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white" value={stockStatus} onChange={(e) => setStockStatus(e.target.value as ShopStockStatus)}>
          {STOCK_OPTS.map((s) => (
            <option key={s} value={s}>
              {stockLabel(s)}
            </option>
          ))}
        </select>
        <input className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white" placeholder="מידות (מופרדות בפסיק)" value={sizes} onChange={(e) => setSizes(e.target.value)} />
        <input className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white" placeholder="צבעים" value={colors} onChange={(e) => setColors(e.target.value)} />
        <div className="flex items-center justify-between">
          <Toggle checked={isActive} onChange={setIsActive} aria-label="פעיל" />
          <span className="text-sm text-white/60">מוצר פעיל</span>
        </div>
        <PrimaryButton onClick={save}>שמירה</PrimaryButton>
      </div>
    </BottomSheet>
  );
}
