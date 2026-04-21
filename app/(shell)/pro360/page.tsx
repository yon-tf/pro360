"use client";

import { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ComposedChart,
  ReferenceLine,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs } from "@/components/Tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { KpiCard } from "@/features/pro360/components/KpiCard";
import { GaugeKpiCard } from "@/features/pro360/components/GaugeKpiCard";
import { DonutKpiCard } from "@/features/pro360/components/DonutKpiCard";
import { ChatResponseHealthCard } from "@/features/pro360/components/ChatResponseHealthCard";
import { QualityByProfessional } from "@/features/pro360/components/QualityByProfessional";
import { QualityByOrganization } from "@/features/pro360/components/QualityByOrganization";
import { SeverityBadge } from "@/features/attention/components/SeverityBadge";
import {
  PeriodFilter,
  defaultPeriodValue,
  type PeriodValue,
} from "@/features/filters/components/PeriodFilter";
import { buildAppointmentsLink } from "@/lib/routes";
import { mockTFPRows } from "@/features/payout/mock/payoutRun";
import { professionals } from "@/features/professionals/mock/professionals";
import { organizationQuality } from "@/features/org/mock/organizations";
import { appointments, KIND_LABELS } from "@/features/appointments/mock/appointments";
import {
  monthlyChat,
  monthlyAppointments,
  monthlyRatings,
  monthlyActivation,
  monthlyPayout,
  weeklyChat,
  weeklyAppointments,
  type MonthlyChatData,
  type MonthlyAppointmentData,
} from "@/features/pro360/mock/dashboardTimeSeries";
import {
  buildChatRows,
  buildAppointmentRows,
  buildProfessionalRows,
  buildPodRows,
  buildLearnRows,
  buildGigRows,
  buildSystemRows,
  ATTENTION_TAB_LABELS,
  type AttentionTabId,
  type AttentionRow,
} from "@/lib/attention-rows";
import {
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  UsersBold,
  Building2Bold,
  CheckCircle,
  CheckCircleBold,
  StarBold,
  SparklesBold,
  MessageSquareBold,
  DollarSignBold,
  ZapBold,
  BarChart3Bold,
  Crown,
  CrownBold,
  ThumbsUpDuotone,
  CalendarMinimalisticDuotone,
  FileTextBold,
  CalendarBold,
  Info,
} from "@/components/ui/solar-icons";
import { systemToast } from "@/lib/systemToast";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers — upcoming events
// ---------------------------------------------------------------------------

type OpsEventType = "townhall" | "pod" | "workshop" | "other";

interface OpsCalEvent {
  id: string;
  title: string;
  participants: string;
  start: string;
  end: string;
  eventType: OpsEventType;
  date: Date;
}

const EVENT_DOT: Record<OpsEventType, string> = {
  townhall: "bg-chart-2",
  pod: "bg-chart-4",
  workshop: "bg-warning",
  other: "bg-primary",
};

function toOpsType(type: string): OpsEventType {
  if (type === "townhall") return "townhall";
  if (type === "pod_appointment") return "pod";
  if (type === "workshop") return "workshop";
  return "other";
}

function getUpcomingEvents(): OpsCalEvent[] {
  const now = new Date();
  return appointments
    .filter((a) => a.context === "internal")
    .map((a) => {
      const dt = new Date(a.scheduledAt);
      const endDt = a.endedAt ? new Date(a.endedAt) : null;
      return {
        id: a.id,
        title: KIND_LABELS[a.type] ?? a.type.replace(/_/g, " "),
        participants: a.participantsSummary ?? a.professionalDisplay,
        start: dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        end: endDt
          ? endDt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
          : a.duration ? `+${a.duration}` : "—",
        eventType: toOpsType(a.type),
        date: dt,
      } satisfies OpsCalEvent;
    })
    .filter((e) => e.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);
}

// ---------------------------------------------------------------------------
// Helpers — Top performer spotlight
// ---------------------------------------------------------------------------

interface TopPerformer {
  rank: number;
  id: string;
  name: string;
  value: string;
  avatar?: string;
}

type ProSpotCategory = (typeof PRO_SPOT_ORDER)[number];
type OrgSpotCategory = (typeof ORG_SPOT_ORDER)[number];

const proAvatarMap = Object.fromEntries(professionals.map((p) => [p.id, p.avatar]));

function getProTopPerformers(category: ProSpotCategory): TopPerformer[] {
  const TOP_N = 10;
  const withAvatar = (id: string, base: Omit<TopPerformer, "avatar">): TopPerformer => ({
    ...base,
    avatar: proAvatarMap[id],
  });

  switch (category) {
    case "earnings":
      return [...mockTFPRows].sort((a, b) => b.total - a.total).slice(0, TOP_N)
        .map((r, i) => withAvatar(r.id, { rank: i + 1, id: r.id, name: r.name, value: `$${r.total.toLocaleString()}` }));
    case "sla":
      return [...professionals].sort((a, b) => (b.responseRate24h ?? 0) - (a.responseRate24h ?? 0)).slice(0, TOP_N)
        .map((p, i) => withAvatar(p.id, { rank: i + 1, id: p.id, name: p.name, value: `${p.responseRate24h ?? 0}%` }));
    case "response_time":
      return [...professionals].sort((a, b) => a.avgServiceResponseHours - b.avgServiceResponseHours).slice(0, TOP_N)
        .map((p, i) => withAvatar(p.id, { rank: i + 1, id: p.id, name: p.name, value: `${p.avgServiceResponseHours}h` }));
    case "chat_hours":
      return [...professionals].sort((a, b) => b.clientChatHours - a.clientChatHours).slice(0, TOP_N)
        .map((p, i) => withAvatar(p.id, { rank: i + 1, id: p.id, name: p.name, value: `${p.clientChatHours}h` }));
    case "appointments":
      return [...professionals].sort((a, b) => b.totalAppointments - a.totalAppointments).slice(0, TOP_N)
        .map((p, i) => withAvatar(p.id, { rank: i + 1, id: p.id, name: p.name, value: `${p.totalAppointments} sessions` }));
    case "ai_rating":
      return [...professionals].sort((a, b) => b.aiRatingAvg - a.aiRatingAvg).slice(0, TOP_N)
        .map((p, i) => withAvatar(p.id, { rank: i + 1, id: p.id, name: p.name, value: `${p.aiRatingAvg}` }));
    case "client_rating":
      return [...professionals].sort((a, b) => b.clientRatingAvg - a.clientRatingAvg).slice(0, TOP_N)
        .map((p, i) => withAvatar(p.id, { rank: i + 1, id: p.id, name: p.name, value: `${p.clientRatingAvg}` }));
    case "activations":
      return [...professionals].filter((p) => p.activationCount > 0)
        .sort((a, b) => b.activationCount - a.activationCount).slice(0, TOP_N)
        .map((p, i) => withAvatar(p.id, { rank: i + 1, id: p.id, name: p.name, value: `${p.activationCount} activations` }));
    case "dass":
      return [...professionals].sort((a, b) => a.dassScoreAvg - b.dassScoreAvg).slice(0, TOP_N)
        .map((p, i) => withAvatar(p.id, { rank: i + 1, id: p.id, name: p.name, value: `${p.dassScoreAvg}` }));
    default:
      return [];
  }
}

