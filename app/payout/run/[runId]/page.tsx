"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import { monthlyReports } from "@/lib/mock/payout";
import {
  getRunIdToMonthYear,
  mockTFPRows,
  mockHotlineRows,
  mockExceptions,
  mockHotlineShifts,
  computeRunKPIs,
  type RunStatus,
  type TFPProfessionalRow,
  type HotlineRow,
} from "@/lib/mock/payoutRun";
import { ChevronRight, Play, Search, X, Check, Download, Save, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs } from "@/components/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TablePagination } from "@/components/TablePagination";

const DRAFT_STORAGE_KEY = "payout-run-draft";
type TFPOverrides = Record<string, { status?: string; reviewer?: string | null; note?: string }>;
type HotlineOverrides = Record<string, { status?: string; reviewer?: string | null; note?: string }>;
interface DraftState {
  runStatus: RunStatus;
  currentStep: number;
  tfpOverrides: TFPOverrides;
  hotlineOverrides: HotlineOverrides;
}

const STEPS = [
  { id: 1, label: "Review TFP Sheet" },
  { id: 2, label: "Review Hotline Ops Sheet" },
  { id: 3, label: "Exceptions & Reconciliation" },
  { id: 4, label: "Finalize" },
];

export default function PayoutRunPage() {
  const params = useParams();
  const runId = (params.runId as string) ?? "";
  const monthLabel = getRunIdToMonthYear(runId);
  const report = useMemo(() => monthlyReports.find((r) => (r as { runId?: string }).runId === runId), [runId]);

  const draftKey = `${DRAFT_STORAGE_KEY}-${runId}`;

  const [runStatus, setRunStatus] = useState<RunStatus>("Not started");
  const [currentStep, setCurrentStep] = useState(1);
  const [tfpOverrides, setTfpOverrides] = useState<TFPOverrides>({});
  const [hotlineOverrides, setHotlineOverrides] = useState<HotlineOverrides>({});
  const [selectedTfpIds, setSelectedTfpIds] = useState<Set<string>>(new Set());
  const [selectedHotlineIds, setSelectedHotlineIds] = useState<Set<string>>(new Set());
  const [bulkNote, setBulkNote] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!report) return;
    const status = report.status as RunStatus;
    if (status === "Draft") {
      setRunStatus("Draft");
      setCurrentStep(1);
    } else if (status !== "Not started") {
      setRunStatus(status);
      setCurrentStep(4);
    }
  }, [report]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw) as DraftState;
        if (d.runStatus) setRunStatus(d.runStatus);
        if (typeof d.currentStep === "number") setCurrentStep(d.currentStep);
        if (d.tfpOverrides && typeof d.tfpOverrides === "object") setTfpOverrides(d.tfpOverrides);
        if (d.hotlineOverrides && typeof d.hotlineOverrides === "object") setHotlineOverrides(d.hotlineOverrides);
      }
    } catch {
      // ignore
    }
  }, [draftKey]);

  const saveDraft = useCallback(() => {
    const state: DraftState = {
      runStatus,
      currentStep,
      tfpOverrides,
      hotlineOverrides,
    };
    try {
      localStorage.setItem(draftKey, JSON.stringify(state));
      setLastSavedAt(Date.now());
    } catch {
      // ignore
    }
  }, [draftKey, runStatus, currentStep, tfpOverrides, hotlineOverrides]);

  useEffect(() => {
    if (runStatus === "Not started") return;
    const t = setTimeout(saveDraft, 2000);
    return () => clearTimeout(t);
  }, [runStatus, currentStep, tfpOverrides, hotlineOverrides, saveDraft]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTFP, setSelectedTFP] = useState<TFPProfessionalRow | null>(null);
  const [selectedHotline, setSelectedHotline] = useState<HotlineRow | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [exceptionsOnly, setExceptionsOnly] = useState(false);
  const [tfpPage, setTfpPage] = useState(1);
  const [tfpPageSize, setTfpPageSize] = useState(10);
  const [hotlinePage, setHotlinePage] = useState(1);
  const [hotlinePageSize, setHotlinePageSize] = useState(10);
  const [exceptionTab, setExceptionTab] = useState("flagged_delta");

  const isDraft = runStatus === "Draft";

  const tfpRowsWithOverrides = useMemo(() => {
    return mockTFPRows.map((r) => {
      const o = tfpOverrides[r.id];
      if (!o) return r;
      return {
        ...r,
        status: (o.status as TFPProfessionalRow["status"]) ?? r.status,
        reviewer: o.reviewer !== undefined ? o.reviewer : r.reviewer,
      };
    });
  }, [tfpOverrides]);

  const hotlineRowsWithOverrides = useMemo(() => {
    return mockHotlineRows.map((r) => {
      const o = hotlineOverrides[r.id];
      if (!o) return r;
      return {
        ...r,
        status: (o.status as HotlineRow["status"]) ?? r.status,
      };
    });
  }, [hotlineOverrides]);

  const kpis = useMemo(() => computeRunKPIs(tfpRowsWithOverrides), [tfpRowsWithOverrides]);

  const filteredTFPRows = useMemo(() => {
    let list = tfpRowsWithOverrides;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.country.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    return list;
  }, [tfpRowsWithOverrides, search, statusFilter]);

  const paginatedTFPRows = useMemo(() => {
    const start = (tfpPage - 1) * tfpPageSize;
    return filteredTFPRows.slice(start, start + tfpPageSize);
  }, [filteredTFPRows, tfpPage, tfpPageSize]);

  const paginatedHotlineRows = useMemo(() => {
    const start = (hotlinePage - 1) * hotlinePageSize;
    return hotlineRowsWithOverrides.slice(start, start + hotlinePageSize);
  }, [hotlineRowsWithOverrides, hotlinePage, hotlinePageSize]);

  const toggleTfpSelection = (id: string) => {
    setSelectedTfpIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleHotlineSelection = (id: string) => {
    setSelectedHotlineIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAllTfpOnPage = () => {
    const ids = paginatedTFPRows.map((r) => r.id);
    setSelectedTfpIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };
  const selectAllHotlineOnPage = () => {
    const ids = paginatedHotlineRows.map((r) => r.id);
    setSelectedHotlineIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const bulkAssignReviewerTfp = (reviewer: string) => {
    const rev = reviewer === "none" ? null : reviewer;
    setTfpOverrides((prev) => {
      const next = { ...prev };
      selectedTfpIds.forEach((id) => {
        next[id] = { ...next[id], reviewer: rev };
      });
      return next;
    });
    setSelectedTfpIds(new Set());
  };
  const bulkSetStatusTfp = (status: string) => {
    setTfpOverrides((prev) => {
      const next = { ...prev };
      selectedTfpIds.forEach((id) => {
        next[id] = { ...next[id], status };
      });
      return next;
    });
    setSelectedTfpIds(new Set());
  };
  const bulkAddNoteTfp = () => {
    if (!bulkNote.trim()) return;
    setTfpOverrides((prev) => {
      const next = { ...prev };
      selectedTfpIds.forEach((id) => {
        next[id] = { ...next[id], note: bulkNote };
      });
      return next;
    });
    setBulkNote("");
    setSelectedTfpIds(new Set());
  };
  const bulkAssignReviewerHotline = (reviewer: string) => {
    const rev = reviewer === "none" ? null : reviewer;
    setHotlineOverrides((prev) => {
      const next = { ...prev };
      selectedHotlineIds.forEach((id) => {
        next[id] = { ...next[id], reviewer: rev };
      });
      return next;
    });
    setSelectedHotlineIds(new Set());
  };
  const bulkSetStatusHotline = (status: string) => {
    setHotlineOverrides((prev) => {
      const next = { ...prev };
      selectedHotlineIds.forEach((id) => {
        next[id] = { ...next[id], status };
      });
      return next;
    });
    setSelectedHotlineIds(new Set());
  };

  const handleGenerate = () => {
    setRunStatus("Draft");
    setCurrentStep(1);
  };

  const openDrawerTFP = (row: TFPProfessionalRow) => {
    setSelectedTFP(row);
    setSelectedHotline(null);
    setDrawerOpen(true);
  };
  const openDrawerHotline = (row: HotlineRow) => {
    setSelectedHotline(row);
    setSelectedTFP(null);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Payout Dashboard — {monthLabel}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Run status: <Badge variant={isDraft ? "secondary" : "outline"}>{runStatus}</Badge>
            {lastSavedAt != null && (
              <span className="ml-2 text-muted-foreground">· Last saved {new Date(lastSavedAt).toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentStep >= 1 && runStatus === "Draft" && (
            <Button variant="outline" onClick={saveDraft}>
              <Save className="h-4 w-4" />
              Save as draft
            </Button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <nav className="flex flex-wrap items-center gap-2 border-b border-border pb-6">
          {STEPS.map((step, i) => (
            <span key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => (step.id <= currentStep || isDraft ? setCurrentStep(step.id) : undefined)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : step.id < currentStep
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {step.id < currentStep && <Check className="h-4 w-4" />}
                {step.label}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </span>
          ))}
      </nav>

      {/* Step 1 — Review TFP Sheet */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {runStatus === "Not started" && (
            <Card>
              <CardContent className="pt-6 pb-6">
                <p className="text-sm text-muted-foreground">
                  Generate pulls and compiles data sources for this month into a reviewable payout sheet to start review.
                </p>
                <Button className="mt-4" onClick={handleGenerate}>
                  <Play className="h-4 w-4" />
                  Generate
                </Button>
              </CardContent>
            </Card>
          )}
          {runStatus !== "Not started" && (
            <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">Total payout (USD equiv)</p>
                <p className="text-lg font-semibold">${kpis.totalPayoutUsd}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground"># professionals</p>
                <p className="text-lg font-semibold">{kpis.professionalCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground"># flagged</p>
                <p className="text-lg font-semibold">{kpis.flagged}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground"># holds</p>
                <p className="text-lg font-semibold">{kpis.holds}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground"># too small</p>
                <p className="text-lg font-semibold">{kpis.tooSmall}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground"># unclaimed</p>
                <p className="text-lg font-semibold">{kpis.unclaimed}</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="Ready">Ready</option>
              <option value="Flagged">Flagged</option>
              <option value="Hold">Hold</option>
              <option value="Too small">Too small</option>
              <option value="Unclaimed">Unclaimed</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={exceptionsOnly} onChange={(e) => setExceptionsOnly(e.target.checked)} className="rounded" />
              Exceptions only
            </label>
          </div>
          {selectedTfpIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/30 px-4 py-3 shadow-card">
              <span className="text-sm font-medium">{selectedTfpIds.size} selected</span>
              <Select onValueChange={bulkAssignReviewerTfp}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Assign reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No reviewer</SelectItem>
                  <SelectItem value="Sarah Lee">Sarah Lee</SelectItem>
                  <SelectItem value="Anton Kraskov">Anton Kraskov</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={() => bulkSetStatusTfp("Ready")}>Mark Ready</Button>
              <Button size="sm" variant="outline" onClick={() => bulkSetStatusTfp("Hold")}>Hold</Button>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add note..."
                  className="h-8 w-[160px]"
                  value={bulkNote}
                  onChange={(e) => setBulkNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && bulkAddNoteTfp()}
                />
                <Button size="sm" variant="outline" onClick={bulkAddNoteTfp}>
                  <MessageSquare className="h-4 w-4" />
                  Add note
                </Button>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedTfpIds(new Set())}>Clear</Button>
            </div>
          )}
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={paginatedTFPRows.length > 0 && paginatedTFPRows.every((r) => selectedTfpIds.has(r.id))}
                        onChange={() => paginatedTFPRows.every((r) => selectedTfpIds.has(r.id)) ? setSelectedTfpIds((p) => { const n = new Set(p); paginatedTFPRows.forEach((r) => n.delete(r.id)); return n; }) : selectAllTfpOnPage()}
                        aria-label="Select all on page"
                      />
                    </TableHead>
                    <TableHead>Professional</TableHead>
                    <TableHead>Chat</TableHead>
                    <TableHead>Therapy</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Events / Leadership</TableHead>
                    <TableHead>Bonuses / Recon</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTFPRows.map((r) => (
                    <TableRow
                      key={r.id}
                      className={cn("cursor-pointer hover:bg-muted/50", selectedTfpIds.has(r.id) && "bg-muted/50")}
                      onClick={() => openDrawerTFP(r)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedTfpIds.has(r.id)}
                          onChange={() => toggleTfpSelection(r.id)}
                          aria-label={`Select ${r.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.country}</p>
                          <div className="mt-1 flex gap-1">
                            {r.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {r.chat.tfpTime}h / {r.chat.clientTime}h · ${r.chat.earnings}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {r.therapy.videoCount}v {r.therapy.f2fCount}f · ${r.therapy.earnings}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {r.referrals.tfpReferral}/{r.referrals.userReferral} · ${r.referrals.earnings}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {r.eventsEngagements.clinicalEvents}+{r.eventsEngagements.csEngagements} · ${r.eventsEngagements.earnings + r.leadership.podLeaderEarnings + r.leadership.otLdpEarnings}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        ${r.bonuses.languageBonus + r.bonuses.otherAdjustments} / ${r.reconciliation}
                      </TableCell>
                      <TableCell className="text-right font-medium">${r.total}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "Ready" ? "default" : r.status === "Flagged" ? "destructive" : "secondary"}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.reviewer ?? "—"}</TableCell>
                      <TableCell>
                        <button type="button" className="rounded p-1 hover:bg-muted" aria-label="Actions">⋯</button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              total={filteredTFPRows.length}
              page={tfpPage}
              pageSize={tfpPageSize}
              onPageChange={(p) => { setTfpPage(p); }}
              onPageSizeChange={(s) => { setTfpPageSize(s); setTfpPage(1); }}
            />
          </Card>
            </>
          )}
        </div>
      )}

      {/* Step 2 — Review Hotline Ops Sheet */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {selectedHotlineIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/30 px-4 py-3 shadow-card">
              <span className="text-sm font-medium">{selectedHotlineIds.size} selected</span>
              <Select onValueChange={bulkAssignReviewerHotline}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Assign reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No reviewer</SelectItem>
                  <SelectItem value="Sarah Lee">Sarah Lee</SelectItem>
                  <SelectItem value="Anton Kraskov">Anton Kraskov</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={() => bulkSetStatusHotline("Ready")}>Mark Ready</Button>
              <Button size="sm" variant="outline" onClick={() => bulkSetStatusHotline("Hold")}>Hold</Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedHotlineIds(new Set())}>Clear</Button>
            </div>
          )}
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={paginatedHotlineRows.length > 0 && paginatedHotlineRows.every((r) => selectedHotlineIds.has(r.id))}
                        onChange={() => paginatedHotlineRows.every((r) => selectedHotlineIds.has(r.id)) ? setSelectedHotlineIds((p) => { const n = new Set(p); paginatedHotlineRows.forEach((r) => n.delete(r.id)); return n; }) : selectAllHotlineOnPage()}
                        aria-label="Select all on page"
                      />
                    </TableHead>
                    <TableHead>Professional</TableHead>
                    <TableHead>Hotline activity</TableHead>
                    <TableHead>Rate / adjustments</TableHead>
                    <TableHead className="text-right">Hotline total pay</TableHead>
                    <TableHead>Validation flags</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHotlineRows.map((r) => (
                    <TableRow key={r.id} className={cn("cursor-pointer hover:bg-muted/50", selectedHotlineIds.has(r.id) && "bg-muted/50")} onClick={() => openDrawerHotline(r)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedHotlineIds.has(r.id)}
                          onChange={() => toggleHotlineSelection(r.id)}
                          aria-label={`Select ${r.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.country}</p>
                          <div className="mt-1 flex gap-1">
                            {r.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{r.shiftHours}h · {r.sessionsHandled} sessions</TableCell>
                      <TableCell className="text-muted-foreground">{r.rateNote}</TableCell>
                      <TableCell className="text-right font-medium">${r.hotlineTotalPay}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.validationFlags.join(", ") || "—"}</TableCell>
                      <TableCell><Badge variant={r.status === "Ready" ? "default" : "destructive"}>{r.status}</Badge></TableCell>
                      <TableCell><button type="button" className="rounded p-1 hover:bg-muted" aria-label="Actions">⋯</button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              total={hotlineRowsWithOverrides.length}
              page={hotlinePage}
              pageSize={hotlinePageSize}
              onPageChange={(p) => setHotlinePage(p)}
              onPageSizeChange={(s) => { setHotlinePageSize(s); setHotlinePage(1); }}
            />
          </Card>
        </div>
      )}

      {/* Step 3 — Exceptions (tabs) */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Exceptions & reconciliation</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                tabs={[
                  { id: "flagged_delta", label: "Flagged deltas" },
                  { id: "too_small", label: "Too small" },
                  { id: "unclaimed", label: "Unclaimed" },
                  { id: "fx_recon", label: "FX" },
                  { id: "failed_payment", label: "Failed payments" },
                ]}
                activeId={exceptionTab}
                onChange={setExceptionTab}
              />
              <div className="mt-4 space-y-3">
                {mockExceptions
                  .filter((e) => e.category === exceptionTab)
                  .map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-lg bg-card p-3 shadow-card">
                      <div>
                        <p className="font-medium">{e.reason}</p>
                        <p className="text-sm text-muted-foreground">{e.professionalName} · {e.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{e.category.replace("_", " ")}</Badge>
                        <Button variant="outline" size="sm">Resolve</Button>
                      </div>
                    </div>
                  ))}
                {mockExceptions.filter((e) => e.category === exceptionTab).length === 0 && (
                  <p className="text-sm text-muted-foreground py-4">No exceptions in this category.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4 — Finalize */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total payout</p><p className="text-xl font-semibold">${kpis.totalPayoutUsd}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Ready</p><p className="text-xl font-semibold">{tfpRowsWithOverrides.filter((r) => r.status === "Ready").length}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Holds</p><p className="text-xl font-semibold">{kpis.holds}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Carryovers</p><p className="text-xl font-semibold">0</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Unclaimed</p><p className="text-xl font-semibold">{kpis.unclaimed}</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2">✓ All Flagged reviewed</p>
              <p className="flex items-center gap-2">✓ All Exceptions resolved or held</p>
              <p className="flex items-center gap-2">✓ Hotline review completed</p>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setRunStatus("Approved")}>
              <Check className="h-4 w-4" />
              Approve payout run
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export for finance
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Key actions during review will appear here.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Right drawer with slide-in animation */}
      {drawerOpen && (selectedTFP || selectedHotline) && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-200"
            aria-hidden
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-border/50 bg-card shadow-panel animate-in slide-in-from-right duration-300 ease-out"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border/50 bg-card p-4">
              <h2 className="font-semibold">{selectedTFP?.name ?? selectedHotline?.name}</h2>
              <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {selectedTFP && (
                <>
                  {selectedTFP.status === "Flagged" && (
                    <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">AI recommendation — review</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Why flagged</p>
                          <p className="text-foreground">
                            Potential anomaly: month-over-month payout spike exceeds threshold. Possible data entry issue or one-off bonus; low risk of fraud but worth confirming.
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">What to do next</p>
                          <ul className="list-disc list-inside space-y-1 text-foreground">
                            <li>Confirm with professional or source data; if valid, mark Ready.</li>
                            <li>If under review or disputed, set Hold or Request info.</li>
                            <li>Optionally assign a reviewer for follow-up.</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">TFP+ performance</p>
                    <Badge variant={selectedTFP.tfpPlusQualified ? "default" : "secondary"}>
                      {selectedTFP.tfpPlusQualified ? "Qualified" : "Not qualified"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Earnings breakdown</p>
                    <ul className="space-y-1 text-sm">
                      <li>Chat: ${selectedTFP.chat.earnings}</li>
                      <li>Therapy: ${selectedTFP.therapy.earnings}</li>
                      <li>Referrals: ${selectedTFP.referrals.earnings}</li>
                      <li>Events/CS: ${selectedTFP.eventsEngagements.earnings}</li>
                      <li>Leadership: ${selectedTFP.leadership.podLeaderEarnings + selectedTFP.leadership.otLdpEarnings}</li>
                      <li>Bonuses: ${selectedTFP.bonuses.languageBonus + selectedTFP.bonuses.otherAdjustments}</li>
                      <li>Reconciliation: ${selectedTFP.reconciliation}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                    <Input placeholder="Add note..." className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Your review</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm">Mark Ready</Button>
                      <Button size="sm" variant="outline">Hold</Button>
                      <Button size="sm" variant="outline">Request info</Button>
                      <Button size="sm" variant="outline">Assign reviewer</Button>
                    </div>
                  </div>
                </>
              )}
              {selectedHotline && (
                <>
                  {selectedHotline.status === "Flagged" && (
                    <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">AI recommendation — review</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Why flagged</p>
                          <p className="text-foreground">
                            {selectedHotline.validationFlags?.length
                              ? `Validation issue: ${selectedHotline.validationFlags.join("; ")}. Shift data may be incomplete or need correction.`
                              : "Anomaly detected in shift hours or session count; recommend verifying with source system."}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">What to do next</p>
                          <ul className="list-disc list-inside space-y-1 text-foreground">
                            <li>Confirm check-in/check-out and duration; if correct, mark Ready.</li>
                            <li>If data is wrong or pending, set Hold and add a note.</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Validation checklist</p>
                    <ul className="space-y-2 text-sm">
                      <li className={cn("flex items-center gap-2", selectedHotline.validationFlags.length === 0 && "text-emerald-600 dark:text-emerald-400")}>
                        {selectedHotline.validationFlags.includes("Missing check-in") ? (
                          <span className="text-destructive">✗</span>
                        ) : (
                          <Check className="h-4 w-4 text-emerald-600" />
                        )}
                        Check-in present
                      </li>
                      <li className={cn("flex items-center gap-2", !selectedHotline.validationFlags.some((f) => f.toLowerCase().includes("check-out")) && "text-emerald-600 dark:text-emerald-400")}>
                        {selectedHotline.validationFlags.some((f) => f.toLowerCase().includes("check-out")) ? (
                          <span className="text-destructive">✗</span>
                        ) : (
                          <Check className="h-4 w-4 text-emerald-600" />
                        )}
                        Check-out present
                      </li>
                      <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-4 w-4" />
                        Duration reasonable (1–12h per shift)
                      </li>
                      {selectedHotline.validationFlags.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                          <span className="text-destructive">!</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Shift list</p>
                    <div className="rounded-md overflow-hidden shadow-card">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Date</TableHead>
                            <TableHead className="text-xs">Check-in</TableHead>
                            <TableHead className="text-xs">Check-out</TableHead>
                            <TableHead className="text-xs">Duration</TableHead>
                            <TableHead className="text-xs">Sessions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(mockHotlineShifts[selectedHotline.professionalId] ?? []).map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="text-xs">{s.date}</TableCell>
                              <TableCell className="text-xs">{s.checkIn}</TableCell>
                              <TableCell className="text-xs">{s.checkOut}</TableCell>
                              <TableCell className="text-xs">{s.durationHours}h</TableCell>
                              <TableCell className="text-xs">{s.sessionsHandled}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {(mockHotlineShifts[selectedHotline.professionalId] ?? []).length === 0 && (
                      <p className="text-sm text-muted-foreground py-2">No shifts recorded.</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                    <Input placeholder="Add note..." className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Your review</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm">Mark Ready</Button>
                      <Button size="sm" variant="outline">Hold</Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
