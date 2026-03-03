export type ThreadParticipant = {
  name: string;
  role?: string;
};

export type InteractiveSubtype = "broadcast" | "pod" | "professional";

export type ChatThread = {
  id: string;
  conversationId: string;
  type: "view-only" | "interactive";
  /** Categorises interactive threads for grouping in the sidebar */
  subtype?: InteractiveSubtype;
  label: string;
  subLabel?: string;
  clientDisplayId?: string;
  clientFullName?: string;
  clientEmail?: string;
  clientPhone?: string;
  /** When set, shows member count chip and expandable names (first 2 + "+N more") */
  participants?: ThreadParticipant[];
  lastPreview: string;
  lastTime: string;
  viewOnly?: boolean;
  /** Enables the right panel (annotations, risk, metadata) regardless of viewOnly status */
  oversight?: boolean;
};

export type Message = {
  id: string;
  sender: string;
  senderId: string;
  time: string;
  body: string;
  attachments?: { id: string; name: string; type: "image" | "file" }[];
  edited?: boolean;
};

function teamParticipants(
  leader: string,
  role: string,
  ...others: string[]
): ThreadParticipant[] {
  return [{ name: leader, role }, ...others.map((name) => ({ name }))];
}

export const viewOnlyThreads: ChatThread[] = [
  {
    id: "vo-1",
    conversationId: "vo-1",
    type: "view-only",
    label: "Dr. Benjamin Kow Meng Ah",
    subLabel: "↔ Client • TFC-18392",
    clientDisplayId: "TFC-18392",
    clientFullName: "Jordan Lee",
    clientEmail: "jordan.lee@example.com",
    clientPhone: "+65 9*** 4567",
    lastPreview: "Thanks for the session today.",
    lastTime: "2:30 pm",
    viewOnly: true,
  },
  {
    id: "vo-2",
    conversationId: "vo-2",
    type: "view-only",
    label: "Dr. Benjamin Kow Meng Ah",
    subLabel: "↔ Client • TFC-42017",
    clientDisplayId: "TFC-42017",
    clientFullName: "Sam Kim",
    clientEmail: "sam.kim@example.com",
    clientPhone: "+65 8*** 1932",
    lastPreview: "See you next week.",
    lastTime: "11:00 am",
    viewOnly: true,
  },
];

export const podThreads: ChatThread[] = [
  {
    id: "pod-1", conversationId: "pod-1", type: "interactive", subtype: "pod", label: "Team A",
    lastPreview: "Pod sync confirmed.", lastTime: "Yesterday", oversight: true,
    participants: [
      { name: "Dr. Benjamin Kow Meng Ah", role: "Pod leader" },
      { name: "Dr. Blabla" },
      { name: "Dr. Blabla" },
    ],
  },
  {
    id: "pod-2", conversationId: "pod-2", type: "interactive", subtype: "pod", label: "Team B",
    lastPreview: "Case review scheduled for Thu.", lastTime: "Yesterday", oversight: true,
    participants: teamParticipants("Dr. Sam Wong", "Pod leader", "Dr. Jane Lim", "Dr. Raj Patel"),
  },
  {
    id: "pod-3", conversationId: "pod-3", type: "interactive", subtype: "pod", label: "Team C",
    lastPreview: "Supervision notes uploaded.", lastTime: "Mon", oversight: true,
    participants: teamParticipants("Dr. Mei Lin", "Pod leader", "Dr. James Ho", "Dr. Priya Singh"),
  },
  {
    id: "pod-4", conversationId: "pod-4", type: "interactive", subtype: "pod", label: "Team D",
    lastPreview: "Roster updated for next week.", lastTime: "Mon", oversight: true,
    participants: teamParticipants("Dr. Alex Tan", "Pod leader", "Dr. Sarah Ng", "Dr. David Wong"),
  },
  {
    id: "pod-5", conversationId: "pod-5", type: "interactive", subtype: "pod", label: "Team E",
    lastPreview: "TFP+ checklist completed.", lastTime: "Sun", oversight: true,
    participants: teamParticipants("Dr. Lisa Chen", "Pod leader", "Dr. Michael Teo"),
  },
  {
    id: "pod-6", conversationId: "pod-6", type: "interactive", subtype: "pod", label: "Team F",
    lastPreview: "Townhall prep shared.", lastTime: "Sat", oversight: true,
    participants: teamParticipants("Dr. Rachel Koh", "Pod leader", "Dr. Daniel Lee", "Dr. Nina Park"),
  },
  {
    id: "pod-7", conversationId: "pod-7", type: "interactive", subtype: "pod", label: "Team G",
    lastPreview: "Client handover summary sent.", lastTime: "Fri", oversight: true,
    participants: teamParticipants("Dr. Kevin Goh", "Pod leader", "Dr. Amanda Chua"),
  },
  {
    id: "pod-8", conversationId: "pod-8", type: "interactive", subtype: "pod", label: "Team H",
    lastPreview: "LMS module reminder.", lastTime: "Thu", oversight: true,
    participants: teamParticipants("Dr. Susan Lim", "Pod leader", "Dr. Eric Tan", "Dr. Fiona Yeo"),
  },
];

export const interactiveThreads: ChatThread[] = [
  { id: "int-1", conversationId: "int-1", type: "interactive", subtype: "broadcast", label: "All TFPs", lastPreview: "Reminder: Townhall at 2pm.", lastTime: "10:00 am" },
  { id: "int-2", conversationId: "int-2", type: "interactive", subtype: "professional", label: "Dr. Benjamin Kow Meng Ah", lastPreview: "Got it, thanks.", lastTime: "9:45 am" },
  { id: "int-3", conversationId: "int-3", type: "interactive", subtype: "professional", label: "Dr. Sam Wong", lastPreview: "Will do.", lastTime: "Yesterday" },
];

