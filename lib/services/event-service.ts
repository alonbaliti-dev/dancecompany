/**
 * Studio events & legacy board — mock. Supabase: `studio_events`, `event_achievements`.
 */
import type { StudioEvent } from "@/lib/types";

export const eventService = {
  listByStudio(studioId: string): Promise<StudioEvent[]> {
    void studioId;
    return Promise.resolve([]);
  },

  getById(studioId: string, eventId: string): Promise<StudioEvent | null> {
    void studioId;
    void eventId;
    return Promise.resolve(null);
  }
};
