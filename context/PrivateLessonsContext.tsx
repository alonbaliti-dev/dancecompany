"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useCommunication } from "@/context/CommunicationContext";
import { usePlatform } from "@/context/PlatformContext";
import {
  canManageAvailabilityRequests,
  getManagementUserIds,
  resolveStudentForBooking,
  selectedSlotForRequest
} from "@/lib/private-lessons/availability-logic";
import { privateLessonNotificationContent } from "@/lib/private-lessons/availability-notifications";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { useDomainMutation } from "@/lib/hooks/useDomainMutation";
import * as plOps from "@/lib/domains/private-lessons/operations";
import { privateLessonPriceForDuration } from "@/lib/private-lessons/constants";
import {
  canBookPrivateLessons,
  canManagePrivateLessonProducts,
  canViewTeacherPrivateBookings,
  visiblePrivateProducts
} from "@/lib/private-lessons/logic";
import { createPaymentIntent, recordPaymentAudit, shopPaymentStatusFromTransaction, verifyPayment } from "@/lib/payments/payment-service";
import { shopMethodToProvider } from "@/lib/payments/shop-bridge";
import type {
  PrivateLessonAvailabilityRequest,
  PrivateLessonBooking,
  PrivateLessonBookingStatus,
  PrivateLessonDurationMinutes,
  PrivateLessonPaymentStatus,
  PrivateLessonProduct,
  PrivateLessonRequestPaymentStatus,
  PrivateLessonSuggestedSlot,
  ShopPaymentMethod,
  UserProfile
} from "@/lib/types";

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function mapBookingPaymentStatus(status: ReturnType<typeof shopPaymentStatusFromTransaction>): PrivateLessonPaymentStatus {
  if (status === "paid") return "paid";
  if (status === "failed" || status === "cancelled") return "failed";
  if (status === "refunded") return "refunded";
  return "pending";
}

function mapRequestPaymentStatus(status: ReturnType<typeof shopPaymentStatusFromTransaction>): PrivateLessonRequestPaymentStatus {
  if (status === "paid") return "paid";
  if (status === "failed" || status === "cancelled") return "failed";
  if (status === "refunded") return "refunded";
  return "pending";
}

type BookInput = {
  productId: string;
  durationMinutes: PrivateLessonDurationMinutes;
  requestedDate?: string;
  requestedTime?: string;
  notes?: string;
  paymentMethod: ShopPaymentMethod;
};

type CreateRequestInput = {
  productId: string;
  durationMinutes: PrivateLessonDurationMinutes;
  preferredTimeNotes?: string;
  studentNote?: string;
  studentId?: string;
};

type Ctx = {
  user: UserProfile;
  studioId: string;
  products: PrivateLessonProduct[];
  visibleProducts: PrivateLessonProduct[];
  bookings: PrivateLessonBooking[];
  myBookings: PrivateLessonBooking[];
  teacherBookings: PrivateLessonBooking[];
  availabilityRequests: PrivateLessonAvailabilityRequest[];
  myAvailabilityRequests: PrivateLessonAvailabilityRequest[];
  teacherAvailabilityRequests: PrivateLessonAvailabilityRequest[];
  canBook: boolean;
  canManage: boolean;
  canManageRequests: boolean;
  getProduct: (id: string) => PrivateLessonProduct | undefined;
  getAvailabilityRequest: (id: string) => PrivateLessonAvailabilityRequest | undefined;
  setTeacherProductActive: (teacherId: string, isActive: boolean) => void;
  bookWithPayment: (input: BookInput) => Promise<PrivateLessonBooking | null>;
  confirmPendingPayment: (bookingId: string) => Promise<PrivateLessonBooking | null>;
  updateBookingStatus: (bookingId: string, status: PrivateLessonBookingStatus) => void;
  updateBookingPayment: (bookingId: string, status: PrivateLessonPaymentStatus) => void;
  createAvailabilityRequest: (input: CreateRequestInput) => PrivateLessonAvailabilityRequest | null;
  teacherSuggestSlots: (requestId: string, slots: Omit<PrivateLessonSuggestedSlot, "id">[], note?: string) => void;
  teacherMarkUnavailable: (requestId: string) => void;
  studentSelectSlot: (requestId: string, slotId: string) => void;
  studentRequestOtherTime: (requestId: string, note?: string) => void;
  cancelAvailabilityRequest: (requestId: string) => void;
  payAndReserveRequest: (requestId: string, paymentMethod: ShopPaymentMethod) => Promise<PrivateLessonAvailabilityRequest | null>;
  confirmRequestPayment: (requestId: string) => Promise<PrivateLessonAvailabilityRequest | null>;
  managementSendReminder: (requestId: string) => void;
  managementMarkCoordinated: (requestId: string) => void;
};

