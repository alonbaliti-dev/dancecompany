/**
 * Demo identity — platform owner vs fictional studio staff placeholders.
 * Teacher/management names are clearly fictional; do not present as real people.
 */

export const PLATFORM_OWNER_ID = "u_creator" as const;
export const PLATFORM_OWNER_NAME = "אלון בליטי" as const;
export const PLATFORM_OWNER_INITIAL = "א" as const;
export const PLATFORM_OWNER_BADGE = "Platform Owner / Super Admin" as const;

export const DEMO_DATA_FOOTNOTE_HE = "צוות הדגמה — שמות פיקטיביים, לא אנשים אמיתיים";
export const DEMO_STUDIO_DISPLAY_NAME = "LK Dance School — כפר ויתקין (דמו)";

export const DEMO_STUDIO_MGMT_NAME = "מנהלת סטודיו LK (דמו)";
export const DEMO_STUDIO_MGMT_ALT_NAME = "מנהל משנה (דמו)";

/** Directory user id → display name for demo teachers / studio management */
export const DEMO_STAFF_NAMES: Record<string, string> = {
  u_liata: DEMO_STUDIO_MGMT_NAME,
  u_noa: "שירה מ. (דמו)",
  u_dan: "עומר ד. (דמו)",
  u_roni: "רות ל. (דמו)",
  u_mai: "יעל כ. (דמו)",
  u_admin2: DEMO_STUDIO_MGMT_ALT_NAME,
  [PLATFORM_OWNER_ID]: PLATFORM_OWNER_NAME
};

export function demoStaffName(userId: string, fallback = "מורה (דמו)"): string {
  return DEMO_STAFF_NAMES[userId] ?? fallback;
}

/** Group id → teacher for attendance intelligence mock */
export const DEMO_GROUP_TEACHERS: Record<string, { teacherId: string; teacherName: string }> = {
  grp_hh_sel: { teacherId: "u_liata", teacherName: DEMO_STUDIO_MGMT_NAME },
  grp_hh_teen: { teacherId: "u_noa", teacherName: demoStaffName("u_noa") },
  grp_hh_new: { teacherId: "u_noa", teacherName: demoStaffName("u_noa") },
  grp_mod_adv: { teacherId: "u_noa", teacherName: demoStaffName("u_noa") },
  grp_mod_mid: { teacherId: "u_mai", teacherName: demoStaffName("u_mai") },
  grp_ballet_kids: { teacherId: "u_roni", teacherName: demoStaffName("u_roni") },
  grp_ballet_sel: { teacherId: "u_roni", teacherName: demoStaffName("u_roni") },
  grp_flamenco: { teacherId: "u_liata", teacherName: DEMO_STUDIO_MGMT_NAME },
  grp_acro: { teacherId: "u_noa", teacherName: demoStaffName("u_noa") },
  grp_rep: { teacherId: "u_liata", teacherName: DEMO_STUDIO_MGMT_NAME },
  grp_tech: { teacherId: "u_dan", teacherName: demoStaffName("u_dan") }
};
