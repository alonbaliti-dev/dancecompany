"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck, WandSparkles } from "lucide-react";
import { Button, StatusBadge, v6Cx } from "@/components/v6/design-system";

export type AISuggestionCardProps = {
  title: string;
  insight: string;
  draftText: string;
  confidence: "low" | "medium" | "high";
  priority: "low" | "medium" | "high";
  requiresApproval?: boolean;
  why: string;
  approveLabel?: string;
  editLabel?: string;
  rejectLabel?: string;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
};

const confidenceLabel: Record<AISuggestionCardProps["confidence"], string> = {
  low: "ביטחון נמוך",
  medium: "ביטחון בינוני",
  high: "ביטחון גבוה"
};

const priorityLabel: Record<AISuggestionCardProps["priority"], string> = {
  low: "עדיפות רגועה",
  medium: "עדיפות לבדיקה",
  high: "עדיפות גבוהה"
};

export function AISuggestionCard({
  title,
  insight,
  draftText,
  confidence,
  priority,
  requiresApproval = true,
  why,
  approveLabel = "אישור",
  editLabel = "עריכה לפני שליחה",
  rejectLabel = "דחייה",
  onApprove,
  onEdit,
  onReject
}: AISuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-[26px] border border-white/[0.07] bg-white/[0.055] p-3.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex shrink-0 items-center gap-1.5">
          {requiresApproval ? <StatusBadge tone="repertoire">דורש אישור</StatusBadge> : null}
          <StatusBadge tone={priority === "high" ? "urgent" : priority === "medium" ? "repertoire" : "success"}>{priorityLabel[priority]}</StatusBadge>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-end gap-2">
            <h3 className="truncate text-[15px] font-black text-white">{title}</h3>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-200/16 text-violet-100">
              <WandSparkles size={15} />
            </span>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-white/56">{insight}</p>
        </div>
      </div>

      <div className="mt-3 rounded-[20px] bg-black/18 p-3 text-[13px] leading-relaxed text-white/72">
        <p className="mb-1 flex items-center justify-end gap-1.5 text-[11px] font-black text-white/42">
          <span>{confidenceLabel[confidence]}</span>
          <ShieldCheck size={13} />
        </p>
        <p>{draftText}</p>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-2 flex w-full items-center justify-between rounded-[18px] bg-white/[0.045] px-3 py-2 text-[12px] font-bold text-white/58"
      >
        <ChevronDown size={15} className={v6Cx("transition", expanded && "rotate-180")} />
        <span>למה ההצעה הזו?</span>
      </button>
      {expanded ? <p className="mt-2 rounded-[18px] bg-white/[0.04] p-3 text-[12px] leading-relaxed text-white/54">{why}</p> : null}

      <div className="mt-3 flex flex-wrap justify-between gap-2">
        <Button variant="danger" onClick={onReject}>{rejectLabel}</Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onEdit}>{editLabel}</Button>
          <Button onClick={onApprove} disabled={!requiresApproval}>{approveLabel}</Button>
        </div>
      </div>
    </section>
  );
}
