"use client";

import { Film, Image as ImageIcon } from "lucide-react";
import type { MediaItem } from "@/lib/media/media-types";

export function MediaPicker({
  items,
  selectedId,
  onSelect
}: {
  items: MediaItem[];
  selectedId?: string;
  onSelect: (item: MediaItem) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2" dir="rtl">
      {items.map((item) => {
        const active = selectedId === item.id;
        const Icon = item.mediaType === "video" ? Film : ImageIcon;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`flex items-center gap-3 rounded-[18px] border px-3 py-3 text-right transition ${
              active ? "border-emerald-200/35 bg-emerald-300/12" : "border-white/[0.08] bg-white/[0.035]"
            }`}
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-black/30">
              {item.localPreviewUrl && item.mediaType === "image" ? (
                <img src={item.localPreviewUrl} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <Icon className="text-white/36" size={18} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-0.5 truncate text-xs text-white/38">{item.fileName}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

