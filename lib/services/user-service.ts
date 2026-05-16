/**
 * User service — mock. Supabase: `from('users').select().eq('studio_id', studioId)`.
 */
import { getDirectoryUsers } from "@/lib/directory-store";
import type { DirectoryUser, UserProfile } from "@/lib/types";

export const userService = {
  listByStudio(studioId: string): DirectoryUser[] {
    return getDirectoryUsers().filter((u) => u.studioId === studioId);
  },
  getById(userId: string): UserProfile | undefined {
    return getDirectoryUsers().find((u) => u.id === userId);
  }
};
