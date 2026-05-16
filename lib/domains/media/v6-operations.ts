import type { V6MediaItem, V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied } from "../core/v6";
import { canV6ManageMedia, canV6UploadMedia } from "./guards";

export function buildV6SaveMediaOperation(actor: V6User, media: V6MediaItem) {
  if (!canV6UploadMedia(actor) && !canV6ManageMedia(actor, media)) return v6Denied("אין הרשאה לניהול מדיה");
  return v6Allowed({ media });
}
