"use client";

import { useMemo, useState } from "react";
import { Film, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import type { MediaItem, MediaVisibility } from "@/lib/media/media-types";
import { canManageMedia, canViewMedia } from "@/lib/services/media-service";
import type { V2Group, V2Product, V2User } from "@/lib/v2/types";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const visibilityLabel: Record<MediaVisibility, string> = {
  specific_group: "קבוצה",
  specific_students: "תלמידים",
  parents: "הורים",
  teachers_only: "מורים",
  staff_only: "צוות",
  management_only: "הנהלה",
  shop_public: "חנות",
  studio_legacy_public: "מורשת"
};

export function MediaLibrary({
  user,
  items,
  groups,
  products,
  onUpdate,
  onArchive
}: {
  user: V2User;
  items: MediaItem[];
  groups: V2Group[];
  products: V2Product[];
  onUpdate?: (item: MediaItem) => void;
  onArchive?: (item: MediaItem) => void;
}) {
  const [type, setType] = useState<"all" | "image" | "video">("all");
  const [tag, setTag] = useState("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const tags = useMemo(() => [...new Set(items.flatMap((item) => item.tags))], [items]);
  const visible = useMemo(
    () =>
      items
        .filter((item) => canViewMedia(user, item))
        .filter((item) => type === "all" || item.mediaType === type)
        .filter((item) => tag === "all" || item.tags.includes(tag)),
    [items, tag, type, user]
  );

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="flex flex-wrap justify-end gap-2">
        {(["all", "image", "video"] as const).map((id) => (
          <button key={id} onClick={() => setType(id)} className={cx("rounded-full border px-3 py-1.5 text-xs font-bold", type === id ? "border-white/25 bg-white text-black" : "border-white/[0.09] bg-white/[0.035] text-white/50")}>
            {id === "all" ? "הכול" : id === "image" ? "תמונות" : "וידאו"}
          </button>
        ))}
        <select value={tag} onChange={(e) => setTag(e.target.value)} className="rounded-full border border-white/[0.09] bg-black/28 px-3 py-1.5 text-xs text-white">
          <option value="all" className="bg-zinc-950">כל התגיות</option>
          {tags.map((item) => <option key={item} value={item} className="bg-zinc-950">{item}</option>)}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => {
          const Icon = item.mediaType === "video" ? Film : ImageIcon;
          return (
            <button key={item.id} onClick={() => setSelected(item)} className="overflow-hidden rounded-[24px] border border-white/[0.085] bg-white/[0.04] text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition active:scale-[0.99]">
              <div className="grid aspect-video place-items-center bg-black/30">
                {item.localPreviewUrl ? (
                  item.mediaType === "video" ? <video src={item.localPreviewUrl} className="h-full w-full object-cover" /> : <img src={item.localPreviewUrl} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <Icon className="text-white/28" size={34} />
                )}
              </div>
              <div className="p-3">
                <p className="truncate font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-white/38">{visibilityLabel[item.visibility]} · {item.uploadStatus}</p>
              </div>
            </button>
          );
        })}
      </div>

      {!visible.length ? (
        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-8 text-center text-sm text-white/42">
          אין מדיה להצגה לפי המסנן הנוכחי.
        </div>
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-[85] flex items-end bg-black/68 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-safe backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/[0.1] bg-zinc-950 p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <button onClick={() => setSelected(null)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/60">סגירה</button>
              <div>
                <p className="text-xl font-semibold text-white">{selected.title}</p>
                <p className="mt-1 text-xs text-white/42">{selected.fileName}</p>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-[22px] border border-white/[0.08] bg-black/30">
              {selected.localPreviewUrl ? (
                selected.mediaType === "video" ? <video src={selected.localPreviewUrl} controls className="max-h-80 w-full object-contain" /> : <img src={selected.localPreviewUrl} alt={selected.title} className="max-h-80 w-full object-contain" />
              ) : (
                <div className="grid h-48 place-items-center"><ImageIcon className="text-white/28" size={36} /></div>
              )}
            </div>
            <div className="mt-4 space-y-2 text-sm text-white/52">
              <p>{selected.description || "אין תיאור"}</p>
              <p>תגיות: {selected.tags.join(", ") || "אין"}</p>
              <p>קבוצות: {(selected.linkedGroupIds ?? []).map((id) => groups.find((g) => g.id === id)?.name).filter(Boolean).join(", ") || "לא משויך"}</p>
              <p>מוצר: {products.find((p) => p.id === selected.linkedProductId)?.title ?? "לא משויך"}</p>
            </div>
            {canManageMedia(user, selected) ? (
              <div className="mt-4 flex gap-2">
                <button onClick={() => onUpdate?.(selected)} className="rounded-[18px] border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white">
                  <span className="inline-flex items-center gap-2"><Pencil size={15} /> עריכה</span>
                </button>
                <button onClick={() => { onArchive?.(selected); setSelected(null); }} className="rounded-[18px] border border-rose-200/20 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-100">
                  <span className="inline-flex items-center gap-2"><Trash2 size={15} /> ארכוב</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

