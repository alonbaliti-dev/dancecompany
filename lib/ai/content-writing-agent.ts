import type { AIAgent } from "./ai-types";

export const contentWritingAgent: AIAgent = {
  id: "content_writing",
  label: "Content Writing Agent",
  run: ({ actor }) => {
    if (actor.role !== "teacher" && actor.role !== "management" && actor.role !== "super_admin") return [];
    return [
      {
        id: "content_group_message",
        agentId: "content_writing",
        title: "טיוטת הודעה לקבוצה",
        body: "הצעה בלבד: ״היי אהובים, השבוע נתמקד בחזרה נקייה על החומר ובנוכחות מלאה. מחכים לראות אתכם בסטודיו.״",
        riskLevel: "low",
        requiresApproval: true,
        suggestedActions: ["אישור ושליחה ידנית", "עריכת נוסח"]
      }
    ];
  }
};
