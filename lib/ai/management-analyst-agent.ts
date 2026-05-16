import type { AIAgent } from "./ai-types";

export const managementAnalystAgent: AIAgent = {
  id: "management_analyst",
  label: "Management Analyst Agent",
  run: ({ actor, db }) => {
    if (actor.role !== "management" && actor.role !== "super_admin") return [];
    const openLessons = db.privateLessons.filter((lesson) => lesson.status !== "paid").length;
    return [
      {
        id: "studio_health",
        agentId: "management_analyst",
        title: "בריאות הסטודיו",
        body: `מומלץ לבדיקה: ${openLessons} שיעורים פרטיים פתוחים ו־${db.media.length} פריטי מדיה שמחכים למעקב.`,
        riskLevel: openLessons > 2 ? "medium" : "low",
        requiresApproval: true,
        suggestedActions: ["תיאום שיעורים פתוחים", "בדיקת מוכנות אירוע"]
      }
    ];
  }
};
