export type RunStatus = "Not started" | "Draft" | "In review" | "Approved" | "Sent" | "Completed";

export type PayoutRowStatus = "Ready" | "Flagged" | "Hold" | "Too small" | "Unclaimed";
export type OperationalRole = "Pod Leader" | "Hotline Operator";

export interface TFPProfessionalRow {
  id: string;
  name: string;
  country: string;
  roles: OperationalRole[];
  tfpPlusQualified: boolean;
  chat: { tfpTime: number; clientTime: number; earnings: number };
  therapy: { videoCount: number; f2fCount: number; earnings: number };
  referrals: { tfpReferral: number; userReferral: number; earnings: number };
  eventsEngagements: { clinicalEvents: number; csEngagements: number; earnings: number };
  leadership: { podLeaderEarnings: number; otLdpEarnings: number };
  bonuses: { languageBonus: number; otherAdjustments: number };
  reconciliation: number;
  total: number;
  status: PayoutRowStatus;
  reviewer: string | null;
}

export interface HotlineRow {
  id: string;
  professionalId: string;
  name: string;
  country: string;
  roles: OperationalRole[];
  shiftHours: number;
  sessionsHandled: number;
  rateNote: string;
  hotlineTotalPay: number;
  validationFlags: string[];
  status: PayoutRowStatus;
}

export interface PayoutException {
  id: string;
  reason: string;
  professionalId: string;
  professionalName: string;
  owner: string | null;
  status: "Open" | "Investigating" | "Resolved";
  category: "flagged_delta" | "too_small" | "unclaimed" | "fx_recon" | "failed_payment";
}

const TOO_SMALL_THRESHOLD = 5;

export function getRunIdToMonthYear(runId: string): string {
  const [y, m] = runId.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const mi = parseInt(m, 10) - 1;
  return `${months[mi] ?? "Month"} ${y}`;
}

export const mockTFPRows: TFPProfessionalRow[] = [
  {
    id: "p1",
    name: "Dr. Benjamin Kow Meng Ah",
    country: "MY",
    roles: ["Pod Leader"],
    tfpPlusQualified: true,
    chat: { tfpTime: 12, clientTime: 8, earnings: 420 },
    therapy: { videoCount: 8, f2fCount: 4, earnings: 380 },
    referrals: { tfpReferral: 1, userReferral: 0, earnings: 50 },
    eventsEngagements: { clinicalEvents: 2, csEngagements: 1, earnings: 120 },
    leadership: { podLeaderEarnings: 200, otLdpEarnings: 0 },
    bonuses: { languageBonus: 0, otherAdjustments: 0 },
    reconciliation: 0,
    total: 1170,
    status: "Ready",
    reviewer: "Sarah Lee",
  },
  {
    id: "p2",
    name: "Dr. Sam Wong",
    country: "SG",
    roles: ["Hotline Operator"],
    tfpPlusQualified: false,
    chat: { tfpTime: 10, clientTime: 6, earnings: 320 },
    therapy: { videoCount: 6, f2fCount: 2, earnings: 280 },
    referrals: { tfpReferral: 0, userReferral: 1, earnings: 25 },
    eventsEngagements: { clinicalEvents: 0, csEngagements: 2, earnings: 80 },
    leadership: { podLeaderEarnings: 0, otLdpEarnings: 100 },
    bonuses: { languageBonus: 50, otherAdjustments: 0 },
    reconciliation: -10,
    total: 845,
    status: "Flagged",
    reviewer: null,
  },
  {
    id: "p3",
    name: "Dr. Mei Lin",
    country: "MY",
    roles: ["Pod Leader", "Hotline Operator"],
    tfpPlusQualified: true,
    chat: { tfpTime: 8, clientTime: 5, earnings: 260 },
    therapy: { videoCount: 4, f2fCount: 3, earnings: 220 },
    referrals: { tfpReferral: 0, userReferral: 0, earnings: 0 },
    eventsEngagements: { clinicalEvents: 1, csEngagements: 0, earnings: 40 },
    leadership: { podLeaderEarnings: 150, otLdpEarnings: 0 },
    bonuses: { languageBonus: 0, otherAdjustments: 20 },
    reconciliation: 0,
    total: 690,
    status: "Ready",
    reviewer: "Sarah Lee",
  },
  {
    id: "p4",
    name: "Dr. James Ho",
    country: "SG",
    roles: [],
    tfpPlusQualified: false,
    chat: { tfpTime: 2, clientTime: 1, earnings: 45 },
    therapy: { videoCount: 0, f2fCount: 1, earnings: 30 },
    referrals: { tfpReferral: 0, userReferral: 0, earnings: 0 },
    eventsEngagements: { clinicalEvents: 0, csEngagements: 0, earnings: 0 },
    leadership: { podLeaderEarnings: 0, otLdpEarnings: 0 },
    bonuses: { languageBonus: 0, otherAdjustments: 0 },
    reconciliation: 0,
    total: 75,
    status: "Too small",
    reviewer: null,
  },
];

