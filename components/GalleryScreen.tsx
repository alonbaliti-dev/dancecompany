"use client";

import { useMemo } from "react";
import { ChevronLeft, Pin, Play } from "lucide-react";
import { useCommunication } from "@/context/CommunicationContext";
import { useStudioOS } from "@/context/StudioOSContext";
import { GALLERY_SECTIONS, gallerySectionForItem, groupNameForGalleryItem, visibilityLabel } from "@/lib/gallery-permissions";
import type { GalleryItem } from "@/lib/types";
import { Card, Header, PrimaryButton, SectionEyebrow, cx } from "./ui";

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <Card animated={false} className={cx("overflow-hidden !p-0", item.isPinned && "border-amber-400/20")}>
      <div className="flex gap-3 p-3">
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent">
          <Play size={22} className="text-emerald-200/80" />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {item.isPinned ? <Pin size={12} className="text-amber-200/80" /> : null}
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/45">{visibilityLabel(item.visibility)}</span>
          </div>
          <p className="mt-1 font-semibold text-white">{item.title}</p>
          <p className="mt-0.5 text-xs text-white/40">{groupNameForGalleryItem(item)} · {item.createdByName}</p>
          {item.tags.length ? <p className="mt-1 text-[10px] text-white/32">{item.tags.join(" · ")}</p> : null}
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <button type="button" className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">צפייה</button>
            <button type="button" className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/45">שמירה למשימה</button>
          </div>
        </div>
        <ChevronLeft className="shrink-0 self-center text-white/20" size={18} />
      </div>
    </Card>
  );
}

export function GalleryScreen({ onUpload }: { onUpload?: () => void }) {
  const { user, accessibleGallery, canManageGallery } = useCommunication();
  const { gallerySearch, setGallerySearch } = useStudioOS();
  const staff = user.permissions.isTeacher || user.permissions.isManagement;

  const bySection = useMemo(() => {
    const q = gallerySearch.trim().toLowerCase();
    const map = new Map<string, GalleryItem[]>();
    for (const s of GALLERY_SECTIONS) {
      if (s.staffOnly && !staff) continue;
      map.set(s.id, []);
    }
    for (const item of accessibleGallery) {
      if (q) {
        const year = new Date(item.createdAt).getFullYear();
        const hay = `${item.title} ${item.tags.join(" ")} ${year}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }
      const sec = gallerySectionForItem(item);
      if (sec === "staff_only" && !staff) continue;
      const list = map.get(sec) ?? [];
      list.push(item);
      map.set(sec, list);
    }
    for (const [, list] of map) list.sort((a, b) => (a.isPinned === b.isPinned ? +new Date(b.createdAt) - +new Date(a.createdAt) : a.isPinned ? -1 : 1));
    return map;
  }, [accessibleGallery, staff, gallerySearch]);

  return (
    <div className="space-y-8 pb-6">
      <Header title="גלריית חומרים" subtitle="ספריית וידאו וחומרי תרגול — מסודרים לפי קבוצה ומטרה." />
      <input
        type="search"
        value={gallerySearch}
        onChange={(e) => setGallerySearch(e.target.value)}
        placeholder="חיפוש לפי כותרת, תגית או שנה..."
        className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-right text-white outline-none placeholder:text-white/30 focus:border-emerald-400/35"
      />
      {canManageGallery && onUpload ? (
        <PrimaryButton onClick={onUpload}>העלאה / שמירה לגלריה</PrimaryButton>
      ) : null}
      {GALLERY_SECTIONS.filter((s) => !s.staffOnly || staff).map((section) => {
        const items = bySection.get(section.id) ?? [];
        if (!items.length && section.id !== "my_group") return null;
        return (
          <div key={section.id}>
            <SectionEyebrow>{section.title}</SectionEyebrow>
            <p className="mt-1 text-sm text-white/40">{section.subtitle}</p>
            <div className="mt-3 space-y-2">
              {items.length ? items.map((item) => <GalleryCard key={item.id} item={item} />) : (
                <Card animated={false}><p className="py-6 text-center text-sm text-white/35">אין חומרים בסעיף זה.</p></Card>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
