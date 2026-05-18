"use client";

import { motion } from "framer-motion";

interface AttendanceRingProps {
  value: number; // 0..1
  label?: string;
  caption?: string;
  size?: number;
}

export function AttendanceRing({
  value,
  label = "נוכחות",
  caption,
  size = 132,
}: AttendanceRingProps) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * Math.max(0, Math.min(1, value));

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="oklch(1 0 0 / 8%)"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#ringGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - dash }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.82 0.13 80)" />
              <stop offset="100%" stopColor="oklch(0.74 0.13 15)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-semibold tracking-tight">
              {Math.round(value * 100)}%
            </span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {label}
            </span>
          </div>
        </div>
      </div>
      {caption && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  );
}
