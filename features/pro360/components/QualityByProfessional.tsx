"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { professionals } from "@/features/professionals/mock/professionals";
import { appointments } from "@/features/appointments/mock/appointments";
import { tfpIdToProId } from "@/features/professionals/mock/professionalProfiles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClickableTableRow } from "@/components/ui/clickable";
import { ViewModeToggle, type ViewMode } from "@/components/ui/view-mode-toggle";
import { TablePagination } from "@/components/TablePagination";
import { PeriodFilter, defaultPeriodValue, formatPeriodLabel, type PeriodValue } from "@/features/filters/components/PeriodFilter";
import {
  Search, UsersBold, CheckCircleBold, ZapBold, Clock, ClockBold,
  SparklesBold, StarBold, CalendarBold, FileTextBold, AlertTriangle, AlertTriangleBold,
} from "@/components/ui/solar-icons";
import { ModalListShell } from "./ModalListShell";
import { KpiCard } from "./KpiCard";
import { cn } from "@/lib/utils";

interface MissedLateSessionRow {
  professionalName: string;
  professionalId: string;
  missed: number;
  late: number;
  total: number;
}

interface ExcessiveSessionRow {
  professionalName: string;
  professionalId: string;
  clientName: string;
  sessions: number;
  week: string;
  year: number;
  href: string;
}

interface CaseNoteRow {
  professionalName: string;
  professionalId: string;
  submitted: number;
  total: number;
  late: number;
  missing: number;
}

interface RuleHitRow {
  professionalName: string;
  professionalId: string;
  appointmentId: string;
  ruleHits: string[];
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function normalizeProfessionalLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/^dr\.\s*/, "")
    .replace(/\s*\+\d+$/, "")
    .trim();
}

type ProfessionalSortKey = "sla" | "response" | "chatScore" | "aiRating"
  | "clientRating"
  | "totalAppointments"
  | "missedLate"
  | "excessive"
  | "caseNotes" | "dass" | "chatHours" | "activations" | "activationRating" | "payout" | "tfStandard";

function SortableHead({
  children, sortKey: key, activeSortKey, sortDir, onSort, className,
}: {
  children: React.ReactNode; sortKey: string; activeSortKey: string | null;
  sortDir: "asc" | "desc"; onSort: (key: string) => void; className?: string;
}) {
  const isActive = activeSortKey === key;
  return (
    <TableHead
      className={cn("cursor-pointer select-none hover:text-foreground", className)}
      onClick={() => onSort(key)}
    >
      <div className="flex items-center gap-1">
        {children}
        <span className={cn("text-xxxs", isActive ? "text-foreground" : "text-muted-foreground/50")}>
          {isActive ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </div>
    </TableHead>
  );
}

function TherapyModalContent({ p }: { p: (typeof professionals)[0] }) {
  const total = p.totalAppointments || 0;
  const videoCount = Math.round(total * 0.7);
  const f2fCount = Math.round(total * 0.3);
  const totalHours = (total * 0.8).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xxxs font-medium uppercase text-muted-foreground">Video Sessions</p>
          <p className="mt-1 text-xl font-bold text-foreground">{videoCount}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xxxs font-medium uppercase text-muted-foreground">Face-to-Face</p>
          <p className="mt-1 text-xl font-bold text-foreground">{f2fCount}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Total Hours Worked</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{totalHours}h</p>
        </div>
        <Clock className="h-6 w-6 text-muted-foreground/30" />
      </div>

      {(p.missedLateSessions > 0 || p.excessiveSessions > 0) && (
        <div className="rounded-md border border-warning/35 bg-warning/8 p-3 text-xxs text-warning dark:bg-warning/12">
          <p className="mb-1 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" />
            Performance Flags
          </p>
          Missed: {p.missedSessions} · Late: {p.lateSessions} · Excessive: {p.excessiveSessions}
        </div>
      )}

      <p className="border-t border-border pt-3 text-xxxs italic leading-relaxed text-muted-foreground">
        * Note: Only video sessions are currently tracked for total hours. Face-to-Face tracking will be available in future updates.
      </p>
    </div>
  );
}

