import type { AIAgent } from "./ai-types";

export const chatGptAgent: AIAgent = {
  id: "chatgpt",
  label: "ChatGPT Studio Copilot",
  run: ({ db, actor }) => [
    {
      id: "chatgpt_summary",
      agentId: "chatgpt",
      title: "סיכום מהיר",
      body: `כדאי לעבור על ${db.notifications.filter((n) => n.userIds.includes(actor.id) && !n.readBy.includes(actor.id)).length} התראות ועל ${db.privateLessons.length} בקשות שיעור פרטי פתוחות.`,
      riskLevel: "low",
      requiresApproval: false,
      suggestedActions: ["בדיקת התראות", "סקירת שיעורים פרטיים"]
    }
  ]
};
