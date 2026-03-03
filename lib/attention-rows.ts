import { professionals, chatExceptionsByTfp, chatRiskRows, clients } from "@/lib/mock/professionals";
import { professionalProfiles } from "@/lib/mock/professionalProfiles";
import { appointments } from "@/lib/mock/appointments";
import { pods } from "@/lib/mock/pods";
import { lmsModulesNeedingAttention } from "@/lib/mock/lms";
import { gigJobs } from "@/lib/mock/gig";
import { rulesList } from "@/lib/mock/rules";

export type AttentionTabId = "chat" | "appointments" | "professional" | "pod" | "learn" | "gig" | "system";

export interface AttentionRow {
  id: string;
  primaryLabel: string;
  secondaryLabel: string;
  ageLabel: string;
  actionLabel: string;
  secondaryAction?: { label: string };
}

export const ATTENTION_TAB_LABELS: Record<AttentionTabId, string> = {
  chat: "Chat",
  appointments: "Appointments",
  professional: "Professional",
  pod: "Pod",
  learn: "Learn",
  gig: "Gig",
  system: "System",
};

function maskClient(displayName?: string): string {
  if (!displayName) return "—";
  const match = clients.find((c) => c.name === displayName);
  return match ? match.userId : `C-${Math.abs(hashStr(displayName)).toString().slice(0, 4)}`;
}

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

export function buildChatRows(limit?: number): AttentionRow[] {
  const rows: AttentionRow[] = [];

  for (const r of chatExceptionsByTfp) {
    if (r.working_days_over < 1) continue;
    const pro = professionals.find((p) => p.id === r.tfpId);
    rows.push({
      id: `chat-exc-${r.chat_group_id}`,
      primaryLabel: pro?.name ?? `TFP ${r.tfpId}`,
      secondaryLabel: `Client · ${r.client_name} · ${r.status === "unresponded" ? "Not replying" : "Late reply"}`,
      ageLabel: `${r.working_days_over} working day${r.working_days_over > 1 ? "s" : ""} overdue`,
      actionLabel: "View chat",
    });
  }

  for (const cr of chatRiskRows) {
    const pro = professionals.find((p) => p.id === cr.tfpId);
    const label = cr.riskType === "not_read" ? "Has not read" : `High risk`;
    const secondary = cr.annotations
      ? `Client · ${cr.client_name} · ${label} — ${cr.annotations}`
      : `Client · ${cr.client_name} · ${label}`;
    rows.push({
      id: `chat-risk-${cr.id}`,
      primaryLabel: pro?.name ?? `TFP ${cr.tfpId}`,
      secondaryLabel: secondary,
      ageLabel: cr.durationLabel,
      actionLabel: "View chat",
    });
  }

  const sorted = rows.sort((a, b) => b.ageLabel.localeCompare(a.ageLabel));
  return limit != null ? sorted.slice(0, limit) : sorted;
}

