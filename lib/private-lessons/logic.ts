import { formatPrice } from "@/lib/shop-logic";
import type {
  PrivateLessonBooking,
  PrivateLessonBookingStatus,
  PrivateLessonPaymentStatus,
  PrivateLessonProduct,
  UserProfile
} from "@/lib/types";
import { privateLessonPriceForDuration } from "./constants";

export function privateLessonProductId(teacherId: string): string {
  return `pl_${teacherId}`;
}

export function priceLabelForDuration(minutes: 30 | 45): string {
  return formatPrice(privateLessonPriceForDuration(minutes));
}

export function bookingPaymentLabel(status: PrivateLessonPaymentStatus): string {
  const map: Record<PrivateLessonPaymentStatus, string> = {
    pending: "ממתין לתשלום",
    paid: "שולם",
    failed: "נכשל",
    refunded: "הוחזר"
  };
  return map[status];
}

export function bookingStatusLabel(status: PrivateLessonBookingStatus): string {
  const map: Record<PrivateLessonBookingStatus, string> = {
    requested: "בקשה חדשה",
    confirmed: "אושר",
    completed: "הושלם",
    cancelled: "בוטל"
  };
  return map[status];
}

export function filterPrivateLessonBookings(
  bookings: PrivateLessonBooking[],
  filters: {
    teacherId?: string;
    paymentStatus?: PrivateLessonPaymentStatus | "all";
    bookingStatus?: PrivateLessonBookingStatus | "all";
  }
): PrivateLessonBooking[] {
  return bookings.filter((b) => {
    if (filters.teacherId && b.teacherId !== filters.teacherId) return false;
    if (filters.paymentStatus && filters.paymentStatus !== "all" && b.paymentStatus !== filters.paymentStatus) return false;
    if (filters.bookingStatus && filters.bookingStatus !== "all" && b.bookingStatus !== filters.bookingStatus) return false;
    return true;
  });
}

export function privateLessonRevenueSummary(bookings: PrivateLessonBooking[]) {
  const paid = bookings.filter((b) => b.paymentStatus === "paid");
  const pending = bookings.filter((b) => b.paymentStatus === "pending");
  const totalRevenue = paid.reduce((sum, b) => sum + b.price, 0);
  const pendingTotal = pending.reduce((sum, b) => sum + b.price, 0);
  return {
    paidCount: paid.length,
    pendingCount: pending.length,
    totalRevenue,
    pendingTotal,
    requestedCount: bookings.filter((b) => b.bookingStatus === "requested").length
  };
}

export function canBookPrivateLessons(user: UserProfile): boolean {
  return !user.permissions.isSuperAdmin && (user.permissions.isStudent || user.isParent);
}

export function canManagePrivateLessonProducts(user: UserProfile, studioId: string): boolean {
  if (user.permissions.isSuperAdmin) return true;
  return user.studioId === studioId && user.permissions.isManagement && user.permissions.canManageUsers;
}

export function canViewTeacherPrivateBookings(user: UserProfile, teacherId: string): boolean {
  if (user.permissions.isManagement || user.permissions.isSuperAdmin) return true;
  return user.permissions.isTeacher && user.id === teacherId;
}

export function visiblePrivateProducts(products: PrivateLessonProduct[], user: UserProfile, studioId: string): PrivateLessonProduct[] {
  return products.filter((p) => {
    if (p.studioId !== studioId) return false;
    if (!p.isActive && !canManagePrivateLessonProducts(user, studioId)) return false;
    return p.isActive || canManagePrivateLessonProducts(user, studioId);
  });
}

export function teacherInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`;
  return name.slice(0, 2);
}
