// NOTE: Placeholder adapter. Replace with real API calls during backend integration.
import {
  viewOnlyThreads,
  podThreads,
  interactiveThreads,
  threadMessages,
  threadMetadataByThreadId,
  chatProfessionals,
} from "../mock/chat";

export const chatApi = {
  listThreads: async () => ({
    viewOnly: viewOnlyThreads,
    pod: podThreads,
    interactive: interactiveThreads,
  }),
  getThreadMessages: async (threadId: string) => threadMessages[threadId] ?? [],
  getThreadMetadata: async (threadId: string) => threadMetadataByThreadId[threadId] ?? null,
  listProfessionals: async () => chatProfessionals,
};
