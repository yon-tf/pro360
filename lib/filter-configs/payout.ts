import type { AdvancedFilterConfig, FilterContext } from "@/lib/filters/types";

export interface PayoutAdvanced {
  reviewer: string | null;
  statusFilter: string | null;
  flaggedOnly: boolean | null;
  belowMinimum: boolean | null;
}

export const PAYOUT_ADVANCED_DEFAULTS: PayoutAdvanced = {
  reviewer: null,
  statusFilter: null,
  flaggedOnly: null,
  belowMinimum: null,
};

const REVIEWER_OPTIONS = [
  { value: "sarah", label: "Sarah Lee" },
  { value: "anton", label: "Anton Kraskov" },
];

const STATUS_OPTIONS = [
  { value: "Not started", label: "Not started" },
  { value: "Draft", label: "Draft" },
  { value: "Blocked", label: "Blocked" },
  { value: "Completed", label: "Completed" },
];

export const payoutFilterConfig: AdvancedFilterConfig<PayoutAdvanced> = {
  defaults: PAYOUT_ADVANCED_DEFAULTS,
  groups: [
    {
      title: "Target",
      isVisible: (ctx: FilterContext) => ctx.activeTab === "reports",
      fields: [
        {
          key: "reviewer",
          label: "Reviewer",
          type: "select",
          options: REVIEWER_OPTIONS,
          chipLabel: (v) => {
            if (!v) return null;
            return REVIEWER_OPTIONS.find((o) => o.value === v)?.label ?? null;
          },
        },
      ],
    },
    {
      title: "Status",
      fields: [
        {
          key: "statusFilter",
          label: "Report status",
          type: "select",
          options: STATUS_OPTIONS,
          isVisible: (ctx: FilterContext) => ctx.activeTab === "reports",
          chipLabel: (v) => (v ? `Status: ${v}` : null),
        },
        {
          key: "flaggedOnly",
          label: "Flagged only",
          type: "tri-state",
          chipLabel: (v) => (v === true ? "Flagged" : null),
        },
        {
          key: "belowMinimum",
          label: "Below minimum",
          type: "tri-state",
          isVisible: (ctx: FilterContext) => ctx.activeTab === "reports",
          chipLabel: (v) => (v === true ? "Below min" : null),
        },
      ],
    },
  ],
};
