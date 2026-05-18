import { AlertTriangle, Calendar, CreditCard, UserPlus } from "lucide-react";
import type { ExceptionItem } from "@/lib/lovable/types";

const ICON = {
  attendance: AlertTriangle,
  payment: CreditCard,
  schedule: Calendar,
  registration: UserPlus,
} as const;

const TONE = {
  attendance: "text-rose",
  payment: "text-primary",
  schedule: "text-amber-300",
  registration: "text-foreground",
} as const;

export function Exceptions({
  items,
  title = "חריגות ותשומת לב",
}: {
  items: ExceptionItem[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <span className="text-[11px] text-muted-foreground">
          {items.length} פתוחות
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((a) => {
          const Icon = ICON[a.kind];
          return (
            <li
              key={a.id}
              className="glass flex items-start gap-3 rounded-2xl p-3.5 text-right"
            >
              <span className={`mt-0.5 ${TONE[a.kind]}`}>
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {a.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {a.time}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {a.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
