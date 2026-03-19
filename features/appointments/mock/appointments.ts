import type { WellbeingPillar } from "@/features/org/mock/organizations";

// ---------------------------------------------------------------------------
// Canonical Appointment domain model
// ---------------------------------------------------------------------------

export type AppointmentKind =
  | "townhall"
  | "workshop"
  | "pod_appointment"
  | "client_session"
  | "webinar"
  | "gig"
  | "roadshow"
  | "onsite_clinic"
  | "online_clinic";

export type ServiceType =
  | "video_call"
  | "face_to_face"
  | "online_webinar"
  | "onsite_talk"
  | "online_workshop"
  | "onsite_workshop"
  | "roadshow"
  | "onsite_mental_wellbeing_clinic"
  | "online_mental_wellbeing_clinic";

export type AppointmentContext = "internal" | "external";
export type AppointmentCategory = "core_service" | "activation" | "internal";
export type ActivationStatus = "new" | "in_progress" | "attended";
export type AttendanceStatus = "attended" | "no_show" | "scheduled" | "cancelled";
export type ParticipantRole = "host" | "presenter" | "attendee" | "observer";

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  attendance: AttendanceStatus;
}

export interface CaseNotesSOAP {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface PodDocumentation {
  topics: string[];
  notes: string;
}

export interface CommercialInfo {
  payoutBatchId?: string;
  payoutStatus?: "pending" | "approved" | "paid" | "flagged";
  pricingBasis?: string;
  commercialFlags?: string[];
}

export interface QualityInfo {
  flags: string[];
  ruleHits?: string[];
}

export interface Appointment {
  id: string;
  type: AppointmentKind;
  context: AppointmentContext;
  category: AppointmentCategory;
  appointmentStatus?: "confirmed" | "cancelled";
  serviceType?: ServiceType;

  professionalDisplay: string;
  clientDisplay?: string;
  organisationId?: string;
  organisationName?: string;

  expectedRoster: Participant[];
  joinedRoster: Participant[];

  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  duration?: string;

  transcript?: string;
  aiSummary?: string;
  aiTakeaways?: string[];
  aiQualityScore: number | null;
  aiQualitySignals?: string[];
  aiReview?: { primary: string; secondary?: string };

  caseNotesSOAP?: CaseNotesSOAP;
  caseNotesSubmittedAt?: string;
  podDocumentation?: PodDocumentation;

  commercial?: CommercialInfo;
  quality?: QualityInfo;

  // Activation-specific
  activationStatus?: ActivationStatus;
  wellbeingPillars?: WellbeingPillar[];
  participantCount?: number;
  professionalRating?: number;
  programRating?: number;
  engagementRate?: number;
  programScore?: number;

