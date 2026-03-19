export type RuleType = "integration" | "support" | "maintenance" | "routing" | "notification" | "data";
export type RuleStatus = "active" | "paused" | "invalid";
export type RuleTeam = "Clinical Ops" | "Support" | "Platform" | "Revenue";
export type RuleEnvironment = "Production" | "Staging";

export interface RuleTrigger {
  family: string;
  signal: string;
  source: string;
}

export interface RuleFamily {
  id: string;
  label: string;
  description: string;
}

export interface RuleSignal {
  id: string;
  familyId: string;
  label: string;
  description: string;
  source: string;
}

export interface RuleTemplate {
  id: string;
  label: string;
  description: string;
  familyId: string;
  signalId: string;
  conditionParameter: string;
  conditionOperator: string;
  conditionValue: string;
  actionType: string;
  actionTitle: string;
}

export type RulePreset = RuleTemplate;

export interface RuleCondition {
  id: string;
  combinator?: "and" | "or";
  parameter: string;
  operator: string;
  value: string;
}

export interface RuleAction {
  id: string;
  actionType: string;
  title: string;
  description: string;
  order: number;
}

export interface RuleMetadata {
  executionCount: number;
  successRate: number;
  createdAt: string;
  createdByName: string;
  createdByRole: RuleTeam;
  lastModified: string;
  owner: string;
  lastTriggeredAt: string;
  lastTriggeredBy: string;
  lastTriggeredOutcome: "Success" | "Error";
  environment: RuleEnvironment;
}

export interface RuleActivityEntry {
  id: string;
  kind: "created" | "updated" | "triggered" | "success" | "error";
  title: string;
  description: string;
  at: string;
  actor: string;
}

export interface RuleSummary {
  id: string;
  name: string;
  type: RuleType;
  status: RuleStatus;
  enabled: boolean;
  team: RuleTeam;
  lastRunAt: string;
  triggerPreview: string;
  actionPreview: string;
  executionCount: number;
}

export interface RuleDefinition {
  summary: RuleSummary;
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  actions: RuleAction[];
  metadata: RuleMetadata;
  activity: RuleActivityEntry[];
}

export interface LegacyRuleRow {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  timesTriggered: number;
}

export const triggerCategories: RuleFamily[] = [
  {
    id: "tfp_plus_qualification",
    label: "TFP+ Qualification",
    description: "Eligibility and tier rules that determine Plus status and related payout effects.",
  },
  {
    id: "performance_benchmarking",
    label: "Performance Benchmarking",
    description: "Proactive monitoring for SLA, responsiveness, and quality deviations.",
  },
  {
    id: "documentation_compliance",
    label: "Documentation Compliance",
    description: "Case note and documentation timeliness checks.",
  },
  {
    id: "attendance_reliability",
    label: "Attendance / Reliability",
    description: "Session attendance, missed appointments, and reliability signals.",
  },
  {
    id: "rating_feedback",
    label: "Rating / Feedback",
    description: "Client and AI rating signals that indicate quality shifts.",
  },
  {
    id: "payout_impact",
    label: "Payout Impact",
    description: "Rules that influence payout multipliers or compensation outcomes.",
  },
  {
    id: "automation_alerts",
    label: "Automation Alerts",
    description: "System alerts triggered by rule engine or downstream operational signals.",
  },
];

