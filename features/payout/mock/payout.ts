export const payoutStats = {
  totalMtd: "$184,200",
  totalMtdRaw: 184200,
  professionalsWithPayout: 112,
  activityEvents: 2140,
  pendingExceptions: 5,
  avgPayoutPerPro: "$1,645",
  comparison: "+12% vs last month",
};

export const currentMonthActivity = {
  period: { start: "Mar 1, 2026", end: "Mar 31, 2026" },
  runId: "2026-03",
  status: "Not started" as const,
  detected: {
    sessions: 1200,
    chatHours: 620,
    gigs: 40,
    claims: 30,
  },
};

export const payoutHistory = [
  { month: "February 2026", professionals: 110, total: "$178,200", exceptions: 2, status: "Paid", runId: "2026-02" },
  { month: "January 2026", professionals: 108, total: "$173,000", exceptions: 0, status: "Paid", runId: "2026-01" },
  { month: "December 2025", professionals: 105, total: "$168,900", exceptions: 4, status: "Paid", runId: "2025-12" },
  { month: "November 2025", professionals: 102, total: "$161,500", exceptions: 1, status: "Draft", runId: "2025-11" },
  { month: "October 2025", professionals: 98, total: "$155,200", exceptions: 0, status: "Paid", runId: "2025-10" },
  { month: "September 2025", professionals: 95, total: "$148,700", exceptions: 3, status: "Blocked", runId: "2025-09" },
  { month: "August 2025", professionals: 94, total: "$144,300", exceptions: 0, status: "Paid", runId: "2025-08" },
];

// Legacy alias used by the run wizard
export const monthlyReports = payoutHistory.map((r) => ({
  month: r.month,
  reviewer: "Sarah Lee",
  generated: r.status === "Paid" ? `${r.runId}-01` : r.status === "Draft" ? `${r.runId}-15` : "—",
  status: r.status === "Paid" ? "Completed" : r.status === "Draft" ? "Draft" : r.status === "Blocked" ? "Blocked" : "Not started",
  runId: r.runId,
}));

export const payoutTasks = [
  { id: "t1", reviewer: "Sarah Lee", status: "In progress", taskType: "Review", date: "2026-02-10" },
  { id: "t2", reviewer: "Anton Kraskov", status: "Completed", taskType: "Investigate", date: "2026-02-08" },
  { id: "t3", reviewer: "Sarah Lee", status: "Pending", taskType: "Review", date: "2026-02-11" },
];
