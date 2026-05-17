"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck, WandSparkles } from "lucide-react";
import { Button, RtlText, StatusBadge, v6Cx } from "@/components/v6/design-system";

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
    <section dir="rtl" className="relative isolate overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.060)] bg-[linear-gradient(145deg,rgba(255,255,255,0.064),rgba(255,255,255,0.022)_56%,rgba(139,92,246,0.105))] p-3.5 text-start shadow-[0_16px_42px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.058)]">
      <div className="pointer-events-none absolute -left-14 -top-16 h-32 w-32 rounded-full bg-violet-200/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-l from-transparent via-violet-100/18 to-transparent" />
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-200/14 text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
              <WandSparkles size={15} />
            </span>
            <RtlText as="h3" className="min-w-0 flex-1 truncate text-[15px] font-black text-white">{title}</RtlText>
          </div>
          <RtlText as="p" className="mt-1 text-[12px] leading-relaxed text-white/56">{insight}</RtlText>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {requiresApproval ? <StatusBadge tone="repertoire">דורש אישור</StatusBadge> : null}
          <StatusBadge tone={priority === "high" ? "urgent" : priority === "medium" ? "repertoire" : "success"}>{priorityLabel[priority]}</StatusBadge>
        </div>
      </div>

      <div className="relative mt-3 rounded-[22px] border border-[rgba(255,255,255,0.050)] bg-black/18 p-3 text-[13px] leading-relaxed text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.042)]">
        <p className="mb-1 flex items-center gap-1.5 text-[11px] font-black text-white/42">
          <ShieldCheck size={13} />
          <span>{confidenceLabel[confidence]}</span>
        </p>
        <RtlText as="p">{draftText}</RtlText>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-2 flex w-full items-center gap-2 rounded-[18px] border border-[rgba(255,255,255,0.040)] bg-white/[0.040] px-3 py-2 text-[12px] font-bold text-white/56"
      >
        <span className="min-w-0 flex-1 text-start">למה ההצעה הזו?</span>
        <ChevronDown size={15} className={v6Cx("transition", expanded && "rotate-180")} />
      </button>
      {expanded ? <RtlText as="p" className="mt-2 rounded-[18px] bg-white/[0.04] p-3 text-[12px] leading-relaxed text-white/54">{why}</RtlText> : null}

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button onClick={onApprove} disabled={!requiresApproval}>{approveLabel}</Button>
        <Button variant="ghost" onClick={onEdit}>{editLabel}</Button>
        <Button variant="danger" onClick={onReject}>{rejectLabel}</Button>
      </div>
    </section>
  );
}
