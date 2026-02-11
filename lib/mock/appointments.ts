export type AppointmentType = "user" | "pod" | "townhall";

export type AttendanceStatus = "Attended" | "No-Show" | "Scheduled";

export interface Appointment {
  id: string;
  date: string;
  dateTime: string;
  type: AppointmentType;
  participants: string;
  duration: string | null;
  attendance: AttendanceStatus;
  aiRating: string;
  aiScore: number | null;
  aiReview: { primary: string; secondary?: string } | null;
  notes?: string;
}

export const appointments: Appointment[] = [
  { id: "a1", date: "2026-02-11", dateTime: "2026-02-11 09:00", type: "user", participants: "Dr. Benjamin Kow Meng Ah, Jordan Lee", duration: "50 min", attendance: "Attended", aiRating: "Good", aiScore: 5, aiReview: { primary: "Excellent session. Client showed strong engagement.", secondary: "Discussed breathing exercises and progress tracking." } },
  { id: "a2", date: "2026-02-11", dateTime: "2026-02-11 10:30", type: "user", participants: "Dr. Benjamin Kow Meng Ah, Emma Wilson", duration: "50 min", attendance: "Attended", aiRating: "Good", aiScore: 4, aiReview: { primary: "Good session. Client completed homework assignments." } },
  { id: "a3", date: "2026-02-11", dateTime: "2026-02-11 14:00", type: "pod", participants: "Pod 3 (6 TFPs)", duration: "60 min", attendance: "Attended", aiRating: "Good", aiScore: 4, aiReview: { primary: "Productive pod sync. Case reviews completed." } },
  { id: "a4", date: "2026-02-10", dateTime: "2026-02-10 09:00", type: "user", participants: "Dr. Benjamin Kow Meng Ah, Sam Kim", duration: "50 min", attendance: "No-Show", aiRating: "N/A", aiScore: 1, aiReview: { primary: "Client did not attend. No prior notification received.", secondary: "Follow-up email sent." } },
  { id: "a5", date: "2026-02-10", dateTime: "2026-02-10 11:00", type: "user", participants: "Dr. Sam Wong, Riley Park", duration: "50 min", attendance: "Attended", aiRating: "Needs review", aiScore: 2.5, aiReview: { primary: "Needs review. Client appeared distracted.", secondary: "Flagged for supervision review." } },
  { id: "a6", date: "2026-02-10", dateTime: "2026-02-10 14:00", type: "pod", participants: "Pod 3 (6 TFPs)", duration: "N/A", attendance: "Attended", aiRating: "Good", aiScore: 4, aiReview: { primary: "Good session. Client completed homework ass" } },
  { id: "a7", date: "2026-02-10", dateTime: "2026-02-10 17:00", type: "townhall", participants: "All Clinical Ops, All TFPs", duration: "120 min", attendance: "Attended", aiRating: "Good", aiScore: 4.2, aiReview: { primary: "Well-attended townhall. Covered policy updates.", secondary: "45 attendees total." } },
  { id: "a8", date: "2026-02-09", dateTime: "2026-02-09 09:00", type: "user", participants: "Dr. Mei Lin, David Brown", duration: "50 min", attendance: "Scheduled", aiRating: "N/A", aiScore: null, aiReview: { primary: "Scheduled - not yet completed" } },
  { id: "a9", date: "2026-02-09", dateTime: "2026-02-09 10:00", type: "user", participants: "Dr. Alex Tan, Jessica Martinez", duration: "50 min", attendance: "Attended", aiRating: "Good", aiScore: 5, aiReview: { primary: "Excellent session. Client showed strong engag" } },
  { id: "a10", date: "2026-02-09", dateTime: "2026-02-09 14:00", type: "pod", participants: "Pod 2 (5 TFPs)", duration: "60 min", attendance: "Attended", aiRating: "Good", aiScore: 4, aiReview: null },
  { id: "a11", date: "2026-02-08", dateTime: "2026-02-08 09:00", type: "user", participants: "Dr. Lisa Chen, Thomas Anderson", duration: "50 min", attendance: "Attended", aiRating: "Good", aiScore: 4, aiReview: { primary: "Good session. Client completed homework ass" } },
  { id: "a12", date: "2026-02-08", dateTime: "2026-02-08 15:00", type: "townhall", participants: "All", duration: "90 min", attendance: "Attended", aiRating: "Good", aiScore: 4, aiReview: { primary: "Townhall completed. Q&A session productive." } },
  { id: "a13", date: "2026-02-07", dateTime: "2026-02-07 11:00", type: "user", participants: "Dr. Rachel Koh, Michael Chen", duration: "50 min", attendance: "No-Show", aiRating: "N/A", aiScore: null, aiReview: { primary: "No-show. Reschedule requested." } },
];
