import type { AIAgent } from "./ai-types";

export const studentInsightAgent: AIAgent = {
  id: "student_insight",
  label: "Student Insight Agent",
  run: ({ actor, db }) => {
    if (actor.role !== "student" && actor.role !== "parent") return [];
    const studentIds = actor.role === "parent" ? actor.linkedStudentIds : [actor.id];
    const tasks = db.tasks.filter((task) => db.groups.some((g) => g.id === task.groupId && g.studentIds.some((sid) => studentIds.includes(sid))));
    return [
      {
        id: "student_practice",
        agentId: "student_insight",
        title: actor.role === "parent" ? "סיכום מצב הילד/ה" : "מה לתרגל היום?",
        body: `הצעה בלבד: יש ${tasks.length} משימות רלוונטיות. כדאי להתחיל בחזרה קצרה על החומר האחרון.`,
        riskLevel: "low",
        requiresApproval: false,
        suggestedActions: ["פתיחת משימות", "בדיקת שיעור הבא"]
      }
    ];
  }
};
