"use client";

import { usePlatform } from "@/context/PlatformContext";
import { Card, Header, SectionEyebrow, screenClass } from "../ui";
import { StatCard } from "./PlatformUi";

export function BillingScreen({ mode }: { mode: "studio" | "platform" }) {
  const { studioBilling, platformBilling } = usePlatform();
  const b = mode === "platform" ? platformBilling : studioBilling;

  return (
    <div className={screenClass}>
      <Header title="חיוב ומנוי" subtitle={mode === "platform" ? "רמת פלטפורמה" : "מנוי הסטודיו"} />
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard label="תוכנית" value={b.plan} />
        <StatCard label="מחיר חודשי" value={`₪${b.monthlyPriceNis}`} />
        <StatCard label="סטטוס" value={b.paymentStatus === "paid" ? "שולם" : b.paymentStatus === "trial" ? "ניסיון" : "לתשלום"} />
        <StatCard label="תלמידים פעילים" value={b.activeStudents} />
      </div>
      <Card animated={false}>
        <SectionEyebrow>שדרוג</SectionEyebrow>
        <p className="mt-2 text-sm text-white/48">שינוי תוכנית יתווסף עם חיבור סליקה. צרו קשר עם התמיכה לשדרוג Enterprise.</p>
      </Card>
    </div>
  );
}
