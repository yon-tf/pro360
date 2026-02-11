export const professionals = [
  {
    id: "1",
    name: "Dr. Benjamin Kow Meng Ah",
    licenseNumber: "PSY-45892",
    licenseExpiry: "2026-03-15",
    role: "Clinical Psychologist",
    status: "Active",
    avatar: "https://i.pravatar.cc/128?img=33",
    slaStatus: "TFP+",
    qualified: true,
    responseRate24h: 92,
    averageResponseTime: "3.2 hours",
    payoutMultiplier: "1.2x",
    clientChatHours: 156.5,
    tfpChatScore: 8.7,
    feedbackSummary: "Clients consistently praise Dr. Benjamin Kow Meng Ah's empathetic approach and practical strategies. Common themes include feeling heard, receiving actionable advice, and experiencing meaningful progress in therapy sessions.",
    ratingSummary: "Average rating: 4.8/5.0. Clients rate Dr. Benjamin Kow Meng Ah highly across all categories, with particular strength in communication clarity (4.9/5) and session effectiveness (4.8/5).",
    missedLateSessions: 2,
    missedSessions: 1,
    lateSessions: 1,
    excessiveSessions: 0,
    lateCaseNotes: 6,
    missingCaseNotes: 0,
    caseNotes: [
      { date: "2026-02-10", client: "Emily Johnson", submittedAt: "2026-02-10 14:30", status: "Submitted" },
      { date: "2026-02-09", client: "Michael Chen", submittedAt: "2026-02-09 16:45", status: "Submitted" },
      { date: "2026-02-08", client: "Rachel Williams", submittedAt: "2026-02-08 11:20", status: "Submitted" },
      { date: "2026-02-07", client: "David Brown", submittedAt: "2026-02-08 09:15", status: "Late" },
      { date: "2026-02-06", client: "Jessica Martinez", submittedAt: "2026-02-06 17:00", status: "Submitted" },
    ],
    feedbackList: [
      { id: "1", date: "2026-02-10", rating: 5, comment: "Very helpful and clear. Felt heard and understood." },
      { id: "2", date: "2026-02-08", rating: 4, comment: "Good follow-up and practical strategies I could use right away." },
      { id: "3", date: "2026-02-06", rating: 5, comment: "Empathetic and gave actionable advice. Session was meaningful." },
      { id: "4", date: "2026-02-03", rating: 4, comment: "Communication was clear. Made real progress in this session." },
    ],
    ratingList: [
      { id: "1", date: "2026-02-10", type: "Session", communication: 5, effectiveness: 5, empathy: 5, professionalism: 5, overall: 5 },
      { id: "2", date: "2026-02-08", type: "Chat", communication: 5, effectiveness: 4, empathy: 5, professionalism: 5, overall: 4 },
      { id: "3", date: "2026-02-06", type: "Session", communication: 5, effectiveness: 5, empathy: 5, professionalism: 5, overall: 5 },
      { id: "4", date: "2026-02-03", type: "Session", communication: 4, effectiveness: 4, empathy: 5, professionalism: 4, overall: 4 },
    ],
    strengthsRadar: [
      { label: "Communication", value: 4.6, description: "Clarity, tone and quality of communication; response time and empathy in client and colleague interactions." },
      { label: "Effectiveness", value: 4.7, description: "Impact of sessions, client progress toward goals, outcomes and overall client satisfaction." },
      { label: "Compliance", value: 3.6, description: "SLA adherence, case note timeliness and quality, attendance, policies and audit readiness (e.g. TFP+)." },
      { label: "Professionalism", value: 4.7, description: "Boundaries, ethics, reliability and conduct in line with professional standards." },
      { label: "Contribution", value: 4.3, description: "Contribution to team, organisation and clients beyond core role; collaboration and initiative." },
      { label: "Self-growth", value: 4.4, description: "Commitment to learning, development and continuous improvement in practice and skills." },
    ],
    aiImprovementPreview: "Focus on case note timeliness to strengthen compliance and qualify for higher benchmarks.",
    aiImprovementDetail: "**What to improve:** Submit case notes within 24–48 hours of sessions. One late submission (David Brown, 2026-02-07) and 4/5 on-time rate indicate room to tighten workflow.\n\n**Why it matters:** Late case notes affect continuity of care, audit readiness, and TFP+ eligibility. Consistent on-time submission supports better outcomes tracking and reduces administrative follow-up.\n\n**What it will lead to:** 100% on-time case notes will align with best practice, improve your Case Notes Status score, and reduce risk of compliance flags. It also reinforces client trust and supports smoother handoffs when needed.",
  },
];

