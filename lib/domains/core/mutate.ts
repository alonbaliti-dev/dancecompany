import { appendAuditToDb } from "@/lib/local-db/audit-entry";
import type { LocalDatabase } from "@/lib/local-db/db-types";
import { logActivity } from "@/lib/services/activity-feed-service";
import { enqueueAction } from "@/lib/services/sync-queue-service";
import type { GuardResult } from "@/lib/security/guards";
import type { DomainMutationInput, DomainMutationResult } from "./types";

function resolveGuard(guard: GuardResult | (() => GuardResult)): GuardResult {
  return typeof guard === "function" ? guard() : guard;
}

/**
 * Pure domain write — validate guard, mutate DB, append audit/activity/sync queue.
 */
export function runDomainMutation(
  db: LocalDatabase,
  input: DomainMutationInput
): DomainMutationResult {
  const guardResult = resolveGuard(input.guard);
  if (guardResult.allowed === false) {
    return { ok: false, reason: guardResult.reason };
  }

  let next = input.mutate(db);

  if (input.audit) {
    next = appendAuditToDb(next, input.actor, {
      studioId: input.audit.studioId ?? input.actor.studioId,
      action: input.audit.action,
      targetType: input.audit.targetType,
      targetId: input.audit.targetId,
      severity: input.audit.severity
    });
  }

  if (input.activity) {
    next = logActivity(next, input.actor.studioId, input.activity.kind, input.activity.messageHe, {
      actorUserId: input.actor.id,
      actorName: input.actor.name,
      visibility: input.activity.visibility,
      relatedType: input.activity.relatedType,
      relatedId: input.activity.relatedId,
      targetUserIds: input.activity.targetUserIds,
      targetGroupIds: input.activity.targetGroupIds,
      messageEn: input.activity.messageEn
    });
  }

  if (input.sync) {
    next = enqueueAction(next, {
      studioId: input.actor.studioId,
      userId: input.actor.id,
      actionType: input.sync.actionType,
      payload: input.sync.payload
    });
  }

  return { ok: true, database: next };
}
