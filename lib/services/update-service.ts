/**
 * Studio updates (broadcast messages) — mock. Supabase: `studio_updates` + fan-out to notifications.
 */
import type { StudioUpdate, UserProfile } from "@/lib/types";

export const updateService = {
  listVisible(user: UserProfile): Promise<StudioUpdate[]> {
    void user;
    return Promise.resolve([]);
  },

  /** Edge Function: resolve recipients, insert notifications, audit log */
  create(_row: Omit<StudioUpdate, "id" | "readByUserIds">): Promise<StudioUpdate> {
    throw new Error("updateService.create: use StudioDataContext until Supabase migration");
  }
};