const AVATAR = (id: number) => `https://i.pravatar.cc/128?img=${id}`;

export const clients = [
  { id: "c1", clientId: "C001", userId: "USR-8821", name: "Emily Johnson", age: 28, gender: "Female", lastContact: "2026-02-10", organisation: "Tech Innovations Inc.", packageType: "corporate" as const, packageEndDate: "2028-01-21", avatar: AVATAR(11) },
  { id: "c2", clientId: "C002", userId: "USR-7732", name: "Michael Chen", age: 34, gender: "Male", lastContact: "2026-02-09", organisation: "State University", packageType: "corporate" as const, packageEndDate: "2028-03-15", avatar: AVATAR(12) },
  { id: "c3", clientId: "C003", userId: "USR-6643", name: "Rachel Williams", age: 25, gender: "Female", lastContact: "2026-02-08", organisation: "Lincoln High School", packageType: "corporate" as const, packageEndDate: "2027-12-01", avatar: AVATAR(13) },
  { id: "c4", clientId: "C004", userId: "USR-5544", name: "David Brown", age: 41, gender: "Male", lastContact: "2026-02-07", organisation: "Memorial Hospital", packageType: "corporate" as const, packageEndDate: "2028-06-30", avatar: AVATAR(14) },
  { id: "c5", clientId: "C005", userId: "USR-4455", name: "Jessica Martinez", age: 31, gender: "Female", lastContact: "2026-02-06", organisation: "Community Center Northside", packageType: "corporate" as const, packageEndDate: "2028-01-10", avatar: AVATAR(15) },
  { id: "c6", clientId: "C006", userId: "USR-3366", name: "Thomas Anderson", age: 29, gender: "Male", lastContact: "2026-02-05", organisation: "FinTech Solutions Office", packageType: "corporate" as const, packageEndDate: "2028-02-28", avatar: AVATAR(16) },
  { id: "c7", clientId: "C007", userId: "USR-2277", name: "Jordan Lee", age: 28, gender: "Non-binary", lastContact: "2026-01-28", organisation: null, packageType: "personal" as const, packageEndDate: "2028-01-22", avatar: AVATAR(17) },
  { id: "c8", clientId: "C008", userId: "USR-1188", name: "Sam Kim", age: 34, gender: "Male", lastContact: "2026-01-20", organisation: null, packageType: "personal" as const, packageEndDate: "2027-11-15", avatar: AVATAR(18) },
  { id: "c9", clientId: "C009", userId: "USR-0099", name: "Riley Park", age: 25, gender: "Female", lastContact: "2026-01-15", organisation: null, packageType: "personal" as const, packageEndDate: "2028-04-20", avatar: AVATAR(19) },
];

export const calendarEvents = [
  { id: "e1", title: "Face to face meeting", with: "Emily Johnson", start: "09:00", end: "10:00", type: "f2f", badge: "Client" },
  { id: "e2", title: "Face to face meeting", with: "Michael Chen", start: "11:00", end: "12:00", type: "f2f", badge: "Client" },
  { id: "e3", title: "Pod meeting", with: "Clinical Team", start: "14:00", end: "15:00", type: "pod", badge: "Team" },
  { id: "e4", title: "Face to face meeting", with: "Rachel Williams", start: "15:30", end: "16:30", type: "f2f", badge: "Client" },
  { id: "e5", title: "Townhall", with: "All Staff", start: "17:00", end: "18:00", type: "townhall", badge: "Company" },
];

export const calendarDayLabel = "February 11, 2026";
export const calendarDayShort = "Feb 11";
export const calendarDayWeekday = "Wednesday";

/** Hour slots for day view (8 AM–9 PM) — Figma */
export const calendarDaySlots = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

/** Mini calendar: February 2026 — [dayOfWeek0-6, date][] for grid. Feb 1 2026 = Sunday. */
export const calendarMonthLabel = "February 2026";
export const calendarMonthDays: { dayOfWeek: number; date: number }[] = (() => {
  const firstDay = 0; // Sunday
  const daysInMonth = 28;
  const result: { dayOfWeek: number; date: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    result.push({ dayOfWeek: (firstDay + d - 1) % 7, date: d });
  }
  return result;
})();
export const calendarSelectedDate = 11;

export type CourseStatus = "completed" | "in_progress" | "not_started";

