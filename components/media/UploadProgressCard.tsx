"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { MediaUploadStatus } from "@/lib/media/media-types";

export function UploadProgressCard({
  status,
  fileName,
  fileSize
}: {
  status: MediaUploadStatus;
  fileName?: string;
  fileSize?: number;
}) {
  const Icon = status === "failed" ? XCircle : status === "ready" ? CheckCircle2 : Loader2;
  const label =
    status === "queued"
      ? "ממתין לשמירה"
      : status === "uploading"
        ? "מעלה"
        : status === "processing"
          ? "מעבד"
          : status === "ready"
            ? "מוכן"
            : "נכשל";
  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-black/24 p-3 text-right">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-white/48">{fileSize ? `${(fileSize / 1024 / 1024).toFixed(1)}MB` : "מטאדאטה"}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{label}</span>
          <Icon className={status === "uploading" || status === "processing" ? "animate-spin text-emerald-200" : "text-emerald-200"} size={18} />
        </div>
      </div>
      {fileName ? <p className="mt-2 truncate text-xs text-white/38">{fileName}</p> : null}
    </div>
  );
}

