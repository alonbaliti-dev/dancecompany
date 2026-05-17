import "server-only";

import { requireVerifiedAcademySession, type VerifiedAcademySession } from "@/lib/auth/academy-session";
import type { UserRole } from "@/lib/supabase/types";

export type ProductionRouteId =
  | "ai.complete"
  | "attendance.save"
  | "integrations.health"
  | "media.complete_upload"
  | "media.create_upload_url"
  | "media.list"
  | "media.r2_signed_upload"
  | "shop.products"
  | "users.manage"
  | "notifications.push_subscribe"
  | "notifications.push_test"
  | "payments.create_session"
  | "payments.refund";

export type ProductionHardeningErrorCode =
  | "production_auth_required"
  | "production_session_binding_pending"
  | "forbidden";

export type ProductionRouteGateResult =
  | { ok: true; mode: "local_demo"; session?: never }
  | { ok: true; mode: "verified_session"; session: VerifiedAcademySession }
  | {
      ok: false;
      status: 401 | 403 | 501 | 503;
      error: ProductionHardeningErrorCode;
      message: string;
    };

export type AuditAction =
  | "user.created"
  | "user.updated"
  | "auth.password_reset_requested"
  | "auth.role_changed"
  | "relationship.parent_student_changed"
  | "attendance.updated"
  | "shop.product_changed"
  | "shop.order_changed"
  | "payment.status_changed"
  | "media.visibility_changed"
  | "media.uploaded"
  | "media.deleted"
  | "event.changed"
  | "communication.emergency_sent"
  | "ai.draft_approved"
  | "ai.draft_published"
  | "data.imported"
  | "data.exported"
  | "feature_flag.changed";

export type AuditLogDraft = {
  actorUserId: string;
  academyId: string | null;
  action: AuditAction;
  targetType: string;
  targetId: string;
  occurredAt: string;
  beforeSummary?: Record<string, string | number | boolean | null>;
  afterSummary?: Record<string, string | number | boolean | null>;
  metadata?: Record<string, string | number | boolean | null>;
};

export const phase6AuditActions: readonly AuditAction[] = [
  "user.created",
  "user.updated",
  "auth.password_reset_requested",
  "auth.role_changed",
  "relationship.parent_student_changed",
  "attendance.updated",
  "shop.product_changed",
  "shop.order_changed",
  "payment.status_changed",
  "media.visibility_changed",
  "media.uploaded",
  "media.deleted",
  "event.changed",
  "communication.emergency_sent",
  "ai.draft_approved",
  "ai.draft_published",
  "data.imported",
  "data.exported",
  "feature_flag.changed"
];

const productionOnlyRoutes = new Set<ProductionRouteId>([
  "ai.complete",
  "attendance.save",
  "integrations.health",
  "media.complete_upload",
  "media.create_upload_url",
  "media.list",
  "media.r2_signed_upload",
  "shop.products",
  "users.manage",
  "notifications.push_subscribe",
  "notifications.push_test",
  "payments.create_session",
  "payments.refund"
]);

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

export async function requireProductionSession(
  request: Request,
  route: ProductionRouteId,
  options: { academyId?: string | null; roles?: UserRole[] } = {}
): Promise<ProductionRouteGateResult> {
  if (!productionOnlyRoutes.has(route)) {
    return { ok: false, status: 403, error: "forbidden", message: "This server route is not registered for production access." };
  }

  if ((process.env.AUTH_MODE ?? "local_demo") !== "supabase") {
    if (!isProductionRuntime()) {
      return { ok: true, mode: "local_demo" };
    }

    return {
      ok: false,
      status: 403,
      error: "production_auth_required",
      message: "Production routes require a verified academy session before accessing academy data."
    };
  }

  const session = await requireVerifiedAcademySession(request, { academyId: options.academyId });

  if (session.ok === false) {
    return {
      ok: false,
      status: session.status,
      error: session.status === 503 ? "production_session_binding_pending" : "production_auth_required",
      message: session.message
    };
  }

  if (options.roles?.length && !options.roles.includes(session.session.role)) {
    return {
      ok: false,
      status: 403,
      error: "forbidden",
      message: "The signed-in user does not have permission for this production route."
    };
  }

  return { ok: true, mode: "verified_session", session: session.session };
}
