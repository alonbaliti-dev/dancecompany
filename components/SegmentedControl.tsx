"use client";

import { cx } from "./ui";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = ""
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cx("flex rounded-2xl border border-white/[0.1] bg-black/35 p-1", className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "min-w-0 flex-1 rounded-xl py-2.5 text-center text-[12px] font-semibold transition",
            value === o.value ? "bg-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" : "text-white/42 hover:text-white/62"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