export function buildAppointmentRows(limit?: number): AttentionRow[] {
  const rows: AttentionRow[] = [];

  for (const p of professionals) {
    for (const cn of p.caseNotes) {
      if (cn.status === "Late") {
        rows.push({
          id: `appt-late-${p.id}-${cn.date}`,
          primaryLabel: p.name,
          secondaryLabel: `Client · ${cn.client} · Late case note`,
          ageLabel: `Late submission (${cn.date})`,
          actionLabel: "View appointment",
        });
      }
    }
  }

  const noShows = appointments
    .filter((a) => a.joinedRoster.length === 0 && a.expectedRoster.length > 0 && a.context === "external")
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
    .slice(0, 5);
  for (const a of noShows) {
    const dt = new Date(a.scheduledAt);
    const dateStr = dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    rows.push({
      id: `appt-noshow-${a.id}`,
      primaryLabel: a.professionalDisplay,
      secondaryLabel: a.clientDisplay
        ? `Client · ${maskClient(a.clientDisplay)} · No-show`
        : a.organisationName
          ? `Organisation · ${a.organisationName} · No-show`
          : "No-show",
      ageLabel: `No-show on ${dateStr}`,
      actionLabel: "View appointment",
    });
  }

  const now = new Date();
  const upcoming = appointments
    .filter((a) => a.context === "internal" && new Date(a.scheduledAt) > now)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, 3);
  for (const a of upcoming) {
    const dt = new Date(a.scheduledAt);
    const diff = Math.round((dt.getTime() - now.getTime()) / (1000 * 60 * 60));
    const ageStr = diff <= 24 ? `Starts in ${diff}h` : `Starts ${dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
    rows.push({
      id: `appt-upcoming-${a.id}`,
      primaryLabel: a.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      secondaryLabel: `Internal · ${a.professionalDisplay}`,
      ageLabel: ageStr,
      actionLabel: "Start",
    });
  }

  for (const p of professionals) {
    if (p.excessiveSessions > 0) {
      rows.push({
        id: `appt-excess-${p.id}`,
        primaryLabel: p.name,
        secondaryLabel: `${p.excessiveSessions} excessive session${p.excessiveSessions > 1 ? "s" : ""} flagged`,
        ageLabel: "This period",
        actionLabel: "View sessions",
      });
    }
  }

  return limit != null ? rows.slice(0, limit) : rows;
}

export function buildPodRows(): AttentionRow[] {
  const rows: AttentionRow[] = [];

  for (const pod of pods) {
    if (pod.status !== "Active" && pod.members.length === 0 && pod.leaderId === null) {
      rows.push({
        id: `pod-empty-${pod.id}`,
        primaryLabel: pod.name,
        secondaryLabel: "No leader · No members",
        ageLabel: "Inactive",
        actionLabel: "Open pod",
      });
      continue;
    }

    if (pod.leaderId === null) {
      rows.push({
        id: `pod-nolead-${pod.id}`,
        primaryLabel: pod.name,
        secondaryLabel: `${pod.members.length} member${pod.members.length !== 1 ? "s" : ""} · No leader assigned`,
        ageLabel: "Needs leader",
        actionLabel: "Open pod",
      });
    }

    if (pod.status === "Active" && pod.members.length === 0) {
      rows.push({
        id: `pod-nomembers-${pod.id}`,
        primaryLabel: pod.name,
        secondaryLabel: "Active pod with no members",
        ageLabel: "Needs members",
        actionLabel: "Open pod",
      });
    }

    const ratio = pod.members.length / pod.maxCapacity;
    if (ratio >= 1) {
      rows.push({
        id: `pod-maxed-${pod.id}`,
        primaryLabel: pod.name,
        secondaryLabel: `${pod.members.length}/${pod.maxCapacity} members · Capacity maxed`,
        ageLabel: "At capacity",
        actionLabel: "Open pod",
        secondaryAction: { label: "Dismiss" },
      });
    } else if (ratio >= 0.8) {
      rows.push({
        id: `pod-near-${pod.id}`,
        primaryLabel: pod.name,
        secondaryLabel: `${pod.members.length}/${pod.maxCapacity} members · Near capacity`,
        ageLabel: `${pod.maxCapacity - pod.members.length} slot${pod.maxCapacity - pod.members.length !== 1 ? "s" : ""} left`,
        actionLabel: "Open pod",
        secondaryAction: { label: "Dismiss" },
      });
    }
  }

  return rows;
}

export function buildLearnRows(): AttentionRow[] {
  const rows: AttentionRow[] = [];

  for (const m of lmsModulesNeedingAttention) {
    if (m.issue === "no_enrollment") {
      rows.push({
        id: `learn-noenroll-${m.id}`,
        primaryLabel: m.name,
        secondaryLabel: `${m.category} · No one enrolled`,
        ageLabel: `Created ${m.createdAt}`,
        actionLabel: "Broadcast",
      });
    } else if (m.issue === "low_pass_rate") {
      rows.push({
        id: `learn-lowpass-${m.id}`,
        primaryLabel: m.name,
        secondaryLabel: `${m.category} · Pass rate ${m.passRate}% (${m.passedCount}/${m.enrolledUserIds.length})`,
        ageLabel: "Low quiz score",
        actionLabel: "Open module",
      });
    } else if (m.issue === "not_completed") {
      rows.push({
        id: `learn-incomplete-${m.id}`,
        primaryLabel: m.name,
        secondaryLabel: `${m.category} · ${m.passedCount}/${m.enrolledUserIds.length} completed`,
        ageLabel: `Since ${m.createdAt}`,
        actionLabel: "Broadcast",
      });
    }
  }

  return rows;
}

export function buildGigRows(): AttentionRow[] {
  return gigJobs
    .filter((j) => j.status === "open" && j.applicantIds.length > 0)
    .map((j) => ({
      id: `gig-${j.id}`,
      primaryLabel: j.title,
      secondaryLabel: `${j.applicantIds.length} applicant${j.applicantIds.length !== 1 ? "s" : ""} · ${j.location}`,
      ageLabel: j.date,
      actionLabel: "Review",
    }));
}

export function buildProfessionalRows(): AttentionRow[] {
  const rows: AttentionRow[] = [];
  const now = new Date();
  const warningWindowMs = 60 * 24 * 60 * 60 * 1000; // 60 days

  for (const p of professionalProfiles) {
    const expiry = new Date(p.licenseExpiry);
    const msUntilExpiry = expiry.getTime() - now.getTime();
    const daysUntilExpiry = Math.round(msUntilExpiry / (24 * 60 * 60 * 1000));

    if (msUntilExpiry <= 0) {
      rows.push({
        id: `pro-expired-${p.id}`,
        primaryLabel: `${p.firstName} ${p.lastName}`,
        secondaryLabel: `License ${p.licenseNumber} expired`,
        ageLabel: `Expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) !== 1 ? "s" : ""} ago`,
        actionLabel: "Open profile",
      });
    } else if (msUntilExpiry <= warningWindowMs) {
      rows.push({
        id: `pro-expiring-${p.id}`,
        primaryLabel: `${p.firstName} ${p.lastName}`,
        secondaryLabel: `License ${p.licenseNumber} expiring soon`,
        ageLabel: `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}`,
        actionLabel: "Open profile",
      });
    }

    const ratio = p.activeClients / p.maximumClients;
    if (ratio >= 1) {
      rows.push({
        id: `pro-maxed-${p.id}`,
        primaryLabel: `${p.firstName} ${p.lastName}`,
        secondaryLabel: `${p.activeClients}/${p.maximumClients} clients · Capacity maxed`,
        ageLabel: "At max capacity",
        actionLabel: "Open profile",
        secondaryAction: { label: "Dismiss" },
      });
    } else if (ratio >= 0.8 && p.maximumClients > 0) {
      rows.push({
        id: `pro-nearcap-${p.id}`,
        primaryLabel: `${p.firstName} ${p.lastName}`,
        secondaryLabel: `${p.activeClients}/${p.maximumClients} clients · Near capacity`,
        ageLabel: `${p.maximumClients - p.activeClients} slot${p.maximumClients - p.activeClients !== 1 ? "s" : ""} left`,
        actionLabel: "Open profile",
        secondaryAction: { label: "Dismiss" },
      });
    }
  }

  return rows;
}

export function buildSystemRows(): AttentionRow[] {
  const rows: AttentionRow[] = [];

  for (const rule of rulesList) {
    if (!rule.enabled) continue;
    if (rule.timesTriggered > 0) {
      rows.push({
        id: `sys-rule-${rule.id}`,
        primaryLabel: rule.name,
        secondaryLabel: `${rule.trigger} → ${rule.action}`,
        ageLabel: `Triggered ${rule.timesTriggered} time${rule.timesTriggered !== 1 ? "s" : ""}`,
        actionLabel: "Review",
      });
    }
  }

  for (const rule of rulesList) {
    if (rule.enabled) continue;
    rows.push({
      id: `sys-disabled-${rule.id}`,
      primaryLabel: rule.name,
      secondaryLabel: `Rule is disabled · ${rule.trigger}`,
      ageLabel: "Disabled",
      actionLabel: "Enable",
    });
  }

  return rows;
}

export function getAllRows(): Record<AttentionTabId, AttentionRow[]> {
  return {
    chat: buildChatRows(),
    appointments: buildAppointmentRows(),
    professional: buildProfessionalRows(),
    pod: buildPodRows(),
    learn: buildLearnRows(),
    gig: buildGigRows(),
    system: buildSystemRows(),
  };
}