export const triggers: RuleSignal[] = [
  { id: "response_rate_24h", familyId: "performance_benchmarking", label: "Response rate (24h)", description: "Messages responded to within 24 hours.", source: "appointments" },
  { id: "tfp_plus_status", familyId: "tfp_plus_qualification", label: "TFP+ status", description: "Current Plus qualification state.", source: "professionals" },
  { id: "client_chat_hours", familyId: "performance_benchmarking", label: "Client chat hours", description: "Hours spent in client chats or audio sessions.", source: "appointments" },
  { id: "payout_multiplier", familyId: "payout_impact", label: "Payout multiplier", description: "Multiplier used in payout calculations.", source: "professionals" },
  { id: "rating_feedback_score", familyId: "rating_feedback", label: "Rating / feedback score", description: "Client or session rating signal.", source: "appointments" },
  { id: "missed_or_late_sessions", familyId: "attendance_reliability", label: "Missed or late sessions", description: "Missed or late session count.", source: "appointments" },
  { id: "case_notes_submitted", familyId: "documentation_compliance", label: "Case notes submitted", description: "On-time or overdue case note completion.", source: "appointments" },
  { id: "ai_quality_score", familyId: "performance_benchmarking", label: "AI quality score", description: "AI quality or review score.", source: "appointments" },
  { id: "activation_rating", familyId: "performance_benchmarking", label: "Activation rating", description: "Activation quality or success rating.", source: "professionals" },
  { id: "rule_engine_hits", familyId: "automation_alerts", label: "Rule engine hits", description: "Rules triggered by downstream quality checks.", source: "appointments" },
];

export const ruleEventTypes = triggers; // legacy alias for compatibility
export const ruleFamilies = triggerCategories; // legacy alias for compatibility
export const ruleSignals = triggers; // legacy alias for compatibility

export const ruleSources = [
  { id: "appointments", label: "Appointments" },
  { id: "professionals", label: "Professional Profile" },
  { id: "payouts", label: "Payouts" },
  { id: "automation", label: "Automation / Alerts" },
];

export const conditionParameters = triggers.map((trigger) => ({ id: trigger.id, label: trigger.label }));

export const conditionOperators = [
  { id: "equals", label: "is" },
  { id: "not_equals", label: "is not" },
  { id: "greater_than", label: "is greater than" },
  { id: "less_than", label: "is less than" },
  { id: "contains", label: "contains" },
];

export function getTriggerCategoryLabel(categoryId: string): string {
  return triggerCategories.find((category) => category.id === categoryId)?.label ?? categoryId;
}

export function getTriggerLabel(triggerId: string): string {
  return triggers.find((trigger) => trigger.id === triggerId)?.label ?? triggerId;
}

export function getTriggersForCategory(categoryId: string): RuleSignal[] {
  return triggers.filter((trigger) => trigger.familyId === categoryId);
}

export function getTriggerSource(triggerId: string): string {
  return triggers.find((trigger) => trigger.id === triggerId)?.source ?? "";
}

export const getFamilyLabel = getTriggerCategoryLabel; // legacy alias for compatibility
export const getSignalLabel = getTriggerLabel; // legacy alias for compatibility
export const getSignalsForFamily = getTriggersForCategory; // legacy alias for compatibility
export const getSignalSource = getTriggerSource; // legacy alias for compatibility

export const rulePresets: RuleTemplate[] = [
  {
    id: "tfp-plus-qualification",
    label: "TFP+ Qualification",
    description: "Check whether a professional qualifies for Plus status and alert Clinical Ops.",
    familyId: "tfp_plus_qualification",
    signalId: "tfp_plus_status",
    conditionParameter: "tfp_plus_status",
    conditionOperator: "equals",
    conditionValue: "not qualified",
    actionType: "notify_clinical_ops",
    actionTitle: "Notify Clinical Ops",
  },
  {
    id: "performance-alert",
    label: "Performance Alert",
    description: "Flag response rate drops before they affect performance reviews.",
    familyId: "performance_benchmarking",
    signalId: "response_rate_24h",
    conditionParameter: "response_rate_24h",
    conditionOperator: "less_than",
    conditionValue: "90%",
    actionType: "reassign_tier_2",
    actionTitle: "Reassign to Tier 2 Lead",
  },
  {
    id: "documentation-compliance",
    label: "Documentation Compliance",
    description: "Catch late or missing case notes before the compliance window closes.",
    familyId: "documentation_compliance",
    signalId: "case_notes_submitted",
    conditionParameter: "case_notes_submitted",
    conditionOperator: "less_than",
    conditionValue: "100%",
    actionType: "create_compliance_task",
    actionTitle: "Create compliance task",
  },
  {
    id: "payout-impact",
    label: "Payout Impact",
    description: "Adjust compensation logic when payout drivers change.",
    familyId: "payout_impact",
    signalId: "payout_multiplier",
    conditionParameter: "payout_multiplier",
    conditionOperator: "less_than",
    conditionValue: "1.0x",
    actionType: "flag_payout_review",
    actionTitle: "Flag payout review",
  },
];

