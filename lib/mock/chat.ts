export type ThreadParticipant = {
  name: string;
  role?: string;
};

export type ChatThread = {
  id: string;
  type: "view-only" | "interactive";
  label: string;
  subLabel?: string;
  /** When set, shows member count chip and expandable names (first 2 + "+N more") */
  participants?: ThreadParticipant[];
  lastPreview: string;
  lastTime: string;
  viewOnly?: boolean;
};

export type Message = {
  id: string;
  sender: string;
  senderId: string;
  time: string;
  body: string;
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
  { id: "vo-1", type: "view-only", label: "Dr. Benjamin Kow Meng Ah", subLabel: "↔ Jordan Lee", lastPreview: "Thanks for the session today.", lastTime: "2:30 pm", viewOnly: true },
  { id: "vo-2", type: "view-only", label: "Dr. Benjamin Kow Meng Ah", subLabel: "↔ Sam Kim", lastPreview: "See you next week.", lastTime: "11:00 am", viewOnly: true },
  {
    id: "vo-3",
    type: "view-only",
    label: "Team A",
    lastPreview: "Pod sync confirmed.",
    lastTime: "Yesterday",
    viewOnly: true,
    participants: [
      { name: "Dr. Benjamin Kow Meng Ah", role: "Pod leader" },
      { name: "Dr. Blabla" },
      { name: "Dr. Blabla" },
    ],
  },
  {
    id: "vo-4",
    type: "view-only",
    label: "Team B",
    lastPreview: "Case review scheduled for Thu.",
    lastTime: "Yesterday",
    viewOnly: true,
    participants: teamParticipants("Dr. Sam Wong", "Pod leader", "Dr. Jane Lim", "Dr. Raj Patel"),
  },
  {
    id: "vo-5",
    type: "view-only",
    label: "Team C",
    lastPreview: "Supervision notes uploaded.",
    lastTime: "Mon",
    viewOnly: true,
    participants: teamParticipants("Dr. Mei Lin", "Pod leader", "Dr. James Ho", "Dr. Priya Singh"),
  },
  {
    id: "vo-6",
    type: "view-only",
    label: "Team D",
    lastPreview: "Roster updated for next week.",
    lastTime: "Mon",
    viewOnly: true,
    participants: teamParticipants("Dr. Alex Tan", "Pod leader", "Dr. Sarah Ng", "Dr. David Wong"),
  },
  {
    id: "vo-7",
    type: "view-only",
    label: "Team E",
    lastPreview: "TFP+ checklist completed.",
    lastTime: "Sun",
    viewOnly: true,
    participants: teamParticipants("Dr. Lisa Chen", "Pod leader", "Dr. Michael Teo"),
  },
  {
    id: "vo-8",
    type: "view-only",
    label: "Team F",
    lastPreview: "Townhall prep shared.",
    lastTime: "Sat",
    viewOnly: true,
    participants: teamParticipants("Dr. Rachel Koh", "Pod leader", "Dr. Daniel Lee", "Dr. Nina Park"),
  },
  {
    id: "vo-9",
    type: "view-only",
    label: "Team G",
    lastPreview: "Client handover summary sent.",
    lastTime: "Fri",
    viewOnly: true,
    participants: teamParticipants("Dr. Kevin Goh", "Pod leader", "Dr. Amanda Chua"),
  },
  {
    id: "vo-10",
    type: "view-only",
    label: "Team H",
    lastPreview: "LMS module reminder.",
    lastTime: "Thu",
    viewOnly: true,
    participants: teamParticipants("Dr. Susan Lim", "Pod leader", "Dr. Eric Tan", "Dr. Fiona Yeo"),
  },
];

export const interactiveThreads: ChatThread[] = [
  { id: "int-1", type: "interactive", label: "All TFPs", lastPreview: "Reminder: Townhall at 2pm.", lastTime: "10:00 am" },
  { id: "int-2", type: "interactive", label: "Dr. Benjamin Kow Meng Ah", lastPreview: "Got it, thanks.", lastTime: "9:45 am" },
  { id: "int-3", type: "interactive", label: "Dr. Sam Wong", lastPreview: "Will do.", lastTime: "Yesterday" },
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
  "vo-3": [
    { id: "m5", sender: "Team A", senderId: "pl1", time: "3:00 pm", body: "Pod sync confirmed for Friday." },
    { id: "m6", sender: "Dr. Benjamin Kow Meng Ah", senderId: "tfp1", time: "3:05 pm", body: "Noted, thanks." },
  ],
  "vo-4": [
    { id: "vb1", sender: "Team B", senderId: "pl2", time: "2:00 pm", body: "Case review scheduled for Thu 2pm." },
    { id: "vb2", sender: "Dr. Sam Wong", senderId: "tfp2", time: "2:15 pm", body: "Thanks, will prep notes." },
  ],
  "vo-5": [
    { id: "vc1", sender: "Dr. Mei Lin", senderId: "tfp3", time: "11:00 am", body: "Supervision notes uploaded to drive." },
    { id: "vc2", sender: "Dr. James Ho", senderId: "tfp4", time: "11:30 am", body: "Reviewed, all good." },
  ],
  "vo-6": [
    { id: "vd1", sender: "Team D", senderId: "pl4", time: "9:00 am", body: "Roster updated for next week." },
  ],
  "vo-7": [
    { id: "ve1", sender: "Dr. Lisa Chen", senderId: "tfp5", time: "4:00 pm", body: "TFP+ checklist completed for Q1." },
  ],
  "vo-8": [
    { id: "vf1", sender: "Dr. Rachel Koh", senderId: "tfp6", time: "10:00 am", body: "Townhall prep doc shared in folder." },
  ],
  "vo-9": [
    { id: "vg1", sender: "Dr. Kevin Goh", senderId: "tfp7", time: "3:30 pm", body: "Client handover summary sent to ops." },
  ],
  "vo-10": [
    { id: "vh1", sender: "Team H", senderId: "pl8", time: "2:00 pm", body: "LMS module due Friday – reminder." },
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
