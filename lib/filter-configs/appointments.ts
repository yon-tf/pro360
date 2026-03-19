import { getUniqueOrganisations } from "@/features/appointments/mock/appointments";
import { pods } from "@/features/team/mock/pods";
import type { AdvancedFilterConfig, FilterContext } from "@/lib/filters/types";

export type AttendanceFilter = "attended" | "partial" | "missed" | "no_show";
export type QualityFlag =
  | "late_notes"
  | "missing_notes"
  | "no_show"
  | "rule_hits"
  | "below_threshold_ai_score"
  | "partial_attendance"
  | "below_expected_volume";

export interface AppointmentsAdvanced {
  orgId: string | null;
  podId: string | null;
  attendanceStatuses: AttendanceFilter[];
  hasTranscript: boolean | null;
  hasAiSummary: boolean | null;
  hasCaseNotes: boolean | null;
  hasPodNotes: boolean | null;
  aiRatingMin: number | null;
  qualityFlags: QualityFlag[];
}

export const APPOINTMENTS_ADVANCED_DEFAULTS: AppointmentsAdvanced = {
  orgId: null,
  podId: null,
  attendanceStatuses: [],
  hasTranscript: null,
  hasAiSummary: null,
  hasCaseNotes: null,
  hasPodNotes: null,
  aiRatingMin: null,
  qualityFlags: [],
};

const ATTENDANCE_OPTIONS = [
  { value: "attended", label: "Attended" },
  { value: "partial", label: "Partial" },
  { value: "missed", label: "Missed" },
  { value: "no_show", label: "No-show" },
];

const QUALITY_FLAG_OPTIONS = [
  { value: "late_notes", label: "Late notes" },
  { value: "missing_notes", label: "Missing notes" },
  { value: "no_show", label: "No-show" },
  { value: "rule_hits", label: "Rule engine hits" },
  { value: "partial_attendance", label: "Partial attendance" },
  { value: "below_expected_volume", label: "Below expected volume" },
  { value: "below_threshold_ai_score", label: "Below AI threshold" },
];

function orgOptions() {
  return getUniqueOrganisations().map((o) => ({ value: o.id, label: o.name }));
}

function podOptions() {
  return pods
    .filter((p) => p.status === "Active")
    .map((p) => ({ value: p.id, label: p.name }));
}

function getOrgName(id: unknown): string | null {
  if (!id || typeof id !== "string") return null;
  return getUniqueOrganisations().find((o) => o.id === id)?.name ?? null;
}

function getPodName(id: unknown): string | null {
  if (!id || typeof id !== "string") return null;
  return pods.find((p) => p.id === id)?.name ?? null;
}

export const appointmentsFilterConfig: AdvancedFilterConfig<AppointmentsAdvanced> = {
  defaults: APPOINTMENTS_ADVANCED_DEFAULTS,
  groups: [
    {
      title: "Target",
      fields: [
        {
          key: "orgId",
          label: "Organisation",
          type: "select",
          options: orgOptions,
          searchable: true,
          isEnabled: (ctx: FilterContext) => ctx.activeContext !== "internal",
          lockedDisplay: "ThoughtFull",
          chipLabel: (v) => getOrgName(v),
        },
      ],
    },
    {
      title: "Details",
      fields: [
        {
          key: "podId",
          label: "Pod",
          type: "select",
          options: podOptions,
          chipLabel: (v) => getPodName(v),
        },
      ],
    },
    {
      title: "Status",
      fields: [
        {
          key: "attendanceStatuses",
          label: "Attendance",
          type: "multi-select",
          options: ATTENDANCE_OPTIONS,
          chipLabel: (v) => {
            const arr = v as string[];
            return arr.length > 0 ? `Attendance: ${arr.length}` : null;
          },
        },
      ],
    },
    {
      title: "Documentation & content",
      fields: [
        { key: "hasTranscript", label: "Has transcript", type: "tri-state", chipLabel: (v) => (v === true ? "Has transcript" : v === false ? "No transcript" : null) },
        { key: "hasAiSummary", label: "Has AI summary", type: "tri-state", chipLabel: (v) => (v === true ? "Has AI summary" : v === false ? "No AI summary" : null) },
        { key: "hasCaseNotes", label: "Has case notes", type: "tri-state", chipLabel: (v) => (v === true ? "Has case notes" : v === false ? "No case notes" : null) },
        { key: "hasPodNotes", label: "Has pod notes / topics", type: "tri-state", chipLabel: (v) => (v === true ? "Has pod notes" : v === false ? "No pod notes" : null) },
      ],
    },
    {
      title: "Quality",
      fields: [
        {
          key: "aiRatingMin",
          label: "AI rating minimum",
          type: "slider",
          sliderConfig: { min: 1, max: 5, step: 0.5, suffix: "/ 5" },
          isActive: (v) => v != null && (v as number) > 1,
          chipLabel: (v) => (v != null ? `AI ≥ ${v}` : null),
        },
        {
          key: "qualityFlags",
          label: "Quality flags",
          type: "multi-select",
          options: QUALITY_FLAG_OPTIONS,
          chipLabel: (v) => {
            const arr = v as string[];
            return arr.length > 0 ? `${arr.length} flag${arr.length > 1 ? "s" : ""}` : null;
          },
        },
      ],
    },
  ],
};