export const courses = [
  {
    id: "co1",
    title: "Advanced CBT Techniques for Anxiety Disorders",
    category: "CBT therapy",
    enrollment: "2,847 enrolled",
    status: "completed" as CourseStatus,
    completedOn: "2026-01-15",
  },
  {
    id: "co2",
    title: "Therapeutic Relationship Management",
    category: "Relationship management",
    enrollment: "1,923 enrolled",
    status: "in_progress" as CourseStatus,
    progressPercent: 65,
  },
  {
    id: "co3",
    title: "Trauma-Informed Care: Best Practices",
    category: "Trauma therapy",
    enrollment: "3,102 enrolled",
    status: "in_progress" as CourseStatus,
    progressPercent: 40,
  },
  {
    id: "co4",
    title: "Mindfulness-Based Stress Reduction for Clinicians",
    category: "Mindfulness",
    enrollment: "4,521 enrolled",
    status: "completed" as CourseStatus,
    completedOn: "2025-12-20",
  },
  {
    id: "co5",
    title: "Mindfulness-Based Stress Reduction for Clinicians",
    category: "Mindfulness",
    enrollment: "4,521 enrolled",
    status: "not_started" as CourseStatus,
  },
];

export const jobsForProfessional = [
  { id: "j1", title: "Quarterly Review Support", status: "available" },
  { id: "j2", title: "Hotline Coverage – Feb 15", status: "applied" },
  { id: "j3", title: "Workshop Facilitator (Jan)", status: "expired" },
];

export type GigOpportunityType = "Webinar" | "Roadshow" | "Workshop";
export type GigOpportunityStatus = "Applied" | "Completed" | "Expired";

export const professionalGigOpportunities = [
  {
    id: "go1",
    title: "Mental Health Awareness Webinar",
    type: "Webinar" as GigOpportunityType,
    status: "Applied" as GigOpportunityStatus,
    description: "Lead 2-hour webinar",
    dateTime: "21 Jan 2026, 2:00 PM - 3:00 PM (1 hour)",
    location: "Online",
    participants: "50-100 participants",
    claimsAvailable: "$150",
    applicationOrCompletion: "Applied 8 Dec 2026, 9:00AM",
  },
  {
    id: "go2",
    title: "Community Mental Health Roadshow",
    type: "Roadshow" as GigOpportunityType,
    status: "Completed" as GigOpportunityStatus,
    description: "Participate in full-day roadshow",
    dateTime: "22-24 Jan 2026",
    location: "Downtown Community Center",
    participants: "200+ participants",
    claimsAvailable: "$500",
    applicationOrCompletion: "Completed 8 Dec 2026, 9:00AM",
  },
  {
    id: "go3",
    title: "CBT Skills Workshop for Educators",
    type: "Workshop" as GigOpportunityType,
    status: "Applied" as GigOpportunityStatus,
    description: "Conduct half-day workshop",
    dateTime: "2026-02-25",
    location: "Springfield High School",
    participants: "20-30 participants",
    claimsAvailable: "$300",
    applicationOrCompletion: "Applied 2026-02-01",
  },
  {
    id: "go4",
    title: "Mindfulness Workshop for Parents",
    type: "Workshop" as GigOpportunityType,
    status: "Expired" as GigOpportunityStatus,
    description: "Interactive workshop",
    dateTime: "2026-01-28",
    location: "Family Resource Center",
    participants: "15-25 participants",
    claimsAvailable: "$250",
    applicationOrCompletion: null,
  },
  {
    id: "go5",
    title: "Trauma-Informed Care Webinar",
    type: "Webinar" as GigOpportunityType,
    status: "Expired" as GigOpportunityStatus,
    description: "Educational webinar",
    dateTime: "2026-01-15",
    location: "Online",
    participants: "75 participants",
    claimsAvailable: "$175",
    applicationOrCompletion: "Applied 2025-12-28",
  },
  {
    id: "go6",
    title: "Youth Mental Health Webinar",
    type: "Webinar" as GigOpportunityType,
    status: "Applied" as GigOpportunityStatus,
    description: "1-hour webinar for school counselors",
    dateTime: "5 Mar 2026, 4:00 PM (1 hour)",
    location: "Online",
    participants: "100+ participants",
    claimsAvailable: "$200",
    applicationOrCompletion: "Applied 2026-01-20",
  },
  {
    id: "go7",
    title: "Corporate Wellness Workshop",
    type: "Workshop" as GigOpportunityType,
    status: "Completed" as GigOpportunityStatus,
    description: "Half-day stress management workshop",
    dateTime: "10 Feb 2026",
    location: "Tech Park Conference Room",
    participants: "30-40 participants",
    claimsAvailable: "$400",
    applicationOrCompletion: "Completed 2026-02-10",
  },
];
