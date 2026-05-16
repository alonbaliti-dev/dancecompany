import type { AIAgent } from "./ai-types";

export const eventReadinessAgent: AIAgent = {
  id: "event_readiness",
  label: "Event Readiness Agent",
  run: ({ actor, db }) => {
    if (actor.role !== "management" && actor.role !== "super_admin") return [];
    const readiness = Math.max(58, 92 - db.privateLessons.filter((lesson) => lesson.status !== "paid").length * 6);
    return [
      {
        id: "event_readiness",
        agentId: "event_readiness",
        title: "מוכנות אירוע",
        body: `מוכנות משוערת ${readiness}%. כדאי לעבור על משימות, מדיה וכרטיסים לפני האירוע הבא.`,
        riskLevel: readiness < 75 ? "medium" : "low",
        requiresApproval: true,
        suggestedActions: ["בדיקת אירועים", "מעקב כרטיסים"]
      }
    ];
  }
};
