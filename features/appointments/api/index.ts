import {
  appointments,
  appointmentNotes,
  appointmentTimelineEvents,
  appointmentMetadata,
  appointmentAttendanceHistory,
  getUniqueOrganisations,
} from "../mock/appointments";

export const appointmentsApi = {
  list: async () => appointments,
  getById: async (id: string) => appointments.find((a) => a.id === id) ?? null,
  getNotes: async (id: string) => appointmentNotes[id] ?? [],
  getTimeline: async (id: string) => appointmentTimelineEvents[id] ?? [],
  getMetadata: async (id: string) => appointmentMetadata[id] ?? null,
  getAttendanceHistory: async (id: string) => appointmentAttendanceHistory[id] ?? [],
  getUniqueOrganisations: async () => getUniqueOrganisations(),
};