export const threadMessages: Record<string, Message[]> = {
  "vo-1": [
    { id: "m1", sender: "Jordan Lee", senderId: "c1", time: "2:15 pm", body: "I found the exercises helpful." },
    { id: "m2", sender: "Dr. Benjamin Kow Meng Ah", senderId: "tfp1", time: "2:30 pm", body: "Thanks for the session today. Keep practicing." },
  ],
  "vo-2": [
    { id: "m3", sender: "Sam Kim", senderId: "c2", time: "10:45 am", body: "Can we reschedule?" },
    { id: "m4", sender: "Dr. Benjamin Kow Meng Ah", senderId: "tfp1", time: "11:00 am", body: "See you next week. I've updated the calendar." },
  ],
  "pod-1": [
    { id: "m5", sender: "Dr. Benjamin Kow Meng Ah", senderId: "tfp1", time: "3:00 pm", body: "Pod sync confirmed for Friday." },
    { id: "m6", sender: "Sarah Lee", senderId: "clinical", time: "3:05 pm", body: "Great, I'll join the sync as well." },
  ],
  "pod-2": [
    { id: "vb1", sender: "Dr. Sam Wong", senderId: "tfp2", time: "2:00 pm", body: "Case review scheduled for Thu 2pm." },
    { id: "vb2", sender: "Dr. Jane Lim", senderId: "tfp8", time: "2:15 pm", body: "Thanks, will prep notes." },
    { id: "vb3", sender: "Sarah Lee", senderId: "clinical", time: "2:20 pm", body: "Please include the DASS updates too." },
  ],
  "pod-3": [
    { id: "vc1", sender: "Dr. Mei Lin", senderId: "tfp3", time: "11:00 am", body: "Supervision notes uploaded to drive." },
    { id: "vc2", sender: "Dr. James Ho", senderId: "tfp4", time: "11:30 am", body: "Reviewed, all good." },
  ],
  "pod-4": [
    { id: "vd1", sender: "Dr. Alex Tan", senderId: "tfp9", time: "9:00 am", body: "Roster updated for next week." },
  ],
  "pod-5": [
    { id: "ve1", sender: "Dr. Lisa Chen", senderId: "tfp5", time: "4:00 pm", body: "TFP+ checklist completed for Q1." },
  ],
  "pod-6": [
    { id: "vf1", sender: "Dr. Rachel Koh", senderId: "tfp6", time: "10:00 am", body: "Townhall prep doc shared in folder." },
  ],
  "pod-7": [
    { id: "vg1", sender: "Dr. Kevin Goh", senderId: "tfp7", time: "3:30 pm", body: "Client handover summary sent to ops." },
  ],
  "pod-8": [
    { id: "vh1", sender: "Dr. Susan Lim", senderId: "tfp10", time: "2:00 pm", body: "LMS module due Friday – reminder." },
  ],
  "int-1": [
    { id: "m7", sender: "Sarah Lee", senderId: "clinical", time: "10:00 am", body: "Reminder: Townhall at 2pm. Please join." },
  ],
  "int-2": [
    { id: "m8", sender: "Sarah Lee", senderId: "clinical", time: "9:30 am", body: "Please submit case notes by EOD." },
    { id: "m9", sender: "Dr. Benjamin Kow Meng Ah", senderId: "tfp1", time: "9:45 am", body: "Got it, thanks." },
  ],
  "int-3": [
    { id: "m10", sender: "Sarah Lee", senderId: "clinical", time: "Yesterday", body: "Follow up on the LMS module." },
    { id: "m11", sender: "Dr. Sam Wong", senderId: "tfp2", time: "Yesterday", body: "Will do." },
  ],
};

export type ChatProfessional = {
  id: string;
  name: string;
  initials: string;
  online: boolean;
};

export const chatProfessionals: ChatProfessional[] = [
  { id: "tfp1", name: "Dr. Benjamin Kow Meng Ah", initials: "BK", online: true },
  { id: "tfp2", name: "Dr. Sam Wong", initials: "SW", online: true },
  { id: "tfp3", name: "Dr. Mei Lin", initials: "ML", online: false },
  { id: "tfp4", name: "Dr. James Ho", initials: "JH", online: true },
  { id: "tfp5", name: "Dr. Lisa Chen", initials: "LC", online: false },
  { id: "tfp6", name: "Dr. Rachel Koh", initials: "RK", online: true },
  { id: "tfp7", name: "Dr. Kevin Goh", initials: "KG", online: true },
  { id: "pl1", name: "Pod Lead Jane", initials: "PJ", online: true },
];

export type ThreadMetadata = {
  channel: string;
  participantName: string;
  participantId: string;
  threadId: string;
  phone?: string;
  address?: string;
};

export const threadMetadataByThreadId: Record<string, ThreadMetadata> = {
  "vo-1": {
    channel: "Chat",
    participantName: "Jordan Lee",
    participantId: "C001",
    threadId: "2023113142356",
    phone: "+62 679 7622 9012",
    address: "5467 Richmond View, Suite 511, Sunrise, Kentucky",
  },
  "vo-2": {
    channel: "Chat",
    participantName: "Sam Kim",
    participantId: "C002",
    threadId: "2023113142357",
    phone: "+62 679 7622 9013",
  },
};