const PrivateLessonsContext = createContext<Ctx | null>(null);

export function PrivateLessonsProvider({ user, children }: { user: UserProfile; children: ReactNode }) {
  const { appendAudit, activeStudioId } = usePlatform();
  const { pushNotificationToUsers } = useCommunication();
  const resolvedStudioId = user.permissions.isSuperAdmin ? activeStudioId : user.studioId;

  const { db, setDb } = useLocalDatabase();
  const mutate = useDomainMutation();
  const products = db.privateLessons.products;
  const bookings = db.privateLessons.bookings;
  const availabilityRequests = db.teachersAvailability;

  const setProducts = useCallback(
    (updater: PrivateLessonProduct[] | ((prev: PrivateLessonProduct[]) => PrivateLessonProduct[])) => {
      setDb((prev) => ({
        ...prev,
        privateLessons: {
          ...prev.privateLessons,
          products: typeof updater === "function" ? updater(prev.privateLessons.products) : updater
        }
      }));
    },
    [setDb]
  );

  const setBookings = useCallback(
    (updater: PrivateLessonBooking[] | ((prev: PrivateLessonBooking[]) => PrivateLessonBooking[])) => {
      setDb((prev) => ({
        ...prev,
        privateLessons: {
          ...prev.privateLessons,
          bookings: typeof updater === "function" ? updater(prev.privateLessons.bookings) : updater
        }
      }));
    },
    [setDb]
  );

  const setAvailabilityRequests = useCallback(
    (
      updater:
        | PrivateLessonAvailabilityRequest[]
        | ((prev: PrivateLessonAvailabilityRequest[]) => PrivateLessonAvailabilityRequest[])
    ) => {
      setDb((prev) => ({
        ...prev,
        teachersAvailability: typeof updater === "function" ? updater(prev.teachersAvailability) : updater
      }));
    },
    [setDb]
  );

  const canBook = canBookPrivateLessons(user);
  const canManage = canManagePrivateLessonProducts(user, resolvedStudioId);
  const canManageRequests = canManageAvailabilityRequests(user, resolvedStudioId);

  const notifyPl = useCallback(
    (
      recipientIds: string[],
      kind: Parameters<typeof privateLessonNotificationContent>[0],
      req: PrivateLessonAvailabilityRequest
    ) => {
      const { title, body, priority } = privateLessonNotificationContent(kind, req);
      pushNotificationToUsers(recipientIds, {
        studioId: req.studioId,
        title,
        body,
        createdByUserId: user.id,
        createdByName: user.name,
        priority,
        relatedType: "private_lesson",
        relatedId: req.id,
        createdAt: new Date().toISOString()
      });
    },
    [pushNotificationToUsers, user.id, user.name]
  );

  const patchRequest = useCallback(
    (requestId: string, patch: Partial<PrivateLessonAvailabilityRequest>) => {
      mutate({
        actor: user,
        guard: () => ({ allowed: true }),
        mutate: (d) => plOps.patchAvailabilityRequestInDb(d, requestId, patch)
      });
    },
    [mutate, user]
  );

  const getRequest = useCallback(
    (id: string) => availabilityRequests.find((r) => r.id === id && r.studioId === resolvedStudioId),
    [availabilityRequests, resolvedStudioId]
  );

  const visible = useMemo(
    () => visiblePrivateProducts(products, user, resolvedStudioId).filter((p) => p.isActive),
    [products, user, resolvedStudioId]
  );

  const studioBookings = useMemo(
    () => bookings.filter((b) => b.studioId === resolvedStudioId),
    [bookings, resolvedStudioId]
  );

  const studioRequests = useMemo(
    () =>
      availabilityRequests
        .filter((r) => r.studioId === resolvedStudioId)
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [availabilityRequests, resolvedStudioId]
  );

  const myBookings = useMemo(
    () => studioBookings.filter((b) => b.studentId === user.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [studioBookings, user.id]
  );

  const myAvailabilityRequests = useMemo(
    () =>
      studioRequests.filter(
        (r) => r.requestedByUserId === user.id || r.studentId === user.id
      ),
    [studioRequests, user.id]
  );

  const teacherBookings = useMemo(() => {
    if (user.permissions.isManagement || user.permissions.isSuperAdmin) {
      return [...studioBookings].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    if (user.permissions.isTeacher) {
      return studioBookings.filter((b) => b.teacherId === user.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return [];
  }, [studioBookings, user]);

  const teacherAvailabilityRequests = useMemo(() => {
    if (user.permissions.isManagement || user.permissions.isSuperAdmin) return studioRequests;
    if (user.permissions.isTeacher) return studioRequests.filter((r) => r.teacherId === user.id);
    return [];
  }, [studioRequests, user]);

  const getProduct = useCallback(
    (id: string) => {
      const p = products.find((x) => x.id === id);
      if (!p || p.studioId !== resolvedStudioId) return undefined;
      if (!p.isActive && !canManage) return undefined;
      return p;
    },
    [products, resolvedStudioId, canManage]
  );

  const getAvailabilityRequest = getRequest;

  const setTeacherProductActive = useCallback(
    (teacherId: string, isActive: boolean) => {
      if (!canManage) return;
      const productId = products.find((p) => p.teacherId === teacherId)?.id;
      const input = plOps.buildSetTeacherProductActiveMutation(
        user,
        resolvedStudioId,
        teacherId,
        isActive,
        productId
      );
      mutate({ ...input, actor: user });
    },
    [canManage, products, resolvedStudioId, user, mutate]
  );

  const createAvailabilityRequest = useCallback(
    (input: CreateRequestInput): PrivateLessonAvailabilityRequest | null => {
      if (!canBook) return null;
      const product = getProduct(input.productId);
      if (!product?.isActive) return null;
      const student = resolveStudentForBooking(user, input.studentId);
      if (!student) return null;

      const now = new Date().toISOString();
      const req: PrivateLessonAvailabilityRequest = {
        id: newId("plar"),
        studioId: resolvedStudioId,
        teacherId: product.teacherId,
        teacherName: product.teacherName,
        productId: product.id,
        requestedByUserId: user.id,
        requestedByName: user.name,
        studentId: student.studentId,
        studentName: student.studentName,
        durationMinutes: input.durationMinutes,
        preferredTimeNotes: input.preferredTimeNotes?.trim() || undefined,
        studentNote: input.studentNote?.trim() || undefined,
        status: "waiting_for_teacher",
        paymentStatus: "not_started",
        createdAt: now,
        updatedAt: now
      };

      const built = plOps.buildCreateAvailabilityRequestMutation(
        user,
        resolvedStudioId,
        input,
        product,
        student
      );
      const result = mutate({ ...built, actor: user });
      if (!result.ok) return null;
      const saved =
        result.database.teachersAvailability.find(
          (r) =>
            r.productId === product.id &&
            r.studentId === student.studentId &&
            r.status === "waiting_for_teacher"
        ) ?? req;
      notifyPl([product.teacherId], "request_to_teacher", saved);
      notifyPl(getManagementUserIds(resolvedStudioId), "request_to_teacher", saved);
      return saved;
    },
    [canBook, getProduct, user, resolvedStudioId, notifyPl, mutate]
  );

  const teacherSuggestSlots = useCallback(
    (requestId: string, slots: Omit<PrivateLessonSuggestedSlot, "id">[], note?: string) => {
      const req = getRequest(requestId);
      if (!req) return;
      const input = plOps.buildTeacherSuggestSlotsMutation(
        user,
        requestId,
        req,
        slots,
        resolvedStudioId,
        note
      );
      if (!input) return;
      mutate({ ...input, actor: user });
      const updated: PrivateLessonAvailabilityRequest = {
        ...req,
        teacherSuggestedSlots: slots.map((s) => ({ ...s, id: newId("slot"), note: s.note ?? note })),
        status: "teacher_suggested_time"
      };
      const recipients = [req.requestedByUserId];
      if (req.requestedByUserId !== req.studentId) recipients.push(req.studentId);
      notifyPl([...new Set(recipients)], "teacher_suggested", updated);
    },
    [getRequest, user, resolvedStudioId, notifyPl, mutate]
  );

  const teacherMarkUnavailable = useCallback(
    (requestId: string) => {
      const req = getRequest(requestId);
      if (!req || (req.teacherId !== user.id && !canManageRequests)) return;

      patchRequest(requestId, { status: "not_available" });
      const updated = { ...req, status: "not_available" as const };
      const recipients = [req.requestedByUserId];
      if (req.requestedByUserId !== req.studentId) recipients.push(req.studentId);
      notifyPl([...new Set(recipients)], "unavailable", updated);
      notifyPl(getManagementUserIds(req.studioId), "unavailable", updated);

      appendAudit({
        studioId: req.studioId,
        actorUserId: user.id,
        actorName: user.name,
        action: "מורה סימן שיעור פרטי כלא זמין",
        targetType: "private_lesson_request",
        targetId: requestId,
        severity: "warning"
      });
    },
    [getRequest, user, canManageRequests, patchRequest, notifyPl, appendAudit]
  );

  const studentSelectSlot = useCallback(
    (requestId: string, slotId: string) => {
      const req = getRequest(requestId);
      if (!req) return;
      const isRequester = req.requestedByUserId === user.id || req.studentId === user.id;
      if (!isRequester && !canManageRequests) return;
      if (!req.teacherSuggestedSlots?.some((s) => s.id === slotId)) return;

      patchRequest(requestId, { selectedSlotId: slotId, status: "ready_for_payment" });
      const updated = { ...req, selectedSlotId: slotId, status: "ready_for_payment" as const };
      notifyPl([req.requestedByUserId, req.studentId].filter((id, i, a) => a.indexOf(id) === i), "payment_ready", updated);

      appendAudit({
        studioId: req.studioId,
        actorUserId: user.id,
        actorName: user.name,
        action: "תלמיד בחר מועד לשיעור פרטי",
        targetType: "private_lesson_request",
        targetId: requestId,
        severity: "info"
      });
    },
    [getRequest, user, canManageRequests, patchRequest, notifyPl, appendAudit]
  );

  const studentRequestOtherTime = useCallback(
    (requestId: string, note?: string) => {
      const req = getRequest(requestId);
      if (!req) return;
      const isRequester = req.requestedByUserId === user.id || req.studentId === user.id;
      if (!isRequester) return;

      patchRequest(requestId, {
        status: "student_requested_other_time",
        selectedSlotId: undefined,
        studentNote: note?.trim() ? `${req.studentNote ?? ""}\nבקשה למועד אחר: ${note.trim()}`.trim() : req.studentNote
      });

      const updated = {
        ...req,
        status: "student_requested_other_time" as const,
        selectedSlotId: undefined
      };
      notifyPl([req.teacherId], "student_other_time", updated);

      appendAudit({
        studioId: req.studioId,
        actorUserId: user.id,
        actorName: user.name,
        action: "תלמיד ביקש מועד אחר לשיעור פרטי",
        targetType: "private_lesson_request",
        targetId: requestId,
        severity: "info"
      });
    },
    [getRequest, user, patchRequest, notifyPl, appendAudit]
  );

  const cancelAvailabilityRequest = useCallback(
    (requestId: string) => {
      const req = getRequest(requestId);
      if (!req) return;
      const allowed =
        req.requestedByUserId === user.id ||
        req.studentId === user.id ||
        req.teacherId === user.id ||
        canManageRequests;
      if (!allowed) return;
      if (req.status === "reserved") return;

      patchRequest(requestId, { status: "cancelled" });
      appendAudit({
        studioId: req.studioId,
        actorUserId: user.id,
        actorName: user.name,
        action: "בקשת שיעור פרטי בוטלה",
        targetType: "private_lesson_request",
        targetId: requestId,
        severity: "warning"
      });
    },
    [getRequest, user, canManageRequests, patchRequest, appendAudit]
  );

  const finalizeReservation = useCallback(
    (
      req: PrivateLessonAvailabilityRequest,
      paymentStatus: PrivateLessonRequestPaymentStatus,
      paymentMethod?: ShopPaymentMethod,
      paymentTransactionId?: string
    ) => {
      const slot = selectedSlotForRequest(req);
      const product = products.find((p) => p.id === req.productId);
      if (!slot || !product) return;

      const bookingId = newId("plb");
      const price = privateLessonPriceForDuration(req.durationMinutes);
      const booking: PrivateLessonBooking = {
        id: bookingId,
        studioId: req.studioId,
        studentId: req.studentId,
        studentName: req.studentName,
        teacherId: req.teacherId,
        teacherName: req.teacherName,
        productId: req.productId,
        durationMinutes: req.durationMinutes,
        price,
        currency: "ILS",
        paymentStatus: paymentStatus === "paid" ? "paid" : "pending",
        bookingStatus: "confirmed",
        paymentMethod,
        paymentTransactionId,
        requestedDate: slot.date,
        requestedTime: slot.startTime,
        notes: req.studentNote,
        availabilityRequestId: req.id,
        scheduledDate: slot.date,
        scheduledStartTime: slot.startTime,
        scheduledEndTime: slot.endTime,
        createdAt: new Date().toISOString()
      };

      const input = plOps.buildReservePrivateLessonMutation(
        user,
        req,
        paymentStatus,
        paymentMethod,
        paymentTransactionId,
        products
      );
      if (!input) return;
      mutate({ ...input, actor: user });
      const reservedReq = {
        ...req,
        status: "reserved" as const,
        paymentStatus,
        bookingId,
        selectedSlotId: req.selectedSlotId
      };
      notifyPl([req.teacherId], "reserved", reservedReq);
      notifyPl(getManagementUserIds(req.studioId), "reserved", reservedReq);
    },
    [products, notifyPl, mutate, user]
  );

  const payAndReserveRequest = useCallback(
    async (requestId: string, paymentMethod: ShopPaymentMethod): Promise<PrivateLessonAvailabilityRequest | null> => {
      const req = getRequest(requestId);
      if (!req || req.status !== "ready_for_payment" || !req.selectedSlotId) return null;
      const isRequester = req.requestedByUserId === user.id || req.studentId === user.id;
      if (!isRequester) return null;

      const product = getProduct(req.productId);
      if (!product) return null;

      const price = privateLessonPriceForDuration(req.durationMinutes);
      const normalizedMethod = paymentMethod === "card" ? "credit_card" : paymentMethod;
      let paymentStatus: PrivateLessonRequestPaymentStatus = "pending";
      let paymentTransactionId: string | undefined;

      patchRequest(requestId, { paymentStatus: "pending", paymentMethod: normalizedMethod });

      appendAudit({
        studioId: req.studioId,
        actorUserId: user.id,
        actorName: user.name,
        action: "תשלום שיעור פרטי התחיל",
        targetType: "private_lesson_request",
        targetId: requestId,
        severity: "info"
      });

      if (normalizedMethod === "bank_transfer") {
        paymentStatus = "pending";
      } else {
        // Production payment opens only after a teacher suggests a slot and the student selects it.
        return null;
        const provider = shopMethodToProvider(normalizedMethod);
        if (!provider) return null;

        const intent = await createPaymentIntent({
          studioId: req.studioId,
          orderId: requestId,
          userId: user.id,
          provider,
          amount: price,
          currency: "ILS",
          description: `שיעור פרטי · ${req.teacherName} · ${req.durationMinutes} דק׳`,
          returnUrl: typeof window !== "undefined" ? `${window.location.origin}/?shop=private` : "/",
          checkoutDraft: {
            type: "private_lesson",
            requestId,
            selectedSlotId: req.selectedSlotId,
            teacherId: req.teacherId,
            durationMinutes: req.durationMinutes
          },
          walletSession:
            provider === "apple_pay"
              ? { platform: "apple_pay" }
              : provider === "google_pay"
                ? { platform: "google_pay" }
                : undefined
        });

        paymentStatus = mapRequestPaymentStatus(shopPaymentStatusFromTransaction(intent.transaction.status));
        paymentTransactionId = intent.transaction.id;

        recordPaymentAudit({
          studioId: req.studioId,
          orderId: requestId,
          transactionId: intent.transaction.id,
          action: "payment_initiated",
          actorUserId: user.id,
          actorName: user.name,
          note: `private_lesson_request:${provider}`
        });

        if (intent.redirectUrl && typeof window !== "undefined" && (provider === "bit" || provider === "paybox")) {
          try {
            window.open(intent.redirectUrl, "_blank", "noopener,noreferrer");
          } catch {
            /* manual confirm */
          }
        }
      }

      const fresh = getRequest(requestId);
      if (!fresh) return null;

      patchRequest(requestId, { paymentStatus, paymentTransactionId, paymentMethod: normalizedMethod });

      return getRequest(requestId) ?? null;
    },
    [getRequest, user, getProduct, patchRequest, appendAudit, finalizeReservation]
  );

  const confirmRequestPayment = useCallback(
    async (requestId: string): Promise<PrivateLessonAvailabilityRequest | null> => {
      const req = getRequest(requestId);
      if (!req?.paymentTransactionId) return null;

      const tx = await verifyPayment({ transactionId: req.paymentTransactionId, studioId: req.studioId });
      if (!tx) return null;

      const paymentStatus = mapRequestPaymentStatus(shopPaymentStatusFromTransaction(tx.status));

      recordPaymentAudit({
        studioId: req.studioId,
        orderId: requestId,
        transactionId: tx.id,
        action: paymentStatus === "paid" ? "payment_paid" : "payment_authorized",
        actorUserId: user.id,
        actorName: user.name,
        note: "private_lesson_request"
      });

      if (paymentStatus === "paid") {
        finalizeReservation(req, "paid", req.paymentMethod, req.paymentTransactionId);
      } else {
        patchRequest(requestId, { paymentStatus });
      }

      appendAudit({
        studioId: req.studioId,
        actorUserId: user.id,
        actorName: user.name,
        action: `תשלום שיעור פרטי הושלם: ${paymentStatus}`,
        targetType: "private_lesson_request",
        targetId: requestId,
        severity: "info"
      });

      return getRequest(requestId) ?? null;
    },
    [getRequest, user, finalizeReservation, patchRequest, appendAudit]
  );

  const managementSendReminder = useCallback(
    (requestId: string) => {
      if (!canManageRequests) return;
      const req = getRequest(requestId);
      if (!req) return;
      notifyPl([req.teacherId], "management_reminder", req);
      appendAudit({
        studioId: req.studioId,
        actorUserId: user.id,
        actorName: user.name,
        action: "תזכורת הנהלה למורה — שיעור פרטי",
        targetType: "private_lesson_request",
        targetId: requestId,
        severity: "info"
      });
    },
    [canManageRequests, getRequest, notifyPl, appendAudit, user]
  );

  const managementMarkCoordinated = useCallback(
    (requestId: string) => {
      if (!canManageRequests) return;
      patchRequest(requestId, { managementCoordinated: true });
      appendAudit({
        studioId: resolvedStudioId,
        actorUserId: user.id,
        actorName: user.name,
        action: "בקשת שיעור פרטי סומנה כמתואמת ידנית",
        targetType: "private_lesson_request",
        targetId: requestId,
        severity: "info"
      });
    },
    [canManageRequests, patchRequest, appendAudit, user, resolvedStudioId]
  );

  const bookWithPayment = useCallback(
    async (input: BookInput): Promise<PrivateLessonBooking | null> => {
      if (!canBook) return null;
      const product = getProduct(input.productId);
      if (!product?.isActive) return null;

      const price = privateLessonPriceForDuration(input.durationMinutes);
      const bookingId = newId("plb");
      const normalizedMethod = input.paymentMethod === "card" ? "credit_card" : input.paymentMethod;

      let paymentStatus: PrivateLessonPaymentStatus = "pending";
      let paymentTransactionId: string | undefined;

      if (normalizedMethod === "bank_transfer") {
        paymentStatus = "pending";
      } else {
        const provider = shopMethodToProvider(normalizedMethod);
        if (!provider) return null;

        const intent = await createPaymentIntent({
          studioId: resolvedStudioId,
          orderId: bookingId,
          userId: user.id,
          provider,
          amount: price,
          currency: "ILS",
          description: `שיעור פרטי · ${product.teacherName} · ${input.durationMinutes} דק׳`,
          returnUrl: typeof window !== "undefined" ? `${window.location.origin}/?shop=private` : "/",
          walletSession:
            provider === "apple_pay"
              ? { platform: "apple_pay" }
              : provider === "google_pay"
                ? { platform: "google_pay" }
                : undefined
        });

        paymentStatus = mapBookingPaymentStatus(shopPaymentStatusFromTransaction(intent.transaction.status));
        paymentTransactionId = intent.transaction.id;

        recordPaymentAudit({
          studioId: resolvedStudioId,
          orderId: bookingId,
          transactionId: intent.transaction.id,
          action: "payment_initiated",
          actorUserId: user.id,
          actorName: user.name,
          note: `private_lesson:${provider}`
        });

        if (intent.redirectUrl && typeof window !== "undefined" && (provider === "bit" || provider === "paybox")) {
          try {
            window.open(intent.redirectUrl, "_blank", "noopener,noreferrer");
          } catch {
            /* manual confirm */
          }
        }
      }

      const booking: PrivateLessonBooking = {
        id: bookingId,
        studioId: resolvedStudioId,
        studentId: user.id,
        studentName: user.name,
        teacherId: product.teacherId,
        teacherName: product.teacherName,
        productId: product.id,
        durationMinutes: input.durationMinutes,
        price,
        currency: "ILS",
        paymentStatus,
        bookingStatus: "requested",
        paymentMethod: normalizedMethod,
        paymentTransactionId,
        requestedDate: input.requestedDate,
        requestedTime: input.requestedTime,
        notes: input.notes,
        createdAt: new Date().toISOString()
      };

      setBookings((prev) => [booking, ...prev]);

      appendAudit({
        studioId: resolvedStudioId,
        actorUserId: user.id,
        actorName: user.name,
        action: "שיעור פרטי נרכש",
        targetType: "private_lesson_booking",
        targetId: booking.id,
        severity: "info"
      });

      return booking;
    },
    [canBook, getProduct, resolvedStudioId, user, appendAudit]
  );

  const confirmPendingPayment = useCallback(
    async (bookingId: string): Promise<PrivateLessonBooking | null> => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking?.paymentTransactionId) return null;

      const tx = await verifyPayment({ transactionId: booking.paymentTransactionId, studioId: booking.studioId });
      if (!tx) return null;

      const paymentStatus = mapBookingPaymentStatus(shopPaymentStatusFromTransaction(tx.status));
      let next: PrivateLessonBooking | null = null;
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          next = { ...b, paymentStatus };
          return next;
        })
      );

      return next;
    },
    [bookings]
  );

  const updateBookingStatus = useCallback(
    (bookingId: string, status: PrivateLessonBookingStatus) => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking || !canViewTeacherPrivateBookings(user, booking.teacherId)) return;
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: status } : b)));
    },
    [bookings, user]
  );

  const updateBookingPayment = useCallback(
    (bookingId: string, status: PrivateLessonPaymentStatus) => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking || !canManage) return;
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, paymentStatus: status } : b)));
    },
    [bookings, canManage]
  );

  const value = useMemo(
    () => ({
      user,
      studioId: resolvedStudioId,
      products,
      visibleProducts: visible,
      bookings: studioBookings,
      myBookings,
      teacherBookings,
      availabilityRequests: studioRequests,
      myAvailabilityRequests,
      teacherAvailabilityRequests,
      canBook,
      canManage,
      canManageRequests,
      getProduct,
      getAvailabilityRequest,
      setTeacherProductActive,
      bookWithPayment,
      confirmPendingPayment,
      updateBookingStatus,
      updateBookingPayment,
      createAvailabilityRequest,
      teacherSuggestSlots,
      teacherMarkUnavailable,
      studentSelectSlot,
      studentRequestOtherTime,
      cancelAvailabilityRequest,
      payAndReserveRequest,
      confirmRequestPayment,
      managementSendReminder,
      managementMarkCoordinated
    }),
    [
      user,
      resolvedStudioId,
      products,
      visible,
      studioBookings,
      myBookings,
      teacherBookings,
      studioRequests,
      myAvailabilityRequests,
      teacherAvailabilityRequests,
      canBook,
      canManage,
      canManageRequests,
      getProduct,
      getAvailabilityRequest,
      setTeacherProductActive,
      bookWithPayment,
      confirmPendingPayment,
      updateBookingStatus,
      updateBookingPayment,
      createAvailabilityRequest,
      teacherSuggestSlots,
      teacherMarkUnavailable,
      studentSelectSlot,
      studentRequestOtherTime,
      cancelAvailabilityRequest,
      payAndReserveRequest,
      confirmRequestPayment,
      managementSendReminder,
      managementMarkCoordinated
    ]
  );

  return <PrivateLessonsContext.Provider value={value}>{children}</PrivateLessonsContext.Provider>;
}

export function usePrivateLessons() {
  const ctx = useContext(PrivateLessonsContext);
  if (!ctx) throw new Error("usePrivateLessons requires PrivateLessonsProvider");
  return ctx;
}