export const mockHotlineRows: HotlineRow[] = [
  { id: "h1", professionalId: "p2", name: "Dr. Sam Wong", country: "SG", roles: ["Hotline Operator"], shiftHours: 20, sessionsHandled: 45, rateNote: "Standard", hotlineTotalPay: 400, validationFlags: [], status: "Ready", reviewer: null },
  { id: "h2", professionalId: "p3", name: "Dr. Mei Lin", country: "MY", roles: ["Pod Leader", "Hotline Operator"], shiftHours: 8, sessionsHandled: 18, rateNote: "Non-MY rule", hotlineTotalPay: 160, validationFlags: ["Missing check-out"], status: "Flagged", reviewer: null },
];

export const mockExceptions: PayoutException[] = [
  { id: "e1", reason: "Month-over-month spike > threshold", professionalId: "p2", professionalName: "Dr. Sam Wong", owner: "Sarah Lee", status: "Investigating", category: "flagged_delta" },
  { id: "e2", reason: "Amount below minimum payout", professionalId: "p4", professionalName: "Dr. James Ho", owner: null, status: "Open", category: "too_small" },
  { id: "e3", reason: "Unclaimed payout — no response", professionalId: "p5", professionalName: "Dr. Alex Tan", owner: null, status: "Open", category: "unclaimed" },
  { id: "e4", reason: "FX rate variance vs budget", professionalId: "p2", professionalName: "Dr. Sam Wong", owner: null, status: "Open", category: "fx_recon" },
  { id: "e5", reason: "Bank rejection — invalid account", professionalId: "p3", professionalName: "Dr. Mei Lin", owner: "Sarah Lee", status: "Investigating", category: "failed_payment" },
];

export interface HotlineShift {
  id: string;
  professionalId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  durationHours: number;
  sessionsHandled: number;
  notes: string;
}

export const mockHotlineShifts: Record<string, HotlineShift[]> = {
  p2: [
    { id: "s1", professionalId: "p2", date: "2026-02-01", checkIn: "09:00", checkOut: "13:00", durationHours: 4, sessionsHandled: 12, notes: "" },
    { id: "s2", professionalId: "p2", date: "2026-02-05", checkIn: "14:00", checkOut: "22:00", durationHours: 8, sessionsHandled: 20, notes: "" },
    { id: "s3", professionalId: "p2", date: "2026-02-08", checkIn: "08:00", checkOut: "16:00", durationHours: 8, sessionsHandled: 13, notes: "" },
  ],
  p3: [
    { id: "s4", professionalId: "p3", date: "2026-02-02", checkIn: "10:00", checkOut: "—", durationHours: 6, sessionsHandled: 10, notes: "Missing check-out" },
    { id: "s5", professionalId: "p3", date: "2026-02-06", checkIn: "09:00", checkOut: "17:00", durationHours: 8, sessionsHandled: 8, notes: "" },
  ],
};

export function computeRunKPIs(rows: TFPProfessionalRow[]) {
  const total = rows.reduce((s, r) => s + r.total, 0);
  const flagged = rows.filter((r) => r.status === "Flagged").length;
  const holds = rows.filter((r) => r.status === "Hold").length;
  const tooSmall = rows.filter((r) => r.status === "Too small").length;
  const unclaimed = rows.filter((r) => r.status === "Unclaimed").length;
  return {
    totalPayoutUsd: total,
    professionalCount: rows.length,
    flagged,
    holds,
    tooSmall,
    unclaimed,
  };
}
