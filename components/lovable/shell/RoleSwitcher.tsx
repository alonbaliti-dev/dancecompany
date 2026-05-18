"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ROLES } from "@/lib/lovable/sample-data";
import type { Role } from "@/lib/lovable/types";

interface RoleSwitcherProps {
  active: Role;
  onSelect: (role: Role) => void;
}

export function RoleSwitcher({ active, onSelect }: RoleSwitcherProps) {
  return (
    <div className="flex flex-col gap-2">
      {ROLES.map((r) => {
        const isActive = r.id === active;
        return (
          <motion.button
            key={r.id}
            whileTap={{ scale: 0.985 }}
            onClick={() => onSelect(r.id)}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-right transition-colors ${
              isActive
                ? "border-primary/40 bg-primary/10"
                : "border-hairline bg-white/3 hover:bg-white/5"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {r.label}
              </span>
              <span className="text-xs text-muted-foreground">{r.tagline}</span>
            </div>
            <span
              className={`grid h-6 w-6 place-items-center rounded-full border ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-hairline"
              }`}
            >
              {isActive && <Check size={14} strokeWidth={3} />}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
