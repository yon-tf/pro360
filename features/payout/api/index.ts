// NOTE: Placeholder adapter. Replace with real API calls during backend integration.
import {
  payoutStats,
  payoutHistory,
  payoutTasks,
  currentMonthActivity,
  monthlyReports,
} from "../mock/payout";
import {
  getRunIdToMonthYear,
  mockTFPRows,
  mockHotlineRows,
  mockExceptions,
  mockHotlineShifts,
  computeRunKPIs,
} from "../mock/payoutRun";

export const payoutApi = {
  getOverview: async () => ({
    payoutStats,
    payoutHistory,
    payoutTasks,
    currentMonthActivity,
  }),
  getMonthlyReports: async () => monthlyReports,
  getRunData: async (runId: string) => ({
    runId,
    monthYear: getRunIdToMonthYear(runId),
    tfpRows: mockTFPRows,
    hotlineRows: mockHotlineRows,
    exceptions: mockExceptions,
    hotlineShifts: mockHotlineShifts,
    kpis: computeRunKPIs(mockTFPRows),
  }),
};
