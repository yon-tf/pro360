// NOTE: Placeholder adapter. Replace with real API calls during backend integration.
import { pods, podHistory } from "../mock/pods";
import { professionalProfiles } from "@/features/professionals/mock/professionalProfiles";

export const teamApi = {
  listPods: async () => pods,
  getPodById: async (id: string) => pods.find((p) => p.id === id) ?? null,
  getPodHistory: async (podId: string) => podHistory.filter((entry) => entry.podId === podId),
  listProfessionals: async () => professionalProfiles,
};
