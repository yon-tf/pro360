export const predefinedVariables = [
  { id: "response_rate_24h", label: "Response rate (24h)", description: "% messages responded to within 24 hours" },
  { id: "tfp_plus_status", label: "TFP+ status", description: "Qualified (>90% in 24h) or not" },
  { id: "client_chat_hours", label: "client_chat_hours", description: "Hours spent by clients typing (or audio length)" },
  { id: "payout_multiplier", label: "Payout multiplier", description: "1.2x (TFP+) or 0.8x (Non TFP+)" },
  { id: "rating_score", label: "Rating / feedback score", description: "Session or chat rating" },
  { id: "missed_late_sessions", label: "Missed or late sessions", description: "Count" },
  { id: "case_notes_submitted", label: "Case notes submitted", description: "On time / overdue" },
];

export const predefinedActions = [
  { id: "notify_clinical", label: "Notify Clinical Ops" },
  { id: "flag_review", label: "Flag for review" },
  { id: "alert_pod_leader", label: "Alert pod leader" },
];

export const rulesList = [
  { id: "r1", name: "Low response rate alert", trigger: "When response_rate_24h < 90%", action: "Notify Clinical Ops", enabled: true, timesTriggered: 3 },
  { id: "r2", name: "TFP+ qualification check", trigger: "When tfp_plus_status is not qualified", action: "Flag for review", enabled: true, timesTriggered: 12 },
  { id: "r3", name: "Poor rating threshold", trigger: "When rating_score < 3", action: "Notify Clinical Ops", enabled: true, timesTriggered: 1 },
  { id: "r4", name: "Case notes overdue", trigger: "When case_notes_submitted is overdue", action: "Alert pod leader", enabled: false, timesTriggered: 0 },
];
