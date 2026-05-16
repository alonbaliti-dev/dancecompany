/**
 * Hebrew product voice — LK Dance School, כפר ויתקין.
 */

export const empty = {
  tasks: { title: "אין משימות פתוחות", description: "כשתגיע משימה מהמורה או מהסטודיו — תופיע כאן, מסודר לפי דחיפות." },
  updates: { title: "אין עדכונים", description: "כשיהיה משהו חשוב מ-LK — תקבלו הודעה כאן." },
  notifications: { title: "הכול נקרא", description: "אין התראות חדשות. נשמור על הקצב לקראת החזרות והמופע." },
  gallery: { title: "הגלריה מתמלאת", description: "סרטוני תרגול, חזרות וזיכרונות מהבמה — יופיעו כאן." },
  schedule: { title: "אין שיעורים להצגה", description: "בדקו שוב מאוחר יותר או פנו למורה בכפר ויתקין." }
} as const;

export const cta = {
  continue: "המשך",
  open: "פתיחה",
  back: "חזרה",
  save: "שמירה",
  send: "שליחה",
  skip: "דילוג",
  markRead: "סימון כנקרא"
} as const;
