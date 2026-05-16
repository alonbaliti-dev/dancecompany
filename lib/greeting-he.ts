/** Time-of-day greetings — LK Dance School voice. */
export function greetingForHour(date: Date = new Date()): { title: string; subtitle: string } {
  const h = date.getHours();
  if (h < 5) return { title: "לילה טוב", subtitle: "גם מנוחה טובה היא חלק מהצמיחה האמנותית." };
  if (h < 11) return { title: "בוקר טוב", subtitle: "יום חדש לתנועה, לביטחון ולקצב — ברוכים הבאים ל-LK." };
  if (h < 16) return { title: "צהריים טובים", subtitle: "קצב נשימה, מים, ואז — חזרה לריקוד." };
  if (h < 19) return { title: "אחר הצהריים טובים", subtitle: "הזמן לחזק טכניקה קטנה לפני השיעור או החזרה." };
  if (h < 22) return { title: "ערב טוב", subtitle: "סיום יום — עדיין אפשר נקודה אחת של התקדמות וביטוי." };
  return { title: "לילה טוב", subtitle: "מחר ניפגש בסטודיו — עד אז, מנוחה נעימה." };
}
