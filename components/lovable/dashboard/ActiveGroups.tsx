import type { ActiveGroup } from "@/lib/lovable/types";

const ACCENT_BAR: Record<ActiveGroup["accent"], string> = {
  amber: "bg-gradient-to-l from-amber-300 to-amber-500",
  rose: "bg-gradient-to-l from-rose to-rose/60",
  violet: "bg-gradient-to-l from-violet-300 to-violet-500",
  emerald: "bg-gradient-to-l from-emerald-300 to-emerald-500",
  sky: "bg-gradient-to-l from-sky-300 to-sky-500",
};

export function ActiveGroups({
  groups,
  title = "קבוצות פעילות",
}: {
  groups: ActiveGroup[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <span className="text-[11px] text-muted-foreground">
          {groups.length} קבוצות
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {groups.map((g) => (
          <li
            key={g.id}
            className="glass flex flex-col gap-2.5 rounded-2xl p-3.5 text-right"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-foreground">
                  {g.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {g.teacher} · {g.members}/{g.capacity} חברות
                </span>
              </div>
              <span className="shrink-0 text-sm font-semibold tracking-tight text-foreground">
                {Math.round(g.attendance * 100)}%
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full ${ACCENT_BAR[g.accent]}`}
                style={{ width: `${g.attendance * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
