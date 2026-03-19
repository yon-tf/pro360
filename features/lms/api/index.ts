// NOTE: Placeholder adapter. Replace with real API calls during backend integration.
import {
  lmsModules,
  lmsEnrolledUsers,
  lmsStats,
} from "../mock/lms";

export const lmsApi = {
  listModules: async () => lmsModules,
  listEnrolledUsers: async () => lmsEnrolledUsers,
  getStats: async () => lmsStats,
};
