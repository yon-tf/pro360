/**
 * Pod Management mock data.
 * Many-to-many: members can join multiple pods, leaders can lead multiple pods.
 */

export type PodStatus = "Active" | "Inactive";

export interface PodMember {
  tfpId: string;
  joinedAt: string;
}

export interface Pod {
  id: string;
  name: string;
  leaderId: string | null;
  status: PodStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  members: PodMember[];
  maxCapacity: number;
}

export interface PodHistoryEntry {
  id: string;
  podId: string;
  type:
    | "member_joined"
    | "member_removed"
    | "leader_assigned"
    | "leader_changed"
    | "pod_deactivated"
    | "pod_created"
    | "pod_name_changed"
    | "pod_description_changed"
    | "chat_group_notified";
  tfpId?: string;
  tfpName?: string;
  detail?: string;
  at: string;
}

export const pods: Pod[] = [
  {
    id: "pod-1",
    name: "Clinical Psychologists – North",
    leaderId: "1",
    status: "Active",
    notes: "Primary pod for north region clinical psychologists. Weekly sync on Tuesdays.",
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2026-02-10T14:00:00Z",
    members: [
      { tfpId: "1", joinedAt: "2025-06-01" },
      { tfpId: "2", joinedAt: "2025-07-15" },
      { tfpId: "3", joinedAt: "2025-08-20" },
    ],
    maxCapacity: 5,
  },
  {
    id: "pod-2",
    name: "CBT & Anxiety Specialists",
    leaderId: "4",
    status: "Active",
    notes: "Focus on CBT and anxiety methodologies. Bi-weekly case reviews.",
    createdAt: "2025-07-01T00:00:00Z",
    updatedAt: "2026-02-12T09:30:00Z",
    members: [
      { tfpId: "4", joinedAt: "2025-07-01" },
      { tfpId: "5", joinedAt: "2025-09-01" },
      { tfpId: "6", joinedAt: "2025-10-10" },
      { tfpId: "2", joinedAt: "2025-11-05" },
    ],
    maxCapacity: 4,
  },
  {
    id: "pod-3",
    name: "Trauma-Informed Care Pod",
    leaderId: null,
    status: "Inactive",
    notes: "Paused Q1 2026. To be reactivated with new lead.",
    createdAt: "2025-08-15T00:00:00Z",
    updatedAt: "2026-01-15T11:00:00Z",
    members: [],
    maxCapacity: 6,
  },
];

export const podHistory: PodHistoryEntry[] = [
  { id: "h0", podId: "pod-1", type: "pod_created", detail: "Pod created", at: "2025-06-01T08:00:00Z" },
  { id: "h1", podId: "pod-1", type: "leader_assigned", tfpId: "1", tfpName: "Dr. Benjamin Kow Meng Ah", at: "2025-06-01T10:00:00Z" },
  { id: "h2", podId: "pod-1", type: "chat_group_notified", detail: "Pod chat group created and members notified", at: "2025-06-01T10:01:00Z" },
  { id: "h3", podId: "pod-1", type: "member_joined", tfpId: "1", tfpName: "Dr. Benjamin Kow Meng Ah", at: "2025-06-01T10:00:00Z" },
  { id: "h4", podId: "pod-1", type: "member_joined", tfpId: "2", tfpName: "Dr. Sarah Lim", at: "2025-07-15T09:00:00Z" },
  { id: "h5", podId: "pod-1", type: "chat_group_notified", detail: "Dr. Sarah Lim added — chat group notified", at: "2025-07-15T09:01:00Z" },
  { id: "h6", podId: "pod-1", type: "member_joined", tfpId: "3", tfpName: "Dr. James Wong", at: "2025-08-20T14:00:00Z" },
  { id: "h7", podId: "pod-1", type: "chat_group_notified", detail: "Dr. James Wong added — chat group notified", at: "2025-08-20T14:01:00Z" },
  { id: "h8", podId: "pod-1", type: "pod_description_changed", detail: "\"Weekly sync on Mondays\" → \"Weekly sync on Tuesdays\"", at: "2025-09-10T11:00:00Z" },
  { id: "h9", podId: "pod-1", type: "pod_name_changed", detail: "\"Clinical Psychologists – Central\" → \"Clinical Psychologists – North\"", at: "2025-10-05T09:30:00Z" },

  { id: "h10a", podId: "pod-2", type: "pod_created", detail: "Pod created", at: "2025-07-01T09:00:00Z" },
  { id: "h10", podId: "pod-2", type: "leader_assigned", tfpId: "4", tfpName: "Dr. Priya Sharma", at: "2025-07-01T11:00:00Z" },
  { id: "h11", podId: "pod-2", type: "member_joined", tfpId: "4", tfpName: "Dr. Priya Sharma", at: "2025-07-01T11:00:00Z" },
  { id: "h12", podId: "pod-2", type: "member_joined", tfpId: "5", tfpName: "Dr. Michael Tan", at: "2025-09-01T10:00:00Z" },
  { id: "h13", podId: "pod-2", type: "member_joined", tfpId: "6", tfpName: "Dr. Emily Chen", at: "2025-10-10T09:00:00Z" },
  { id: "h14", podId: "pod-2", type: "member_joined", tfpId: "2", tfpName: "Dr. Sarah Lim", detail: "Also a member of Clinical Psychologists – North", at: "2025-11-05T11:00:00Z" },
  { id: "h15", podId: "pod-2", type: "chat_group_notified", detail: "Dr. Sarah Lim added — chat group notified", at: "2025-11-05T11:01:00Z" },
  { id: "h16", podId: "pod-2", type: "pod_name_changed", detail: "\"Anxiety Specialists\" → \"CBT & Anxiety Specialists\"", at: "2025-12-20T14:00:00Z" },

  { id: "h19", podId: "pod-3", type: "pod_created", detail: "Pod created", at: "2025-08-15T08:00:00Z" },
  { id: "h20", podId: "pod-3", type: "member_joined", tfpId: "7", tfpName: "Dr. Alex Ng", at: "2025-08-15T10:00:00Z" },
  { id: "h21", podId: "pod-3", type: "leader_assigned", tfpId: "7", tfpName: "Dr. Alex Ng", at: "2025-08-15T10:00:00Z" },
  { id: "h22", podId: "pod-3", type: "member_removed", tfpId: "7", tfpName: "Dr. Alex Ng", detail: "Reassigned to another pod", at: "2025-12-01T09:00:00Z" },
  { id: "h23", podId: "pod-3", type: "leader_changed", tfpId: "7", tfpName: "Dr. Alex Ng", detail: "Leader removed — no replacement assigned", at: "2025-12-01T09:00:00Z" },
  { id: "h24", podId: "pod-3", type: "pod_description_changed", detail: "\"Active trauma-informed care group\" → \"Paused Q1 2026. To be reactivated with new lead.\"", at: "2026-01-10T10:00:00Z" },
  { id: "h25", podId: "pod-3", type: "pod_deactivated", detail: "Pod set to Inactive — no active leader or members", at: "2026-01-15T11:00:00Z" },
  { id: "h26", podId: "pod-3", type: "chat_group_notified", detail: "Pod deactivation — chat group archived", at: "2026-01-15T11:01:00Z" },
];
