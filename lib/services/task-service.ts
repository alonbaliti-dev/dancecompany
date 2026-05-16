/** Tasks — mock. Supabase: `from('tasks').eq('studio_id', id)`. */
export const taskService = {
  listForStudio(_studioId: string) {
    return [];
  }
};
