// NOTE: Placeholder adapter. Replace with real API calls during backend integration.
import {
  professionalProfiles,
  credentialRecords,
  tfpIdToProId,
  type ProfessionalProfile,
} from "../mock/professionalProfiles";
import {
  getMergedProfessionalProfiles,
  upsertStoredProfessionalProfile,
} from "../mock/professionalProfileStore";
import {
  PROFESSIONAL_IMPORT_COLUMNS,
  PROFESSIONAL_IMPORT_MOCK_ROWS,
} from "../mock/professionalImport";

export const professionalsApi = {
  list: async () => professionalProfiles,
  getById: async (id: string) => professionalProfiles.find((p) => p.id === id) ?? null,
  listMerged: async () => getMergedProfessionalProfiles(professionalProfiles),
  upsert: async (profile: ProfessionalProfile) => upsertStoredProfessionalProfile(profile),
  getCredentialRecords: async () => credentialRecords,
  getTfpIdToProId: async () => tfpIdToProId,
  getImportTemplate: async () => ({
    columns: PROFESSIONAL_IMPORT_COLUMNS,
    rows: PROFESSIONAL_IMPORT_MOCK_ROWS,
  }),
};
