"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, ImagePlus, Trash2, Upload } from "lucide-react";
import { MEDIA_ACCEPT, MEDIA_LIMITS, MEDIA_TAG_OPTIONS, type MediaItem, type MediaUploadDraft, type MediaVisibility } from "@/lib/media/media-types";
import { canUploadMedia, createLocalMediaItem } from "@/lib/services/media-service";
import type { V2Group, V2Product, V2User } from "@/lib/v2/types";
import { UploadProgressCard } from "./UploadProgressCard";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const visibilityOptions: Array<{ id: MediaVisibility; label: string }> = [
  { id: "specific_group", label: "לקבוצה בלבד" },
  { id: "parents", label: "לתלמידים ולהורים" },
  { id: "staff_only", label: "צוות בלבד" },
  { id: "teachers_only", label: "מורים בלבד" },
  { id: "management_only", label: "הנהלה בלבד" },
  { id: "shop_public", label: "חנות" },
  { id: "studio_legacy_public", label: "מורשת סטודיו" }
];

export function MediaUploader({
  user,
  groups,
  products = [],
  mode = "group",
  onSave,
  onCancel
}: {
  user: V2User;
  groups: V2Group[];
  products?: V2Product[];
  mode?: "group" | "product" | "library";
  onSave: (item: MediaItem) => void;
  onCancel?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const captureRef = useRef<HTMLInputElement>(null);
  const allowedGroups = useMemo(
    () => (user.role === "teacher" ? groups.filter((g) => user.groupIds.includes(g.id)) : groups),
    [groups, user]
  );
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState(allowedGroups[0]?.id ?? "");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [visibility, setVisibility] = useState<MediaVisibility>(mode === "product" ? "shop_public" : "specific_group");
  const [tags, setTags] = useState<string[]>(["שיעור"]);
  const [status, setStatus] = useState<"idle" | "ready" | "failed">("idle");

  function chooseFile(next?: File) {
    if (!next) return;
    const url = URL.createObjectURL(next);
    setFile(next);
    setPreviewUrl(url);
    setTitle((prev) => prev || next.name.replace(/\.[^.]+$/, ""));
    setStatus("ready");
  }

  function save() {
    if (!file) {
      setStatus("failed");
      return;
    }
    const draft: MediaUploadDraft = {
      title,
      description,
      visibility,
      linkedGroupIds: mode === "product" ? undefined : groupId ? [groupId] : undefined,
      linkedProductId: mode === "product" ? productId : undefined,
      tags
    };
    const target = {
      studioId: user.studioId,
      groupIds: draft.linkedGroupIds,
      productId: draft.linkedProductId,
      visibility
    };
    if (!canUploadMedia(user, target)) {
      setStatus("failed");
      return;
    }
    onSave(createLocalMediaItem({ user, file, draft, localPreviewUrl: previewUrl }));
    setFile(null);
    setPreviewUrl("");
    setTitle("");
    setDescription("");
    setStatus("idle");
  }

  const largeVideoWarning = file?.type.startsWith("video/") && file.size > MEDIA_LIMITS.videoWarningBytes;

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="rounded-[26px] border border-dashed border-white/[0.14] bg-white/[0.035] p-4">
        {previewUrl ? (
          <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-black/30">
            {file?.type.startsWith("video/") ? (
              <video src={previewUrl} controls className="max-h-72 w-full object-cover" />
            ) : (
              <img src={previewUrl} alt={title || "תצוגה מקדימה"} className="max-h-72 w-full object-cover" />
            )}
          </div>
        ) : (
          <div className="grid min-h-44 place-items-center rounded-[22px] bg-black/22">
            <div className="text-center">
              <ImagePlus className="mx-auto text-white/35" size={34} />
              <p className="mt-3 text-sm font-semibold text-white">בחרו תמונה או וידאו</p>
              <p className="mt-1 text-xs text-white/40">JPG, PNG, WEBP, MP4, MOV, WEBM</p>
            </div>
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => inputRef.current?.click()} className="rounded-[18px] bg-emerald-200 px-4 py-2.5 text-sm font-bold text-zinc-950">
            <span className="inline-flex items-center gap-2"><Upload size={16} /> בחירה מהמכשיר</span>
          </button>
          <button onClick={() => captureRef.current?.click()} className="rounded-[18px] border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-white">
            <span className="inline-flex items-center gap-2"><Camera size={16} /> צילום</span>
          </button>
          {file ? (
            <button onClick={() => { setFile(null); setPreviewUrl(""); }} className="rounded-[18px] border border-rose-200/20 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-100">
              <span className="inline-flex items-center gap-2"><Trash2 size={16} /> הסרה</span>
            </button>
          ) : null}
        </div>
        <input ref={inputRef} type="file" accept={MEDIA_ACCEPT} className="hidden" onChange={(e) => chooseFile(e.target.files?.[0])} />
        <input ref={captureRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={(e) => chooseFile(e.target.files?.[0])} />
      </div>

      <UploadProgressCard status={status === "failed" ? "failed" : file ? "ready" : "queued"} fileName={file?.name} fileSize={file?.size} />
      {largeVideoWarning ? <p className="rounded-2xl border border-amber-200/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">הווידאו גדול. בפרודקשן מומלץ לדחוס ולייצר תמונות ממוזערות בצד שרת.</p> : null}

      <label className="block">
        <span className="text-xs font-bold text-white/42">כותרת</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/28 px-4 py-3 text-right text-white outline-none" />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-white/42">תיאור</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-20 w-full rounded-[18px] border border-white/[0.09] bg-black/28 px-4 py-3 text-right text-white outline-none" />
      </label>

      {mode === "product" ? (
        <label className="block">
          <span className="text-xs font-bold text-white/42">מוצר</span>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/28 px-4 py-3 text-white">
            {products.map((product) => <option key={product.id} value={product.id} className="bg-zinc-950">{product.title}</option>)}
          </select>
        </label>
      ) : (
        <label className="block">
          <span className="text-xs font-bold text-white/42">קבוצה</span>
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/28 px-4 py-3 text-white">
            {allowedGroups.map((group) => <option key={group.id} value={group.id} className="bg-zinc-950">{group.name}</option>)}
          </select>
        </label>
      )}

      <label className="block">
        <span className="text-xs font-bold text-white/42">נראות</span>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value as MediaVisibility)} className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/28 px-4 py-3 text-white">
          {visibilityOptions.map((option) => <option key={option.id} value={option.id} className="bg-zinc-950">{option.label}</option>)}
        </select>
      </label>

      <div>
        <p className="text-xs font-bold text-white/42">תגיות</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MEDIA_TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => setTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag])}
              className={cx("rounded-full border px-3 py-1.5 text-xs font-bold", tags.includes(tag) ? "border-emerald-200/35 bg-emerald-300/15 text-emerald-100" : "border-white/[0.09] bg-white/[0.035] text-white/48")}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-black/18 px-3 py-2 text-xs leading-relaxed text-white/42">
        בשלב המקומי נשמרת מטאדאטה ותצוגה מקדימה בלבד. אחסון קבצים קבוע יתחבר בהמשך ל־Supabase Storage, Cloudflare R2 או אחסון מאובטח אחר.
      </div>

      <div className="flex gap-2">
        {onCancel ? <button onClick={onCancel} className="rounded-[18px] border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white">ביטול</button> : null}
        <button onClick={save} disabled={!file || !title.trim()} className="rounded-[18px] bg-emerald-200 px-4 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-45">
          שמירה למדיה
        </button>
      </div>
    </div>
  );
}

