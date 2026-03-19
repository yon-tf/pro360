import { professionals, chatExceptionsByTfp, chatRiskRows, clients } from "@/features/professionals/mock/professionals";
import { professionalProfiles } from "@/features/professionals/mock/professionalProfiles";
import { appointments } from "@/features/appointments/mock/appointments";
import { pods } from "@/features/team/mock/pods";
import { lmsModulesNeedingAttention } from "@/features/lms/mock/lms";
import { gigJobs } from "@/features/gig/mock/gig";
import { getRuleDefinitions } from "@/features/rules/mock/rules";

export type AttentionTabId = "chat" | "appointments" | "professional" | "pod" | "learn" | "gig" | "system";

export type Severity = "critical" | "high" | "medium" | "low";

export interface AttentionRow {
  id: string;
  primaryLabel: string;
  secondaryLabel: string;
  ageLabel: string;
  actionLabel: string;
  secondaryAction?: { label: string };
  severity: Severity;
  href?: string;
  infoPopover?: string;
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function sortBySeverity(rows: AttentionRow[]): AttentionRow[] {
  return rows.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
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
    const secondaryLabel = `Client · ${r.client_name} · ${r.status === "unresponded" ? "Not replying" : "Late reply"}`;
    let severity: Severity = "low";
    if (r.working_days_over >= 5) severity = "high";
    else if (r.working_days_over >= 1) severity = "medium";

    rows.push({
      id: `chat-exc-${r.chat_group_id}`,
      primaryLabel: pro?.name ?? `TFP ${r.tfpId}`,
      secondaryLabel,
      ageLabel: `${r.working_days_over} working day${r.working_days_over > 1 ? "s" : ""} overdue`,
      actionLabel: "View chat",
      severity,
    });
  }

  for (const cr of chatRiskRows) {
    const pro = professionals.find((p) => p.id === cr.tfpId);
    const label = cr.riskType === "not_read" ? "Has not read" : `High risk`;
    const secondary = cr.annotations
      ? `Client · ${cr.client_name} · ${label} — ${cr.annotations}`
      : `Client · ${cr.client_name} · ${label}`;
    const lowerSec = secondary.toLowerCase();
    const isRiskFlagged = lowerSec.includes("risk") || lowerSec.includes("suicidal") || lowerSec.includes("distress");
    const isSla = lowerSec.includes("sla");

    let severity: Severity = "low";
    if (isRiskFlagged) severity = "critical";
    else if (isSla) severity = "high";

    rows.push({
      id: `chat-risk-${cr.id}`,
      primaryLabel: pro?.name ?? `TFP ${cr.tfpId}`,
      secondaryLabel: secondary,
      ageLabel: cr.durationLabel,
      actionLabel: "View chat",
      severity,
    });
  }

  const sorted = sortBySeverity(rows);
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
          severity: "medium",
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
      severity: "high",
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
      severity: "low",
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
        severity: "medium",
        infoPopover: "Flagged: more than 2 sessions per week per client (any professional).",
        href: `/appointments?tfp=${encodeURIComponent(p.name)}`,
      });
    }
  }

  const sorted = sortBySeverity(rows);
  return limit != null ? sorted.slice(0, limit) : sorted;
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
        severity: "high",
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
        severity: "high",
      });
    }

    if (pod.status === "Active" && pod.members.length === 0) {
      rows.push({
        id: `pod-nomembers-${pod.id}`,
        primaryLabel: pod.name,
        secondaryLabel: "Active pod with no members",
        ageLabel: "Needs members",
        actionLabel: "Open pod",
        severity: "medium",
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
        severity: "medium",
      });
    } else if (ratio >= 0.8) {
      rows.push({
        id: `pod-near-${pod.id}`,
        primaryLabel: pod.name,
        secondaryLabel: `${pod.members.length}/${pod.maxCapacity} members · Near capacity`,
        ageLabel: `${pod.maxCapacity - pod.members.length} slot${pod.maxCapacity - pod.members.length !== 1 ? "s" : ""} left`,
        actionLabel: "Open pod",
        secondaryAction: { label: "Dismiss" },
        severity: "medium",
      });
    }
  }

  return sortBySeverity(rows);
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
        severity: "low",
      });
    } else if (m.issue === "low_pass_rate") {
      rows.push({
        id: `learn-lowpass-${m.id}`,
        primaryLabel: m.name,
        secondaryLabel: `${m.category} · Pass rate ${m.passRate}% (${m.passedCount}/${m.enrolledUserIds.length})`,
        ageLabel: "Low quiz score",
        actionLabel: "Open module",
        severity: "low",
      });
    } else if (m.issue === "not_completed") {
      rows.push({
        id: `learn-incomplete-${m.id}`,
        primaryLabel: m.name,
        secondaryLabel: `${m.category} · ${m.passedCount}/${m.enrolledUserIds.length} completed`,
        ageLabel: `Since ${m.createdAt}`,
        actionLabel: "Broadcast",
        severity: "low",
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
      severity: "low" as Severity,
    }));
}

