import type { StaffMember } from "@/lib/lovable/types";

const STATE = {
  teaching: { label: "מלמד/ת", tone: "bg-success/15 text-success" },
  break: { label: "בהפסקה", tone: "bg-primary/15 text-primary" },
  off: { label: "לא בסטודיו", tone: "bg-white/6 text-muted-foreground" },
} as const;

export function TeachingStaff({
  staff,
  title = "צוות ההוראה",
}: {
  staff: StaffMember[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <ul className="flex flex-col gap-2">
        {staff.map((s) => {
          const st = STATE[s.state];
          return (
            <li
              key={s.id}
              className="glass flex items-center justify-between gap-3 rounded-2xl p-3.5 text-right"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-rose/20 text-xs font-semibold text-foreground">
                  {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {s.name}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {s.styles} · {s.todayLessons} שיעורים היום
                  </span>
                  {s.next && (
                    <span className="truncate text-[10px] text-muted-foreground/80">
                      {s.next}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${st.tone}`}
              >
                {st.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
