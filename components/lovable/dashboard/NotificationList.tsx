import { Bell, CheckCircle2, AlertTriangle } from "lucide-react";
import type { AppNotification } from "@/lib/lovable/types";

const ICONS = {
  success: CheckCircle2,
  warn: AlertTriangle,
  info: Bell,
} as const;

const TONE = {
  success: "text-success",
  warn: "text-rose",
  info: "text-muted-foreground",
} as const;

export function NotificationList({ items }: { items: AppNotification[] }) {
  if (!items.length) {
    return (
      <div className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">
        אין התראות חדשות
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((n) => {
        const Icon = ICONS[n.tone];
        return (
          <li
            key={n.id}
            className="glass flex items-start gap-3 rounded-2xl p-3.5 text-right"
          >
            <span className={`mt-0.5 ${TONE[n.tone]}`}>
              <Icon size={18} strokeWidth={1.8} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {n.title}
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {n.time}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {n.body}
              </p>
            </div>
            {n.unread && (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
