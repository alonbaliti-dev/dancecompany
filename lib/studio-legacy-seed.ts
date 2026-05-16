import { STUDIO_LK } from "@/lib/platform/constants";
import type { LegacyMilestone, StudioLegacyQuote } from "@/lib/types";

/**
 * Studio memory board — participation, performances and growth.
 * No fabricated awards, rankings or external titles.
 */
export function seedLegacyMilestones(): LegacyMilestone[] {
  return [
    {
      id: "leg_community",
      studioId: STUDIO_LK,
      title: "קהילת הסטודיו",
      subtitle: "LK Dance School · כפר ויתקין",
      year: 2020,
      kind: "milestone",
      participatingGroups: [],
      featured: true,
      quote: "מקום שבו לומדים, חוזרים וגדלים יחד.",
      tags: ["קהילה"]
    },
    {
      id: "leg_flamenco_focus",
      studioId: STUDIO_LK,
      title: "פלמנקו בסטודיו",
      subtitle: "קצב, עיגון וביטוי — זהות אמנותית מרכזית",
      year: 2021,
      kind: "milestone",
      participatingGroups: ["Junior Flamenco"],
      featured: true,
      tags: ["פלמנקו", "אמנות"]
    },
    {
      id: "leg_annual_show_mem",
      studioId: STUDIO_LK,
      title: "מופע סוף שנה",
      subtitle: "ערב הופעות לתלמידים, משפחות וחברים",
      year: 2024,
      kind: "annual_show",
      eventType: "performance",
      participatingGroups: ["כל הקבוצות"],
      quote: "חזרות, תלבושות, ורגע אחד על הבמה — יחד.",
      featured: true,
      relatedEventId: "evt_past_show",
      tags: ["מופע", "זיכרון"]
    },
    {
      id: "leg_workshop",
      studioId: STUDIO_LK,
      title: "סדנת אורח בסטודיו",
      subtitle: "העשרה מקצועית לקבוצות נבחרות",
      year: 2023,
      kind: "guest_choreographer",
      eventType: "workshop",
      participatingGroups: ["LK Hip Hop Crew", "Modern Ensemble"],
      tags: ["סדנה", "העשרה"]
    },
    {
      id: "leg_rehearsal_season",
      studioId: STUDIO_LK,
      title: "עונת חזרות",
      subtitle: "הכנת כוריאוגרפיה והופעה",
      year: 2025,
      kind: "showcase",
      eventType: "showcase",
      participatingGroups: ["נבחרות — חזרות"],
      relatedEventId: "evt_current_showcase",
      memoryVideoUrl: "mock://legacy/rehearsal-teaser.mp4",
      tags: ["חזרות", "הכנה"]
    },
    {
      id: "leg_end_year_prep",
      studioId: STUDIO_LK,
      title: "הכנה למופע סוף שנה",
      subtitle: "תלבושות, סדר כניסות וחזרות גמר",
      year: 2026,
      kind: "annual_show",
      eventType: "performance",
      participatingGroups: ["כל הנבחרות"],
      relatedEventId: "evt_end_year_show",
      tags: ["סוף שנה", "הכנה"]
    }
  ];
}

export function seedStudioQuotes(): StudioLegacyQuote[] {
  return [
    {
      id: "q1",
      text: "אנחנו מלמדים טכניקה וביטוי — ובונים ביטחון וקהילה סביב הריקוד.",
      attribution: "מנהלת סטודיו LK (דמו)"
    },
    {
      id: "q2",
      text: "כל חזרה היא הזדמנות להתקרב לבמה בשקט ובמקצועיות.",
      attribution: "צוות ההוראה"
    },
    {
      id: "q3",
      text: "הסטודיו מרגיש כמו בית — והבמה היא המקום שבו הכל מתחבר.",
      attribution: "קהילת התלמידים"
    }
  ];
}
