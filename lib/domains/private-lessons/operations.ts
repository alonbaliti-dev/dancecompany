import type { LocalDatabase } from "@/lib/local-db/db-types";
import {
  canManageAvailabilityRequests,
  resolveStudentForBooking
} from "@/lib/private-lessons/availability-logic";
import { privateLessonPriceForDuration } from "@/lib/private-lessons/constants";
import { canBookPrivateLessons, canManagePrivateLessonProducts } from "@/lib/private-lessons/logic";
import { selectedSlotForRequest } from "@/lib/private-lessons/availability-logic";
import { guard } from "@/lib/security/guards";
import type {
  PrivateLessonAvailabilityRequest,
  PrivateLessonBooking,
  PrivateLessonDurationMinutes,
  PrivateLessonProduct,
  PrivateLessonRequestPaymentStatus,
  PrivateLessonSuggestedSlot,
  ShopPaymentMethod,
  UserProfile
} from "@/lib/types";
import { domainGuards } from "../core/permissions";
import type { DomainMutationInput } from "../core/types";

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function patchAvailabilityRequestInDb(
  db: LocalDatabase,
  requestId: string,
  patch: Partial<PrivateLessonAvailabilityRequest>
): LocalDatabase {
  return {
    ...db,
    teachersAvailability: db.teachersAvailability.map((r) =>
      r.id === requestId ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r
    )
  };
}

export function buildCreateAvailabilityRequestMutation(
  actor: UserProfile,
  studioId: string,
  input: {
    productId: string;
    durationMinutes: PrivateLessonDurationMinutes;
    preferredTimeNotes?: string;
    studentNote?: string;
    studentId?: string;
  },
  product: PrivateLessonProduct,
  student: { studentId: string; studentName: string }
): DomainMutationInput {
  const now = new Date().toISOString();
  const req: PrivateLessonAvailabilityRequest = {
    id: newId("plar"),
    studioId,
    teacherId: product.teacherId,
    teacherName: product.teacherName,
    productId: product.id,
    requestedByUserId: actor.id,
    requestedByName: actor.name,
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
  return {
    actor,
    guard: guard(canBookPrivateLessons(actor), "אין הרשאה לבקש שיעור פרטי"),
    mutate: (db) => ({ ...db, teachersAvailability: [req, ...db.teachersAvailability] }),
    audit: {
      action: "נוצרה בקשת זמינות לשיעור פרטי",
      targetType: "private_lesson_request",
      targetId: req.id,
      severity: "info"
    },
    activity: {
      kind: "private_lesson",
      messageHe: `בקשת שיעור פרטי: ${product.teacherName}`,
      relatedType: "private_lesson_request",
      relatedId: req.id
    }
  };
}

export function buildPatchAvailabilityRequestMutation(
  actor: UserProfile,
  requestId: string,
  patch: Partial<PrivateLessonAvailabilityRequest>,
  audit: DomainMutationInput["audit"]
): DomainMutationInput {
  return {
    actor,
    guard: () => ({ allowed: true }),
    mutate: (db) => patchAvailabilityRequestInDb(db, requestId, patch),
    audit
  };
}

export function buildReservePrivateLessonMutation(
  actor: UserProfile,
  req: PrivateLessonAvailabilityRequest,
  paymentStatus: PrivateLessonRequestPaymentStatus,
  paymentMethod?: ShopPaymentMethod,
  paymentTransactionId?: string,
  products: PrivateLessonProduct[] = []
): DomainMutationInput | null {
  const slot = selectedSlotForRequest(req);
  const product = products.find((p) => p.id === req.productId);
  if (!slot || !product) return null;

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

  return {
    actor,
    guard: () => ({ allowed: true }),
    mutate: (db) => {
      let next = patchAvailabilityRequestInDb(db, req.id, {
        status: "reserved",
        paymentStatus,
        paymentMethod,
        paymentTransactionId,
        bookingId
      });
      next = {
        ...next,
        privateLessons: {
          ...next.privateLessons,
          bookings: [booking, ...next.privateLessons.bookings]
        }
      };
      return next;
    },
    audit: {
      action: "שיעור פרטי שוריין לאחר תשלום",
      targetType: "private_lesson_request",
      targetId: req.id,
      severity: "info"
    },
    activity: {
      kind: "private_lesson",
      messageHe: `שיעור פרטי שוריין: ${req.teacherName}`,
      relatedType: "private_lesson_booking",
      relatedId: bookingId
    }
  };
}

export function buildSetTeacherProductActiveMutation(
  actor: UserProfile,
  studioId: string,
  teacherId: string,
  isActive: boolean,
  productId?: string
): DomainMutationInput {
  return {
    actor,
    guard: guard(canManagePrivateLessonProducts(actor, studioId)),
    mutate: (db) => ({
      ...db,
      privateLessons: {
        ...db.privateLessons,
        products: db.privateLessons.products.map((p) =>
          p.teacherId === teacherId ? { ...p, isActive } : p
        )
      }
    }),
    audit: {
      action: isActive ? "שיעור פרטי הופעל למורה" : "שיעור פרטי הושבת למורה",
      targetType: "private_lesson_product",
      targetId: productId ?? teacherId,
      severity: isActive ? "info" : "warning"
    }
  };
}

export function canActorManageRequest(
  actor: UserProfile,
  req: PrivateLessonAvailabilityRequest,
  studioId: string
): boolean {
  return (
    req.teacherId === actor.id ||
    canManageAvailabilityRequests(actor, studioId) ||
    actor.permissions.isSuperAdmin
  );
}

export function buildTeacherSuggestSlotsMutation(
  actor: UserProfile,
  requestId: string,
  req: PrivateLessonAvailabilityRequest,
  slots: Omit<PrivateLessonSuggestedSlot, "id">[],
  studioId: string,
  note?: string
): DomainMutationInput | null {
  if (!canActorManageRequest(actor, req, studioId) || !slots.length) return null;
  const teacherSuggestedSlots: PrivateLessonSuggestedSlot[] = slots.map((s) => ({
    ...s,
    id: newId("slot"),
    note: s.note ?? note
  }));
  return buildPatchAvailabilityRequestMutation(
    actor,
    requestId,
    { teacherSuggestedSlots, status: "teacher_suggested_time" },
    {
      action: "מורה הציע מועדים לשיעור פרטי",
      targetType: "private_lesson_request",
      targetId: requestId,
      severity: "info"
    }
  );
}
