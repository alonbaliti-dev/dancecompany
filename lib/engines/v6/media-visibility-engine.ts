import type { V6Database, V6MediaItem, V6User } from "@/lib/v6/types";
import { canV6ViewMedia } from "@/lib/domains/media/guards";

export function visibleV6MediaForActor(db: V6Database, actor: V6User) {
  return db.media.filter((item) => canV6ViewMedia(actor, item));
}

export function explainV6MediaVisibility(item: V6MediaItem) {
  if (item.visibility === "group") return "קבוצה ותלמידים/הורים מורשים בלבד";
  if (item.visibility === "staff") return "צוות בלבד";
  if (item.visibility === "management") return "הנהלה בלבד";
  return "תצוגת חנות ציבורית במערכת";
}
