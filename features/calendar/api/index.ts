// NOTE: Placeholder adapter. Replace with real API calls during backend integration.
import {
  calendarEvents,
  calendarDayLabel,
  calendarDayShort,
  calendarDayWeekday,
} from "../mock/calendar";

export const calendarApi = {
  listEvents: async () => calendarEvents,
  getDayLabels: async () => ({
    dayLabel: calendarDayLabel,
    dayShort: calendarDayShort,
    dayWeekday: calendarDayWeekday,
  }),
};
