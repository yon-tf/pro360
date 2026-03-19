export const calendarEvents = [
  { id: "e1", title: "Face to face meeting", with: "Emily Johnson", start: "09:00", end: "10:00", type: "f2f", badge: "Client" },
  { id: "e2", title: "Face to face meeting", with: "Michael Chen", start: "11:00", end: "12:00", type: "f2f", badge: "Client" },
  { id: "e3", title: "Pod meeting", with: "Clinical Team", start: "14:00", end: "15:00", type: "pod", badge: "Team" },
  { id: "e4", title: "Face to face meeting", with: "Rachel Williams", start: "15:30", end: "16:30", type: "f2f", badge: "Client" },
  { id: "e5", title: "Townhall", with: "All Staff", start: "17:00", end: "18:00", type: "townhall", badge: "Company" },
];

export const calendarDayLabel = "February 11, 2026";
export const calendarDayShort = "Feb 11";
export const calendarDayWeekday = "Wednesday";

/** Hour slots for day view (8 AM–9 PM) — Figma */
export const calendarDaySlots = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

/** Mini calendar: February 2026 — [dayOfWeek0-6, date][] for grid. Feb 1 2026 = Sunday. */
export const calendarMonthLabel = "February 2026";
export const calendarMonthDays: { dayOfWeek: number; date: number }[] = (() => {
  const firstDay = 0; // Sunday
  const daysInMonth = 28;
  const result: { dayOfWeek: number; date: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    result.push({ dayOfWeek: (firstDay + d - 1) % 7, date: d });
  }
  return result;
})();
export const calendarSelectedDate = 11;