export function buildProfessionalRows(): AttentionRow[] {
  const rows: AttentionRow[] = [];
  const now = new Date();
  const warningWindowMs = 60 * 24 * 60 * 60 * 1000; // 60 days

  // Flag: > 2 sessions per week per client (same professional)
  // Logic: Scan appointments for client + professional + week combinations > 2
  const clientProWeekCounts: Record<string, number> = {};
  for (const a of appointments) {
    if (a.type === "client_session" && a.clientDisplay && a.professionalDisplay && a.scheduledAt) {
      const date = new Date(a.scheduledAt);
      // Simple week of year key
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
      const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      // Note: We use the actual week key but store metadata for redirect
      const groupedKey = `${a.clientDisplay}|${a.professionalDisplay}|${date.getFullYear()}|W${week}`;
      clientProWeekCounts[groupedKey] = (clientProWeekCounts[groupedKey] || 0) + 1;
    }
  }

  for (const key in clientProWeekCounts) {
    if (clientProWeekCounts[key] > 2) {
      const [client, professional, year, week] = key.split("|");
      rows.push({
        id: `pro-excessive-${key}`,
        primaryLabel: "Excessive sessions flagged",
        secondaryLabel: `${professional} · Client: ${client} · ${clientProWeekCounts[key]} sessions in ${week}, ${year}`,
        ageLabel: "Critical",
        actionLabel: "Investigate",
        severity: "critical",
        infoPopover: "Flagged: more than 2 sessions per week for the same professional and same client.",
        href: `/appointments?client=${encodeURIComponent(client)}&tfp=${encodeURIComponent(professional)}&period=${year}-${week}`,
      });
    }
  }

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
        severity: "high",
      });
    } else if (msUntilExpiry <= warningWindowMs) {
      const severity: Severity = daysUntilExpiry <= 7 ? "high" : "medium";
      rows.push({
        id: `pro-expiring-${p.id}`,
        primaryLabel: `${p.firstName} ${p.lastName}`,
        secondaryLabel: `License ${p.licenseNumber} expiring soon`,
        ageLabel: `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}`,
        actionLabel: "Open profile",
        severity,
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
        severity: "medium",
      });
    } else if (ratio >= 0.8 && p.maximumClients > 0) {
      rows.push({
        id: `pro-nearcap-${p.id}`,
        primaryLabel: `${p.firstName} ${p.lastName}`,
        secondaryLabel: `${p.activeClients}/${p.maximumClients} clients · Near capacity`,
        ageLabel: `${p.maximumClients - p.activeClients} slot${p.maximumClients - p.activeClients !== 1 ? "s" : ""} left`,
        actionLabel: "Open profile",
        secondaryAction: { label: "Dismiss" },
        severity: "medium",
      });
    }

    if (p.leaveStartDate) {
      const leaveStart = new Date(p.leaveStartDate);
      const leaveEnd = p.leaveEndDate ? new Date(p.leaveEndDate) : null;
      const isCurrentlyOnLeave = leaveStart <= now && (leaveEnd === null || leaveEnd >= now);
      if (isCurrentlyOnLeave) {
        const returnStr = leaveEnd
          ? `Returns ${leaveEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
          : "No return date set";
        rows.push({
          id: `pro-onleave-${p.id}`,
          primaryLabel: `${p.firstName} ${p.lastName}`,
          secondaryLabel: `On leave · ${returnStr}`,
          ageLabel: `Since ${leaveStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
          actionLabel: "Dismiss",
          severity: "low",
        });
      }
    }
  }

  return sortBySeverity(rows);
}

export function buildSystemRows(): AttentionRow[] {
  const rows: AttentionRow[] = [];
  const rules = getRuleDefinitions();

  for (const rule of rules) {
    if (!rule.summary.enabled) continue;
    if (rule.metadata.executionCount > 0) {
      const combined = `${rule.summary.name} ${rule.summary.triggerPreview} ${rule.summary.actionPreview}`.toLowerCase();
      const hasError = combined.includes("error") || combined.includes("fail");
      rows.push({
        id: `sys-rule-${rule.summary.id}`,
        primaryLabel: rule.summary.name,
        secondaryLabel: `${rule.summary.triggerPreview} → ${rule.summary.actionPreview}`,
        ageLabel: `Triggered ${rule.metadata.executionCount} time${rule.metadata.executionCount !== 1 ? "s" : ""}`,
        actionLabel: "Review",
        severity: hasError ? "high" : "medium",
      });
    }
  }

  for (const rule of rules) {
    if (rule.summary.enabled) continue;
    const combined = `${rule.summary.name} ${rule.summary.triggerPreview}`.toLowerCase();
    const hasError = combined.includes("error") || combined.includes("fail");
    rows.push({
      id: `sys-disabled-${rule.summary.id}`,
      primaryLabel: rule.summary.name,
      secondaryLabel: `Rule is disabled · ${rule.summary.triggerPreview}`,
      ageLabel: "Disabled",
      actionLabel: "Enable",
      severity: hasError ? "high" : "medium",
    });
  }

  return sortBySeverity(rows);
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
