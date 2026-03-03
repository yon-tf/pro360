/**
 * Enrolled users/therapists with avatar faces for LMS module cards.
 * Avatar URLs use a placeholder service for distinct faces.
 */
const AVATAR = (id: number) => `https://i.pravatar.cc/128?img=${id}`;

export const lmsEnrolledUsers = [
  { id: "u1", name: "Alex Morgan", avatar: AVATAR(1) },
  { id: "u2", name: "Jordan Lee", avatar: AVATAR(2) },
  { id: "u3", name: "Sam Chen", avatar: AVATAR(3) },
  { id: "u4", name: "Riley Park", avatar: AVATAR(4) },
  { id: "u5", name: "Casey Kim", avatar: AVATAR(5) },
  { id: "u6", name: "Morgan Taylor", avatar: AVATAR(6) },
  { id: "u7", name: "Jamie Wright", avatar: AVATAR(7) },
  { id: "u8", name: "Quinn Davis", avatar: AVATAR(8) },
  { id: "u9", name: "Avery Clark", avatar: AVATAR(9) },
  { id: "u10", name: "Skyler Brown", avatar: AVATAR(10) },
  { id: "u11", name: "Drew Martinez", avatar: AVATAR(11) },
  { id: "u12", name: "Emery Wilson", avatar: AVATAR(12) },
  { id: "u13", name: "Finley Moore", avatar: AVATAR(13) },
  { id: "u14", name: "Hayden White", avatar: AVATAR(14) },
  { id: "u15", name: "Parker Harris", avatar: AVATAR(15) },
  { id: "u16", name: "Blake Martin", avatar: AVATAR(16) },
  { id: "u17", name: "Cameron Thompson", avatar: AVATAR(17) },
  { id: "u18", name: "Reese Garcia", avatar: AVATAR(18) },
  { id: "u19", name: "Sage Robinson", avatar: AVATAR(19) },
  { id: "u20", name: "River Lewis", avatar: AVATAR(20) },
  { id: "u21", name: "Dakota Walker", avatar: AVATAR(21) },
  { id: "u22", name: "Phoenix Hall", avatar: AVATAR(22) },
  { id: "u23", name: "Shiloh Young", avatar: AVATAR(23) },
  { id: "u24", name: "Arlo King", avatar: AVATAR(24) },
  { id: "u25", name: "Indigo Scott", avatar: AVATAR(25) },
  { id: "u26", name: "Rowan Green", avatar: AVATAR(26) },
  { id: "u27", name: "Kai Adams", avatar: AVATAR(27) },
  { id: "u28", name: "Ellis Nelson", avatar: AVATAR(28) },
  { id: "u29", name: "Remi Baker", avatar: AVATAR(29) },
  { id: "u30", name: "Sawyer Carter", avatar: AVATAR(30) },
  { id: "u31", name: "Emerson Mitchell", avatar: AVATAR(31) },
  { id: "u32", name: "Finley Perez", avatar: AVATAR(32) },
  { id: "u33", name: "Quinn Roberts", avatar: AVATAR(33) },
  { id: "u34", name: "Reese Turner", avatar: AVATAR(34) },
  { id: "u35", name: "Avery Phillips", avatar: AVATAR(35) },
  { id: "u36", name: "Jordan Campbell", avatar: AVATAR(36) },
  { id: "u37", name: "Morgan Parker", avatar: AVATAR(37) },
  { id: "u38", name: "Riley Evans", avatar: AVATAR(38) },
  { id: "u39", name: "Casey Edwards", avatar: AVATAR(39) },
  { id: "u40", name: "Alex Collins", avatar: AVATAR(40) },
  { id: "u41", name: "Sam Stewart", avatar: AVATAR(41) },
  { id: "u42", name: "Drew Sanchez", avatar: AVATAR(42) },
  { id: "u43", name: "Jamie Morris", avatar: AVATAR(43) },
  { id: "u44", name: "Skyler Rogers", avatar: AVATAR(44) },
  { id: "u45", name: "Quinn Reed", avatar: AVATAR(45) },
  { id: "u46", name: "Parker Cook", avatar: AVATAR(46) },
  { id: "u47", name: "Blake Morgan", avatar: AVATAR(47) },
  { id: "u48", name: "Cameron Bell", avatar: AVATAR(48) },
  { id: "u49", name: "River Murphy", avatar: AVATAR(49) },
  { id: "u50", name: "Sage Bailey", avatar: AVATAR(50) },
];

export type LMSCategory = "Onboarding Trial" | "Core Training" | "Continuing Education";

export interface LMSModule {
  id: string;
  name: string;
  category: LMSCategory;
  timeSpentAvg: string;
  passRate: number;
  enrolledUserIds: string[];
  passedCount: number;
}

