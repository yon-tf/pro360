/**
 * Mock time-series data for Clinical Ops dashboard.
 * 12 months: Jan–Dec 2026 + 48 weekly rows (4 per month) for drill-down views.
 * All values are fully deterministic — no Math.random().
 */

const MONTH_LABELS = [
  "Jan 2026",
  "Feb 2026",
  "Mar 2026",
  "Apr 2026",
  "May 2026",
  "Jun 2026",
  "Jul 2026",
  "Aug 2026",
  "Sep 2026",
  "Oct 2026",
  "Nov 2026",
  "Dec 2026",
] as const;

// Seasonal factor: slight dip in Dec (index 11), summer uptick (Jun–Aug = indices 5–7)
function seasonalFactor(i: number): number {
  if (i === 11) return 0.92; // Dec dip
  if (i >= 5 && i <= 7) return 1.05; // summer slight boost
  return 1;
}

function growthFactor(i: number, base: number = 0.98): number {
  return 1 + (i / 12) * (1 - base);
}

// --- 1. Monthly Chat ---

export interface MonthlyChatData {
  month: string;
  slaPerformance: number;
  avgResponseTimeHrs: number;
  totalChatHours: number;
  tfpChatHours: number;
  clientChatHours: number;
}

export const monthlyChat: MonthlyChatData[] = MONTH_LABELS.map((month, i) => {
  const growth = growthFactor(i, 0.96);
  const seasonal = seasonalFactor(i);
  const totalChatHours = Math.round(800 + i * 45 * growth * seasonal + (i === 11 ? -80 : 0));
  const tfpChatHours = Math.round(totalChatHours * 0.62);
  return {
    month,
    slaPerformance: Math.min(95, 80 + i * 1.1 + (i === 11 ? -2 : 0)),
    avgResponseTimeHrs: Math.max(3, 6 - i * 0.22 - (i === 11 ? 0.3 : 0)),
    totalChatHours,
    tfpChatHours,
    clientChatHours: totalChatHours - tfpChatHours,
  };
});

// --- 2. Monthly Appointments ---

export interface MonthlyAppointmentData {
  month: string;
  created: number;
  cancelled: number;
  attended: number;
  noShow: number;
  caseNoteSubmitted: number;
  caseNoteNotSubmitted: number;
  lateCount: number;
  onTimeCount: number;
  therapyVideoHours: number;
  therapyF2FHours: number;
  totalTherapyHours: number;
}

function deriveAppointments(i: number): Omit<MonthlyAppointmentData, "month"> {
  const seasonal = seasonalFactor(i);
  const created = Math.round(220 + i * 12 * seasonal + (i === 11 ? -25 : 0));
  const attendedPct = 0.72 + i * 0.008;
  const noShowPct = 0.12 - i * 0.005;

  const attended = Math.round(created * attendedPct);
  const noShow = Math.round(created * noShowPct);
  const cancelled = created - attended - noShow;

  const caseNoteSubmittedPct = 0.65 + i * 0.01;
  const caseNoteSubmitted = Math.round(attended * caseNoteSubmittedPct);
  const caseNoteNotSubmitted = attended - caseNoteSubmitted;

  const latePct = 0.22 - i * 0.01;
  const lateCount = Math.round(caseNoteSubmitted * latePct);
  const onTimeCount = caseNoteSubmitted - lateCount;

  const therapyTotalHours = Math.round(attended * 0.8 * 10) / 10;
  const therapyVideoHours = Math.round(therapyTotalHours * 0.7 * 10) / 10;
  const therapyF2FHours = Math.round((therapyTotalHours - therapyVideoHours) * 10) / 10;

  return {
    created,
    cancelled: Math.max(0, cancelled),
    attended,
    noShow,
    caseNoteSubmitted,
    caseNoteNotSubmitted,
    lateCount,
    onTimeCount,
    therapyVideoHours,
    therapyF2FHours,
    totalTherapyHours: therapyTotalHours,
  };
}

export const monthlyAppointments: MonthlyAppointmentData[] = MONTH_LABELS.map((month, i) => ({
  month,
  ...deriveAppointments(i),
}));

// --- 3. Monthly Ratings ---

export interface MonthlyRatingData {
  month: string;
  professionalRating: number;
  aiRating: number;
  clientRating: number;
}

export const monthlyRatings: MonthlyRatingData[] = MONTH_LABELS.map((month, i) => {
  const base = 3.5 + i * 0.06;
  const decDip = i === 11 ? 0.12 : 0;
  return {
    month,
    professionalRating: Math.round((base - decDip + (i % 3) * 0.08) * 100) / 100,
    aiRating: Math.round((base + 0.1 - decDip + (i % 2) * 0.05) * 100) / 100,
    clientRating: Math.round((base - 0.05 - decDip + (i % 4) * 0.06) * 100) / 100,
  };
});

// --- 4. Monthly Activation ---

export interface MonthlyActivationData {
  month: string;
  totalActivations: number;
  programRating: number;
  professionalRating: number;
}

export const monthlyActivation: MonthlyActivationData[] = MONTH_LABELS.map((month, i) => {
  const seasonal = seasonalFactor(i);
  const totalActivations = Math.round(10 + i * 1.5 * seasonal + (i === 11 ? -3 : 0));
  const baseRating = 3.6 + i * 0.05 + (i === 11 ? -0.1 : 0);
  return {
    month,
    totalActivations: Math.max(10, Math.min(30, totalActivations)),
    programRating: Math.round(Math.min(4.8, Math.max(3.8, baseRating + 0.2)) * 100) / 100,
    professionalRating: Math.round(Math.min(4.7, Math.max(3.7, baseRating + 0.1)) * 100) / 100,
  };
});