function getOrgTopPerformers(category: OrgSpotCategory): TopPerformer[] {
  const TOP_N = 10;
  const orgs = organizationQuality;

  switch (category) {
    case "omwa":
      return [...orgs].sort((a, b) => b.omwaScore - a.omwaScore).slice(0, TOP_N)
        .map((o, i) => ({ rank: i + 1, id: o.id, name: o.name, value: `${o.omwaScore}` }));
    case "earnings":
      return [...orgs].sort((a, b) => b.payout - a.payout).slice(0, TOP_N)
        .map((o, i) => ({ rank: i + 1, id: o.id, name: o.name, value: `$${o.payout.toLocaleString()}` }));
    case "activations":
      return [...orgs].sort((a, b) => b.activationTotal - a.activationTotal).slice(0, TOP_N)
        .map((o, i) => ({ rank: i + 1, id: o.id, name: o.name, value: `${o.activationTotal}` }));
    case "appointments": {
      const apptCounts = orgs.map((o) => ({
        ...o,
        totalAppts: o.coreServices.length,
      }));
      return [...apptCounts].sort((a, b) => b.totalAppts - a.totalAppts).slice(0, TOP_N)
        .map((o, i) => ({ rank: i + 1, id: o.id, name: o.name, value: `${o.totalAppts} sessions` }));
    }
    case "dass":
      return [...orgs].sort((a, b) => a.dassAvg - b.dassAvg).slice(0, TOP_N)
        .map((o, i) => ({ rank: i + 1, id: o.id, name: o.name, value: `${o.dassAvg}` }));
    default:
      return [];
  }
}
void getProTopPerformers;
void getOrgTopPerformers;

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------

const slaResponseChartConfig: ChartConfig = {
  slaPerformance: { label: "SLA % (right axis)", color: "hsl(var(--chart-1))" },
  avgResponseTimeHrs: { label: "Avg Response hrs (left axis)", color: "hsl(var(--chart-2))" },
};

// Page-local semantic palette for repeated dashboard chart/status meaning.
const PRO360_DASHBOARD_COLORS = {
  chatTotal: "var(--brand-hex)",
  chatTfp: "hsl(var(--chart-2))",
  chatClient: "hsl(var(--chart-1))",
  therapyTotal: "hsl(var(--chart-3))",
  therapyVideo: "hsl(var(--chart-3))",
  therapyFaceToFace: "hsl(var(--primary))",
  attended: "var(--brand-hex)",
  cancelled: "hsl(var(--warning))",
  noShow: "hsl(var(--muted-foreground))",
  caseNoteSubmitted: "hsl(var(--primary))",
  caseNoteMissing: "hsl(var(--destructive))",
  corePayout: "var(--brand-hex)",
  activationPayout: "hsl(var(--chart-2))",
  incentivePayout: "hsl(var(--chart-3))",
} as const;

const chatHoursChartConfig: ChartConfig = {
  totalChatHours: { label: "Total Chat Hours", color: PRO360_DASHBOARD_COLORS.chatTotal },
  tfpChatHours: { label: "TFP Chat Hours", color: PRO360_DASHBOARD_COLORS.chatTfp },
  clientChatHours: { label: "Client Chat Hours", color: PRO360_DASHBOARD_COLORS.chatClient },
};

const therapyHoursChartConfig: ChartConfig = {
  totalTherapyHours: { label: "Total Therapy Hours", color: PRO360_DASHBOARD_COLORS.therapyTotal },
  therapyVideoHours: { label: "Video Call", color: PRO360_DASHBOARD_COLORS.therapyVideo },
  therapyF2FHours: { label: "Face to Face", color: PRO360_DASHBOARD_COLORS.therapyFaceToFace },
};

const combinedApptConfig: ChartConfig = {
  attended: { label: "Attended", color: PRO360_DASHBOARD_COLORS.attended },
  cancelled: { label: "Cancelled", color: PRO360_DASHBOARD_COLORS.cancelled },
  noShow: { label: "No-show", color: PRO360_DASHBOARD_COLORS.noShow },
  caseNoteSubmitted: { label: "Case Notes Submitted", color: PRO360_DASHBOARD_COLORS.caseNoteSubmitted },
  caseNoteNotSubmitted: { label: "Case Notes Missing", color: PRO360_DASHBOARD_COLORS.caseNoteMissing },
};

// Fraud-detection threshold — aggregate attended volume that warrants clinical review
const EXCESSIVE_APPT_THRESHOLD = 500;

const ratingsChartConfig: ChartConfig = {
  clientRating: { label: "Client Rating", color: "hsl(var(--chart-3))" },
  aiRating: { label: "AI Rating", color: "hsl(var(--chart-2))" },
};

const activationChartConfig: ChartConfig = {
  totalActivations: { label: "Total Activations", color: "hsl(var(--chart-1))" },
  programRating: { label: "Avg Event Rating", color: "hsl(var(--chart-4))" },
  professionalRating: { label: "Avg Professional Rating", color: "hsl(var(--chart-2))" },
};

const payoutChartConfig: ChartConfig = {
  corePayout: { label: "Core Payout", color: PRO360_DASHBOARD_COLORS.corePayout },
  activationPayout: { label: "Activation Payout", color: PRO360_DASHBOARD_COLORS.activationPayout },
  incentivePayout: { label: "Incentive Payout", color: PRO360_DASHBOARD_COLORS.incentivePayout },
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DASHBOARD_ITEM_LIMIT = 8;
const ATTENTION_PAGE_SIZE = 3;

const PRO_SPOT_ORDER = [
  "earnings", "sla", "response_time", "chat_hours", "appointments",
  "ai_rating", "client_rating", "activations", "dass",
] as const;
const PRO_SPOT_LABELS: Record<(typeof PRO_SPOT_ORDER)[number], string> = {
  earnings: "Earnings",
  sla: "SLA",
  response_time: "Avg Chat Response Time",
  chat_hours: "Chat Hours",
  appointments: "Appointments",
  ai_rating: "AI Rating",
  client_rating: "Client Rating",
  activations: "Activations",
  dass: "DASS",
};

const ORG_SPOT_ORDER = [
  "omwa", "earnings", "activations", "appointments", "dass",
] as const;
const ORG_SPOT_LABELS: Record<(typeof ORG_SPOT_ORDER)[number], string> = {
  omwa: "OMWA",
  earnings: "Earnings",
  activations: "Activations",
  appointments: "Appointments",
  dass: "DASS",
};
void PRO_SPOT_ORDER;
void PRO_SPOT_LABELS;
void ORG_SPOT_ORDER;
void ORG_SPOT_LABELS;

// ---------------------------------------------------------------------------
// Custom appointment tooltip — shows breakdown + total created
// ---------------------------------------------------------------------------

interface TooltipEntry {
  dataKey?: string;
  name?: string;
  value?: number;
  color?: string;
  payload?: { created?: number };
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="inline-block h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </span>
  );
}

function AppointmentChartLegend() {
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground px-2">
      <div className="flex items-center gap-3">
        <span className="text-micro font-semibold text-foreground/50">Appointments</span>
        <LegendDot color={PRO360_DASHBOARD_COLORS.attended} label="Attended" />
        <LegendDot color={PRO360_DASHBOARD_COLORS.cancelled} label="Cancelled" />
        <LegendDot color={PRO360_DASHBOARD_COLORS.noShow} label="No-show" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-micro font-semibold text-foreground/50">Case Notes</span>
        <LegendDot color={PRO360_DASHBOARD_COLORS.caseNoteSubmitted} label="Submitted" />
        <LegendDot color={PRO360_DASHBOARD_COLORS.caseNoteMissing} label="Missing" />
      </div>
    </div>
  );
}

function AppointmentTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const created = payload[0]?.payload?.created ?? 0;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-card">
      <p className="mb-2 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </span>
          <span className="tabular-nums font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
      <div className="mt-2 border-t border-border pt-2 flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Total created</span>
        <span className="tabular-nums font-semibold text-foreground">{created}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Pro360AggregatePage() {
  // --- Period ---
  const [period, setPeriod] = useState<PeriodValue>(defaultPeriodValue);

  // --- Attention ---
  const chatRows = useMemo(() => buildChatRows(DASHBOARD_ITEM_LIMIT), []);
  const appointmentRows = useMemo(() => buildAppointmentRows(DASHBOARD_ITEM_LIMIT), []);
  const [professionalRows, setProfessionalRows] = useState(() => buildProfessionalRows());
  const podRows = useMemo(() => buildPodRows(), []);
  const learnRows = useMemo(() => buildLearnRows(), []);
  const gigRows = useMemo(() => buildGigRows(), []);
  const systemRows = useMemo(() => buildSystemRows(), []);

  const tabCounts = useMemo(
    () => ({
      chat: chatRows.length,
      appointments: appointmentRows.length,
      professional: professionalRows.length,
      pod: podRows.length,
      learn: learnRows.length,
      gig: gigRows.length,
      system: systemRows.length,
    }),
    [chatRows, appointmentRows, professionalRows, podRows, learnRows, gigRows, systemRows],
  );
  const totalAttention = Object.values(tabCounts).reduce((s, n) => s + n, 0);

  const defaultTab: AttentionTabId = useMemo(() => {
    const entries = Object.entries(tabCounts) as [AttentionTabId, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }, [tabCounts]);

  const [attentionTab, setAttentionTab] = useState<AttentionTabId>(defaultTab);
  const [attentionPage, setAttentionPage] = useState(1);

  const handleTabChange = (id: string) => {
    setAttentionTab(id as AttentionTabId);
    setAttentionPage(1);
  };

  const rowMap: Record<AttentionTabId, AttentionRow[]> = {
    chat: chatRows,
    appointments: appointmentRows,
    professional: professionalRows,
    pod: podRows,
    learn: learnRows,
    gig: gigRows,
    system: systemRows,
  };
  const activeRows = rowMap[attentionTab];
  const attentionTotalPages = Math.max(1, Math.ceil(activeRows.length / ATTENTION_PAGE_SIZE));
  const safePage = Math.min(attentionPage, attentionTotalPages);
  const paginatedRows = activeRows.slice((safePage - 1) * ATTENTION_PAGE_SIZE, safePage * ATTENTION_PAGE_SIZE);
  const attentionViewAllHref = `/pro360/attention?tab=${attentionTab}`;

  const criticalCount = useMemo(
    () => Object.values(rowMap).flat().filter((r) => r.severity === "critical").length,
    [rowMap],
  );

  const tabHasUrgent = useCallback(
    (tabId: AttentionTabId) => rowMap[tabId].some((r) => r.severity === "critical" || r.severity === "high"),
    [rowMap],
  );

  // --- Upcoming events ---
  const upcomingEvents = useMemo(getUpcomingEvents, []);


  // --- Static counts (not period-sensitive) ---
  const activePros = professionals.length;
  const tfPlusCount = professionals.filter((p) => p.thoughtfullStandard >= 80).length;
  const orgCount = organizationQuality.length;
  const latestRating = monthlyRatings[monthlyRatings.length - 1];

  // --- Month abbreviations for period matching ---
  const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

  // Helper: aggregate an array of monthly appointment rows into one summary
  function aggregateAppt(rows: typeof monthlyAppointments) {
    return rows.reduce((acc, d) => ({
      created: acc.created + d.created,
      attended: acc.attended + d.attended,
      noShow: acc.noShow + d.noShow,
      cancelled: acc.cancelled + d.cancelled,
      caseNoteSubmitted: acc.caseNoteSubmitted + d.caseNoteSubmitted,
      caseNoteNotSubmitted: acc.caseNoteNotSubmitted + d.caseNoteNotSubmitted,
      therapyVideoHours: acc.therapyVideoHours + d.therapyVideoHours,
      therapyF2FHours: acc.therapyF2FHours + d.therapyF2FHours,
    }), { created: 0, attended: 0, noShow: 0, cancelled: 0, caseNoteSubmitted: 0, caseNoteNotSubmitted: 0, therapyVideoHours: 0, therapyF2FHours: 0 });
  }

  function aggregateChat(rows: typeof monthlyChat) {
    if (!rows.length) return monthlyChat[monthlyChat.length - 1];
    return {
      month: rows[rows.length - 1].month,
      totalChatHours: rows.reduce((s, d) => s + d.totalChatHours, 0),
      tfpChatHours: rows.reduce((s, d) => s + d.tfpChatHours, 0),
      clientChatHours: rows.reduce((s, d) => s + d.clientChatHours, 0),
      slaPerformance: Math.round(rows.reduce((s, d) => s + d.slaPerformance, 0) / rows.length * 10) / 10,
      avgResponseTimeHrs: Math.round(rows.reduce((s, d) => s + d.avgResponseTimeHrs, 0) / rows.length * 10) / 10,
    };
  }

  function aggregatePayout(rows: typeof monthlyPayout) {
    return rows.reduce((acc, d) => ({
      corePayout: acc.corePayout + d.corePayout,
      activationPayout: acc.activationPayout + d.activationPayout,
      incentivePayout: acc.incentivePayout + d.incentivePayout,
    }), { corePayout: 0, activationPayout: 0, incentivePayout: 0 });
  }

  // --- Period-aware KPI data ---
  const { kpiAppt, prevKpiAppt, kpiChat, prevKpiChat, kpiPayout, prevKpiPayout, trendLabel } = useMemo(() => {
    if (period.type === "year") {
      // Rolling 12 months ending at the selected year (mocked as the full year for simplicity since data is monthly)
      const rows = monthlyAppointments.filter(d => d.month.includes(String(period.year)));
      const chatRows = monthlyChat.filter(d => d.month.includes(String(period.year)));
      const payRows = monthlyPayout.filter(d => d.month.includes(String(period.year)));
      return {
        kpiAppt: aggregateAppt(rows),
        prevKpiAppt: null,
        kpiChat: aggregateChat(chatRows),
        prevKpiChat: null,
        kpiPayout: aggregatePayout(payRows),
        prevKpiPayout: null,
        trendLabel: "vs last year",
      };
    }
    if (period.type === "quarter" && period.quarter != null) {
      // Rolling 4 quarters ending at the selected quarter
      const qIdx = (period.quarter - 1);
      // For mock data purposes, we take the last 4 quarters available up to the selected one
      const endMonthIdx = (qIdx + 1) * 3;
      const curr = monthlyAppointments.slice(Math.max(0, endMonthIdx - 12), endMonthIdx);
      const prev = endMonthIdx >= 12 ? monthlyAppointments.slice(Math.max(0, endMonthIdx - 24), endMonthIdx - 12) : null;

      const chatCurr = monthlyChat.slice(Math.max(0, endMonthIdx - 12), endMonthIdx);
      const chatPrev = endMonthIdx >= 12 ? monthlyChat.slice(Math.max(0, endMonthIdx - 24), endMonthIdx - 12) : null;

      const payCurr = monthlyPayout.slice(Math.max(0, endMonthIdx - 12), endMonthIdx);
      const payPrev = endMonthIdx >= 12 ? monthlyPayout.slice(Math.max(0, endMonthIdx - 24), endMonthIdx - 12) : null;

      return {
        kpiAppt: aggregateAppt(curr),
        prevKpiAppt: prev ? aggregateAppt(prev) : null,
        kpiChat: aggregateChat(chatCurr),
        prevKpiChat: chatPrev ? aggregateChat(chatPrev) : null,
        kpiPayout: aggregatePayout(payCurr),
        prevKpiPayout: payPrev ? aggregatePayout(payPrev) : null,
        trendLabel: "vs last 4 quarters",
      };
    }
    // month: Rolling 4 weeks
    const targetMonthStr = `${MONTH_ABBR[(period.month ?? 1) - 1]} ${period.year}`;
    const mIdx = monthlyAppointments.findIndex(d => d.month === targetMonthStr);
    const safeIdx = mIdx >= 0 ? mIdx : monthlyAppointments.length - 1;

    // For KPIs in rolling 4 weeks, we use the monthly aggregate as a proxy if weekly not fully available,
    // but the chart filter logic below handles the "rolling 4 weeks" visual.
    return {
      kpiAppt: monthlyAppointments[safeIdx],
      prevKpiAppt: safeIdx > 0 ? monthlyAppointments[safeIdx - 1] : null,
      kpiChat: monthlyChat[safeIdx] ?? monthlyChat[monthlyChat.length - 1],
      prevKpiChat: safeIdx > 0 ? monthlyChat[safeIdx - 1] : null,
      kpiPayout: monthlyPayout[safeIdx] ?? monthlyPayout[monthlyPayout.length - 1],
      prevKpiPayout: safeIdx > 0 ? monthlyPayout[safeIdx - 1] : null,
      trendLabel: "vs last 4 weeks",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const latestActivation = monthlyActivation[monthlyActivation.length - 1];

  function computeTrend(current: number, previous: number | null | undefined, suffix = ""): { text: string | undefined; dir: "up" | "down" | "stable" } {
    if (previous == null) return { text: undefined, dir: "stable" };
    const diff = current - previous;
    if (diff === 0) return { text: undefined, dir: "stable" };
    return {
      text: `${diff > 0 ? "+" : ""}${Number.isInteger(diff) ? diff : diff.toFixed(1)}${suffix} ${trendLabel}`,
      dir: diff > 0 ? "up" : "down",
    };
  }

  function computeTrendPercent(current: number, previous: number | null | undefined): { text: string | undefined; dir: "up" | "down" | "stable" } {
    if (previous == null || previous <= 0) return { text: undefined, dir: "stable" };
    const diff = current - previous;
    if (diff === 0) return { text: undefined, dir: "stable" };
    const pct = Math.round(((diff / previous) * 100) * 10) / 10;
    return {
      text: `${pct > 0 ? "+" : ""}${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}% ${trendLabel}`,
      dir: pct > 0 ? "up" : "down",
    };
  }

  const kpiTotalPayout = kpiPayout.corePayout + kpiPayout.activationPayout + kpiPayout.incentivePayout;
  const prevKpiTotalPayout = prevKpiPayout ? prevKpiPayout.corePayout + prevKpiPayout.activationPayout + prevKpiPayout.incentivePayout : null;

  const apptTrend = computeTrend(kpiAppt.created, prevKpiAppt?.created);
  const payoutTrend = computeTrendPercent(kpiTotalPayout, prevKpiTotalPayout);
  const slaTrend = computeTrend(kpiChat.slaPerformance, prevKpiChat?.slaPerformance, "%");
  const chatHoursTrend = computeTrend(kpiChat.totalChatHours, prevKpiChat?.totalChatHours);
  const avgRespTrend = computeTrend(kpiChat.avgResponseTimeHrs, prevKpiChat?.avgResponseTimeHrs, "h");

  const totalTherapyHours = kpiAppt.therapyVideoHours + kpiAppt.therapyF2FHours;
  const prevTotalTherapyHours = prevKpiAppt ? prevKpiAppt.therapyVideoHours + prevKpiAppt.therapyF2FHours : null;
  const therapyHoursTrend = computeTrend(totalTherapyHours, prevTotalTherapyHours);

  const caseNotePct = kpiAppt.attended > 0 ? Math.round((kpiAppt.caseNoteSubmitted / kpiAppt.attended) * 100) : 0;
  const prevCaseNotePct = prevKpiAppt && prevKpiAppt.attended > 0 ? Math.round((prevKpiAppt.caseNoteSubmitted / prevKpiAppt.attended) * 100) : null;
  const caseNoteTrend = computeTrend(caseNotePct, prevCaseNotePct, "%");

  // Gauge pct values (0–100) for Row 1 operational health cards
  const AVG_RESP_MAX = 12;
  const slaPct = kpiChat.slaPerformance;   // already 0–100
  // Inverted: lower avg response = higher gauge fill (better)
  const avgRespPct = (1 - Math.min(kpiChat.avgResponseTimeHrs / AVG_RESP_MAX, 1)) * 100;
  void slaTrend;
  void avgRespTrend;
  void therapyHoursTrend;
  void slaPct;
  void avgRespPct;

  // Compute At-Risk Professionals
  const atRiskPros = useMemo(() => {
    return professionals.filter(p => !p.qualified || (p.responseRate24h ?? 0) < 90);
  }, []);

  const handleComingSoon = () => {
    systemToast.info("Coming soon", "This action is not yet available.");
  };

  const handleDismissProfessionalRow = (id: string) => {
    setProfessionalRows((prev) => prev.filter((r) => r.id !== id));
  };

  // --- Period-filtered chart data ---
  const filteredChatData = useMemo((): (MonthlyChatData & { label: string })[] => {
    if (period.type === "year") {
      return monthlyChat
        .filter((d) => d.month.includes(String(period.year)))
        .map((d) => ({ ...d, label: d.month.slice(0, 3) }));
    }
    if (period.type === "quarter" && period.quarter != null) {
      const start = (period.quarter - 1) * 3;
      return monthlyChat
        .filter(d => d.month.includes(String(period.year)))
        .slice(start, start + 3)
        .map(d => ({ ...d, label: d.month.slice(0, 3) }));
    }
    // Month: 4 weekly bars for the selected month (Approach C)
    const targetMonth = `${MONTH_ABBR[(period.month ?? 1) - 1]} ${period.year}`;
    const weeks = weeklyChat.filter(d => d.month === targetMonth);
    if (weeks.length > 0) return weeks; // WeeklyChatData already has `label`
    // Fallback: rolling 4-month window
    const tIdx = monthlyChat.findIndex(d =>
      d.month.startsWith(MONTH_ABBR[(period.month ?? 1) - 1]) && d.month.includes(String(period.year))
    );
    const end = tIdx >= 0 ? tIdx + 1 : monthlyChat.length;
    return monthlyChat.slice(Math.max(0, end - 4), end).map(d => ({ ...d, label: d.month.slice(0, 3) }));
  }, [period]);

  const filteredApptData = useMemo((): (MonthlyAppointmentData & { label: string })[] => {
    let base: MonthlyAppointmentData[];
    if (period.type === "year") {
      base = monthlyAppointments.filter((d) => d.month.includes(String(period.year)));
      return base.map((d) => ({ ...d, label: d.month.slice(0, 3), totalTherapyHours: d.therapyVideoHours + d.therapyF2FHours }));
    }
    if (period.type === "quarter" && period.quarter != null) {
      const start = (period.quarter - 1) * 3;
      return monthlyAppointments
        .filter(d => d.month.includes(String(period.year)))
        .slice(start, start + 3)
        .map(d => ({ ...d, label: d.month.slice(0, 3), totalTherapyHours: d.therapyVideoHours + d.therapyF2FHours }));
    }
    // Month: 4 weekly bars for the selected month (Approach C)
    const targetMonth = `${MONTH_ABBR[(period.month ?? 1) - 1]} ${period.year}`;
    const weeks = weeklyAppointments.filter(d => d.month === targetMonth);
    if (weeks.length > 0) return weeks.map(w => ({ ...w, totalTherapyHours: w.therapyVideoHours + w.therapyF2FHours }));
    // Fallback to rolling monthly window if no weekly data for this period
    const tIdx = monthlyAppointments.findIndex(d =>
      d.month.startsWith(MONTH_ABBR[(period.month ?? 1) - 1]) && d.month.includes(String(period.year))
    );
    const end = tIdx >= 0 ? tIdx + 1 : monthlyAppointments.length;
    base = monthlyAppointments.slice(Math.max(0, end - 4), end);
    return base.map((d) => ({ ...d, label: d.month.slice(0, 3), totalTherapyHours: d.therapyVideoHours + d.therapyF2FHours }));
  }, [period]);

  const filteredActivationData = useMemo(() => {
    const addLabel = (rows: typeof monthlyActivation) =>
      rows.map(d => ({ ...d, label: d.month.slice(0, 3) }));
    if (period.type === "year") {
      return addLabel(monthlyActivation.filter(d => d.month.includes(String(period.year))));
    }
    if (period.type === "quarter" && period.quarter != null) {
      const endMonthIdx = period.quarter * 3;
      return addLabel(monthlyActivation.slice(Math.max(0, endMonthIdx - 12), endMonthIdx));
    }
    const target = `${MONTH_ABBR[(period.month ?? 1) - 1]} ${period.year}`;
    const row = monthlyActivation.find(d => d.month === target) ?? monthlyActivation[monthlyActivation.length - 1];
    const nil = null as unknown as number;
    const empty = { month: target, totalActivations: 0, programRating: nil, professionalRating: nil };
    return (["W1", "W2", "W3", "W4"] as const).map(w =>
      ({ ...(w === "W3" ? row : empty), label: w })
    );
  }, [period]);

  const filteredPayoutData = useMemo(() => {
    const addLabel = (rows: typeof monthlyPayout) =>
      rows.map(d => ({ ...d, label: d.month.slice(0, 3) }));
    if (period.type === "year") {
      return addLabel(monthlyPayout.filter(d => d.month.includes(String(period.year))));
    }
    if (period.type === "quarter" && period.quarter != null) {
      const start = (period.quarter - 1) * 3;
      return addLabel(monthlyPayout
        .filter(d => d.month.includes(String(period.year)))
        .slice(start, start + 3));
    }
    const target = `${MONTH_ABBR[(period.month ?? 1) - 1]} ${period.year}`;
    const row = monthlyPayout.find(d => d.month === target) ?? monthlyPayout[monthlyPayout.length - 1];
    const empty = { month: target, corePayout: 0, activationPayout: 0, incentivePayout: 0 };
    return (["W1", "W2", "W3", "W4"] as const).map(w =>
      ({ ...(w === "W3" ? row : empty), label: w })
    );
  }, [period]);

  const filteredRatingsData = useMemo(() => {
    const addLabel = (rows: typeof monthlyRatings) =>
      rows.map(d => ({ ...d, label: d.month.slice(0, 3) }));
    if (period.type === "year") {
      return addLabel(monthlyRatings.filter(d => d.month.includes(String(period.year))));
    }
    if (period.type === "quarter" && period.quarter != null) {
      const start = (period.quarter - 1) * 3;
      return addLabel(monthlyRatings
        .filter(d => d.month.includes(String(period.year)))
        .slice(start, start + 3));
    }
    const target = `${MONTH_ABBR[(period.month ?? 1) - 1]} ${period.year}`;
    const row = monthlyRatings.find(d => d.month === target) ?? monthlyRatings[monthlyRatings.length - 1];
    const nil = null as unknown as number;
    const empty = { month: target, clientRating: nil, aiRating: nil, professionalRating: nil };
    return (["W1", "W2", "W3", "W4"] as const).map(w =>
      ({ ...(w === "W3" ? row : empty), label: w })
    );
  }, [period]);

  return (
    <div className="space-y-6">
      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Professional 360</h1>
        <p className="text-sm text-muted-foreground">Clinical ops overview</p>
      </div>

      {/* ── S1: NEEDS ATTENTION (3/4) + UPCOMING (1/4) ──────────────────── */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Needs Attention */}
        {totalAttention > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Needs attention
                  <Badge variant="secondary" className="ml-1 text-xxxs">{totalAttention}</Badge>
                  {criticalCount > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xxxs">
                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      {criticalCount} critical
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="link" size="sm" className="text-xs" asChild>
                  <Link href={attentionViewAllHref}>View all <ExternalLink className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <Tabs
                tabs={Object.entries(tabCounts).map(([id, count]) => ({
                  id,
                  label: `${ATTENTION_TAB_LABELS[id as AttentionTabId]} (${count})`,
                  suffix: tabHasUrgent(id as AttentionTabId) ? (
                    <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
                  ) : undefined,
                }))}
                activeId={attentionTab}
                onChange={handleTabChange}
              />
              {activeRows.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No items in this category.</p>
              ) : (
                <>
                  <ul className="divide-y divide-border">
                    {paginatedRows.map((row) => (
                      <li key={row.id} className="flex items-center gap-4 py-3">
                        <SeverityBadge row={row} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{row.primaryLabel}</p>
                            {row.infoPopover && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button onClick={(e) => e.stopPropagation()} className="rounded-full p-1 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground">
                                    <Info className="h-3 w-3" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 text-xs" side="top" align="start">
                                  {row.infoPopover}
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{row.secondaryLabel}</p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">{row.ageLabel}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          asChild={!!row.href}
                          onClick={
                            row.href
                              ? (e) => e.stopPropagation()
                              : attentionTab === "professional" && row.actionLabel === "Dismiss"
                                ? (e) => { e.stopPropagation(); handleDismissProfessionalRow(row.id); }
                                : (e) => { e.stopPropagation(); handleComingSoon(); }
                          }
                        >
                          {row.href ? (
                            <Link href={row.href}>{row.actionLabel}</Link>
                          ) : (
                            row.actionLabel
                          )}
                        </Button>
                        {row.secondaryAction && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-xs"
                            onClick={
                              attentionTab === "professional" && row.secondaryAction.label === "Dismiss"
                                ? () => handleDismissProfessionalRow(row.id)
                                : handleComingSoon
                            }
                          >
                            {row.secondaryAction.label}
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {attentionTotalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <span className="text-xs text-muted-foreground">
                        Showing {paginatedRows.length} of {activeRows.length} · sorted by severity
                      </span>
                      <div className="flex items-center gap-2">
                        <Button variant="link" size="sm" className="text-xs h-7 px-0" asChild>
                          <Link href={attentionViewAllHref}>View all →</Link>
                        </Button>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={safePage <= 1} onClick={() => setAttentionPage(safePage - 1)}>
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={safePage >= attentionTotalPages} onClick={() => setAttentionPage(safePage + 1)}>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming sidebar */}
        <Card className={totalAttention > 0 ? "lg:col-span-1" : "lg:col-span-4"}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                Upcoming
              </CardTitle>
              <Button variant="link" size="sm" className="text-xs" asChild>
                <Link href={buildAppointmentsLink({ context: "internal" })}>
                  Calendar <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarMinimalisticDuotone className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">No upcoming appointments</p>
                <p className="text-xs text-muted-foreground/60">Your schedule is clear for now</p>
              </div>
            ) : (
              <>
                {upcomingEvents.map((evt) => (
                  <div key={evt.id} className="flex gap-3">
                    <div className={cn("w-1 shrink-0 rounded-full", EVENT_DOT[evt.eventType])} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{evt.title}</p>
                      <p className="text-xs text-muted-foreground">{evt.start} – {evt.end}</p>
                      <p className="text-xxxs text-muted-foreground/70">
                        {evt.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length < 3 && (
                  <div className="flex flex-col items-center justify-center py-5 text-center">
                    <ThumbsUpDuotone className="h-8 w-8 text-muted-foreground/25" />
                    <p className="mt-2 text-xs text-muted-foreground/60">The rest of your day is free</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── S2: GLOBAL PERIOD FILTER + TOP-LINE KPI ROWS ───────────────── */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-foreground">Overview</h2>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        {/* Row 1 — Operational Health */}
        <div className="grid gap-3 sm:grid-cols-3">
          <GaugeKpiCard
            title="ThoughtFull Standard"
            value={`${kpiChat.slaPerformance.toFixed(0)}`}
            icon={<CrownBold className="h-4 w-4" />}
            pct={kpiChat.slaPerformance}
            target="Target 90"
            footer={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-normal text-foreground">At-Risk Professionals</span>
                  <span className="text-sm font-medium text-foreground">{atRiskPros.length}</span>
                </div>
                {atRiskPros.length > 0 && (
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {atRiskPros.slice(0, 3).map((p) => (
                      <div key={p.id} className="relative inline-block h-5 w-5 rounded-full ring-1 ring-background bg-muted">
                        {p.avatar ? (
                          <Image src={p.avatar} alt={p.name} fill className="rounded-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center rounded-full text-nano font-medium text-muted-foreground">
                            {p.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    ))}
                    {atRiskPros.length > 3 && (
                      <div className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted ring-1 ring-background">
                        <span className="text-nano font-medium text-muted-foreground">+{atRiskPros.length - 3}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            }
          />
          <DonutKpiCard
            title="Service Hours"
            icon={<BarChart3Bold className="h-4 w-4" />}
            groups={[
              {
                title: "CHAT",
                segments: [
                  { label: "TFP", value: kpiChat.tfpChatHours, color: PRO360_DASHBOARD_COLORS.chatTfp },
                  { label: "Client", value: kpiChat.clientChatHours, color: PRO360_DASHBOARD_COLORS.chatClient },
                ],
                centerLabel: "hours",
              },
              {
                title: "THERAPY",
                segments: [
                  { label: "Video Call", value: kpiAppt.therapyVideoHours, color: PRO360_DASHBOARD_COLORS.therapyVideo },
                  { label: "Face to Face", value: kpiAppt.therapyF2FHours, color: PRO360_DASHBOARD_COLORS.therapyFaceToFace },
                ],
                centerLabel: "hours",
              },
            ]}
            trend={chatHoursTrend.text}
            trendDirection={chatHoursTrend.dir}
          />
          <ChatResponseHealthCard
            healthyCount={225}
            lateCount={12}
            inactiveCount={5}
            icon={<CheckCircleBold className="h-4 w-4" />}
          />
        </div>

        {/* Row 2 — System Capacity & Activity */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Active Professionals"
            value={
              <>
                <span className="tabular-nums">{activePros}</span>
                <span className="ml-2 inline-flex items-center rounded-full bg-muted px-2 py-1 text-micro font-medium text-muted-foreground">
                  {tfPlusCount} TF+
                </span>
              </>
            }
            icon={<UsersBold className="h-4 w-4" />}
          />
          <KpiCard
            title="Active Organisations"
            value={orgCount}
            icon={<Building2Bold className="h-4 w-4" />}
          />
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="h-full w-full text-left">
                <KpiCard
                  title="Therapy"
                  value={kpiAppt.created}
                  icon={<CalendarBold className="h-4 w-4" />}
                  trend={apptTrend.text}
                  trendDirection={apptTrend.dir}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-3">
              <p className="text-xs font-medium text-foreground mb-2">Therapy Breakdown</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attended</span>
                  <span className="font-medium tabular-nums">{kpiAppt.attended}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No-show</span>
                  <span className="font-medium tabular-nums text-destructive">{kpiAppt.noShow}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span className="font-medium tabular-nums text-warning">{kpiAppt.cancelled}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-muted-foreground font-medium">Total created</span>
                  <span className="font-semibold tabular-nums">{kpiAppt.created}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <KpiCard
            title="Activations"
            value={latestActivation.totalActivations}
            icon={<ZapBold className="h-4 w-4" />}
          />
        </div>

        {/* Row 3 — Quality & Outcome */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Client Ratings"
            value={
              latestRating ? (
                <span className="flex items-baseline gap-1">
                  <span>{latestRating.clientRating.toFixed(2)}</span>
                  <span className="text-sm font-normal text-muted-foreground">/ 5.00</span>
                </span>
              ) : "—"
            }
            icon={<StarBold className="h-4 w-4" />}
          />
          <KpiCard
            title="AI Ratings"
            value={
              latestRating ? (
                <span className="flex items-baseline gap-1">
                  <span>{latestRating.aiRating.toFixed(2)}</span>
                  <span className="text-sm font-normal text-muted-foreground">/ 5.00</span>
                </span>
              ) : "—"
            }
            icon={<SparklesBold className="h-4 w-4" />}
          />
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="h-full w-full text-left">
                <KpiCard
                  title="Case Notes"
                  value={
                    <span className="flex items-baseline gap-2">
                      <span>{caseNotePct}%</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {kpiAppt.caseNoteSubmitted}/{kpiAppt.attended}
                      </span>
                    </span>
                  }
                  icon={<FileTextBold className="h-4 w-4" />}
                  trend={caseNoteTrend.text}
                  trendDirection={caseNoteTrend.dir}
                  target="90%"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-3">
              <p className="text-xs font-medium text-foreground mb-2">Case Notes Breakdown</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium tabular-nums text-success">{kpiAppt.caseNoteSubmitted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Missing</span>
                  <span className="font-medium tabular-nums text-destructive">{kpiAppt.caseNoteNotSubmitted}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-muted-foreground font-medium">Total attended</span>
                  <span className="font-semibold tabular-nums">{kpiAppt.attended}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <KpiCard
            title="Total Payout"
            value={`$${kpiTotalPayout.toLocaleString()}`}
            icon={<DollarSignBold className="h-4 w-4" />}
            trend={payoutTrend.text}
            trendDirection={payoutTrend.dir}
          />
        </div>
      </div>

      {/* ── QUALITY ──────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-muted-foreground">Quality</h2>

        {/* SLA + Ratings — 2-col */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex h-full flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                    <CheckCircleBold className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">SLA Compliance &amp; Response</CardTitle>
                  </div>
                </div>
                <Button variant="link" size="sm" className="text-xs shrink-0" asChild>
                  <Link href="/chat">View module <ExternalLink className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <ChartContainer config={slaResponseChartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 600, height: 200 }}>
                  <ComposedChart data={filteredChatData} margin={{ top: 4, right: 36, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[0, 12]} tickFormatter={(v: number) => `${v}h`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[70, 100]} tickFormatter={(v: number) => `${v}%`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line yAxisId="left" type="monotone" dataKey="avgResponseTimeHrs" stroke="var(--color-avgResponseTimeHrs)" strokeWidth={2} dot={false} name="Avg Response hrs (left axis)" />
                    <Line yAxisId="right" type="monotone" dataKey="slaPerformance" stroke="var(--color-slaPerformance)" strokeWidth={2} dot={false} name="SLA % (right axis)" />
                    <Legend content={(props) => <ChartLegendContent payload={props.payload} order={["avgResponseTimeHrs", "slaPerformance"]} seriesTypes={{ avgResponseTimeHrs: "line", slaPerformance: "line" }} />} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                  <StarBold className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">Ratings Trend</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <ChartContainer config={ratingsChartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 600, height: 200 }}>
                  <LineChart data={filteredRatingsData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis domain={[3, 5]} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="clientRating" stroke="var(--color-clientRating)" strokeWidth={2.5} dot={{ r: 2 }} name="Client Rating" />
                    <Line type="monotone" dataKey="aiRating" stroke="var(--color-aiRating)" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 2 }} name="AI Rating" />
                    <Legend content={(props) => <ChartLegendContent payload={props.payload} order={["clientRating", "aiRating"]} seriesTypes={{ clientRating: "line", aiRating: "line" }} />} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Side-by-side Trends */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Chat Hours trend */}
          <Card className="flex h-full flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                  <MessageSquareBold className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">Chat Hours Trend</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <ChartContainer config={chatHoursChartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 600, height: 200 }}>
                  <ComposedChart data={filteredChatData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="totalChatHours" fill="var(--color-totalChatHours)" fillOpacity={0.12} stroke="var(--color-totalChatHours)" strokeWidth={2} dot={false} name="Total Chat Hours" />
                    <Line type="monotone" dataKey="tfpChatHours" stroke="var(--color-tfpChatHours)" strokeWidth={2} dot={false} name="TFP Chat Hours" />
                    <Line type="monotone" dataKey="clientChatHours" stroke="var(--color-clientChatHours)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Client Chat Hours" />
                    <Legend content={(props) => <ChartLegendContent payload={props.payload} order={["totalChatHours", "tfpChatHours", "clientChatHours"]} seriesTypes={{ totalChatHours: "line", tfpChatHours: "line", clientChatHours: "line" }} dashedKeys={["clientChatHours"]} />} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Therapy Hours trend */}
          <Card className="flex h-full flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                  <CalendarBold className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">Therapy Hours Trend</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <ChartContainer config={therapyHoursChartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 600, height: 200 }}>
                  <ComposedChart data={filteredApptData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="totalTherapyHours" fill="var(--color-totalTherapyHours)" fillOpacity={0.12} stroke="var(--color-totalTherapyHours)" strokeWidth={2} dot={false} name="Total Therapy Hours" />
                    <Line type="monotone" dataKey="therapyVideoHours" stroke="var(--color-therapyVideoHours)" strokeWidth={2} dot={false} name="Video Call" />
                    <Line type="monotone" dataKey="therapyF2FHours" stroke="var(--color-therapyF2FHours)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Face to Face" />
                    <Legend content={(props) => <ChartLegendContent payload={props.payload} order={["totalTherapyHours", "therapyVideoHours", "therapyF2FHours"]} seriesTypes={{ totalTherapyHours: "line", therapyVideoHours: "line", therapyF2FHours: "line" }} dashedKeys={["therapyF2FHours"]} />} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Therapy Outcomes — moved from Service Delivery section */}
        <Card>
          <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                    <CalendarBold className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Therapy Outcomes</CardTitle>
                  </div>
                </div>
              <Button variant="link" size="sm" className="text-xs shrink-0" asChild>
                <Link href="/appointments">View module <ExternalLink className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={combinedApptConfig} className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 600, height: 240 }}>
                <BarChart data={filteredApptData} barGap={4} barCategoryGap={24} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<AppointmentTooltip />} />
                  <ReferenceLine
                    y={EXCESSIVE_APPT_THRESHOLD}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="4 4"
                    label={{ value: "Excessive Appointment Guideline", position: "insideTopRight", fontSize: 9, fill: "hsl(var(--destructive))" }}
                  />
                  <Bar dataKey="attended" stackId="appt" barSize={20} fill="var(--color-attended)" name="Attended" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="cancelled" stackId="appt" barSize={20} fill="var(--color-cancelled)" name="Cancelled" />
                  <Bar dataKey="noShow" stackId="appt" barSize={20} fill="var(--color-noShow)" name="No-show" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="caseNoteSubmitted" stackId="case" barSize={20} fill="var(--color-caseNoteSubmitted)" name="Case Notes Submitted" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="caseNoteNotSubmitted" stackId="case" barSize={20} fill="var(--color-caseNoteNotSubmitted)" name="Case Notes Missing" radius={[3, 3, 0, 0]} />
                  <Legend content={() => <AppointmentChartLegend />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── COMMERCIAL ───────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-muted-foreground">Commercial</h2>

        {/* Activation + Payout — 2-col */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex h-full flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                  <ZapBold className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">Activation</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <ChartContainer config={activationChartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 600, height: 200 }}>
                  <ComposedChart data={filteredActivationData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[3, 5]} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="totalActivations" barSize={20} fill="var(--color-totalActivations)" radius={[3, 3, 0, 0]} name="Total Activations" />
                    <Line yAxisId="right" type="monotone" dataKey="programRating" stroke="var(--color-programRating)" strokeWidth={2} dot={{ r: 2 }} name="Avg Event Rating" />
                    <Line yAxisId="right" type="monotone" dataKey="professionalRating" stroke="var(--color-professionalRating)" strokeWidth={2} dot={{ r: 2 }} name="Avg Professional Rating" />
                    <Legend content={(props) => <ChartLegendContent payload={props.payload} order={["totalActivations", "programRating", "professionalRating"]} seriesTypes={{ totalActivations: "bar", programRating: "line", professionalRating: "line" }} />} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                    <DollarSignBold className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Payout Breakdown</CardTitle>
                  </div>
                </div>
                <Button variant="link" size="sm" className="text-xs shrink-0" asChild>
                  <Link href="/payout">View module <ExternalLink className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <ChartContainer config={payoutChartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 600, height: 200 }}>
                  <BarChart data={filteredPayoutData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value: number) => `$${value.toLocaleString()}`} />} />
                    <Bar dataKey="corePayout" stackId="payout" barSize={20} fill="var(--color-corePayout)" radius={[0, 0, 0, 0]} name="Core Payout" />
                    <Bar dataKey="activationPayout" stackId="payout" barSize={20} fill="var(--color-activationPayout)" name="Activation Payout" />
                    <Bar dataKey="incentivePayout" stackId="payout" barSize={20} fill="var(--color-incentivePayout)" radius={[3, 3, 0, 0]} name="Incentive Payout" />
                    <Legend content={(props) => <ChartLegendContent payload={props.payload} order={["corePayout", "activationPayout", "incentivePayout"]} seriesTypes={{ corePayout: "bar", activationPayout: "bar", incentivePayout: "bar" }} />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── ADMINISTRATION ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-muted-foreground">Administration</h2>
        <DetailTabsSection />
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// DetailTabsSection — tabbed container for By Professional / By Organization
// with integrated Top Performer Spotlight per tab
// ---------------------------------------------------------------------------

type DetailTab = "professional" | "organization";

function DetailTabsSection() {
  const [activeTab, setActiveTab] = useState<DetailTab>("professional");

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            Detail View
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <Tabs
          tabs={[
            { id: "professional", label: "By Professional" },
            { id: "organization", label: "By Organization" },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as DetailTab)}
        />
        <div className="mt-4">
          {activeTab === "professional" ? (
            <QualityByProfessional hideMetrics />
          ) : (
            <QualityByOrganization hideMetrics />
          )}
        </div>

        {/* Top Performer Spotlight — contextual to active tab */}
        <div className="mt-6 border-t border-border pt-5">
          <ServiceQualityLeaders />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// TopPerformerSpotlight — podium top-3 + accordion expand
// ---------------------------------------------------------------------------

function ServiceQualityLeaders() {
  const leaders = useMemo(() => {
    return professionals
      .map(p => {
        const responseRate12h = p.responseRate12h ?? 0;
        const avgSpeed = p.avgServiceResponseHours ?? 10;
        const activeClients = p.totalAppointments > 0 ? 1 : 0;
        const msgCount = Math.round((p.clientChatHours || 0) * (responseRate12h / 20)); // Simulating message count

        // Weighted score for Top 10 ranking
        const score = (responseRate12h / 100) * 0.4 +
          (Math.max(0, 1 - avgSpeed / 5)) * 0.3 +
          (activeClients * 0.2) +
          (Math.min(1, msgCount / 50) * 0.1);

        return {
          ...p,
          score,
          msgCount,
          activeClients: p.totalAppointments > 0,
          isTop15: true // Simplifying for mock
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, []);

  const top3 = leaders.slice(0, 3);
  const others = leaders.slice(3);

  // Reorder for podium: [2, 1, 3]
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Crown className="h-4 w-4 text-warning" />
          Service Quality Leaders
        </h3>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-2 px-2 text-xxs font-medium text-muted-foreground hover:text-foreground">
              <Info className="h-3.5 w-3.5" />
              How do we measure?
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm leading-none text-foreground">Service Quality Leader (Quarterly)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Professionals are ranked based on a weighted score of these four performance metrics:
              </p>
              <ul className="space-y-2 text-xxs text-muted-foreground list-disc pl-4">
                <li><span className="font-medium text-foreground">100% Chat Response:</span> Within 12 hours of the first client message.</li>
                <li><span className="font-medium text-foreground">Top 15 Speed:</span> Shortest average response times across all professionals.</li>
                <li><span className="font-medium text-foreground">Active Engagement:</span> At least 1 active client with a minimum of 5 messages received per month.</li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Podium for Top 3 */}
      <div className="flex items-end justify-center gap-4 pt-4 pb-2">
        {podiumOrder.map((p, idx) => {
          const rank = leaders.indexOf(p) + 1;
          const isFirst = rank === 1;
          const speedRank = idx === 1 ? 1 : idx === 0 ? 2 : 3; // Mocking speed rank based on podium
          return (
            <div key={p.id} className={cn(
              "flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all",
              isFirst
                ? "bg-warning/8 dark:bg-warning/12 scale-110 -translate-y-2 border border-warning/25 min-w-[130px]"
                : "bg-muted/30 min-w-[110px]"
            )}>
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xxxs font-medium",
                rank === 1
                  ? "bg-warning text-primary-foreground"
                  : rank === 2
                    ? "bg-muted text-muted-foreground"
                    : "bg-warning/60 text-primary-foreground"
              )}>
                {rank}
              </div>
              <div className="relative">
                {p.avatar ? (
                  <Image src={p.avatar} alt={p.name} width={isFirst ? 56 : 44} height={isFirst ? 56 : 44} className="rounded-full border-2 border-background" />
                ) : (
                  <div className={cn("rounded-full bg-muted flex items-center justify-center font-medium text-xs uppercase", isFirst ? "h-14 w-14" : "h-11 w-11")}>
                    {p.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="max-w-[100px] truncate text-xs font-semibold text-foreground">{p.name}</p>
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-xxxs font-medium text-warning tabular-nums">#{speedRank} speed</span>
                  <span className="text-micro text-muted-foreground opacity-70">{p.avgServiceResponseHours}h avg</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Columnar list for 4-10 */}
      <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
        <div className="grid h-12 grid-cols-[30px_1fr_80px_60px_60px] items-center gap-2 border-b border-border bg-muted/50 px-4 text-sm font-medium text-muted-foreground">
          <span>#</span>
          <span>Professional</span>
          <span className="text-center">Speed Rank</span>
          <span className="text-center">Active</span>
          <span className="text-center">Msgs</span>
        </div>
        <div className="divide-y divide-border">
          {others.map((p, i) => {
            const overallRank = i + 4;
            const speedRank = overallRank + 2; // Mocking speed rank
            return (
              <div key={p.id} className="grid grid-cols-[30px_1fr_80px_60px_60px] items-center gap-2 px-4 py-4 transition-colors hover:bg-muted/50">
                <span className="text-xs font-medium text-muted-foreground tabular-nums">{overallRank}</span>
                <div className="flex items-center gap-2 min-w-0">
                  {p.avatar ? (
                    <Image src={p.avatar} alt="" width={24} height={24} className="rounded-full shadow-sm" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-nano uppercase">{p.name.charAt(0)}</div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{p.responseRate12h}% chat</p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-warning tabular-nums">#{speedRank}</span>
                  <span className="text-xs text-muted-foreground/80 tabular-nums">{p.avgServiceResponseHours}h</span>
                </div>
                <div className="flex justify-center">
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="flex justify-center text-xs font-semibold text-foreground tabular-nums">
                  {p.msgCount}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KpiMini — inline stat pill used above charts
// ---------------------------------------------------------------------------

function KpiMini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1">
      <span className="text-xxxs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold tabular-nums text-foreground">{String(value)}</span>
    </div>
  );
}
void KpiMini;