export const lmsModules: LMSModule[] = [
  {
    id: "m1",
    name: "Introduction to Clinical Operations",
    category: "Onboarding Trial",
    timeSpentAvg: "2.5 hrs avg",
    passRate: 93,
    enrolledUserIds: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u11", "u12", "u13", "u14", "u15", "u16", "u17", "u18", "u19", "u20", "u21", "u22", "u23", "u24", "u25", "u26", "u27", "u28", "u29", "u30", "u31", "u32", "u33", "u34", "u35", "u36", "u37", "u38", "u39", "u40", "u41", "u42", "u43", "u44", "u45"],
    passedCount: 42,
  },
  {
    id: "m2",
    name: "Mental Health First Response",
    category: "Core Training",
    timeSpentAvg: "4.2 hrs avg",
    passRate: 92,
    enrolledUserIds: ["u2", "u4", "u6", "u8", "u10", "u12", "u14", "u16", "u18", "u20", "u22", "u24", "u26", "u28", "u30", "u32", "u34", "u36", "u38", "u40", "u1", "u3", "u5", "u7", "u9", "u11", "u13", "u15", "u17", "u19", "u21", "u23", "u25", "u27", "u29", "u31", "u33", "u35", "u37", "u39", "u41", "u42", "u43", "u44", "u45", "u46", "u47"],
    passedCount: 35,
  },
  {
    id: "m3",
    name: "Advanced CBT Techniques",
    category: "Continuing Education",
    timeSpentAvg: "6.8 hrs avg",
    passRate: 86,
    enrolledUserIds: ["u1", "u3", "u5", "u7", "u9", "u11", "u13", "u15", "u17", "u19", "u21", "u23", "u25", "u27", "u29", "u31", "u33", "u35", "u37", "u39", "u41", "u43", "u45", "u47", "u49", "u2", "u4", "u6", "u8", "u10", "u12", "u14", "u16", "u18", "u20", "u22", "u24", "u26", "u28", "u30", "u32", "u34", "u36", "u38", "u40", "u42", "u44", "u46"],
    passedCount: 24,
  },
  {
    id: "m4",
    name: "Crisis Intervention Protocols",
    category: "Core Training",
    timeSpentAvg: "3.5 hrs avg",
    passRate: 94,
    enrolledUserIds: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u11", "u12", "u13", "u14", "u15", "u16", "u17", "u18", "u19", "u20", "u21", "u22", "u23", "u24", "u25", "u26", "u27", "u28", "u29", "u30", "u31", "u32", "u33", "u34", "u35", "u36", "u37", "u38", "u39", "u40", "u41", "u42", "u43", "u44", "u45", "u46", "u47", "u48", "u49", "u50"],
    passedCount: 49,
  },
  {
    id: "m5",
    name: "Documentation Best Practices",
    category: "Onboarding Trial",
    timeSpentAvg: "1.8 hrs avg",
    passRate: 98,
    enrolledUserIds: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u11", "u12", "u13", "u14", "u15", "u16", "u17", "u18", "u19", "u20", "u21", "u22", "u23", "u24", "u25", "u26", "u27", "u28", "u29", "u30", "u31", "u32", "u33", "u34", "u35", "u36", "u37", "u38", "u39", "u40", "u41", "u42", "u43", "u44", "u45"],
    passedCount: 44,
  },
  {
    id: "m6",
    name: "Trauma-Informed Care",
    category: "Continuing Education",
    timeSpentAvg: "5.5 hrs avg",
    passRate: 90,
    enrolledUserIds: ["u2", "u5", "u8", "u11", "u14", "u17", "u20", "u23", "u26", "u29", "u32", "u35", "u38", "u41", "u44", "u47", "u50", "u1", "u3", "u4", "u6", "u7", "u9", "u10", "u12", "u13", "u15", "u16", "u18", "u19", "u21", "u22", "u24", "u25", "u27", "u28", "u30", "u31", "u33", "u34", "u36", "u37", "u39", "u40", "u42", "u43", "u45", "u46"],
    passedCount: 28,
  },
  {
    id: "m7",
    name: "Ethics and Boundaries",
    category: "Core Training",
    timeSpentAvg: "2.2 hrs avg",
    passRate: 96,
    enrolledUserIds: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u11", "u12", "u13", "u14", "u15", "u16", "u17", "u18", "u19", "u20", "u21", "u22", "u23", "u24", "u25", "u26", "u27", "u28", "u29", "u30", "u31", "u32", "u33", "u34", "u35", "u36", "u37", "u38", "u39", "u40", "u41", "u42", "u43", "u44", "u45", "u46", "u47", "u48", "u49"],
    passedCount: 48,
  },
];

export const lmsModulesNeedingAttention = [
  {
    id: "m8",
    name: "Workplace Wellbeing Foundations",
    category: "Onboarding Trial" as LMSCategory,
    timeSpentAvg: "—",
    passRate: 0,
    enrolledUserIds: [] as string[],
    passedCount: 0,
    createdAt: "2026-01-15",
    issue: "no_enrollment" as const,
  },
  {
    id: "m9",
    name: "Substance Abuse Screening",
    category: "Core Training" as LMSCategory,
    timeSpentAvg: "4.0 hrs avg",
    passRate: 52,
    enrolledUserIds: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10"],
    passedCount: 3,
    createdAt: "2025-11-01",
    issue: "low_pass_rate" as const,
  },
  {
    id: "m6",
    name: "Trauma-Informed Care",
    category: "Continuing Education" as LMSCategory,
    timeSpentAvg: "5.5 hrs avg",
    passRate: 58,
    enrolledUserIds: ["u2", "u5", "u8", "u11", "u14", "u17", "u20", "u23", "u26", "u29", "u32", "u35", "u38", "u41", "u44", "u47", "u50"],
    passedCount: 5,
    createdAt: "2025-09-01",
    issue: "not_completed" as const,
  },
];

/** Aggregate stats for dashboard metrics */
export const lmsStats = {
  totalModules: lmsModules.length,
  totalEnrollments: 289,
  averagePassRate: 93,
  avgTimeSpent: "3.7 hrs",
};
