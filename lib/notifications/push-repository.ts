import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type PushSubscriptionDraft = {
  academyId: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh?: string;
    auth?: string;
  };
  userAgent?: string;
};

export type NotificationPreferenceDraft = {
  academyId: string;
  userId: string;
  parentUpdates: boolean;
  eventReminders: boolean;
  urgentAlerts: boolean;
  paymentConfirmations: boolean;
};

const localSubscriptions = new Map<string, PushSubscriptionDraft>();

export async function savePushSubscription(draft: PushSubscriptionDraft) {
  const supabase = getSupabaseServerClient({ preferServiceRole: true });
  if (!supabase.enabled) {
    localSubscriptions.set(`${draft.academyId}:${draft.userId}:${draft.endpoint}`, draft);
    return { ok: true as const, mode: "local_demo" as const };
  }

  return {
    ok: false as const,
    mode: "supabase_placeholder" as const,
    reason: "push_subscriptions_table_not_applied"
  };
}

export async function saveNotificationPreferences(draft: NotificationPreferenceDraft) {
  const supabase = getSupabaseServerClient({ preferServiceRole: true });
  if (!supabase.enabled) return { ok: true as const, mode: "local_demo" as const, preferences: draft };

  return {
    ok: false as const,
    mode: "supabase_placeholder" as const,
    reason: "notification_preferences_table_not_applied"
  };
}
