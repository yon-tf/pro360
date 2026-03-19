/**
 * Gig / Job Listings mock data.
 * Contacts and applicants have avatar URLs for faces.
 */
const AVATAR = (id: number) => `https://i.pravatar.cc/128?img=${id}`;

export type GigJobStatus = "open" | "approved" | "completed";

export const gigContacts = [
  { id: "c1", name: "Sarah Lee", avatar: AVATAR(32) },
  { id: "c2", name: "Michael Chong", avatar: AVATAR(12) },
  { id: "c3", name: "Jennifer Wa", avatar: AVATAR(23) },
];

export const gigApplicants = [
  { id: "a1", name: "Alex M.", avatar: AVATAR(1) },
  { id: "a2", name: "Jordan L.", avatar: AVATAR(2) },
  { id: "a3", name: "Sam C.", avatar: AVATAR(3) },
  { id: "a4", name: "Riley P.", avatar: AVATAR(4) },
  { id: "a5", name: "Casey K.", avatar: AVATAR(5) },
  { id: "a6", name: "Morgan T.", avatar: AVATAR(6) },
  { id: "a7", name: "Jamie W.", avatar: AVATAR(7) },
  { id: "a8", name: "Quinn D.", avatar: AVATAR(8) },
  { id: "a9", name: "Avery C.", avatar: AVATAR(9) },
  { id: "a10", name: "Skyler B.", avatar: AVATAR(10) },
];

export interface GigJob {
  id: string;
  title: string;
  description: string;
  status: GigJobStatus;
  claimableExpenses?: boolean;
  location: string;
  date: string;
  payment: string;
  contactId: string;
  applicantIds: string[];
  actionLabel: "View Application" | "View Details";
}

export const gigJobs: GigJob[] = [
  {
    id: "g1",
    title: "Mental Health Awareness Workshop",
    description: "Deliver a 2-hour workshop on mental health awareness for corporate staff.",
    status: "open",
    claimableExpenses: true,
    location: "Tech Corp HQ Downtown",
    date: "2026-02-22",
    payment: "$250",
    contactId: "c1",
    applicantIds: [],
    actionLabel: "View Application",
  },
  {
    id: "g2",
    title: "University Counseling Fair Booth",
    description: "Staff a booth at the university counseling fair and engage with students.",
    status: "approved",
    claimableExpenses: true,
    location: "State University",
    date: "2026-02-18",
    payment: "$150",
    contactId: "c2",
    applicantIds: ["a1", "a2", "a3"],
    actionLabel: "View Details",
  },
  {
    id: "g3",
    title: "Anxiety Management Webinar Series",
    description: "Lead a 3-session webinar series on anxiety management techniques.",
    status: "open",
    location: "Online",
    date: "Starting 2026-02-01",
    payment: "$450 (for all 3 sessions)",
    contactId: "c1",
    applicantIds: ["a4", "a5"],
    actionLabel: "View Application",
  },
  {
    id: "g4",
    title: "High School Teacher Training",
    description: "Train teachers on recognizing and supporting student mental health.",
    status: "approved",
    claimableExpenses: true,
    location: "Lincoln High School",
    date: "2026-02-15",
    payment: "$320",
    contactId: "c3",
    applicantIds: ["a1", "a2", "a3", "a4", "a5", "a6"],
    actionLabel: "View Details",
  },
  {
    id: "g5",
    title: "Healthcare Workers Burnout Prevention",
    description: "Workshop for healthcare staff on burnout prevention and self-care.",
    status: "open",
    claimableExpenses: true,
    location: "Memorial Hospital",
    date: "2026-02-25",
    payment: "$380",
    contactId: "c1",
    applicantIds: ["a7"],
    actionLabel: "View Application",
  },
  {
    id: "g6",
    title: "Parent Support Group Facilitation",
    description: "Facilitate weekly parent support group at the community center.",
    status: "open",
    location: "Community Center, Northside",
    date: "Starting 2026-02-05",
    payment: "$200/session",
    contactId: "c2",
    applicantIds: ["a2", "a4", "a8"],
    actionLabel: "View Application",
  },
  {
    id: "g7",
    title: "Corporate Wellness Program Design",
    description: "Design and present a 4-week corporate wellness program.",
    status: "approved",
    claimableExpenses: true,
    location: "FinTech Solutions Office",
    date: "2026-02-22",
    payment: "$320",
    contactId: "c3",
    applicantIds: ["a3", "a9"],
    actionLabel: "View Details",
  },
  {
    id: "g8",
    title: "Crisis Hotline Coverage - Weekend Shift",
    description: "Weekend shift coverage for the crisis hotline.",
    status: "completed",
    location: "Remote",
    date: "2026-02-10",
    payment: "$240",
    contactId: "c1",
    applicantIds: ["a1", "a5", "a7", "a10"],
    actionLabel: "View Details",
  },
  {
    id: "g9",
    title: "Mindfulness Meditation Instructor",
    description: "Lead 4 mindfulness meditation sessions at the community center.",
    status: "open",
    location: "Zen Community Center",
    date: "Starting 2026-02-28",
    payment: "$400 (for 4 sessions)",
    contactId: "c2",
    applicantIds: [],
    actionLabel: "View Application",
  },
  {
    id: "g10",
    title: "Peer Support Training Program",
    description: "Design and deliver peer support training for regional mental health center staff.",
    status: "open",
    location: "Regional Mental Health Center",
    date: "Starting 2026-03-10",
    payment: "$800",
    contactId: "c1",
    applicantIds: [],
    actionLabel: "View Application",
  },
];

export const gigStats = {
  total: gigJobs.length,
  open: gigJobs.filter((j) => j.status === "open").length,
  approved: gigJobs.filter((j) => j.status === "approved").length,
  completed: gigJobs.filter((j) => j.status === "completed").length,
};