// --- 5. Monthly Payout ---

export interface MonthlyPayoutData {
  month: string;
  corePayout: number;
  activationPayout: number;
  incentivePayout: number;
}

const QUARTER_END_INDICES = new Set([2, 5, 8, 11]); // Mar, Jun, Sep, Dec

export const monthlyPayout: MonthlyPayoutData[] = MONTH_LABELS.map((month, i) => {
  const seasonal = seasonalFactor(i);
  const decDip = i === 11 ? 0.93 : 1;
  const isQuarterEnd = QUARTER_END_INDICES.has(i);
  return {
    month,
    corePayout: Math.round((20000 + i * 1100 * seasonal * decDip) / 100) * 100,
    activationPayout: Math.round((5000 + i * 550 * seasonal * decDip) / 100) * 100,
    incentivePayout: isQuarterEnd
      ? Math.round((3000 + i * 600 * seasonal * decDip) / 100) * 100
      : 0,
  };
});

// ---------------------------------------------------------------------------
// Weekly data — 4 rows per month, derived from monthly totals.
// Week 4 is slightly lighter (end-of-month scheduling drift).
// Noise is deterministic: oscillates based on (monthIdx * 3 + weekIdx * 7) % 7.
// ---------------------------------------------------------------------------

// Distribution of monthly volume across 4 weeks (must sum to 1)
const WEEK_DIST = [0.27, 0.27, 0.25, 0.21] as const;

/** ±4% deterministic noise to give weeks a realistic spread */
function wNoise(mi: number, wi: number): number {
  return 1 + ((mi * 3 + wi * 7) % 7 - 3) * 0.013;
}

export interface WeeklyChatData {
  /** "Jan 2026" — used for month-based filtering */
  month: string;
  /** "W1", "W2", "W3", "W4" — XAxis tick label */
  label: string;
  slaPerformance: number;
  avgResponseTimeHrs: number;
  totalChatHours: number;
  tfpChatHours: number;
  clientChatHours: number;
}

export const weeklyChat: WeeklyChatData[] = MONTH_LABELS.flatMap((month, mi) => {
  const base = monthlyChat[mi];
  return ([0, 1, 2, 3] as const).map((wi) => {
    const n = wNoise(mi, wi);
    const dist = WEEK_DIST[wi];
    const totalChatHours = Math.round(base.totalChatHours * dist * n);
    const tfpChatHours = Math.round(totalChatHours * 0.62);
    return {
      month,
      label: `W${wi + 1}`,
      totalChatHours,
      tfpChatHours,
      clientChatHours: totalChatHours - tfpChatHours,
      slaPerformance: Math.min(99, Math.max(70, Math.round((base.slaPerformance + ((mi + wi) % 3) - 1) * 10) / 10)),
      avgResponseTimeHrs: Math.max(2, Math.round((base.avgResponseTimeHrs + (wi % 2 === 0 ? 0.15 : -0.15)) * 10) / 10),
    };
  });
});

export interface WeeklyAppointmentData {
  /** "Jan 2026" — used for month-based filtering */
  month: string;
  /** "W1", "W2", "W3", "W4" — XAxis tick label */
  label: string;
  created: number;
  attended: number;
  noShow: number;
  cancelled: number;
  caseNoteSubmitted: number;
  caseNoteNotSubmitted: number;
  lateCount: number;
  onTimeCount: number;
  therapyVideoHours: number;
  therapyF2FHours: number;
  totalTherapyHours: number;
}

export const weeklyAppointments: WeeklyAppointmentData[] = MONTH_LABELS.flatMap((month, mi) => {
  const base = monthlyAppointments[mi];
  return ([0, 1, 2, 3] as const).map((wi) => {
    const n = wNoise(mi, wi);
    const dist = WEEK_DIST[wi];
    const created = Math.round(base.created * dist * n);
    // Maintain the same ratios as the monthly row
    const attendedRatio = base.attended / base.created;
    const noShowRatio = base.noShow / base.created;
    const attended = Math.round(created * attendedRatio);
    const noShow = Math.round(created * noShowRatio);
    const cancelled = Math.max(0, created - attended - noShow);
    const cnRatio = base.caseNoteSubmitted / base.attended;
    const caseNoteSubmitted = Math.round(attended * cnRatio);
    const caseNoteNotSubmitted = Math.max(0, attended - caseNoteSubmitted);
    const lateRatio = base.lateCount / (base.caseNoteSubmitted || 1);
    const lateCount = Math.round(caseNoteSubmitted * lateRatio);

    // Therapy hours follow same distribution
    const therapyVideoHours = Math.round(base.therapyVideoHours * dist * n * 10) / 10;
    const therapyF2FHours = Math.round(base.therapyF2FHours * dist * n * 10) / 10;

    return {
      month,
      label: `W${wi + 1}`,
      created,
      attended,
      noShow,
      cancelled,
      caseNoteSubmitted,
      caseNoteNotSubmitted,
      lateCount,
      onTimeCount: Math.max(0, caseNoteSubmitted - lateCount),
      therapyVideoHours,
      therapyF2FHours,
      totalTherapyHours: Math.round((therapyVideoHours + therapyF2FHours) * 10) / 10,
    };
  });
});
