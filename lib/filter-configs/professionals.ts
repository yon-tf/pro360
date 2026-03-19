import { pods } from "@/features/team/mock/pods";
import { professionalProfiles } from "@/features/professionals/mock/professionalProfiles";
import type { AdvancedFilterConfig } from "@/lib/filters/types";

export interface ProfessionalsAdvanced {
  profileStatus: string | null;
  credentialStatus: string | null;
  country: string | null;
  podId: string | null;
  profession: string | null;
  isPodLeader: boolean | null;
}

export const PROFESSIONALS_ADVANCED_DEFAULTS: ProfessionalsAdvanced = {
  profileStatus: null,
  credentialStatus: null,
  country: null,
  podId: null,
  profession: null,
  isPodLeader: null,
};

const PROFILE_STATUS_OPTIONS = [
  { value: "pending_introduction", label: "Pending introduction" },
  { value: "updated_introduction", label: "Updated introduction" },
  { value: "imported", label: "Imported" },
];

const CREDENTIAL_STATUS_OPTIONS = [
  { value: "Valid", label: "Valid" },
  { value: "Expiring soon", label: "Expiring soon" },
  { value: "Expired", label: "Expired" },
];

function countryOptions() {
  const countries = [...new Set(professionalProfiles.map((p) => p.country).filter(Boolean))].sort();
  return countries.map((c) => ({ value: c, label: c }));
}

function podOptions() {
  return pods
    .filter((p) => p.status === "Active")
    .map((p) => ({ value: p.id, label: p.name }));
}

function professionOptions() {
  const professions = [...new Set(professionalProfiles.map((p) => p.profession).filter(Boolean))].sort();
  return professions.map((p) => ({ value: p, label: p }));
}

function getPodName(id: unknown): string | null {
  if (!id || typeof id !== "string") return null;
  return pods.find((p) => p.id === id)?.name ?? null;
}

export const professionalsFilterConfig: AdvancedFilterConfig<ProfessionalsAdvanced> = {
  defaults: PROFESSIONALS_ADVANCED_DEFAULTS,
  groups: [
    {
      title: "Status",
      fields: [
        {
          key: "profileStatus",
          label: "Profile status",
          type: "select",
          options: PROFILE_STATUS_OPTIONS,
          chipLabel: (v) => {
            if (!v) return null;
            return PROFILE_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? null;
          },
        },
        {
          key: "credentialStatus",
          label: "Credential status",
          type: "select",
          options: CREDENTIAL_STATUS_OPTIONS,
          chipLabel: (v) => {
            if (!v) return null;
            return `Credentials: ${v}`;
          },
        },
      ],
    },
    {
      title: "Details",
      fields: [
        {
          key: "profession",
          label: "Profession / Role",
          type: "select",
          options: professionOptions,
          chipLabel: (v) => (v ? `${v}` : null),
        },
        {
          key: "country",
          label: "Country",
          type: "select",
          options: countryOptions,
          chipLabel: (v) => (v ? `Country: ${v}` : null),
        },
        {
          key: "podId",
          label: "Pod",
          type: "select",
          options: podOptions,
          chipLabel: (v) => getPodName(v),
        },
        {
          key: "isPodLeader",
          label: "Pod leader",
          type: "tri-state",
          chipLabel: (v) => (v === true ? "Pod leader" : v === false ? "Not pod leader" : null),
        },
      ],
    },
  ],
};
