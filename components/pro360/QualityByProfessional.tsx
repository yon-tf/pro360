"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { professionals } from "@/lib/mock/professionals";
import { tfpIdToProId } from "@/lib/mock/professionalProfiles";
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
import { ClickableTableRow } from "@/components/ui/clickable";
import { ViewModeToggle, type ViewMode } from "@/components/ui/view-mode-toggle";
import { TablePagination } from "@/components/TablePagination";
import { PeriodFilter, defaultPeriodValue, formatPeriodLabel, type PeriodValue } from "@/components/filters/PeriodFilter";
import {
  Search, Users, CheckCircle, Zap, Clock, MessageSquare,
  Sparkles, Star, Calendar, FileText, AlertTriangle,
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
  excessiveSessions: number;
}

interface CaseNoteRow {
  professionalName: string;
  professionalId: string;
  submitted: number;
  total: number;
  late: number;
  missing: number;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function QualityByProfessional() {
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
  const [tfStandardModal, setTfStandardModal] = useState<{ name: string; id: string; score: number } | null>(null);

  const filteredPros = useMemo(() => {
    if (!deferredSearch) return professionals;
    const q = deferredSearch.toLowerCase();
    return professionals.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
    );
  }, [deferredSearch]);

  const headerMetrics = useMemo(() => {
    const total = filteredPros.length;
    const safeDivisor = total || 1;
    const avgSla = filteredPros.reduce((s, p) => s + p.responseRate24h, 0) / safeDivisor;
    const avgResponseTime = filteredPros.reduce((s, p) => s + p.avgServiceResponseHours, 0) / safeDivisor;
    const avgChatScore = filteredPros.reduce((s, p) => s + p.tfpChatScore, 0) / safeDivisor;
    const avgAiRating = filteredPros.reduce((s, p) => s + p.aiRatingAvg, 0) / safeDivisor;
    const avgClientRating = filteredPros.reduce((s, p) => s + p.clientRatingAvg, 0) / safeDivisor;
    const totalMissedLate = filteredPros.reduce((s, p) => s + p.missedLateSessions, 0);
    const totalCaseNotesSubmitted = filteredPros.reduce((s, p) => s + p.caseNotesSubmitted, 0);
    const totalAppointments = filteredPros.reduce((s, p) => s + p.totalAppointments, 0);
    const totalExcessive = filteredPros.filter((p) => p.excessiveSessions > 0).length;
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
      avgTfStandard: avgTfStandard.toFixed(0),
    };
  }, [filteredPros]);

  const paginatedPros = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPros.slice(start, start + pageSize);
  }, [filteredPros, page, pageSize]);

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

  const openExcessiveAll = () => {
    setExcessiveModal({
      title: "All Excessive Sessions",
      rows: professionals
        .filter((p) => p.excessiveSessions > 0)
        .map((p) => ({ professionalName: p.name, professionalId: tfpIdToProId(p.id), excessiveSessions: p.excessiveSessions })),
    });
  };

  const openExcessivePro = (p: (typeof professionals)[0]) => {
    setExcessiveModal({
      title: `Excessive Sessions — ${p.name}`,
      rows: [{ professionalName: p.name, professionalId: tfpIdToProId(p.id), excessiveSessions: p.excessiveSessions }],
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Quality by Professional</h2>
          <p className="text-xs text-muted-foreground">{formatPeriodLabel(period)}</p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Header summary metrics — 2 rows × 5 cols at lg */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard title="Active Professionals" value={headerMetrics.total} icon={<Users className="h-5 w-5" />} trend="+2%" trendDirection="up" />
        <KpiCard title="ThoughtFull Standard" value={headerMetrics.avgTfStandard} icon={<CheckCircle className="h-5 w-5" />} trend="+5%" trendDirection="up" />
        <KpiCard title="SLA Performance" value={`${headerMetrics.avgSla}%`} icon={<Zap className="h-5 w-5" />} trend="-1.2%" trendDirection="down" />
        <KpiCard title="Avg Response Time" value={`${headerMetrics.avgResponseTime} hrs`} icon={<Clock className="h-5 w-5" />} trend="-0.5h" trendDirection="up" />
        <KpiCard title="AI Rating" value={headerMetrics.avgAiRating} icon={<Sparkles className="h-5 w-5" />} badge="Stable" />
        <KpiCard title="Client Rating" value={headerMetrics.avgClientRating} icon={<Star className="h-5 w-5" />} trend="+0.2" trendDirection="up" />
        <KpiCard title="Missed/Late Sessions" value={headerMetrics.totalMissedLate} icon={<Calendar className="h-5 w-5" />} badge="Monthly Total" clickable onClick={openMissedLateAll} />
        <KpiCard
          title="Case Notes Filed"
          value={`${headerMetrics.totalCaseNotesSubmitted} / ${headerMetrics.totalAppointments}`}
          icon={<FileText className="h-5 w-5" />}
          progress={{ current: headerMetrics.totalCaseNotesSubmitted, total: headerMetrics.totalAppointments }}
          clickable
          onClick={openCaseNotesAll}
        />
        <KpiCard title="Excessive Sessions" value={headerMetrics.totalExcessive} icon={<AlertTriangle className="h-5 w-5" />} badge={headerMetrics.totalExcessive === 0 ? "CLEAR" : undefined} clickable onClick={openExcessiveAll} />
      </div>

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
                    <TableHead className="text-right">SLA %</TableHead>
                    <TableHead className="text-right">Avg Response</TableHead>
                    <TableHead className="text-right">Chat Score</TableHead>
                    <TableHead className="text-right">AI Rating</TableHead>
                    <TableHead className="text-right">Client Rating</TableHead>
                    <TableHead className="text-center">Missed / Late</TableHead>
                    <TableHead className="text-center">Excessive</TableHead>
                    <TableHead className="text-center">Case Notes</TableHead>
                    <TableHead className="text-right">DASS Avg</TableHead>
                    <TableHead className="text-right">ThoughtFull Standard</TableHead>
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
                          className="tabular-nums text-sm text-primary hover:underline"
                          onClick={(e) => { e.preventDefault(); openMissedLatePro(p); }}
                          disabled={p.missedLateSessions === 0}
                        >
                          {p.missedLateSessions > 0 ? `${p.missedSessions} / ${p.lateSessions}` : "0"}
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          className={cn("tabular-nums text-sm", p.excessiveSessions > 0 ? "text-destructive font-medium hover:underline" : "text-muted-foreground")}
                          onClick={(e) => { e.preventDefault(); openExcessivePro(p); }}
                          disabled={p.excessiveSessions === 0}
                        >
                          {p.excessiveSessions}
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
                      <TableCell colSpan={11} className="py-8 text-center text-sm text-muted-foreground">No professionals found.</TableCell>
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
                  className="flex cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-md"
                  onClick={() => router.push(`/pro360/${p.id}`)}
                >
                  <CardContent className="relative flex flex-1 flex-col gap-3 p-5">
                    {/* TF Standard badge — top right */}
                    <button
                      className="absolute right-4 top-4 shrink-0 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-base font-semibold tabular-nums text-primary hover:bg-primary/10"
                      onClick={(e) => { e.stopPropagation(); setTfStandardModal({ name: p.name, id: p.id, score: p.thoughtfullStandard }); }}
                    >
                      {p.thoughtfullStandard}
                      <span className="ml-1 text-[9px] font-normal text-muted-foreground">TF Std</span>
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
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 rounded-lg bg-muted/40 px-3 py-2.5 text-xs">
                      <div><span className="text-muted-foreground">SLA</span> <span className="font-medium text-foreground tabular-nums">{p.responseRate24h}%</span></div>
                      <div><span className="text-muted-foreground">Response</span> <span className="font-medium text-foreground tabular-nums">{p.avgServiceResponseHours}h</span></div>
                      <div><span className="text-muted-foreground">Chat</span> <span className="font-medium text-foreground tabular-nums">{p.tfpChatScore}</span></div>
                      <div><span className="text-muted-foreground">AI</span> <span className="font-medium text-foreground tabular-nums">{p.aiRatingAvg}</span></div>
                      <div><span className="text-muted-foreground">Client</span> <span className="font-medium text-foreground tabular-nums">{p.clientRatingAvg}</span></div>
                      <div><span className="text-muted-foreground">DASS</span> <span className="font-medium text-foreground tabular-nums">{p.dassScoreAvg}</span></div>
                    </div>

                    {/* Action pills */}
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <button
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs tabular-nums",
                          p.missedLateSessions > 0 ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300" : "border-border text-muted-foreground"
                        )}
                        disabled={p.missedLateSessions === 0}
                        onClick={(e) => { e.stopPropagation(); openMissedLatePro(p); }}
                      >
                        Missed/Late <span className="font-medium">{p.missedSessions}/{p.lateSessions}</span>
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs tabular-nums text-primary hover:bg-muted/50"
                        onClick={(e) => { e.stopPropagation(); openCaseNotesPro(p); }}
                      >
                        Case Notes <span className="font-medium">{p.caseNotesSubmitted}/{p.totalAppointments}</span>
                      </button>
                      <button
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs tabular-nums",
                          p.excessiveSessions > 0 ? "border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300" : "border-border text-muted-foreground"
                        )}
                        disabled={p.excessiveSessions === 0}
                        onClick={(e) => { e.stopPropagation(); openExcessivePro(p); }}
                      >
                        Excessive <span className="font-medium">{p.excessiveSessions}</span>
                      </button>
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
                <div key={r.professionalId} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.professionalName}</p>
                      <p className="text-xs text-muted-foreground">ID: {r.professionalId}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs shrink-0">{r.excessiveSessions} sessions</Badge>
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
        <div key={c.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <span className="text-sm text-foreground">{c.label}</span>
          <span className="tabular-nums text-sm font-semibold text-foreground">{c.score}</span>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground italic">
        Component breakdown is a placeholder and will be refined.
      </p>
    </div>
  );
}
