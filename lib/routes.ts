import type { PeriodValue } from "@/components/filters/PeriodFilter";
import { formatPeriodLabel } from "@/components/filters/PeriodFilter";

function periodParams(period?: PeriodValue): string {
  if (!period) return "";
  const parts: string[] = [];
  parts.push(`periodType=${period.type}`);
  parts.push(`periodYear=${period.year}`);
  if (period.type === "month" && period.month != null) parts.push(`periodMonth=${period.month}`);
  if (period.type === "quarter" && period.quarter != null) parts.push(`periodQuarter=${period.quarter}`);
  return parts.join("&");
}

function qs(base: string, params: Record<string, string | undefined>, period?: PeriodValue): string {
  const entries = Object.entries(params).filter(([, v]) => v != null) as [string, string][];
  const pp = periodParams(period);
  const all = [...entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`), pp].filter(Boolean);
  return all.length > 0 ? `${base}?${all.join("&")}` : base;
}

export function buildChatLink(filters?: { status?: string; minDays?: number }, period?: PeriodValue): string {
  return qs("/chat", { status: filters?.status, minDays: filters?.minDays?.toString() }, period);
}

export function buildAppointmentsLink(filters?: { context?: string; flag?: string; category?: string }, period?: PeriodValue): string {
  return qs("/appointments", { context: filters?.context, flag: filters?.flag, category: filters?.category }, period);
}

export function buildRuleEngineLink(filters?: { state?: string }, period?: PeriodValue): string {
  return qs("/rules", { state: filters?.state }, period);
}

export function buildPayoutLink(filters?: { status?: string }, period?: PeriodValue): string {
  return qs("/payout", { status: filters?.status }, period);
}

export function buildProfessionalsLink(filters?: { flag?: string }): string {
  return qs("/professionals", { flag: filters?.flag });
}

export function buildTeamLink(filters?: { filter?: string }): string {
  return qs("/team", { filter: filters?.filter });
}

export function buildLmsLink(filters?: { filter?: string }): string {
  return qs("/lms", { filter: filters?.filter });
}

export function buildGigLink(filters?: { filter?: string }): string {
  return qs("/gig", { filter: filters?.filter });
}

export { formatPeriodLabel };
