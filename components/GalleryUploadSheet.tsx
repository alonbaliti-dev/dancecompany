"use client";

import { useMemo, useState } from "react";
import { Image as ImageIcon, Film, Upload } from "lucide-react";
import { useCommunication } from "@/context/CommunicationContext";
import { usePlatformOS } from "@/context/PlatformOSContext";
import { getDirectoryUsers } from "@/lib/directory-store";
import { visibilityLabel } from "@/lib/gallery-permissions";
import { MEDIA_LIMITS, processLocalMediaFile, validateMediaFile } from "@/lib/media/upload-placeholder";
import { getStudentsForTeacher } from "@/lib/studio-roster";
import { getStudioGroups } from "@/lib/studio-groups-access";
import type { GalleryVisibility, UserProfile } from "@/lib/types";
import { BottomSheet } from "./BottomSheet";
import { GhostButton, PrimaryButton, SectionEyebrow } from "./ui";

const VIS: { value: GalleryVisibility; label: string }[] = [
  { value: "student_group", label: visibilityLabel("student_group") },
  { value: "specific_students", label: visibilityLabel("specific_students") },
  { value: "teachers_only", label: visibilityLabel("teachers_only") },
  { value: "staff_only", label: visibilityLabel("staff_only") },
  { value: "management_only", label: visibilityLabel("management_only") }
];

export function GalleryUploadSheet({ open, onClose, user }: { open: boolean; onClose: () => void; user: UserProfile }) {
  const { uploadGalleryItem } = useCommunication();
  const { enqueueSync } = usePlatformOS();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<GalleryVisibility>("student_group");
  const [groupId, setGroupId] = useState(getStudioGroups()[0]?.id ?? "");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [notify, setNotify] = useState(true);
  const [done, setDone] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const groupOptions = useMemo(
    () =>
      user.permissions.isManagement
        ? getStudioGroups()
        : getStudioGroups().filter((g) => user.assignedGroups.includes(g.name)),
    [user]
  );
  const students = useMemo(
    () =>
      user.permissions.isManagement
        ? getDirectoryUsers().filter((u) => u.permissions.isStudent && !u.isParent)
        : getStudentsForTeacher(user),
    [user]
  );

  const submit = async () => {
    if (!title.trim() || !file) return;
    const err = validateMediaFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(10);
    try {
      const local = await processLocalMediaFile(file);
      setProgress(70);
      uploadGalleryItem({
        title: title.trim(),
        description: description.trim() || undefined,
        mediaKind: local.mediaKind,
        videoUrl: local.mediaKind === "video" ? local.url : undefined,
        photoUrl: local.mediaKind === "photo" ? local.url : undefined,
        mimeType: local.mimeType,
        fileSizeBytes: local.fileSizeBytes,
        fileName: file.name,
        visibility,
        assignedGroupIds: visibility === "student_group" && groupId ? [groupId] : undefined,
        assignedStudentIds: visibility === "specific_students" ? studentIds : undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        notifyUsers: notify
      });
      enqueueSync("gallery_upload", { title: title.trim(), file: file.name });
      setProgress(100);
      setDone(true);
    } catch {
      setError("העלאה נכשלה — נסו שוב");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setDone(false);
    setStudentIds([]);
    setFile(null);
    setProgress(0);
    setError(null);
  };
  const close = () => {
    reset();
    onClose();
  };

  return (
    <BottomSheet open={open} title={done ? "נשמר בגלריה" : "העלאת מדיה"} onClose={close}>
      {done ? (
        <div className="space-y-4 text-center">
          <p className="text-emerald-100">הקובץ נשמר · ממתין לסנכרון לענן (פיילוט)</p>
          <PrimaryButton onClick={close}>סגירה</PrimaryButton>
        </div>
      ) : (
        <div className="space-y-4 text-right">
          <label className="flex min-h-[5.5rem] touch-manipulation cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.04] px-4 py-6 active:bg-white/[0.06]">
            <Upload size={28} className="text-white/50" />
            <span className="text-sm text-white/70">{file ? file.name : "בחירת תמונה או וידאו"}</span>
            <span className="text-[11px] text-white/40">
              וידאו עד {MEDIA_LIMITS.maxVideoMb}MB · תמונה עד {MEDIA_LIMITS.maxPhotoMb}MB
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {file ? (
            <p className="flex items-center justify-end gap-2 text-xs text-white/50">
              {file.type.startsWith("video") ? <Film size={14} /> : <ImageIcon size={14} />}
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          ) : null}
          {uploading ? (
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
          ) : null}
          {error ? <p className="text-sm text-rose-300/90">{error}</p> : null}
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="כותרת"
          />
          <textarea
            className="min-h-[4rem] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="תיאור (אופציונלי)"
          />
          <SectionEyebrow>הרשאות צפייה</SectionEyebrow>
          <select
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as GalleryVisibility)}
          >
            {VIS.map((v) => (
              <option key={v.value} value={v.value} className="bg-zinc-900">
                {v.label}
              </option>
            ))}
          </select>
          {visibility === "student_group" ? (
            <select
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              {groupOptions.map((g) => (
                <option key={g.id} value={g.id} className="bg-zinc-900">
                  {g.name}
                </option>
              ))}
            </select>
          ) : null}
          {visibility === "specific_students" ? (
            <div className="max-h-36 space-y-1 overflow-y-auto rounded-2xl border border-white/10 p-2">
              {students.map((s) => (
                <label key={s.id} className="flex justify-end gap-2 py-1 text-sm text-white/70">
                  <span>{s.name}</span>
                  <input
                    type="checkbox"
                    checked={studentIds.includes(s.id)}
                    onChange={(e) =>
                      setStudentIds((p) => (e.target.checked ? [...p, s.id] : p.filter((id) => id !== s.id)))
                    }
                    className="accent-emerald-400"
                  />
                </label>
              ))}
            </div>
          ) : null}
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="תגיות (מופרדות בפסיק)"
          />
          <label className="flex justify-end gap-2 text-sm text-white/55">
            <span>התראה לנמענים</span>
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-emerald-400" />
          </label>
          <PrimaryButton disabled={!title.trim() || !file || uploading} onClick={() => void submit()}>
            {uploading ? "מעלה…" : "שמירה בגלריה"}
          </PrimaryButton>
          <GhostButton className="w-full" onClick={close}>
            ביטול
          </GhostButton>
        </div>
      )}
    </BottomSheet>
  );
}