  participantsSummary: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

export const INTERNAL_TYPES: AppointmentKind[] = ["townhall", "workshop", "pod_appointment"];
export const EXTERNAL_TYPES: AppointmentKind[] = ["client_session", "webinar", "gig", "roadshow", "onsite_clinic", "online_clinic"];

export function deriveContext(type: AppointmentKind): AppointmentContext {
  return (INTERNAL_TYPES as string[]).includes(type) ? "internal" : "external";
}

export const KIND_LABELS: Record<AppointmentKind, string> = {
  townhall: "Townhall",
  workshop: "Workshop",
  pod_appointment: "Pod Appointment",
  client_session: "Client Session",
  webinar: "Webinar",
  gig: "Gig",
  roadshow: "Roadshow",
  onsite_clinic: "Onsite Clinic",
  online_clinic: "Online Clinic",
};

export const CONTEXT_LABELS: Record<AppointmentContext, string> = {
  internal: "Internal",
  external: "External",
};

export const CATEGORY_LABELS: Record<AppointmentCategory, string> = {
  core_service: "Core Service",
  activation: "Activation",
  internal: "Internal",
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  video_call: "Video call",
  face_to_face: "Face-to-face",
  online_webinar: "Online webinar",
  onsite_talk: "Onsite talk",
  online_workshop: "Online workshop",
  onsite_workshop: "Onsite workshop",
  roadshow: "Roadshow",
  onsite_mental_wellbeing_clinic: "Onsite mental wellbeing clinic",
  online_mental_wellbeing_clinic: "Online mental wellbeing clinic",
};

export const SERVICE_TYPE_BY_CATEGORY: Record<AppointmentCategory, ServiceType[]> = {
  core_service: ["video_call", "face_to_face"],
  activation: ["online_webinar", "onsite_talk", "online_workshop", "onsite_workshop", "roadshow", "onsite_mental_wellbeing_clinic", "online_mental_wellbeing_clinic"],
  internal: [],
};

export const ACTIVATION_STATUS_LABELS: Record<ActivationStatus, string> = {
  new: "New",
  in_progress: "In progress",
  attended: "Attended",
};

export const OFFLINE_SERVICE_TYPES: ServiceType[] = [
  "face_to_face", "roadshow", "onsite_talk", "onsite_workshop", "onsite_mental_wellbeing_clinic",
];

export function isOfflineType(st?: ServiceType): boolean {
  return st != null && (OFFLINE_SERVICE_TYPES as string[]).includes(st);
}

// ---------------------------------------------------------------------------
// Context-filter presets (consumed by the list page)
// ---------------------------------------------------------------------------

export interface ContextPreset {
  key: string;
  label: string;
  context?: AppointmentContext;
  defaultSort: { field: keyof Appointment; dir: "asc" | "desc" };
}

export const CONTEXT_PRESETS: Record<string, ContextPreset> = {
  internal: {
    key: "internal",
    label: "Internal appointments",
    context: "internal",
    defaultSort: { field: "scheduledAt", dir: "desc" },
  },
  external: {
    key: "external",
    label: "External appointments",
    context: "external",
    defaultSort: { field: "scheduledAt", dir: "desc" },
  },
};

// ---------------------------------------------------------------------------
// Helpers for Client / Organisation column rendering
// ---------------------------------------------------------------------------

export function getUniqueOrganisations(): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const a of appointments) {
    if (a.organisationId && a.organisationName) {
      seen.set(a.organisationId, a.organisationName);
    }
  }
  return Array.from(seen.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

function p(id: string, name: string, role: ParticipantRole, att: AttendanceStatus): Participant {
  return { id, name, role, attendance: att };
}

export const appointments: Appointment[] = [
  // ── External / Core Service: client_session ───────────────────────────
  {
    id: "a1", type: "client_session", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "video_call",
    professionalDisplay: "Dr. Benjamin Kow Meng Ah",
    clientDisplay: "C-4821",
    expectedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("c1", "C-4821", "attendee", "attended")],
    joinedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("c1", "C-4821", "attendee", "attended")],
    scheduledAt: "2026-02-11T09:00:00", startedAt: "2026-02-11T09:02:00", endedAt: "2026-02-11T09:52:00", duration: "50 min",
    transcript: "Professional: Good morning, how have you been this week?\nClient: Much better actually. I've been sleeping a lot better since we started those breathing exercises.\nProfessional: That's great to hear. Can you tell me more about your sleep pattern?\nClient: I've been falling asleep within 20 minutes instead of an hour. And I only woke up once last night.\nProfessional: Excellent progress. And the anxiety episodes — have you noticed any change?\nClient: Yes, I had one on Tuesday but I used the grounding technique and it passed much faster.\nProfessional: That's a significant improvement. Let's review your GAD-7 scores today and discuss next steps.",
    aiSummary: "Client showed strong engagement throughout the session. Discussed breathing exercises and progress tracking. Significant improvement in sleep quality and anxiety management since last session.",
    aiTakeaways: ["Sleep onset improved from 60 min to 20 min", "GAD-7 decreased from 12 to 8", "Client successfully applied grounding technique during anxiety episode", "Breathing exercises showing positive results"],
    aiQualityScore: 5, aiQualitySignals: ["good_engagement", "homework_completed"],
    aiReview: { primary: "Excellent session. Client showed strong engagement.", secondary: "Discussed breathing exercises and progress tracking." },
    caseNotesSOAP: { subjective: "Client reports improved sleep quality and reduced anxiety episodes this week.", objective: "Alert and oriented. Good eye contact. Relaxed posture.", assessment: "Progress toward treatment goals. GAD-7 score decreased from 12 to 8.", plan: "Continue CBT exercises. Schedule follow-up in 2 weeks." },
    caseNotesSubmittedAt: "2026-02-11T10:15:00",
    participantsSummary: "Dr. Benjamin Kow Meng Ah, C-4821",
  },
  {
    id: "a2", type: "client_session", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "video_call",
    professionalDisplay: "Dr. Benjamin Kow Meng Ah",
    clientDisplay: "C-7293",
    organisationId: "org-tech", organisationName: "Tech Innovations Inc.",
    expectedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("c2", "C-7293", "attendee", "attended")],
    joinedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("c2", "C-7293", "attendee", "attended")],
    scheduledAt: "2026-02-11T10:30:00", startedAt: "2026-02-11T10:32:00", endedAt: "2026-02-11T11:22:00", duration: "50 min",
    transcript: "Professional: Let's start with how your week went. Did you try the assertiveness exercises?\nClient: Yes, I had a meeting where I usually stay quiet and I actually spoke up.\nProfessional: That's a big step. How did it feel?\nClient: Nerve-wracking at first, but my manager actually acknowledged my point.\nProfessional: That positive reinforcement is valuable. Let's build on this.",
    aiSummary: "Client demonstrated progress with assertiveness techniques in the workplace. Positive reinforcement from manager noted. PHQ-9 stable.",
    aiTakeaways: ["Client spoke up in a team meeting for the first time", "Manager positively acknowledged contribution", "PHQ-9 remains stable at 6", "Ready to begin exposure hierarchy for presentations"],
    aiQualityScore: 4, aiReview: { primary: "Good session. Client completed homework assignments." },
    caseNotesSOAP: { subjective: "Client feeling more confident at work after practising assertiveness techniques.", objective: "Engaged and responsive. Shared journal entries.", assessment: "Steady improvement in workplace anxiety. PHQ-9 stable at 6.", plan: "Introduce exposure hierarchy for presentation anxiety." },
    caseNotesSubmittedAt: "2026-02-12T22:45:00",
    participantsSummary: "Dr. Benjamin Kow Meng Ah, C-7293",
  },
  {
    id: "a4", type: "client_session", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "video_call",
    professionalDisplay: "Dr. Benjamin Kow Meng Ah",
    clientDisplay: "C-3156",
    expectedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("c3", "C-3156", "attendee", "no_show")],
    joinedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended")],
    scheduledAt: "2026-02-10T09:00:00", startedAt: "2026-02-10T09:00:00", endedAt: "2026-02-10T09:10:00", duration: "10 min",
    aiQualityScore: 1, aiReview: { primary: "Client did not attend. No prior notification received.", secondary: "Follow-up email sent." },
    quality: { flags: ["no_show", "no_prior_notification"], ruleHits: ["no_show_followup"] },
    participantsSummary: "Dr. Benjamin Kow Meng Ah, C-3156",
  },
  {
    id: "a5", type: "client_session", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "face_to_face",
    professionalDisplay: "Dr. Sam Wong",
    clientDisplay: "C-5847",
    organisationId: "org-uni", organisationName: "State University",
    expectedRoster: [p("p2", "Dr. Sam Wong", "host", "attended"), p("c4", "C-5847", "attendee", "attended")],
    joinedRoster: [p("p2", "Dr. Sam Wong", "host", "attended"), p("c4", "C-5847", "attendee", "attended")],
    scheduledAt: "2026-02-10T11:00:00", startedAt: "2026-02-10T11:03:00", endedAt: "2026-02-10T11:53:00", duration: "50 min",
    transcript: "Professional: How are you feeling today?\nClient: I'm okay, I guess. Been a tough week.\nProfessional: Can you tell me more about what happened?\nClient: Work has been really stressful. I couldn't focus on anything.\nProfessional: I see. Have you been able to use the coping strategies we discussed?\nClient: Not really. I forgot most of them.",
    aiSummary: "Client appeared distracted and reported difficulty focusing. Coping strategy adherence was low this week. Session flagged for supervision review due to below-threshold engagement.",
    aiTakeaways: ["High workplace stress reported", "Low adherence to coping strategies", "Difficulty focusing throughout session", "Requires supervision follow-up"],
    aiQualityScore: 2.5, aiReview: { primary: "Needs review. Client appeared distracted.", secondary: "Flagged for supervision review." },
    quality: { flags: ["below_threshold_ai_score"], ruleHits: ["supervision_review_required"] },
    commercial: { payoutBatchId: "PB-2026-02", payoutStatus: "approved", pricingBasis: "per_session" },
    participantsSummary: "Dr. Sam Wong, C-5847",
  },
  {
    id: "a8", type: "client_session", context: "external", category: "core_service", serviceType: "video_call",
    professionalDisplay: "Dr. Mei Lin",
    clientDisplay: "C-6102",
    organisationId: "org-memorial", organisationName: "Memorial Hospital",
    expectedRoster: [p("p3", "Dr. Mei Lin", "host", "scheduled"), p("c5", "C-6102", "attendee", "scheduled")],
    joinedRoster: [],
    scheduledAt: "2026-02-12T09:00:00", aiQualityScore: null,
    aiReview: { primary: "Scheduled — not yet completed" },
    participantsSummary: "Dr. Mei Lin, C-6102",
  },
  {
    id: "a9", type: "client_session", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "face_to_face",
    professionalDisplay: "Dr. Alex Tan",
    clientDisplay: "C-9438",
    organisationId: "org-ccn", organisationName: "Community Center Northside",
    expectedRoster: [p("p4", "Dr. Alex Tan", "host", "attended"), p("c6", "C-9438", "attendee", "attended")],
    joinedRoster: [p("p4", "Dr. Alex Tan", "host", "attended"), p("c6", "C-9438", "attendee", "attended")],
    scheduledAt: "2026-02-09T10:00:00", startedAt: "2026-02-09T10:01:00", endedAt: "2026-02-09T10:51:00", duration: "50 min",
    transcript: "Professional: Welcome back. How has your week been with the meditation?\nClient: Really good! I managed to practice 5 out of 7 days.\nProfessional: That's excellent consistency. How are you finding the mindfulness exercises?\nClient: They help me stay grounded. I notice I'm less reactive at work.\nProfessional: Wonderful. Let's talk about introducing body-scan meditation as the next step.",
    aiSummary: "Client demonstrated excellent adherence to mindfulness meditation practice, reporting 5 out of 7 days of practice. Noticeable improvement in emotional regulation at work.",
    aiTakeaways: ["5/7 days meditation practice adherence", "Reduced emotional reactivity at work", "Ready to progress to body-scan meditation", "Strong therapeutic alliance evident"],
    aiQualityScore: 5, aiReview: { primary: "Excellent session. Client showed strong engagement and openness." },
    caseNotesSOAP: { subjective: "Client discusses progress with mindfulness meditation practice.", objective: "Calm demeanour. Reports practicing 5 days this week.", assessment: "Strong adherence to treatment plan.", plan: "Introduce body-scan meditation. Review in 1 week." },
    caseNotesSubmittedAt: "2026-02-09T11:10:00",
    commercial: { payoutBatchId: "PB-2026-02", payoutStatus: "paid", pricingBasis: "per_session" },
    participantsSummary: "Dr. Alex Tan, C-9438",
  },
  {
    id: "a11", type: "client_session", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "video_call",
    professionalDisplay: "Dr. Lisa Chen",
    clientDisplay: "C-2071",
    organisationId: "org-fintech", organisationName: "FinTech Solutions",
    expectedRoster: [p("p5", "Dr. Lisa Chen", "host", "attended"), p("c7", "C-2071", "attendee", "attended")],
    joinedRoster: [p("p5", "Dr. Lisa Chen", "host", "attended"), p("c7", "C-2071", "attendee", "attended")],
    scheduledAt: "2026-02-08T09:00:00", startedAt: "2026-02-08T09:00:00", endedAt: "2026-02-08T09:50:00", duration: "50 min",
    transcript: "Professional: Good morning. How did the journaling exercise go this week?\nClient: I did it every day. It actually helped me notice patterns in my thinking.\nProfessional: That's exactly what we were hoping for. What patterns did you notice?\nClient: I tend to catastrophise small mistakes at work. Once I saw it written down, it felt less real.\nProfessional: That's a really important insight. Let's explore some cognitive restructuring techniques today.",
    aiSummary: "Client demonstrated strong homework completion with daily journaling. Identified cognitive distortion pattern (catastrophising) independently. Ready for cognitive restructuring techniques.",
    aiTakeaways: ["Daily journaling adherence — 7/7 days", "Self-identified catastrophising pattern", "Reduced severity of negative thought spirals", "Progressing to cognitive restructuring phase"],
    aiQualityScore: 4, aiReview: { primary: "Good session. Client completed homework assignments and showed improvement." },
    caseNotesSOAP: { subjective: "Client reports consistent journaling and identifies catastrophising patterns.", objective: "Engaged, clear thinking, good self-awareness.", assessment: "Progressing well. Cognitive distortions becoming more visible to client.", plan: "Introduce cognitive restructuring. Continue journaling." },
    caseNotesSubmittedAt: "2026-02-08T10:05:00",
    commercial: { payoutBatchId: "PB-2026-02", payoutStatus: "approved", pricingBasis: "per_session" },
    participantsSummary: "Dr. Lisa Chen, C-2071",
  },
  {
    id: "a13", type: "client_session", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "face_to_face",
    professionalDisplay: "Dr. Rachel Koh",
    clientDisplay: "C-8364",
    expectedRoster: [p("p6", "Dr. Rachel Koh", "host", "attended"), p("c8", "C-8364", "attendee", "no_show")],
    joinedRoster: [p("p6", "Dr. Rachel Koh", "host", "attended")],
    scheduledAt: "2026-02-07T11:00:00", startedAt: "2026-02-07T11:00:00", endedAt: "2026-02-07T11:05:00", duration: "5 min",
    aiQualityScore: null, aiReview: { primary: "No-show. Reschedule requested." },
    quality: { flags: ["no_show"] },
    participantsSummary: "Dr. Rachel Koh, C-8364",
  },

  // ── Internal / Core Service: pod_appointment ──────────────────────────
  {
    id: "a3", type: "pod_appointment", context: "internal", category: "internal", appointmentStatus: "confirmed",
    professionalDisplay: "Dr. Benjamin Kow Meng Ah +5",
    organisationId: "org-tf", organisationName: "ThoughtFull",
    expectedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("p2", "Dr. Sam Wong", "attendee", "attended"), p("p3", "Dr. Mei Lin", "attendee", "attended"), p("p5", "Dr. Lisa Chen", "attendee", "attended"), p("p6", "Dr. Rachel Koh", "attendee", "attended"), p("p7", "Dr. Priya Nair", "attendee", "attended")],
    joinedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("p2", "Dr. Sam Wong", "attendee", "attended"), p("p3", "Dr. Mei Lin", "attendee", "attended"), p("p5", "Dr. Lisa Chen", "attendee", "attended"), p("p6", "Dr. Rachel Koh", "attendee", "attended"), p("p7", "Dr. Priya Nair", "attendee", "attended")],
    scheduledAt: "2026-02-11T14:00:00", startedAt: "2026-02-11T14:00:00", endedAt: "2026-02-11T15:00:00", duration: "60 min",
    aiQualityScore: 4, aiReview: { primary: "Productive pod sync. Case reviews completed." },
    podDocumentation: { topics: ["Case review: C-4821 progress", "New intake protocol", "Supervision schedule update"], notes: "All members present. C-4821 case progressing well — reduced GAD-7. New intake checklist to be used from next week." },
    participantsSummary: "Pod 3 (6 TFPs)",
  },
  {
    id: "a6", type: "pod_appointment", context: "internal", category: "internal", appointmentStatus: "confirmed",
    professionalDisplay: "Dr. Benjamin Kow Meng Ah +5",
    organisationId: "org-tf", organisationName: "ThoughtFull",
    expectedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("p2", "Dr. Sam Wong", "attendee", "attended"), p("p3", "Dr. Mei Lin", "attendee", "no_show"), p("p5", "Dr. Lisa Chen", "attendee", "attended"), p("p6", "Dr. Rachel Koh", "attendee", "attended"), p("p7", "Dr. Priya Nair", "attendee", "attended")],
    joinedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("p2", "Dr. Sam Wong", "attendee", "attended"), p("p5", "Dr. Lisa Chen", "attendee", "attended"), p("p6", "Dr. Rachel Koh", "attendee", "attended"), p("p7", "Dr. Priya Nair", "attendee", "attended")],
    scheduledAt: "2026-02-10T14:00:00", startedAt: "2026-02-10T14:02:00", endedAt: "2026-02-10T15:02:00", duration: "60 min",
    aiQualityScore: 4, aiReview: { primary: "Good session. One member absent — follow-up needed." },
    podDocumentation: { topics: ["Weekly check-in", "Client escalation protocol"], notes: "Dr. Mei Lin absent — sent summary notes post-session. Escalation protocol reviewed and approved." },
    quality: { flags: ["partial_attendance"] },
    participantsSummary: "Pod 3 (5/6 TFPs)",
  },
  {
    id: "a10", type: "pod_appointment", context: "internal", category: "internal", appointmentStatus: "confirmed",
    professionalDisplay: "Dr. Alex Tan +4",
    organisationId: "org-tf", organisationName: "ThoughtFull",
    expectedRoster: [p("p4", "Dr. Alex Tan", "host", "attended"), p("p8", "Dr. Siti Aminah", "attendee", "attended"), p("p9", "Dr. Jason Lim", "attendee", "attended"), p("p10", "Dr. Wei Ling Chow", "attendee", "attended"), p("p11", "Dr. Amir Hassan", "attendee", "attended")],
    joinedRoster: [p("p4", "Dr. Alex Tan", "host", "attended"), p("p8", "Dr. Siti Aminah", "attendee", "attended"), p("p9", "Dr. Jason Lim", "attendee", "attended"), p("p10", "Dr. Wei Ling Chow", "attendee", "attended"), p("p11", "Dr. Amir Hassan", "attendee", "attended")],
    scheduledAt: "2026-02-09T14:00:00", startedAt: "2026-02-09T14:00:00", endedAt: "2026-02-09T15:00:00", duration: "60 min",
    aiQualityScore: 4, aiReview: { primary: "Full attendance. Collaborative discussion." },
    podDocumentation: { topics: ["Burnout prevention workshop prep", "Mid-month metrics review"], notes: "All metrics on track. Workshop materials to be finalised by Friday." },
    participantsSummary: "Pod 2 (5 TFPs)",
  },

  // ── Internal / Activation: townhall ───────────────────────────────────
  {
    id: "a7", type: "townhall", context: "internal", category: "internal", appointmentStatus: "confirmed",
    professionalDisplay: "Sarah Lee (Clinical Ops)",
    organisationId: "org-tf", organisationName: "ThoughtFull",
    expectedRoster: [p("admin1", "Sarah Lee (Clinical Ops)", "host", "attended"), p("p-all", "All TFPs", "attendee", "attended")],
    joinedRoster: [p("admin1", "Sarah Lee (Clinical Ops)", "host", "attended"), p("p-all", "45 attendees", "attendee", "attended")],
    scheduledAt: "2026-02-10T17:00:00", startedAt: "2026-02-10T17:00:00", endedAt: "2026-02-10T19:00:00", duration: "120 min",
    aiQualityScore: 4.2, aiReview: { primary: "Well-attended townhall. Covered policy updates.", secondary: "45 attendees total." },
    participantsSummary: "All Clinical Ops, All TFPs",
  },
  {
    id: "a12", type: "townhall", context: "internal", category: "internal", appointmentStatus: "confirmed",
    professionalDisplay: "Sarah Lee (Clinical Ops)",
    organisationId: "org-tf", organisationName: "ThoughtFull",
    expectedRoster: [p("admin1", "Sarah Lee (Clinical Ops)", "host", "attended"), p("p-all", "All", "attendee", "attended")],
    joinedRoster: [p("admin1", "Sarah Lee (Clinical Ops)", "host", "attended"), p("p-all", "38 attendees", "attendee", "attended")],
    scheduledAt: "2026-02-08T15:00:00", startedAt: "2026-02-08T15:00:00", endedAt: "2026-02-08T16:30:00", duration: "90 min",
    aiQualityScore: 4, aiReview: { primary: "Townhall completed. Q&A session productive." },
    participantsSummary: "All",
  },

  // ── Internal / Activation: workshop ───────────────────────────────────
  {
    id: "a14", type: "workshop", context: "internal", category: "internal", appointmentStatus: "confirmed",
    professionalDisplay: "Dr. Alex Tan +3",
    organisationId: "org-tf", organisationName: "ThoughtFull",
    expectedRoster: [p("p4", "Dr. Alex Tan", "presenter", "attended"), p("p2", "Dr. Sam Wong", "attendee", "attended"), p("p3", "Dr. Mei Lin", "attendee", "attended"), p("p8", "Dr. Siti Aminah", "attendee", "attended")],
    joinedRoster: [p("p4", "Dr. Alex Tan", "presenter", "attended"), p("p2", "Dr. Sam Wong", "attendee", "attended"), p("p3", "Dr. Mei Lin", "attendee", "attended"), p("p8", "Dr. Siti Aminah", "attendee", "attended")],
    scheduledAt: "2026-02-07T14:00:00", startedAt: "2026-02-07T14:05:00", endedAt: "2026-02-07T16:05:00", duration: "120 min",
    aiQualityScore: 4.5, aiReview: { primary: "Engaging workshop on trauma-informed care techniques.", secondary: "Hands-on role-play exercises well received." },
    participantsSummary: "Dr. Alex Tan + 3 TFPs",
  },

  // ── External / Activation: webinar ────────────────────────────────────
  {
    id: "a15", type: "webinar", context: "external", category: "activation", appointmentStatus: "confirmed", serviceType: "online_webinar",
    professionalDisplay: "Dr. Benjamin Kow Meng Ah",
    organisationId: "org-smhf", organisationName: "SG Mental Health Foundation",
    expectedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "presenter", "attended"), p("ext-all", "120 registrants", "attendee", "attended")],
    joinedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "presenter", "attended"), p("ext-all", "87 attendees", "attendee", "attended")],
    scheduledAt: "2026-02-06T12:00:00", startedAt: "2026-02-06T12:00:00", endedAt: "2026-02-06T13:00:00", duration: "60 min",
    transcript: "Dr. Benjamin: Welcome everyone to today's webinar on workplace mental health strategies.\n[Slide: Understanding Burnout]\nDr. Benjamin: Let's start by discussing the key indicators of workplace burnout...\n[Q&A session follows with 15 audience questions]",
    aiSummary: "Well-structured webinar covering workplace mental health fundamentals. Strong audience engagement with 15 Q&A questions. 87 of 120 registrants attended.",
    aiTakeaways: ["Covered burnout indicators and prevention strategies", "87/120 registrant attendance rate", "15 Q&A questions from audience", "Follow-up resources shared post-session"],
    aiQualityScore: 4.3, aiReview: { primary: "Well-received public webinar on workplace mental health.", secondary: "87 of 120 registrants attended. 15 Q&A questions." },
    commercial: { pricingBasis: "sponsored", commercialFlags: ["activation_event"] },
    activationStatus: "attended",
    wellbeingPillars: ["emotional_wellbeing", "career_satisfaction"],
    participantCount: 87,
    professionalRating: 4.5,
    programRating: 4.2,
    engagementRate: 78,
    programScore: 82,
    participantsSummary: "Dr. Benjamin Kow Meng Ah + 87 attendees",
  },

  // ── External / Activation: gig ────────────────────────────────────────
  {
    id: "a16", type: "gig", context: "external", category: "activation", appointmentStatus: "confirmed", serviceType: "onsite_talk",
    professionalDisplay: "Dr. Lisa Chen",
    organisationId: "org-dbs", organisationName: "DBS Bank",
    expectedRoster: [p("p5", "Dr. Lisa Chen", "host", "attended")],
    joinedRoster: [p("p5", "Dr. Lisa Chen", "host", "attended")],
    scheduledAt: "2026-02-05T10:00:00", startedAt: "2026-02-05T10:00:00", endedAt: "2026-02-05T12:00:00", duration: "120 min",
    aiQualityScore: null,
    commercial: { payoutBatchId: "PB-2026-02", payoutStatus: "pending", pricingBasis: "flat_fee", commercialFlags: ["gig_assignment"] },
    activationStatus: "attended",
    wellbeingPillars: ["career_satisfaction", "emotional_wellbeing"],
    participantCount: 45,
    professionalRating: 4.3,
    programRating: 4.0,
    engagementRate: 85,
    programScore: 79,
    participantsSummary: "Dr. Lisa Chen (Corporate wellness talk)",
  },

  // ── External / Activation: roadshow ───────────────────────────────────
  {
    id: "a17", type: "roadshow", context: "external", category: "activation", appointmentStatus: "confirmed", serviceType: "roadshow",
    professionalDisplay: "Dr. Alex Tan +1",
    organisationId: "org-singtel", organisationName: "Singtel",
    expectedRoster: [p("p4", "Dr. Alex Tan", "presenter", "attended"), p("p6", "Dr. Rachel Koh", "presenter", "attended")],
    joinedRoster: [p("p4", "Dr. Alex Tan", "presenter", "attended"), p("p6", "Dr. Rachel Koh", "presenter", "attended")],
    scheduledAt: "2026-02-04T09:00:00", startedAt: "2026-02-04T09:15:00", endedAt: "2026-02-04T12:15:00", duration: "180 min",
    aiQualityScore: null,
    commercial: { pricingBasis: "day_rate", commercialFlags: ["activation_event", "corporate_client"] },
    activationStatus: "attended",
    wellbeingPillars: ["physical_health", "emotional_wellbeing", "career_satisfaction"],
    participantCount: 120,
    professionalRating: 4.1,
    programRating: 3.8,
    engagementRate: 72,
    programScore: 75,
    participantsSummary: "Dr. Alex Tan, Dr. Rachel Koh (Singtel roadshow)",
  },
  {
    id: "a21", type: "webinar", context: "external", category: "activation", serviceType: "online_workshop",
    professionalDisplay: "Dr. Priya Nair +1",
    organisationId: "org-grab", organisationName: "Grab Holdings",
    expectedRoster: [p("p7", "Dr. Priya Nair", "presenter", "attended"), p("p8", "Dr. Siti Aminah", "presenter", "scheduled")],
    joinedRoster: [],
    scheduledAt: "2026-02-14T10:00:00", duration: "90 min",
    aiQualityScore: null,
    commercial: { pricingBasis: "flat_fee", commercialFlags: ["activation_event"] },
    activationStatus: "new",
    wellbeingPillars: ["financial_wellbeing", "career_satisfaction"],
    participantCount: 0,
    participantsSummary: "Dr. Priya Nair, Dr. Siti Aminah",
  },
  {
    id: "a22", type: "gig", context: "external", category: "activation", appointmentStatus: "confirmed", serviceType: "onsite_workshop",
    professionalDisplay: "Dr. Sam Wong",
    organisationId: "org-shopee", organisationName: "Shopee",
    expectedRoster: [p("p2", "Dr. Sam Wong", "presenter", "attended"), p("ext-all", "30 registrants", "attendee", "attended")],
    joinedRoster: [p("p2", "Dr. Sam Wong", "presenter", "attended"), p("ext-all", "18 so far", "attendee", "attended")],
    scheduledAt: "2026-02-11T14:00:00", startedAt: "2026-02-11T14:05:00", duration: "120 min",
    aiQualityScore: null,
    commercial: { pricingBasis: "flat_fee", commercialFlags: ["activation_event"] },
    activationStatus: "in_progress",
    wellbeingPillars: ["emotional_wellbeing", "healthy_relationship"],
    participantCount: 18,
    professionalRating: 4.6,
    programRating: 4.4,
    engagementRate: 91,
    programScore: 88,
    participantsSummary: "Dr. Sam Wong + 18 participants",
  },

  // ── External / Core Service: online_clinic ────────────────────────────
  {
    id: "a18", type: "online_clinic", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "online_mental_wellbeing_clinic",
    professionalDisplay: "Dr. Mei Lin",
    organisationId: "org-nus-counsel", organisationName: "NUS Student Counselling",
    expectedRoster: [p("p3", "Dr. Mei Lin", "host", "attended"), p("c9", "C-1192", "attendee", "attended"), p("c10", "C-3047", "attendee", "attended"), p("c11", "C-5581", "attendee", "no_show")],
    joinedRoster: [p("p3", "Dr. Mei Lin", "host", "attended"), p("c9", "C-1192", "attendee", "attended"), p("c10", "C-3047", "attendee", "attended")],
    scheduledAt: "2026-02-06T15:00:00", startedAt: "2026-02-06T15:00:00", endedAt: "2026-02-06T16:30:00", duration: "90 min",
    aiQualityScore: 4, aiReview: { primary: "Group therapy session went well. One participant absent." },
    quality: { flags: ["partial_attendance"] },
    commercial: { payoutBatchId: "PB-2026-02", payoutStatus: "approved", pricingBasis: "per_session" },
    participantsSummary: "Dr. Mei Lin + 2/3 clients",
  },

  // ── External / Core Service: onsite_clinic ────────────────────────────
  {
    id: "a19", type: "onsite_clinic", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "onsite_mental_wellbeing_clinic",
    professionalDisplay: "Dr. Sam Wong",
    organisationId: "org-nus", organisationName: "National University of Singapore",
    expectedRoster: [p("p2", "Dr. Sam Wong", "host", "attended"), p("c12", "Walk-in clients (est. 8)", "attendee", "attended")],
    joinedRoster: [p("p2", "Dr. Sam Wong", "host", "attended"), p("c12", "6 walk-in clients", "attendee", "attended")],
    scheduledAt: "2026-02-05T14:00:00", startedAt: "2026-02-05T14:10:00", endedAt: "2026-02-05T17:10:00", duration: "180 min",
    aiQualityScore: 3.5, aiReview: { primary: "Onsite clinic at NUS. 6 of 8 expected walk-ins attended.", secondary: "Mostly first-time screening appointments." },
    commercial: { payoutBatchId: "PB-2026-02", payoutStatus: "flagged", pricingBasis: "half_day", commercialFlags: ["below_expected_volume"] },
    quality: { flags: ["below_expected_volume"] },
    participantsSummary: "Dr. Sam Wong (NUS onsite — 6 clients)",
  },

  // ── External / Core Service: online_clinic (another) ──────────────────
  {
    id: "a20", type: "online_clinic", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "online_mental_wellbeing_clinic",
    professionalDisplay: "Dr. Priya Nair",
    organisationId: "org-temasek", organisationName: "Temasek Foundation",
    expectedRoster: [p("p7", "Dr. Priya Nair", "host", "attended"), p("c13", "C-4420", "attendee", "attended"), p("c14", "C-6731", "attendee", "attended"), p("c15", "C-8902", "attendee", "attended")],
    joinedRoster: [p("p7", "Dr. Priya Nair", "host", "attended"), p("c13", "C-4420", "attendee", "attended"), p("c14", "C-6731", "attendee", "attended"), p("c15", "C-8902", "attendee", "attended")],
    scheduledAt: "2026-02-04T15:00:00", startedAt: "2026-02-04T15:00:00", endedAt: "2026-02-04T16:30:00", duration: "90 min",
    aiQualityScore: 4.8, aiReview: { primary: "Excellent group session. All participants engaged actively.", secondary: "Follow-up resources shared post-session." },
    commercial: { payoutBatchId: "PB-2026-02", payoutStatus: "paid", pricingBasis: "per_session" },
    participantsSummary: "Dr. Priya Nair + 3 clients",
  },

  // ── Upcoming internal appointments ──────────────────────────────────────
  {
    id: "a23", type: "townhall", context: "internal", category: "internal",
    professionalDisplay: "Sarah Lee (Clinical Ops)",
    organisationId: "org-tf", organisationName: "ThoughtFull",
    expectedRoster: [p("admin1", "Sarah Lee (Clinical Ops)", "host", "attended"), p("p-all", "All TFPs", "attendee", "attended")],
    joinedRoster: [],
    scheduledAt: "2026-02-27T14:30:00", duration: "90 min",
    aiQualityScore: null,
    participantsSummary: "All Clinical Ops, All TFPs",
  },
  {
    id: "a24", type: "pod_appointment", context: "internal", category: "internal",
    professionalDisplay: "Dr. Benjamin Kow Meng Ah +5",
    organisationId: "org-tf", organisationName: "ThoughtFull",
    expectedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("p2", "Dr. Sam Wong", "attendee", "attended"), p("p3", "Dr. Mei Lin", "attendee", "attended")],
    joinedRoster: [],
    scheduledAt: "2026-02-28T10:00:00", duration: "60 min",
    aiQualityScore: null,
    participantsSummary: "Pod 3 (6 TFPs)",
  },
  {
    id: "a25", type: "workshop", context: "internal", category: "internal",
    professionalDisplay: "Dr. Alex Tan",
    organisationId: "org-tf", organisationName: "ThoughtFull",
    expectedRoster: [p("p4", "Dr. Alex Tan", "presenter", "attended"), p("p2", "Dr. Sam Wong", "attendee", "attended")],
    joinedRoster: [],
    scheduledAt: "2026-03-03T14:00:00", duration: "120 min",
    aiQualityScore: null,
    participantsSummary: "Team A (4 TFPs)",
  },
  {
    id: "a26", type: "townhall", context: "internal", category: "internal",
    professionalDisplay: "Sarah Lee (Clinical Ops)",
    organisationId: "org-tf", organisationName: "ThoughtFull",
    expectedRoster: [p("admin1", "Sarah Lee (Clinical Ops)", "host", "attended"), p("p-all", "All TFPs", "attendee", "attended")],
    joinedRoster: [],
    scheduledAt: "2026-03-10T17:00:00", duration: "90 min",
    aiQualityScore: null,
    participantsSummary: "All Clinical Ops, All TFPs",
  },

  // ── Cancelled appointments ─────────────────────────────────────────────
  {
    id: "a27", type: "client_session", context: "external", category: "core_service", appointmentStatus: "cancelled", serviceType: "video_call",
    professionalDisplay: "Dr. Benjamin Kow Meng Ah",
    clientDisplay: "C-7293",
    scheduledAt: "2026-03-01T10:00:00", duration: "60 min",
    organisationId: "org-tech", organisationName: "Tech Innovations Inc.",
    expectedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "cancelled"), p("c2", "C-7293", "attendee", "cancelled")],
    joinedRoster: [],
    aiQualityScore: null,
    participantsSummary: "Dr. Benjamin Kow Meng Ah, C-7293",
  },
  {
    id: "a28", type: "client_session", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "video_call",
    professionalDisplay: "Dr. Benjamin Kow Meng Ah",
    clientDisplay: "C-7293",
    scheduledAt: "2026-03-02T11:00:00", duration: "60 min",
    organisationId: "org-tech", organisationName: "Tech Innovations Inc.",
    expectedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("c2", "C-7293", "attendee", "attended")],
    joinedRoster: [],
    aiQualityScore: null,
    participantsSummary: "Dr. Benjamin Kow Meng Ah, C-7293",
  },
  {
    id: "a29", type: "client_session", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "video_call",
    professionalDisplay: "Dr. Benjamin Kow Meng Ah",
    clientDisplay: "C-7293",
    scheduledAt: "2026-03-03T09:00:00", duration: "60 min",
    organisationId: "org-tech", organisationName: "Tech Innovations Inc.",
    expectedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("c2", "C-7293", "attendee", "attended")],
    joinedRoster: [],
    aiQualityScore: null,
    participantsSummary: "Dr. Benjamin Kow Meng Ah, C-7293",
  },
  {
    id: "a30", type: "client_session", context: "external", category: "core_service", appointmentStatus: "confirmed", serviceType: "video_call",
    professionalDisplay: "Dr. Benjamin Kow Meng Ah",
    clientDisplay: "C-7293",
    scheduledAt: "2026-03-04T15:00:00", duration: "60 min",
    organisationId: "org-tech", organisationName: "Tech Innovations Inc.",
    expectedRoster: [p("p1", "Dr. Benjamin Kow Meng Ah", "host", "attended"), p("c2", "C-7293", "attendee", "attended")],
    joinedRoster: [],
    aiQualityScore: null,
    participantsSummary: "Dr. Benjamin Kow Meng Ah, C-7293",
  },
];

export const appointmentNotes: Record<string, string[]> = {};
export const appointmentTimelineEvents: Record<string, string[]> = {};
export const appointmentMetadata: Record<string, Record<string, string>> = {};
export const appointmentAttendanceHistory: Record<string, { date: string; status: AttendanceStatus }[]> = {};
