// NOTE: Placeholder adapter. Replace with real API calls during backend integration.
import {
  monthlyChat,
  monthlyAppointments,
  monthlyRatings,
  monthlyActivation,
  monthlyPayout,
  weeklyChat,
  weeklyAppointments,
} from "../mock/dashboardTimeSeries";
import { organizationQuality } from "@/features/org/mock/organizations";
import { professionals } from "@/features/professionals/mock/professionals";
import { appointments } from "@/features/appointments/mock/appointments";

export const pro360Api = {
  getDashboardSeries: async () => ({
    monthlyChat,
    monthlyAppointments,
    monthlyRatings,
    monthlyActivation,
    monthlyPayout,
    weeklyChat,
    weeklyAppointments,
  }),
  listOrganizations: async () => organizationQuality,
  listProfessionals: async () => professionals,
  listAppointments: async () => appointments,
};
