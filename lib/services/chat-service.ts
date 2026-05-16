/**
 * Group chats — mock. Supabase: `group_chats` + `chat_messages` + Realtime channel.
 */
import type { DanceGroupChat, UserProfile } from "@/lib/types";

export const chatService = {
  /** `.from('group_chats').select().eq('studio_id', studioId)` + membership join */
  listAccessible(_user: UserProfile): Promise<DanceGroupChat[]> {
    return Promise.resolve([]);
  },

  /** `supabase.channel('chat:' + chatId).on('postgres_changes', ...)` */
  subscribeMessages(_chatId: string, _onMessage: (payload: unknown) => void): () => void {
    return () => {};
  }
};
