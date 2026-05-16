"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { globalSearch, type SearchResult } from "@/lib/services/global-search-service";
import type { CommandJump } from "@/components/CommandPalette";
import type { UserProfile } from "@/lib/types";

export function GlobalSearchSheet({
  open,
  onClose,
  user,
  onJump
}: {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  onJump: (j: CommandJump) => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => globalSearch(user, q), [user, q]);

  const pick = (r: SearchResult) => {
    if (r.stackTarget) onJump({ type: "stack", target: r.stackTarget });
    else if (r.mainTab) onJump({ type: "main", target: r.mainTab });
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex flex-col bg-black/85 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <button type="button" onClick={onClose} aria-label="סגירה" className="text-white/60">
              <X size={22} />
            </button>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/35" size={18} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="חיפוש בכל המערכת…"
                className="w-full rounded-xl border border-white/12 bg-white/[0.06] py-2.5 pl-3 pr-10 text-right text-sm text-white"
                aria-label="חיפוש גלובלי"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto px-4 py-3">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  className="w-full rounded-xl px-3 py-3 text-right active:bg-white/[0.06]"
                >
                  <p className="text-sm font-medium text-white">{r.title}</p>
                  <p className="text-xs text-white/45">
                    {r.subtitle} · {r.category}
                  </p>
                </button>
              </li>
            ))}
            {q && results.length === 0 ? (
              <p className="py-8 text-center text-sm text-white/40">לא נמצאו תוצאות</p>
            ) : null}
          </ul>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
