"use client";

import { motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import type { Role } from "@/lib/lovable/types";

interface TopBarProps {
  role: Role;
  name: string;
  onNotifications: () => void;
  onRoleTap: () => void;
  unread?: number;
}

const ROLE_LABEL: Record<Role, string> = {
  student: "תלמיד/ה",
  teacher: "מורה",
  admin: "ניהול",
};

export function TopBar({
  role,
  name,
  onNotifications,
  onRoleTap,
  unread = 0,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 px-5 pb-3 pt-3 safe-top">
      <div className="flex items-center justify-between">
        <button
          onClick={onRoleTap}
          className="glass flex items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5 text-right"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-rose text-sm font-semibold text-primary-foreground">
            {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {ROLE_LABEL[role]}
            </span>
            <span className="text-sm font-medium text-foreground">{name}</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            aria-label="חיפוש"
            className="glass grid h-10 w-10 place-items-center rounded-full"
          >
            <Search size={18} strokeWidth={1.8} />
          </button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onNotifications}
            aria-label="התראות"
            className="glass relative grid h-10 w-10 place-items-center rounded-full"
          >
            <Bell size={18} strokeWidth={1.8} />
            {unread > 0 && (
              <span className="absolute -left-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose px-1 text-[9px] font-semibold text-background">
                {unread}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        אקדמיית המחול · סטודיו תל אביב
      </div>
    </header>
  );
}