export function QualityByProfessional({ hideMetrics = false }: { hideMetrics?: boolean } = {}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [period, setPeriod] = useState<PeriodValue>(defaultPeriodValue());
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const pageSize = viewMode === "card" ? 6 : 5;
  const [missedLateModal, setMissedLateModal] = useState<{ title: string; rows: MissedLateSessionRow[] } | null>(null);
  const [excessiveModal, setExcessiveModal] = useState<{ title: string; rows: ExcessiveSessionRow[] } | null>(null);
  const [caseNotesModal, setCaseNotesModal] = useState<{ title: string; rows: CaseNoteRow[] } | null>(null);
  const [ruleHitModal, setRuleHitModal] = useState<{ title: string; rows: RuleHitRow[] } | null>(null);
  const [tfStandardModal, setTfStandardModal] = useState<{ name: string; id: string; score: number } | null>(null);
  const [therapyModal, setTherapyModal] = useState<{ name: string; id: string; p: (typeof professionals)[0] } | null>(null);
  const [sortKey, setSortKey] = useState<ProfessionalSortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key as ProfessionalSortKey);
      setSortDir("desc");
    }
    setPage(1);
  };

  // Calculate excessive sessions from appointments (same pro + same client > 2/week)
  const excessiveFlags = useMemo(() => {
    const counts: Record<string, number> = {};
    const flags: Record<string, ExcessiveSessionRow[]> = {};

    for (const a of appointments) {
      if (a.type === "client_session" && a.clientDisplay && a.professionalDisplay && a.scheduledAt) {
        const date = new Date(a.scheduledAt);
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        const groupedKey = `${a.professionalDisplay}|${a.clientDisplay}|${date.getFullYear()}|W${week}`;
        counts[groupedKey] = (counts[groupedKey] || 0) + 1;
      }
    }

    for (const key in counts) {
      if (counts[key] > 2) {
        const [pro, client, year, week] = key.split("|");
        const proObj = professionals.find(p => p.name === pro);
        if (proObj) {
          if (!flags[proObj.id]) flags[proObj.id] = [];
          flags[proObj.id].push({
            professionalName: pro,
            professionalId: tfpIdToProId(proObj.id),
            clientName: client,
            sessions: counts[key],
            week,
            year: parseInt(year),
            href: `/appointments?client=${encodeURIComponent(client)}&tfp=${encodeURIComponent(pro)}&period=${year}-${week}`,
          });
        }
      }
    }
    return flags;
  }, []);

  const ruleHitFlags = useMemo(() => {
    const flags: Record<string, RuleHitRow[]> = {};

    for (const appointment of appointments) {
      const ruleHits = appointment.quality?.ruleHits;
      if (!ruleHits || ruleHits.length === 0 || !appointment.professionalDisplay) continue;

      const normalizedProfessional = normalizeProfessionalLabel(appointment.professionalDisplay);
      const professional = professionals.find(
        (p) => normalizeProfessionalLabel(p.name) === normalizedProfessional,
      );

      if (!professional) continue;
      if (!flags[professional.id]) flags[professional.id] = [];
      flags[professional.id].push({
        professionalName: professional.name,
        professionalId: tfpIdToProId(professional.id),
        appointmentId: appointment.id,
        ruleHits,
      });
    }

    return flags;
  }, []);

  const filteredPros = useMemo(() => {
    if (!deferredSearch) return professionals;
    const q = deferredSearch.toLowerCase();
    return professionals.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
    );
  }, [deferredSearch]);

  const sortedPros = useMemo(() => {
    if (!sortKey) return filteredPros;
    const getValue = (p: (typeof filteredPros)[0]): number => {
      switch (sortKey) {
        case "sla": return p.responseRate24h ?? 0;
        case "response": return p.avgServiceResponseHours;
        case "chatScore": return p.tfpChatScore;
        case "aiRating": return p.aiRatingAvg;
        case "clientRating": return p.clientRatingAvg;
        case "missedLate": return p.missedLateSessions;
        case "excessive": return (excessiveFlags[p.id]?.length || 0);
        case "caseNotes": return p.caseNotesSubmitted / (p.totalAppointments || 1);
        case "dass": return p.dassScoreAvg;
        case "chatHours": return p.clientChatHours;
        case "activations": return p.activationCount;
        case "activationRating": return p.activationRatingAvg;
        case "payout": return p.payoutCore + p.payoutActivation + p.payoutIncentive;
        case "tfStandard": return p.thoughtfullStandard;
        default: return 0;
      }
    };
    return [...filteredPros].sort((a, b) => {
      const diff = getValue(a) - getValue(b);
      return sortDir === "asc" ? diff : -diff;
    });
  }, [filteredPros, sortKey, sortDir, excessiveFlags]);

  const professionalMetrics = useMemo(() => {
    const total = filteredPros.length;
    const safeDivisor = total || 1;
    const avgSla = filteredPros.reduce((s, p) => s + (p.responseRate24h ?? 0), 0) / safeDivisor;
    const avgResponseTime = filteredPros.reduce((s, p) => s + p.avgServiceResponseHours, 0) / safeDivisor;
    const avgChatScore = filteredPros.reduce((s, p) => s + p.tfpChatScore, 0) / safeDivisor;
    const avgAiRating = filteredPros.reduce((s, p) => s + p.aiRatingAvg, 0) / safeDivisor;
    const avgClientRating = filteredPros.reduce((s, p) => s + p.clientRatingAvg, 0) / safeDivisor;
    const totalMissedLate = filteredPros.reduce((s, p) => s + p.missedLateSessions, 0);
    const totalCaseNotesSubmitted = filteredPros.reduce((s, p) => s + p.caseNotesSubmitted, 0);
    const totalAppointments = filteredPros.reduce((s, p) => s + p.totalAppointments, 0);
    const totalExcessive = filteredPros.filter((p) => (excessiveFlags[p.id]?.length || 0) > 0).length;
    const totalRuleHits = filteredPros.reduce(
      (sum, p) => sum + (ruleHitFlags[p.id]?.reduce((inner, row) => inner + row.ruleHits.length, 0) ?? 0),
      0,
    );
    const avgTfStandard = filteredPros.reduce((s, p) => s + p.thoughtfullStandard, 0) / safeDivisor;
    return {
      total,
      avgSla: avgSla.toFixed(1),
      avgResponseTime: avgResponseTime.toFixed(1),
      avgChatScore: avgChatScore.toFixed(1),
      avgAiRating: avgAiRating.toFixed(1),
      avgClientRating: avgClientRating.toFixed(1),
      totalMissedLate,
      totalCaseNotesSubmitted,
      totalAppointments,
      totalExcessive,
      totalRuleHits,
      avgTfStandard: avgTfStandard.toFixed(0),
    };
  }, [filteredPros, excessiveFlags, ruleHitFlags]);

  const paginatedPros = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedPros.slice(start, start + pageSize);
  }, [sortedPros, page, pageSize]);

  const openMissedLateAll = () => {
    setMissedLateModal({
      title: "All Missed / Late Sessions",
      rows: professionals
        .filter((p) => p.missedLateSessions > 0)
        .map((p) => ({ professionalName: p.name, professionalId: tfpIdToProId(p.id), missed: p.missedSessions, late: p.lateSessions, total: p.missedLateSessions })),
    });
  };

  const openMissedLatePro = (p: (typeof professionals)[0]) => {
    setMissedLateModal({
      title: `Missed / Late Sessions — ${p.name}`,
      rows: [{ professionalName: p.name, professionalId: tfpIdToProId(p.id), missed: p.missedSessions, late: p.lateSessions, total: p.missedLateSessions }],
    });
  };
  void openMissedLatePro;

  const openExcessiveAll = () => {
    const allRows: ExcessiveSessionRow[] = [];
    Object.values(excessiveFlags).forEach(rows => allRows.push(...rows));
    setExcessiveModal({
      title: "All Excessive Sessions",
      rows: allRows,
    });
  };

  const openExcessivePro = (p: (typeof professionals)[0]) => {
    setExcessiveModal({
      title: `Excessive Sessions — ${p.name}`,
      rows: excessiveFlags[p.id] || [],
    });
  };

  const openCaseNotesAll = () => {
    setCaseNotesModal({
      title: "All Case Notes Submissions",
      rows: professionals.map((p) => ({
        professionalName: p.name,
        professionalId: tfpIdToProId(p.id),
        submitted: p.caseNotesSubmitted,
        total: p.totalAppointments,
        late: "lateCaseNotes" in p ? Number(p.lateCaseNotes) : 0,
        missing: "missingCaseNotes" in p ? Number(p.missingCaseNotes) : 0,
      })),
    });
  };

  const openCaseNotesPro = (p: (typeof professionals)[0]) => {
    setCaseNotesModal({
      title: `Case Notes — ${p.name}`,
      rows: [{
        professionalName: p.name,
        professionalId: tfpIdToProId(p.id),
        submitted: p.caseNotesSubmitted,
        total: p.totalAppointments,
        late: "lateCaseNotes" in p ? Number(p.lateCaseNotes) : 0,
        missing: "missingCaseNotes" in p ? Number(p.missingCaseNotes) : 0,
      }],
    });
  };

  const openRuleHitsAll = () => {
    const rows: RuleHitRow[] = [];
    Object.values(ruleHitFlags).forEach((list) => rows.push(...list));
    setRuleHitModal({
      title: "All Rule Engine Hits",
      rows,
    });
  };

  const openRuleHitsPro = (p: (typeof professionals)[0]) => {
    setRuleHitModal({
      title: `Rule Engine Hits — ${p.name}`,
      rows: ruleHitFlags[p.id] || [],
    });
  };

  return (
    <div className="space-y-4">
      {!hideMetrics && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Quality by Professional</h2>
              <p className="text-xs text-muted-foreground">{formatPeriodLabel(period)}</p>
            </div>
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          {/* Header summary metrics — 2 rows × 5 cols at lg */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            <KpiCard title="Active Professionals" value={professionalMetrics.total} icon={<UsersBold className="h-5 w-5" />} trend="+2%" trendDirection="up" />
            <KpiCard title="ThoughtFull Standard" value={professionalMetrics.avgTfStandard} icon={<CheckCircleBold className="h-5 w-5" />} trend="+5%" trendDirection="up" />
            <KpiCard title="SLA Performance" value={`${professionalMetrics.avgSla}%`} icon={<ZapBold className="h-5 w-5" />} trend="-1.2%" trendDirection="down" />
            <KpiCard title="Avg Chat Response Time" value={`${professionalMetrics.avgResponseTime} hrs`} icon={<ClockBold className="h-5 w-5" />} trend="-0.5h" trendDirection="up" />
            <KpiCard title="AI Rating" value={professionalMetrics.avgAiRating} icon={<SparklesBold className="h-5 w-5" />} badge="Stable" />
            <KpiCard title="Client Rating" value={professionalMetrics.avgClientRating} icon={<StarBold className="h-5 w-5" />} trend="+0.2" trendDirection="up" />
            <KpiCard title="Missed/Late Sessions" value={professionalMetrics.totalMissedLate} icon={<CalendarBold className="h-5 w-5" />} badge="Monthly Total" clickable onClick={openMissedLateAll} />
            <KpiCard
              title="Case Notes Filed"
              value={`${professionalMetrics.totalCaseNotesSubmitted} / ${professionalMetrics.totalAppointments}`}
              icon={<FileTextBold className="h-5 w-5" />}
              progress={{ current: professionalMetrics.totalCaseNotesSubmitted, total: professionalMetrics.totalAppointments }}
              clickable
              onClick={openCaseNotesAll}
            />
            <KpiCard
              title="Excessive Sessions"
              value={professionalMetrics.totalExcessive}
              icon={<AlertTriangleBold className="h-5 w-5" />}
              badge={professionalMetrics.totalExcessive === 0 ? "CLEAR" : undefined}
              clickable
              onClick={openExcessiveAll}
            />
            <KpiCard
              title="Rule Engine Hits"
              value={professionalMetrics.totalRuleHits}
              icon={<SparklesBold className="h-5 w-5" />}
              badge={professionalMetrics.totalRuleHits === 0 ? "NONE" : "Automation"}
              clickable
              onClick={openRuleHitsAll}
            />
          </div>
        </>
      )}

      {/* Professionals table */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or ID…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Professional</TableHead>
                    <SortableHead sortKey="sla" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">SLA %</SortableHead>
                    <SortableHead sortKey="response" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Avg Chat Response Time</SortableHead>
                    <SortableHead sortKey="chatScore" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Chat Score</SortableHead>
                    <SortableHead sortKey="aiRating" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">AI Rating</SortableHead>
                    <SortableHead sortKey="clientRating" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Client Rating</SortableHead>
                    <SortableHead sortKey="missedLate" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-center">Therapy</SortableHead>
                    <SortableHead sortKey="caseNotes" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-center">Case Notes</SortableHead>
                    <SortableHead sortKey="dass" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">DASS Avg</SortableHead>
                    <SortableHead sortKey="chatHours" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Chat Hours</SortableHead>
                    <SortableHead sortKey="activations" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Activations</SortableHead>
                    <SortableHead sortKey="activationRating" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Activation Rating</SortableHead>
                    <SortableHead sortKey="payout" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Payout</SortableHead>
                    <SortableHead sortKey="tfStandard" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">ThoughtFull Standard</SortableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPros.map((p) => (
                    <ClickableTableRow key={p.id} onActivate={() => router.push(`/pro360/${p.id}`)}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{tfpIdToProId(p.id)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{p.responseRate24h}%</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{p.avgServiceResponseHours}h</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{p.tfpChatScore}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{p.aiRatingAvg}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{p.clientRatingAvg}</TableCell>
                      <TableCell className="text-center">
                        <button
                          className="tabular-nums text-sm font-semibold text-primary hover:underline underline-offset-4 decoration-primary/30"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTherapyModal({ name: p.name, id: p.id, p });
                          }}
                        >
                          {p.totalAppointments}
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          className="tabular-nums text-sm text-primary hover:underline"
                          onClick={(e) => { e.preventDefault(); openCaseNotesPro(p); }}
                        >
                          {p.caseNotesSubmitted} / {p.totalAppointments}
                        </button>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{p.dassScoreAvg}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{p.clientChatHours}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{p.activationCount === 0 ? "—" : p.activationCount}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{p.activationCount === 0 ? "—" : p.activationRatingAvg}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm font-medium">${(p.payoutCore + p.payoutActivation + p.payoutIncentive).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <button
                          className="tabular-nums text-sm font-medium text-primary hover:underline"
                          onClick={(e) => { e.preventDefault(); setTfStandardModal({ name: p.name, id: p.id, score: p.thoughtfullStandard }); }}
                        >
                          {p.thoughtfullStandard}
                        </button>
                      </TableCell>
                    </ClickableTableRow>
                  ))}
                  {paginatedPros.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={14} className="py-8 text-center text-sm text-muted-foreground">No professionals found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              {paginatedPros.length === 0 && (
                <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No professionals found.</p>
              )}
              {paginatedPros.map((p) => (
                <Card
                  key={p.id}
                  className="flex cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-card"
                  onClick={() => router.push(`/pro360/${p.id}`)}
                >
                  <CardContent className="relative flex flex-1 flex-col gap-3 p-5">
                    {/* TF Standard badge — top right */}
                    <button
                      className="absolute right-4 top-4 shrink-0 rounded-md border border-primary/20 bg-primary/5 px-3 py-1 text-base font-semibold tabular-nums text-primary hover:bg-primary/10"
                      onClick={(e) => { e.stopPropagation(); setTfStandardModal({ name: p.name, id: p.id, score: p.thoughtfullStandard }); }}
                    >
                      {p.thoughtfullStandard}
                      <span className="ml-1 text-micro font-normal text-muted-foreground">TF Std</span>
                    </button>

                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      {p.avatar ? (
                        <Image src={p.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" width={44} height={44} />
                      ) : (
                        <div className="h-11 w-11 shrink-0 rounded-full bg-muted" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground leading-tight">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{tfpIdToProId(p.id)} · {p.role}</p>
                      </div>
                    </div>

                    {/* Quality metrics row */}
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 rounded-lg bg-muted/40 px-3 py-3 text-xs">
                      <div><span className="text-muted-foreground">SLA</span> <span className="font-medium text-foreground tabular-nums">{p.responseRate24h}%</span></div>
                      <div><span className="text-muted-foreground">Response</span> <span className="font-medium text-foreground tabular-nums">{p.avgServiceResponseHours}h</span></div>
                      <div><span className="text-muted-foreground">Chat</span> <span className="font-medium text-foreground tabular-nums">{p.tfpChatScore}</span></div>
                      <div><span className="text-muted-foreground">AI</span> <span className="font-medium text-foreground tabular-nums">{p.aiRatingAvg}</span></div>
                      <div><span className="text-muted-foreground">Client</span> <span className="font-medium text-foreground tabular-nums">{p.clientRatingAvg}</span></div>
                      <div><span className="text-muted-foreground">DASS</span> <span className="font-medium text-foreground tabular-nums">{p.dassScoreAvg}</span></div>
                      <div><span className="text-muted-foreground">Chat Hrs</span> <span className="font-medium text-foreground tabular-nums">{p.clientChatHours}</span></div>
                      <div><span className="text-muted-foreground">Activations</span> <span className="font-medium text-foreground tabular-nums">{p.activationCount === 0 ? "—" : p.activationCount}</span></div>
                      <div><span className="text-muted-foreground">Payout</span> <span className="font-medium text-foreground tabular-nums">${(p.payoutCore + p.payoutActivation + p.payoutIncentive).toLocaleString()}</span></div>
                    </div>

                    {/* Action pills */}
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-auto flex-col items-start px-2 py-1 text-xs tabular-nums",
                          p.missedLateSessions > 0 ? "border-warning/35 bg-warning/8 text-warning hover:bg-warning/12 dark:bg-warning/15" : "border-border text-muted-foreground"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTherapyModal({ name: p.name, id: p.id, p });
                        }}
                      >
                        <span>Therapy <span className="font-bold text-foreground">{p.totalAppointments}</span></span>
                      </Button>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs tabular-nums text-primary hover:bg-muted/50"
                        onClick={(e) => { e.stopPropagation(); openCaseNotesPro(p); }}
                      >
                        Case Notes <span className="font-medium">{p.caseNotesSubmitted}/{p.totalAppointments}</span>
                      </button>
                      {(ruleHitFlags[p.id]?.length || 0) > 0 && (
                        <button
                          className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-xs tabular-nums text-primary hover:bg-primary/10"
                          onClick={(e) => { e.stopPropagation(); openRuleHitsPro(p); }}
                        >
                          Rule Hits {ruleHitFlags[p.id]?.reduce((sum, row) => sum + row.ruleHits.length, 0)}
                        </button>
                      )}
                      {(excessiveFlags[p.id]?.length || 0) > 0 && (
                        <button
                          className="inline-flex items-center gap-1 rounded-md border border-destructive/20 bg-destructive/5 px-2 py-1 text-xs tabular-nums text-destructive hover:bg-destructive/10"
                          onClick={(e) => { e.stopPropagation(); openExcessivePro(p); }}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Excessive {excessiveFlags[p.id]?.length}
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <TablePagination
            total={filteredPros.length}
            pageSize={pageSize}
            page={page}
            onPageChange={setPage}
            onPageSizeChange={() => setPage(1)}
          />
        </CardContent>
      </Card>

      {/* Missed / Late Sessions Modal */}
      <Dialog open={!!missedLateModal} onOpenChange={(open) => !open && setMissedLateModal(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{missedLateModal?.title}</DialogTitle>
            <DialogDescription>Breakdown of missed and late sessions for the selected period.</DialogDescription>
          </DialogHeader>
          {missedLateModal && (
            <ModalListShell
              key={missedLateModal.title}
              items={missedLateModal.rows}
              searchPlaceholder="Search by professional name…"
              searchFn={(r, q) => r.professionalName.toLowerCase().includes(q)}
              emptyMessage="No missed or late sessions."
              renderItem={(r) => (
                <div key={r.professionalId} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.professionalName}</p>
                      <p className="text-xs text-muted-foreground">ID: {r.professionalId}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{r.total} total</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <DetailRow label="Missed" value={String(r.missed)} />
                    <DetailRow label="Late" value={String(r.late)} />
                  </div>
                </div>
              )}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Excessive Sessions Modal */}
      <Dialog open={!!excessiveModal} onOpenChange={(open) => !open && setExcessiveModal(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{excessiveModal?.title}</DialogTitle>
            <DialogDescription>Professionals flagged for excessive sessions in the selected period.</DialogDescription>
          </DialogHeader>
          {excessiveModal && (
            <ModalListShell
              key={excessiveModal.title}
              items={excessiveModal.rows}
              searchPlaceholder="Search by professional name…"
              searchFn={(r, q) => r.professionalName.toLowerCase().includes(q)}
              emptyMessage="No excessive sessions flagged."
              renderItem={(r) => (
                <div key={`${r.professionalId}-${r.clientName}-${r.week}`} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.professionalName}</p>
                      <p className="text-xs text-muted-foreground">ID: {r.professionalId}</p>
                      <p className="mt-1 text-xs font-semibold text-destructive">Client: {r.clientName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="destructive" className="text-xs">{r.sessions} sessions</Badge>
                      <span className="text-xxxs font-medium text-muted-foreground">{r.week}, {r.year}</span>
                    </div>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-end">
                    <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                      <Link href={r.href}>Investigate appointments</Link>
                    </Button>
                  </div>
                </div>
              )}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Case Notes Modal */}
      <Dialog open={!!caseNotesModal} onOpenChange={(open) => !open && setCaseNotesModal(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{caseNotesModal?.title}</DialogTitle>
            <DialogDescription>Case notes submission status for the selected period.</DialogDescription>
          </DialogHeader>
          {caseNotesModal && (
            <ModalListShell
              key={caseNotesModal.title}
              items={caseNotesModal.rows}
              searchPlaceholder="Search by professional name…"
              searchFn={(r, q) => r.professionalName.toLowerCase().includes(q)}
              emptyMessage="No case notes data."
              renderItem={(r) => (
                <div key={r.professionalId} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.professionalName}</p>
                      <p className="text-xs text-muted-foreground">ID: {r.professionalId}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{r.submitted} / {r.total}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <DetailRow label="Submitted" value={String(r.submitted)} />
                    <DetailRow label="Total appts" value={String(r.total)} />
                    <DetailRow label="Late" value={String(r.late)} />
                    <DetailRow label="Missing" value={String(r.missing)} />
                  </div>
                </div>
              )}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Rule Engine Hits Modal */}
      <Dialog open={!!ruleHitModal} onOpenChange={(open) => !open && setRuleHitModal(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{ruleHitModal?.title}</DialogTitle>
            <DialogDescription>Appointments that triggered rule engine quality flags in the selected period.</DialogDescription>
          </DialogHeader>
          {ruleHitModal && (
            <ModalListShell
              key={ruleHitModal.title}
              items={ruleHitModal.rows}
              searchPlaceholder="Search by professional or rule…"
              searchFn={(r, q) =>
                r.professionalName.toLowerCase().includes(q) ||
                r.ruleHits.some((hit) => hit.toLowerCase().includes(q))
              }
              emptyMessage="No rule engine hits found."
              renderItem={(r) => (
                <div key={`${r.professionalId}-${r.appointmentId}`} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.professionalName}</p>
                      <p className="text-xs text-muted-foreground">ID: {r.professionalId}</p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">{r.ruleHits.length} hit{r.ruleHits.length !== 1 ? "s" : ""}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.ruleHits.map((hit) => (
                      <Badge key={hit} variant="secondary" className="text-xs capitalize">
                        {hit.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ThoughtFull Standard Breakdown Modal */}
      <Dialog open={!!tfStandardModal} onOpenChange={(open) => !open && setTfStandardModal(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ThoughtFull Standard breakdown</DialogTitle>
            <DialogDescription>
              {tfStandardModal?.name} &bull; {tfpIdToProId(tfStandardModal?.id ?? "")} &bull; Overall: <span className="font-semibold tabular-nums">{tfStandardModal?.score}</span>
            </DialogDescription>
          </DialogHeader>
          {tfStandardModal && <TfStandardBreakdown score={tfStandardModal.score} />}
        </DialogContent>
      </Dialog>

      {/* Therapy Breakdown Modal */}
      <Dialog open={!!therapyModal} onOpenChange={(open) => !open && setTherapyModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Therapy Breakdown</DialogTitle>
            <DialogDescription>
              {therapyModal?.name} &bull; {tfpIdToProId(therapyModal?.id ?? "")}
            </DialogDescription>
          </DialogHeader>
          {therapyModal && <TherapyModalContent p={therapyModal.p} />}
          <div className="mt-2 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setTherapyModal(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const TF_COMPONENTS = [
  { key: "comms", label: "Chat / Comms" },
  { key: "responsiveness", label: "Responsiveness" },
  { key: "documentation", label: "Documentation (Case Notes)" },
  { key: "attendance", label: "Attendance / Reliability" },
  { key: "feedback", label: "Feedback / Rating" },
] as const;

function derivePlaceholderScores(overall: number) {
  const offsets = [3, -2, 5, -4, 1];
  return TF_COMPONENTS.map((c, i) => {
    const raw = overall + offsets[i] * ((overall * (i + 1)) % 7 - 3);
    return { ...c, score: Math.max(0, Math.min(100, Math.round(raw))) };
  });
}

function TfStandardBreakdown({ score }: { score: number }) {
  const components = derivePlaceholderScores(score);
  return (
    <div className="space-y-3">
      {components.map((c) => (
        <div key={c.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
          <span className="text-sm text-foreground">{c.label}</span>
          <span className="tabular-nums text-sm font-semibold text-foreground">{c.score}</span>
        </div>
      ))}
      <p className="text-xxxs italic text-muted-foreground">
        Component breakdown is a placeholder and will be refined.
      </p>
    </div>
  );
}
