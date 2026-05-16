"use client";

import { useMemo, useState } from "react";
import { Languages, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { useEditableText } from "@/context/EditableTextContext";
import { filterEditableTexts, uniqueModules } from "@/lib/content/editable-text";
import { GhostButton, Header, SectionEyebrow, screenClass } from "../ui";
import { TextEditorSheet } from "./TextEditorSheet";

export function SuperAdminTextEditorScreen({ onBack }: { onBack?: () => void }) {
  const { texts, textEditMode, setTextEditMode, canEdit } = useEditableText();
  const [q, setQ] = useState("");
  const [module, setModule] = useState("all");
  const [scope, setScope] = useState<"all" | "global" | "studio">("all");
  const [editedOnly, setEditedOnly] = useState(false);
  const [untranslatedOnly, setUntranslatedOnly] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);

  const modules = useMemo(() => ["all", ...uniqueModules(texts)], [texts]);

  const rows = useMemo(
    () =>
      filterEditableTexts(texts, {
        q,
        module: module === "all" ? undefined : module,
        scope: scope === "all" ? undefined : scope,
        editedOnly,
        untranslatedOnly
      }),
    [texts, q, module, scope, editedOnly, untranslatedOnly]
  );

  if (!canEdit) {
    return (
      <div className={screenClass}>
        <Header title="עריכת טקסטים" subtitle="זמין למנהל על בלבד." />
      </div>
    );
  }

  return (
    <div className={screenClass}>
      {onBack ? (
        <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
          ← חזרה
        </GhostButton>
      ) : null}

      <Header title="מצב עריכת טקסטים" subtitle="עריכה גלובלית של כותרות, כפתורים ומיקרו־קופי באפליקציה." />

      <button
        type="button"
        onClick={() => setTextEditMode(!textEditMode)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/[0.08] px-4 py-4 text-right transition active:scale-[0.99]"
      >
        <span className="text-violet-200/80">{textEditMode ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}</span>
        <div>
          <p className="font-semibold text-white">{textEditMode ? "מצב עריכה פעיל" : "מצב עריכה כבוי"}</p>
          <p className="mt-1 text-sm text-white/45">כשפעיל — יופיעו אייקוני עיפרון ליד טקסטים שניתן לערוך</p>
        </div>
      </button>

      <input
        className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white"
        placeholder="חיפוש לפי מפתח, מסך או טקסט…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="flex flex-wrap justify-end gap-2">
        {modules.map((m) => (
          <GhostButton
            key={m}
            className={module === m ? "!border-white/20 !bg-white/10" : ""}
            onClick={() => setModule(m)}
          >
            {m === "all" ? "הכל" : m}
          </GhostButton>
        ))}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {(["all", "global", "studio"] as const).map((s) => (
          <GhostButton key={s} className={scope === s ? "!border-white/20 !bg-white/10" : ""} onClick={() => setScope(s)}>
            {s === "all" ? "היקף: הכל" : s === "global" ? "גלובלי" : "סטודיו"}
          </GhostButton>
        ))}
        <GhostButton className={editedOnly ? "!border-white/20 !bg-white/10" : ""} onClick={() => setEditedOnly((v) => !v)}>
          נערך
        </GhostButton>
        <GhostButton
          className={untranslatedOnly ? "!border-white/20 !bg-white/10" : ""}
          onClick={() => setUntranslatedOnly((v) => !v)}
        >
          ללא תרגום
        </GhostButton>
      </div>

      <SectionEyebrow>{rows.length} רשומות</SectionEyebrow>

      <div className="space-y-2">
        {rows.map((row) => {
          const untranslated = Boolean(row.defaultEn && !row.en);
          const edited = row.he !== row.defaultHe || (row.en && row.en !== row.defaultEn);
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => setEditKey(row.key)}
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-right transition active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2">
                <Pencil size={16} className="mt-1 shrink-0 text-violet-200/60" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] text-white/35">{row.key}</p>
                  <p className="mt-1 font-semibold text-white">{row.he}</p>
                  {row.en ? (
                    <p className="mt-1 text-sm text-white/45" dir="ltr">
                      {row.en}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[10px] text-white/32">
                    {row.module} · {row.label}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                {edited ? (
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-100">
                    נערך
                  </span>
                ) : null}
                {untranslated ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-100">
                    <Languages size={10} />
                    ללא EN
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <TextEditorSheet textKey={editKey} open={Boolean(editKey)} onClose={() => setEditKey(null)} />
    </div>
  );
}
