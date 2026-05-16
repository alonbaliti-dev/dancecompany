/** Map retired demo user ids to real roster ids when regenerating database. */
export const LEGACY_USER_ID_MAP: Record<string, string> = {
  u_noa: "u_t_yakir",
  u_dan: "u_t_shabi",
  u_roni: "u_t_lena",
  u_mai: "u_t_almog",
  pl_u_noa: "pl_u_t_yakir",
  pl_u_dan: "pl_u_t_shabi",
  pl_u_roni: "pl_u_t_lena",
  pl_u_mai: "pl_u_t_almog"
};

/** Retired demo display names → real roster names */
export const LEGACY_DISPLAY_NAME_MAP: Record<string, string> = {
  "לנה קריושקו": "לנה קרושקו",
  "שירה מ. (דמו)": "יקיר גבאי",
  "עומר ד. (דמו)": "שבי שלום אברמוביץ",
  "רות ל. (דמו)": "לנה קרושקו",
  "יעל כ. (דמו)": "אלמוג דוד",
  "מנהלת סטודיו LK (דמו)": "ליאת קפלינסקי",
  "מנהל משנה (דמו)": "שחר קפלינסקי"
};

function migrateString(s: string): string {
  let out = s;
  for (const [from, to] of Object.entries(LEGACY_USER_ID_MAP)) {
    out = out.split(from).join(to);
  }
  for (const [from, to] of Object.entries(LEGACY_DISPLAY_NAME_MAP)) {
    out = out.split(from).join(to);
  }
  return out;
}

export function migrateLegacyIdsDeep<T>(value: T): T {
  if (typeof value === "string") {
    return migrateString(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => migrateLegacyIdsDeep(v)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = migrateLegacyIdsDeep(v);
    }
    return out as T;
  }
  return value;
}
