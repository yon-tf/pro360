// NOTE: Placeholder adapter. Replace with real API calls during backend integration.
import {
  gigJobs,
  gigContacts,
  gigApplicants,
  gigStats,
} from "../mock/gig";

export const gigApi = {
  listJobs: async () => gigJobs,
  getJobById: async (id: string) => gigJobs.find((j) => j.id === id) ?? null,
  listContacts: async () => gigContacts,
  listApplicants: async () => gigApplicants,
  getStats: async () => gigStats,
};
