"use client";

import { useEffect, useState } from "react";
import { useEditableText } from "@/context/EditableTextContext";
import { BottomSheet } from "../BottomSheet";
import { GhostButton, PrimaryButton, SectionEyebrow } from "../ui";

export function TextEditorSheet({
  textKey,
  open,
  onClose
}: {
  textKey: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { resolve, saveText, resetText } = useEditableText();
  const [he, setHe] = useState("");
  const [en, setEn] = useState("");

  const entry = textKey ? resolve(textKey) : null;

  useEffect(() => {
    if (!textKey || !open) return;
    const r = resolve(textKey);
    setHe(r.he);
    setEn(r.en ?? "");
  }, [textKey, open, resolve]);

  if (!textKey || !entry?.entry) return null;

  const meta = entry.entry;

  return (
    <BottomSheet open={open} onClose={onClose} title="עריכת טקסט">
      <div className="space-y-4 text-right" dir="rtl">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <SectionEyebrow>מזהה</SectionEyebrow>
          <p className="mt-1 font-mono text-xs text-white/55">{textKey}</p>
          <p className="mt-2 text-sm text-white/45">
            {meta.module} · {meta.label}
          </p>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-white/40">עברית</label>
          <textarea
            className="mt-2 min-h-[4rem] w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white"
            value={he}
            onChange={(e) => setHe(e.target.value)}
            dir="rtl"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-white/40">English</label>
          <textarea
            className="mt-2 min-h-[4rem] w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white"
            value={en}
            onChange={(e) => setEn(e.target.value)}
            dir="ltr"
          />
          {!en.trim() ? (
            <p className="mt-1 text-[10px] text-amber-200/70">ללא תרגום — יוצג תג סטטוס</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2 text-right">
          <p className="text-[10px] text-white/35">ברירת מחדל</p>
          <p className="mt-1 text-sm text-white/50">{meta.defaultHe}</p>
          {meta.defaultEn ? <p className="mt-1 text-sm text-white/40" dir="ltr">{meta.defaultEn}</p> : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <GhostButton className="!text-sm" onClick={() => resetText(textKey)}>
            איפוס לברירת מחדל
          </GhostButton>
          <PrimaryButton
            className="!py-2.5"
            onClick={() => {
              saveText({ key: textKey, he, en: en.trim() || undefined });
              onClose();
            }}
          >
            שמירה
          </PrimaryButton>
        </div>
      </div>
    </BottomSheet>
  );
}
