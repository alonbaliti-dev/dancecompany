import type { V6Database, V6MediaItem, V6User } from "@/lib/v6/types";
import { canV6ViewMedia } from "./guards";
import { dedupeById, dedupeByCompositeKey } from "@/lib/v6/dedupe";

export function selectV6MediaForActor(db: V6Database, actor: V6User) {
  const media = dedupeByCompositeKey(dedupeById(db.media), (item) => `${item.studioId}:${item.title}:${item.fileName}:${item.mediaType}:${item.linkedGroupId ?? ""}:${item.linkedProductId ?? ""}`);
  return media.filter((item) => canV6ViewMedia(actor, item));
}

export function selectV6MediaByGroup(db: V6Database, actor: V6User, groupId: string) {
  return selectV6MediaForActor(db, actor).filter((item: V6MediaItem) => item.linkedGroupId === groupId);
}