export const ruleTemplates = rulePresets; // legacy alias for compatibility

export const actionCatalog = [
  {
    id: "notify_clinical_ops",
    label: "Notify Clinical Ops",
    description: "Send a structured operational alert to the Clinical Ops inbox.",
  },
  {
    id: "reassign_tier_2",
    label: "Reassign to Tier 2 Lead",
    description: "Escalate the case to Tier 2 Operations for review.",
  },
  {
    id: "flag_payout_review",
    label: "Flag payout review",
    description: "Mark the professional for payout review and compensation follow-up.",
  },
  {
    id: "notify_professional",
    label: "Notify professional",
    description: "Send a status or coaching notification to the professional.",
  },
  {
    id: "create_compliance_task",
    label: "Create compliance task",
    description: "Open a follow-up task for compliance review and tracking.",
  },
  {
    id: "post_quality_alert",
    label: "Post quality alert",
    description: "Publish a quality alert to the operations feed.",
  },
  {
    id: "open_case_review",
    label: "Open case review",
    description: "Create a case review workflow for Clinical Ops follow-up.",
  },
];

const ruleDefinitionsSeed: RuleDefinition[] = [
  {
    summary: {
      id: "tfp-plus-eligibility",
      name: "TFP+ Eligibility",
      type: "notification",
      status: "active",
      enabled: true,
      team: "Clinical Ops",
      lastRunAt: "2m ago",
      triggerPreview: "TFP+ status changes to not qualified",
      actionPreview: "Notify Clinical Ops",
      executionCount: 1240,
    },
    trigger: { family: "tfp_plus_qualification", signal: "tfp_plus_status", source: "professionals" },
    conditions: [
      { id: "c1", parameter: "tfp_plus_status", operator: "equals", value: "not qualified" },
    ],
    actions: [
      {
        id: "a1",
        actionType: "notify_clinical_ops",
        title: "Notify Clinical Ops",
        description: "Send a structured operational alert to the Clinical Ops inbox.",
        order: 1,
      },
    ],
    metadata: {
      executionCount: 1240,
      successRate: 99.2,
      createdAt: "Mar 04, 2026",
      createdByName: "Sarah Lee",
      createdByRole: "Clinical Ops",
      lastModified: "Mar 16, 2026",
      owner: "Clinical Ops",
      lastTriggeredAt: "2m ago",
      lastTriggeredBy: "System",
      lastTriggeredOutcome: "Success",
      environment: "Production",
    },
    activity: [
      {
        id: "tfp-plus-eligibility-created",
        kind: "created",
        title: "Rule created",
        description: "Created by Clinical Ops using the TFP+ Qualification preset.",
        at: "Mar 04, 2026",
        actor: "Sarah Lee",
      },
      {
        id: "tfp-plus-eligibility-success",
        kind: "success",
        title: "Rule triggered successfully",
        description: "Matched 1,240 times and notified Clinical Ops.",
        at: "2m ago",
        actor: "System",
      },
      {
        id: "tfp-plus-eligibility-updated",
        kind: "updated",
        title: "Rule updated",
        description: "Adjusted the trigger to use the latest TFP+ status mapping.",
        at: "Mar 16, 2026",
        actor: "Clinical Ops",
      },
    ],
  },
  {
    summary: {
      id: "response-rate-alert",
      name: "Response Rate Alert",
      type: "notification",
      status: "active",
      enabled: true,
      team: "Clinical Ops",
      lastRunAt: "14m ago",
      triggerPreview: "Response rate (24h) drops below 90%",
      actionPreview: "Reassign to Tier 2 Lead",
      executionCount: 820,
    },
    trigger: { family: "performance_benchmarking", signal: "response_rate_24h", source: "appointments" },
    conditions: [
      { id: "c1", parameter: "response_rate_24h", operator: "less_than", value: "90%" },
    ],
    actions: [
      {
        id: "a1",
        actionType: "reassign_tier_2",
        title: "Reassign to Tier 2 Lead",
        description: "Escalate the case to Tier 2 Operations for review.",
        order: 1,
      },
      {
        id: "a2",
        actionType: "notify_clinical_ops",
        title: "Notify Clinical Ops",
        description: "Send a structured operational alert to the Clinical Ops inbox.",
        order: 2,
      },
    ],
    metadata: {
      executionCount: 820,
      successRate: 97.6,
      createdAt: "Mar 01, 2026",
      createdByName: "Sarah Lee",
      createdByRole: "Clinical Ops",
      lastModified: "Mar 12, 2026",
      owner: "Clinical Ops",
      lastTriggeredAt: "14m ago",
      lastTriggeredBy: "System",
      lastTriggeredOutcome: "Success",
      environment: "Production",
    },
    activity: [
      {
        id: "response-rate-alert-created",
        kind: "created",
        title: "Rule created",
        description: "Created by Clinical Ops for response rate monitoring.",
        at: "Mar 01, 2026",
        actor: "Sarah Lee",
      },
      {
        id: "response-rate-alert-success",
        kind: "success",
        title: "Rule triggered successfully",
        description: "Reassigned the case to Tier 2 Lead and notified Clinical Ops.",
        at: "14m ago",
        actor: "System",
      },
      {
        id: "response-rate-alert-updated",
        kind: "updated",
        title: "Rule updated",
        description: "Lowered the alert threshold to match the current SLA standard.",
        at: "Mar 12, 2026",
        actor: "Clinical Ops",
      },
    ],
  },
  {
    summary: {
      id: "payout-multiplier-review",
      name: "Payout Multiplier Review",
      type: "data",
      status: "paused",
      enabled: false,
      team: "Revenue",
      lastRunAt: "Yesterday",
      triggerPreview: "Payout multiplier drops below 1.0x",
      actionPreview: "Flag payout review",
      executionCount: 406,
    },
    trigger: { family: "payout_impact", signal: "payout_multiplier", source: "payouts" },
    conditions: [
      { id: "c1", parameter: "payout_multiplier", operator: "less_than", value: "1.0x" },
    ],
    actions: [
      {
        id: "a1",
        actionType: "flag_payout_review",
        title: "Flag payout review",
        description: "Mark the professional for payout review and compensation follow-up.",
        order: 1,
      },
    ],
    metadata: {
      executionCount: 406,
      successRate: 100,
      createdAt: "Feb 22, 2026",
      createdByName: "Marcus Chen",
      createdByRole: "Revenue",
      lastModified: "Mar 10, 2026",
      owner: "Revenue Ops",
      lastTriggeredAt: "Yesterday",
      lastTriggeredBy: "System",
      lastTriggeredOutcome: "Success",
      environment: "Production",
    },
    activity: [
      {
        id: "payout-multiplier-review-created",
        kind: "created",
        title: "Rule created",
        description: "Created by Revenue Ops to monitor payout multiplier shifts.",
        at: "Feb 22, 2026",
        actor: "Marcus Chen",
      },
      {
        id: "payout-multiplier-review-success",
        kind: "success",
        title: "Rule triggered successfully",
        description: "Flagged payout review for the latest multiplier change.",
        at: "Yesterday",
        actor: "System",
      },
      {
        id: "payout-multiplier-review-updated",
        kind: "updated",
        title: "Rule paused",
        description: "Temporarily paused while the payout model is being reviewed.",
        at: "Mar 10, 2026",
        actor: "Revenue Ops",
      },
    ],
  },
  {
    summary: {
      id: "rating-feedback-alert",
      name: "Rating / Feedback Alert",
      type: "support",
      status: "active",
      enabled: true,
      team: "Clinical Ops",
      lastRunAt: "45m ago",
      triggerPreview: "Rating / feedback score drops below 4.5",
      actionPreview: "Notify professional",
      executionCount: 975,
    },
    trigger: { family: "rating_feedback", signal: "rating_feedback_score", source: "appointments" },
    conditions: [
      { id: "c1", parameter: "rating_feedback_score", operator: "less_than", value: "4.5" },
    ],
    actions: [
      {
        id: "a1",
        actionType: "notify_professional",
        title: "Notify professional",
        description: "Send a status or coaching notification to the professional.",
        order: 1,
      },
    ],
    metadata: {
      executionCount: 975,
      successRate: 98.4,
      createdAt: "Mar 05, 2026",
      createdByName: "Sarah Lee",
      createdByRole: "Clinical Ops",
      lastModified: "Mar 15, 2026",
      owner: "Clinical Ops",
      lastTriggeredAt: "45m ago",
      lastTriggeredBy: "System",
      lastTriggeredOutcome: "Success",
      environment: "Production",
    },
    activity: [
      {
        id: "rating-feedback-alert-created",
        kind: "created",
        title: "Rule created",
        description: "Created by Clinical Ops for feedback monitoring.",
        at: "Mar 05, 2026",
        actor: "Sarah Lee",
      },
      {
        id: "rating-feedback-alert-success",
        kind: "success",
        title: "Rule triggered successfully",
        description: "Sent a coaching notification to the professional.",
        at: "45m ago",
        actor: "System",
      },
      {
        id: "rating-feedback-alert-updated",
        kind: "updated",
        title: "Rule updated",
        description: "Adjusted the review threshold after QA feedback.",
        at: "Mar 15, 2026",
        actor: "Clinical Ops",
      },
    ],
  },
  {
    summary: {
      id: "missed-session-escalation",
      name: "Missed Session Escalation",
      type: "routing",
      status: "active",
      enabled: true,
      team: "Clinical Ops",
      lastRunAt: "1h ago",
      triggerPreview: "Missed or late sessions exceed threshold",
      actionPreview: "Reassign to Tier 2 Lead",
      executionCount: 512,
    },
    trigger: { family: "attendance_reliability", signal: "missed_or_late_sessions", source: "appointments" },
    conditions: [
      { id: "c1", parameter: "missed_or_late_sessions", operator: "greater_than", value: "1" },
    ],
    actions: [
      {
        id: "a1",
        actionType: "reassign_tier_2",
        title: "Reassign to Tier 2 Lead",
        description: "Escalate the case to Tier 2 Operations for review.",
        order: 1,
      },
      {
        id: "a2",
        actionType: "notify_clinical_ops",
        title: "Notify Clinical Ops",
        description: "Send a structured operational alert to the Clinical Ops inbox.",
        order: 2,
      },
    ],
    metadata: {
      executionCount: 512,
      successRate: 89.3,
      createdAt: "Mar 03, 2026",
      createdByName: "Sarah Lee",
      createdByRole: "Clinical Ops",
      lastModified: "Mar 16, 2026",
      owner: "Clinical Ops",
      lastTriggeredAt: "1h ago",
      lastTriggeredBy: "System",
      lastTriggeredOutcome: "Error",
      environment: "Production",
    },
    activity: [
      {
        id: "missed-session-escalation-created",
        kind: "created",
        title: "Rule created",
        description: "Created by Clinical Ops for missed session escalation.",
        at: "Mar 03, 2026",
        actor: "Sarah Lee",
      },
      {
        id: "missed-session-escalation-error",
        kind: "error",
        title: "Rule triggered with an error",
        description: "Escalation ran, but the reassignment step failed validation.",
        at: "1h ago",
        actor: "System",
      },
      {
        id: "missed-session-escalation-updated",
        kind: "updated",
        title: "Rule updated",
        description: "Refined the missed session threshold and reassignment target.",
        at: "Mar 16, 2026",
        actor: "Clinical Ops",
      },
    ],
  },
  {
    summary: {
      id: "case-notes-compliance",
      name: "Case Notes Compliance",
      type: "maintenance",
      status: "active",
      enabled: true,
      team: "Clinical Ops",
      lastRunAt: "6d ago",
      triggerPreview: "Case notes submitted fall below 100%",
      actionPreview: "Create compliance task",
      executionCount: 77,
    },
    trigger: { family: "documentation_compliance", signal: "case_notes_submitted", source: "appointments" },
    conditions: [
      { id: "c1", parameter: "case_notes_submitted", operator: "less_than", value: "100%" },
    ],
    actions: [
      {
        id: "a1",
        actionType: "create_compliance_task",
        title: "Create compliance task",
        description: "Open a follow-up task for compliance review and tracking.",
        order: 1,
      },
    ],
    metadata: {
      executionCount: 77,
      successRate: 100,
      createdAt: "Mar 07, 2026",
      createdByName: "Sarah Lee",
      createdByRole: "Clinical Ops",
      lastModified: "Mar 11, 2026",
      owner: "Clinical Ops",
      lastTriggeredAt: "6d ago",
      lastTriggeredBy: "System",
      lastTriggeredOutcome: "Success",
      environment: "Production",
    },
    activity: [
      {
        id: "case-notes-compliance-created",
        kind: "created",
        title: "Rule created",
        description: "Created by Clinical Ops for compliance tracking.",
        at: "Mar 07, 2026",
        actor: "Sarah Lee",
      },
      {
        id: "case-notes-compliance-success",
        kind: "success",
        title: "Rule triggered successfully",
        description: "Created a compliance task for overdue case notes.",
        at: "6d ago",
        actor: "System",
      },
      {
        id: "case-notes-compliance-updated",
        kind: "updated",
        title: "Rule updated",
        description: "Updated the trigger threshold to match the latest policy.",
        at: "Mar 11, 2026",
        actor: "Clinical Ops",
      },
    ],
  },
];

