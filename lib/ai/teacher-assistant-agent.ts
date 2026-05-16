import type { AIAgent } from "./ai-types";

export const teacherAssistantAgent: AIAgent = {
  id: "teacher_assistant",
  label: "Teacher Assistant Agent",
  run: ({ actor, db }) => {
    if (actor.role !== "teacher" && actor.role !== "management" && actor.role !== "super_admin") return [];
    const groups = db.groups.filter((group) => actor.role !== "teacher" || group.teacherIds.includes(actor.id));
    return [
      {
        id: "teacher_attention",
        agentId: "teacher_assistant",
        title: "תלמידים שדורשים תשומת לב",
        body: `כדאי לעבור על ${groups.length} קבוצות, לבדוק משימות פתוחות ואז לנסח הודעה קצרה ומרגיעה.`,
        riskLevel: "medium",
        requiresApproval: true,
        suggestedActions: ["יצירת משימה שבועית", "טיוטת הודעה לקבוצה"]
      }
    ];
  }
};
