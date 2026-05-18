import { AlertTriangle, Calendar, CreditCard, Users } from "lucide-react";

const ALERTS = [
  {
    id: "a1",
    Icon: AlertTriangle,
    tone: "text-rose",
    title: "אולפן הגדול · התנגשות במערכת",
    body: "שיעור מודרני 18:30 חופף לחזרת להקת בלט.",
    time: "לפני 8 דק׳",
  },
  {
    id: "a2",
    Icon: CreditCard,
    tone: "text-primary",
    title: "4 תשלומים באיחור מעל 7 ימים",
    body: "סך פתוח: ₪6,420 — מומלץ לפתוח שיחה.",
    time: "היום",
  },
  {
    id: "a3",
    Icon: Users,
    tone: "text-foreground",
    title: "רישום חדש · שלי אברהם",
    body: "ממתינה לאישור שיבוץ לקבוצת מתחילים ה׳.",
    time: "אתמול",
  },
  {
    id: "a4",
    Icon: Calendar,
    tone: "text-muted-foreground",
    title: "מורה בחופשה ביום ה׳",
    body: "תמר אלון — דרוש מילוי לשני שיעורים.",
    time: "אתמול",
  },
];

export function AdminAlerts() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">התראות ניהוליות</h2>
      <ul className="flex flex-col gap-2">
        {ALERTS.map((a) => {
          const Icon = a.Icon;
          return (
            <li
              key={a.id}
              className="glass flex items-start gap-3 rounded-2xl p-3.5 text-right"
            >
              <span className={`mt-0.5 ${a.tone}`}>
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
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