export const rulesList: LegacyRuleRow[] = ruleDefinitionsSeed.map((rule) => ({
  id: rule.summary.id,
  name: rule.summary.name,
  trigger: rule.summary.triggerPreview,
  action: rule.summary.actionPreview,
  enabled: rule.summary.enabled,
  timesTriggered: rule.metadata.executionCount > 0 ? Math.max(1, Math.round(rule.metadata.executionCount / 100)) : 0,
}));

const structuredCloneFallback = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function getRuleSummaries(): RuleSummary[] {
  return ruleDefinitionsSeed.map((rule) => ({
    ...structuredCloneFallback(rule.summary),
    executionCount: rule.metadata.executionCount,
  }));
}

export function getRuleDefinitions(): RuleDefinition[] {
  return structuredCloneFallback(ruleDefinitionsSeed);
}

export function getRuleDefinitionById(ruleId: string): RuleDefinition | undefined {
  const match = ruleDefinitionsSeed.find((rule) => rule.summary.id === ruleId);
  return match ? structuredCloneFallback(match) : undefined;
}

export function createEmptyRuleDefinition(): RuleDefinition {
  return {
    summary: {
      id: "draft-rule",
      name: "Untitled rule",
      type: "support",
      status: "paused",
      enabled: false,
      team: "Clinical Ops",
      lastRunAt: "Never",
      triggerPreview: "Choose a trigger to define this rule",
      actionPreview: "Add at least one action",
      executionCount: 0,
    },
    trigger: {
      family: "",
      signal: "",
      source: "",
    },
    conditions: [
      { id: "draft-condition-1", combinator: "and", parameter: "", operator: "", value: "" },
    ],
    actions: [
      {
        id: "draft-action-1",
        actionType: "",
        title: "Action pending",
        description: "Choose an action to define the expected outcome.",
        order: 1,
      },
    ],
    metadata: {
      executionCount: 0,
      successRate: 0,
      createdAt: "Not saved yet",
      createdByName: "Sarah Lee",
      createdByRole: "Clinical Ops",
      lastModified: "Not saved yet",
      owner: "Clinical Ops",
      lastTriggeredAt: "Never",
      lastTriggeredBy: "—",
      lastTriggeredOutcome: "Success",
      environment: "Production",
    },
    activity: [],
  };
}
