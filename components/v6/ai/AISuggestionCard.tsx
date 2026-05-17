"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck, WandSparkles } from "lucide-react";
import { Button, RtlText, SafeBadgeGroup, SafeMeta, SafeTitle, StatusBadge, SurfaceContent, v6Cx, v6Surface } from "@/components/v6/design-system";

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
  low: "הצעה לבדיקה",
  medium: "נראה מתאים",
  high: "מתאים מאוד"
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
    <section dir="rtl" className={v6Cx("lk-safe-surface relative isolate overflow-hidden rounded-[36px] border p-5 text-start", v6Surface.elevated)}>
      <div className="pointer-events-none absolute -left-12 -top-14 h-28 w-28 rounded-full bg-violet-200/8 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-l from-transparent via-[#f4d58d]/18 to-transparent" />
      <SurfaceContent className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.035] bg-violet-200/12 text-violet-100 shadow-[inset_0_1px_0_rgba(255,247,223,0.05)]">
              <WandSparkles size={15} strokeWidth={1.9} />
            </span>
            <SafeTitle as="h3" className="min-w-0 flex-1 text-[15px] font-semibold leading-snug tracking-[-0.024em] text-white/90">{title}</SafeTitle>
          </div>
          <SafeMeta as="p" className="mt-1 text-[12px] leading-relaxed text-white/52">{insight}</SafeMeta>
        </div>
        <SafeBadgeGroup className="shrink sm:max-w-[45%]">
          {requiresApproval ? <StatusBadge tone="repertoire">דורש אישור</StatusBadge> : null}
          <StatusBadge tone={priority === "high" ? "urgent" : priority === "medium" ? "repertoire" : "success"}>{priorityLabel[priority]}</StatusBadge>
        </SafeBadgeGroup>
      </div>

      <div className={v6Cx("lk-safe-surface relative rounded-[28px] border p-4 text-[13px] leading-relaxed text-white/68", v6Surface.quiet)}>
        <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-white/40">
          <ShieldCheck size={13} strokeWidth={1.9} />
          <span>{confidenceLabel[confidence]}</span>
        </p>
        <RtlText as="p">{draftText}</RtlText>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-3 flex w-full items-center gap-2 rounded-[24px] border border-[rgba(244,213,141,0.058)] bg-white/[0.036] px-3 py-2 text-[12px] font-semibold text-white/56"
      >
        <span className="lk-safe-meta min-w-0 flex-1 text-start">למה זה מוצע?</span>
        <ChevronDown size={15} className={v6Cx("transition", expanded && "rotate-180")} />
      </button>
      {expanded ? <RtlText as="p" className="mt-2 rounded-[22px] border border-white/[0.035] bg-white/[0.032] p-3 text-[12px] leading-relaxed text-white/52">{why}</RtlText> : null}

      <div className="mt-4 flex flex-wrap justify-start gap-2 border-t border-[#f4d58d]/8 pt-4">
        <Button onClick={onApprove} disabled={!requiresApproval}>{approveLabel}</Button>
        <Button variant="ghost" onClick={onEdit}>{editLabel}</Button>
        <Button variant="danger" onClick={onReject}>{rejectLabel}</Button>
      </div>
      </SurfaceContent>
    </section>
  );
}
