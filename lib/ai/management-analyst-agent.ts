import type { AIAgent } from "./ai-types";

export const managementAnalystAgent: AIAgent = {
  id: "management_analyst",
  label: "הצעות לניהול",
  run: ({ actor, db }) => {
    if (actor.role !== "management" && actor.role !== "super_admin") return [];
    const openLessons = db.privateLessons.filter((lesson) => lesson.status !== "paid").length;
    const openEventItems = db.eventChecklists.filter((item) => item.status !== "done").length;
    const pendingApprovals = db.eventParticipants.filter((item) => item.approvalStatus === "pending").length;
    return [
      {
        id: "studio_health",
        agentId: "management_analyst",
        title: "מה דורש תשומת לב",
        body: `הצעה לאישור: ${openLessons} שיעורים פרטיים פתוחים, ${openEventItems} משימות לאירוע ו־${pendingApprovals} אישורים חסרים.`,
        riskLevel: openLessons > 2 || pendingApprovals > 0 ? "medium" : "low",
        requiresApproval: true,
        suggestedActions: ["לתאם שיעורים פתוחים", "לעבור על ההכנות לאירוע", "לנסח עדכון להורים לאישור"]
      }
    ];
  }
};
