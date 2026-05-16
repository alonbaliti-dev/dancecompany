"use client";

import { Pencil } from "lucide-react";
import { useEditableText } from "@/context/EditableTextContext";
import { cx } from "../ui";

export function EditableTextWrapper({
  textKey,
  defaultHe,
  defaultEn,
  className,
  as: Tag = "span",
  dir,
  onEdit
}: {
  textKey: string;
  defaultHe: string;
  defaultEn?: string;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3";
  dir?: "rtl" | "ltr";
  onEdit?: () => void;
}) {
  const { textEditMode, canEdit, t, setActiveEditKey } = useEditableText();
  const Component = Tag;
  const showEdit = canEdit && textEditMode;

  return (
    <span className={cx("group relative inline-flex max-w-full items-start gap-1", className)}>
      {showEdit ? (
        <button
          type="button"
          onClick={() => (onEdit ? onEdit() : setActiveEditKey(textKey))}
          className="mt-0.5 shrink-0 rounded-lg border border-violet-400/25 bg-violet-500/10 p-1 text-violet-200/80 opacity-80 transition hover:opacity-100"
          aria-label="עריכת טקסט"
        >
          <Pencil size={12} />
        </button>
      ) : null}
      <Component dir={dir ?? "rtl"} className="min-w-0">
        {t(textKey, defaultHe)}
      </Component>
    </span>
  );
}
