import { computeV6EventReadiness } from "@/lib/engines/v6";
import type { AIAgent } from "./ai-types";

export const eventReadinessAgent: AIAgent = {
  id: "event_readiness",
  label: "הכנות לאירוע",
  run: ({ actor, db }) => {
    if (actor.role !== "management" && actor.role !== "super_admin") return [];
    const nextEvent = computeV6EventReadiness(db)[0];
    const readiness = nextEvent?.score ?? Math.max(58, 92 - db.privateLessons.filter((lesson) => lesson.status !== "paid").length * 6);
    return [
      {
        id: "event_readiness",
        agentId: "event_readiness",
        title: "הכנות לאירוע",
        body: nextEvent
          ? `הצעה לבדיקה: ${nextEvent.title} מוכן בערך ${readiness}%. הצעד הבא: ${nextEvent.nextAction}`
          : `ההכנות עומדות בערך על ${readiness}%. כדאי לעבור על משימות, גלריה וכרטיסים לפני האירוע הבא.`,
        riskLevel: readiness < 75 ? "medium" : "low",
        requiresApproval: true,
        suggestedActions: ["לעבור על ההכנות", "לנסח תזכורת לאישור", "לעקוב אחרי תלבושות וציוד"]
      }
    ];
  }
};
