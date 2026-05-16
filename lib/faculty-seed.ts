import { STUDIO_LK } from "@/lib/platform/constants";
import { seedFacultyRecords } from "@/lib/studio/faculty-seed-data";
import { MENTOR_TEAM_SEASON_LABEL } from "@/lib/studio/staff-roster";
import type { StudioMission } from "@/lib/types";

export function seedStudioMission(): StudioMission {
  return {
    studioId: STUDIO_LK,
    foundedYear: 2018,
    missionStatement:
      "ללוות תלמידים ותלמידות במסע של טכניקה, ביטוי ומשמעת — עם חיבור רגשי לתנועה, בקהילה חמה ומקצועית.",
    vision: "סטודיו שמאמין בצמיחה אישית, בביטחון על הבמה ובאיזון בין משמעת לביטוי אמנותי."
  };
}

export { seedFacultyRecords, MENTOR_TEAM_SEASON_LABEL };
