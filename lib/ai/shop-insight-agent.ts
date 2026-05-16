import type { AIAgent } from "./ai-types";

export const shopInsightAgent: AIAgent = {
  id: "shop_insight",
  label: "Shop Insight Agent",
  run: ({ actor, db }) => {
    if (actor.role !== "management" && actor.role !== "super_admin") return [];
    return [
      {
        id: "shop_conversion",
        agentId: "shop_insight",
        title: "תובנות מכירה",
        body: `הצעה בלבד: ${db.products.filter((p) => p.active).length} מוצרים פעילים. כדאי להבליט כרטיסים ושיעורים פרטיים בבית.`,
        riskLevel: "low",
        requiresApproval: false,
        suggestedActions: ["בדיקת מוצרים פעילים", "קידום מוצר מוביל"]
      }
    ];
  }
};
