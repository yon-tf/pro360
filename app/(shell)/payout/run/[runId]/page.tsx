"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { monthlyReports } from "@/features/payout/mock/payout";
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
} from "@/features/payout/mock/payoutRun";
import {
  ChevronRight, ChevronLeft, Play, Search, X, Check, Download, Save, MessageSquare,
  CheckCircle, CheckCircleBold, AlertTriangle, Send, Users, MoreHorizontal, FileText,
  MenuDotsCircle,
} from "@/components/ui/solar-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs } from "@/components/Tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { TablePagination } from "@/components/TablePagination";

const DRAFT_STORAGE_KEY = "payout-run-draft";
type TFPOverrides = Record<string, { status?: string; reviewer?: string | null; note?: string }>;
type HotlineOverrides = Record<string, { status?: string; reviewer?: string | null; note?: string }>;
type AuditEvent = {
  id: string;
  ts: number;
  actor: string;
  title: string;
  detail?: string;
};
interface DraftState {
  runStatus: RunStatus;
  currentStep: number;
  tfpOverrides: TFPOverrides;
  hotlineOverrides: HotlineOverrides;
  exceptionOverrides?: Record<string, "Resolved">;
}

const STEPS = [
  { id: 1, label: "Review" },
  { id: 2, label: "Exceptions" },
  { id: 3, label: "Approve" },
];

const ACTIVITY_SOURCES = [
  { key: "video", label: "Video sessions processed" },
  { key: "chat", label: "Chat hours calculated" },
  { key: "gig", label: "Activation gigs detected" },
  { key: "claims", label: "Claims validated" },
  { key: "incentives", label: "Incentives applied" },
] as const;

export default function PayoutRunPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const runId = (params.runId as string) ?? "";
  const fromGenerate = searchParams.get("generate") === "1";
  const monthLabel = getRunIdToMonthYear(runId);
  const report = useMemo(() => monthlyReports.find((r) => (r as { runId?: string }).runId === runId), [runId]);

  const draftKey = `${DRAFT_STORAGE_KEY}-${runId}`;

  // ── Wizard state ────────────────────────────────────────────────────────────
  const [runStatus, setRunStatus] = useState<RunStatus>("Not started");
  const [currentStep, setCurrentStep] = useState(1); // 1=Review, 2=Exceptions, 3=Approve
  const [tfpOverrides, setTfpOverrides] = useState<TFPOverrides>({});
  const [hotlineOverrides, setHotlineOverrides] = useState<HotlineOverrides>({});
  const [selectedTfpIds, setSelectedTfpIds] = useState<Set<string>>(new Set());
  const [selectedHotlineIds, setSelectedHotlineIds] = useState<Set<string>>(new Set());
  const [bulkNote, setBulkNote] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [draftSheetTab, setDraftSheetTab] = useState("tfp");

  // Generate loading state (activity detection)
  const [detectedSources, setDetectedSources] = useState<Set<string>>(new Set());
  const [detectionDone, setDetectionDone] = useState(false);
  const detectionStartedRef = useRef(false);

  // Step 3 — table filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [exceptionsOnly, setExceptionsOnly] = useState(false);
  const [tfpPage, setTfpPage] = useState(1);
  const [tfpPageSize, setTfpPageSize] = useState(10);
  const [hotlinePage, setHotlinePage] = useState(1);
  const [hotlinePageSize, setHotlinePageSize] = useState(10);

  // Step 2 — exceptions: priority tab + category chip + overrides
  const [exceptionTab, setExceptionTab] = useState<"blocking" | "warnings" | "resolved" | "all">("blocking");
  const [exceptionCategory, setExceptionCategory] = useState<string | null>(null);
  const [exceptionOverrides, setExceptionOverrides] = useState<Record<string, "Resolved">>({});

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTFP, setSelectedTFP] = useState<TFPProfessionalRow | null>(null);
  const [selectedHotline, setSelectedHotline] = useState<HotlineRow | null>(null);

  // Phase 5: Activity audit secondary drawer (layers above receipt drawer)
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [activityDrawerSource, setActivityDrawerSource] = useState<"sessions" | "events" | "claims" | "chat" | null>(null);

  // Receipt drawer: fee overrides and reasons (keyed by professional id)
  type ReceiptFeeKey = "activity" | "chat" | "events" | "bonuses";
  const [receiptOverrides, setReceiptOverrides] = useState<Record<string, Partial<Record<ReceiptFeeKey, number>>>>({});
  const [receiptReasons, setReceiptReasons] = useState<Record<string, Partial<Record<ReceiptFeeKey, string>>>>({});
  const [receiptOverridesSaved, setReceiptOverridesSaved] = useState<Record<string, Partial<Record<ReceiptFeeKey, number>>>>({});
  const [receiptReasonsSaved, setReceiptReasonsSaved] = useState<Record<string, Partial<Record<ReceiptFeeKey, string>>>>({});
  const [receiptManualBonusEnabled, setReceiptManualBonusEnabled] = useState<Record<string, boolean>>({});
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  // ── Restore from report status (skip when coming from Generate button) ─────────
  useEffect(() => {
    if (fromGenerate) return;
    if (!report) return;
    const status = report.status as RunStatus;
    if (status === "Draft") {
      setRunStatus("Draft");
      setCurrentStep(1);
    } else if (status !== "Not started") {
      setRunStatus(status as RunStatus);
      setCurrentStep(3);
    }
  }, [report, fromGenerate]);

  // ── Restore from localStorage (skip when coming from Generate button) ─────────
  useEffect(() => {
    if (fromGenerate) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw) as DraftState;
        if (d.runStatus) setRunStatus(d.runStatus);
        if (typeof d.currentStep === "number") setCurrentStep(d.currentStep);
        if (d.tfpOverrides && typeof d.tfpOverrides === "object") setTfpOverrides(d.tfpOverrides);
        if (d.hotlineOverrides && typeof d.hotlineOverrides === "object") setHotlineOverrides(d.hotlineOverrides);
        if (d.exceptionOverrides && typeof d.exceptionOverrides === "object") setExceptionOverrides(d.exceptionOverrides);
      }
    } catch { /* ignore */ }
  }, [draftKey, fromGenerate]);

  const saveDraft = useCallback(() => {
    const state: DraftState = { runStatus, currentStep, tfpOverrides, hotlineOverrides, exceptionOverrides };
    try {
      localStorage.setItem(draftKey, JSON.stringify(state));
      setLastSavedAt(Date.now());
    } catch { /* ignore */ }
  }, [draftKey, runStatus, currentStep, tfpOverrides, hotlineOverrides, exceptionOverrides]);

  useEffect(() => {
    if (runStatus === "Not started") return;
    const t = setTimeout(saveDraft, 2000);
    return () => clearTimeout(t);
  }, [runStatus, currentStep, tfpOverrides, hotlineOverrides, exceptionOverrides, saveDraft]);

  // ── Activity detection simulation (Phase 2: loading state) ────────────────────
  useEffect(() => {
    if (runStatus !== "Not started" || detectionStartedRef.current) return;
    detectionStartedRef.current = true;
    setDetectedSources(new Set());
    setDetectionDone(false);
    ACTIVITY_SOURCES.forEach(({ key }, i) => {
      setTimeout(() => {
        setDetectedSources((prev) => new Set([...prev, key]));
        if (i === ACTIVITY_SOURCES.length - 1) {
          setTimeout(() => {
            setDetectionDone(true);
            setRunStatus("Draft");
            setCurrentStep(1);
            if (fromGenerate) router.replace(`/payout/run/${runId}`, { scroll: false });
          }, 400);
        }
      }, (i + 1) * 600);
    });
  }, [runStatus, fromGenerate, router, runId]);

  // ── Derived state ────────────────────────────────────────────────────────────
  const isDraft = runStatus === "Draft" || runStatus === "In review";
  const currentActor = "You";
  const formatCurrency = useCallback(
    (value: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value),
    []
  );
  const logAuditEvent = useCallback((event: Omit<AuditEvent, "id">) => {
    setAuditEvents((prev) => [{ ...event, id: `${event.ts}-${prev.length}` }, ...prev]);
  }, []);

  const updateReceiptOverride = useCallback((pid: string, key: ReceiptFeeKey, value: number) => {
    setReceiptOverrides((prev) => {
      const prevValue = prev[pid]?.[key];
      if (prevValue === value) return prev;
      return { ...prev, [pid]: { ...prev[pid], [key]: value } };
    });
  }, []);


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
      return { ...r, status: (o.status as HotlineRow["status"]) ?? r.status };
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
    if (exceptionsOnly) list = list.filter((r) => r.status !== "Ready");
    return list;
  }, [tfpRowsWithOverrides, search, statusFilter, exceptionsOnly]);

  const paginatedTFPRows = useMemo(() => {
    const start = (tfpPage - 1) * tfpPageSize;
    return filteredTFPRows.slice(start, start + tfpPageSize);
  }, [filteredTFPRows, tfpPage, tfpPageSize]);

  const paginatedHotlineRows = useMemo(() => {
    const start = (hotlinePage - 1) * hotlinePageSize;
    return hotlineRowsWithOverrides.slice(start, start + hotlinePageSize);
  }, [hotlineRowsWithOverrides, hotlinePage, hotlinePageSize]);

  // ── Bulk actions ─────────────────────────────────────────────────────────────
  const toggleTfpSelection = (id: string) =>
    setSelectedTfpIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleHotlineSelection = (id: string) =>
    setSelectedHotlineIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAllTfpOnPage = () => setSelectedTfpIds((p) => { const n = new Set(p); paginatedTFPRows.forEach((r) => n.add(r.id)); return n; });
  const selectAllHotlineOnPage = () => setSelectedHotlineIds((p) => { const n = new Set(p); paginatedHotlineRows.forEach((r) => n.add(r.id)); return n; });

  const bulkAssignReviewerTfp = (reviewer: string) => {
    const rev = reviewer === "none" ? null : reviewer;
    setTfpOverrides((p) => { const n = { ...p }; selectedTfpIds.forEach((id) => { n[id] = { ...n[id], reviewer: rev }; }); return n; });
    setSelectedTfpIds(new Set());
  };
  const bulkSetStatusTfp = (status: string) => {
    setTfpOverrides((p) => { const n = { ...p }; selectedTfpIds.forEach((id) => { n[id] = { ...n[id], status }; }); return n; });
    setSelectedTfpIds(new Set());
  };
  const bulkAddNoteTfp = () => {
    if (!bulkNote.trim()) return;
    setTfpOverrides((p) => { const n = { ...p }; selectedTfpIds.forEach((id) => { n[id] = { ...n[id], note: bulkNote }; }); return n; });
    setBulkNote("");
    setSelectedTfpIds(new Set());
  };
  const bulkAssignReviewerHotline = (reviewer: string) => {
    const rev = reviewer === "none" ? null : reviewer;
    setHotlineOverrides((p) => { const n = { ...p }; selectedHotlineIds.forEach((id) => { n[id] = { ...n[id], reviewer: rev }; }); return n; });
    setSelectedHotlineIds(new Set());
  };
  const bulkSetStatusHotline = (status: string) => {
    setHotlineOverrides((p) => { const n = { ...p }; selectedHotlineIds.forEach((id) => { n[id] = { ...n[id], status }; }); return n; });
    setSelectedHotlineIds(new Set());
  };

  const openDrawerTFP = (row: TFPProfessionalRow) => { setSelectedTFP(row); setSelectedHotline(null); setDrawerOpen(true); };
  const openDrawerHotline = (row: HotlineRow) => { setSelectedHotline(row); setSelectedTFP(null); setDrawerOpen(true); };

  const showLoading = runStatus === "Not started" && !detectionDone;

  // ── Exceptions helpers ──────────────────────────────────────────────────────
  const EXCEPTION_SEVERITY: Record<string, "Blocking" | "Warning"> = {
    flagged_delta: "Blocking",
    unclaimed: "Blocking",
    failed_payment: "Blocking",
    too_small: "Blocking",
    fx_recon: "Warning",
  };
  const getExceptionSeverity = (cat: string) => EXCEPTION_SEVERITY[cat] ?? "Warning";
  const getExceptionStatus = (e: (typeof mockExceptions)[0]) => exceptionOverrides[e.id] ?? e.status;
  const exceptionsWithOverrides = useMemo(
    () =>
      mockExceptions.map((e) => ({
        ...e,
        effectiveStatus: getExceptionStatus(e),
        severity: getExceptionSeverity(e.category),
      })),
    [exceptionOverrides]
  );
  const blockingExceptions = exceptionsWithOverrides.filter(
    (e) => e.severity === "Blocking" && e.effectiveStatus !== "Resolved"
  );
  const warningExceptions = exceptionsWithOverrides.filter(
    (e) => e.severity === "Warning" && e.effectiveStatus !== "Resolved"
  );
  const resolvedExceptions = exceptionsWithOverrides.filter((e) => e.effectiveStatus === "Resolved");
  const exceptionsResolved = resolvedExceptions.length;
  const exceptionsTotal = mockExceptions.length;
  const blockingExceptionCount = blockingExceptions.length;
  const canContinueToApproval = blockingExceptionCount === 0;

  // Filtered list for current tab + category
  const categoryLabels: Record<string, string> = {
    flagged_delta: "Delta",
    too_small: "Too small",
    unclaimed: "Unclaimed",
    fx_recon: "FX",
    failed_payment: "Failed payments",
  };
  const resolveException = useCallback((e: (typeof exceptionsWithOverrides)[0], actionLabel: string) => {
    if (e.effectiveStatus === "Resolved") return;
    setExceptionOverrides((o) => ({ ...o, [e.id]: "Resolved" }));
    logAuditEvent({
      ts: Date.now(),
      actor: currentActor,
      title: `${actionLabel}: ${categoryLabels[e.category] ?? e.category} — ${e.professionalName}`,
      detail: `${e.effectiveStatus} → Resolved`,
    });
  }, [categoryLabels, currentActor, logAuditEvent, setExceptionOverrides]);
  const filteredExceptions = useMemo(() => {
    let list =
      exceptionTab === "blocking"
        ? blockingExceptions
        : exceptionTab === "warnings"
          ? warningExceptions
          : exceptionTab === "resolved"
            ? resolvedExceptions
            : exceptionsWithOverrides;
    if (exceptionCategory) list = list.filter((e) => e.category === exceptionCategory);
    return list;
  }, [exceptionTab, exceptionCategory, blockingExceptions, warningExceptions, resolvedExceptions, exceptionsWithOverrides]);

  // ── Finalize ─────────────────────────────────────────────────────────────────
  const holdCount = tfpRowsWithOverrides.filter((r) => r.status === "Hold").length;
  const hasBlockingIssues = holdCount > 0 || blockingExceptionCount > 0;
  const canApprove = !hasBlockingIssues;

  // ── Step navigation (Review always; Exceptions when draft; Approve only when blocking = 0) ─
  const canNavigateTo = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return isDraft;
    if (step === 3) return isDraft && canApprove;
    return false;
  };

  const periodLabel = monthLabel;

  return (
    <div className="space-y-8 py-6">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Payout — {monthLabel}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
            Run status: <Badge variant={isDraft ? "secondary" : "outline"}>{runStatus}</Badge>
            {lastSavedAt != null && (
              <span className="text-muted-foreground">· Saved {new Date(lastSavedAt).toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        {!showLoading && currentStep >= 1 && isDraft && (
          <Button variant="outline" onClick={saveDraft}>
            <Save className="h-4 w-4" />
            Save draft
          </Button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE 2 — GENERATING (loading state) — terminal-style, centered
      ══════════════════════════════════════════════════════════════════════ */}
      {showLoading && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="w-full max-w-xl overflow-hidden border-zinc-200 bg-white shadow-xl">
            {/* Terminal title bar */}
            <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 font-mono text-xs text-zinc-500">payout generate</span>
            </div>
            <CardContent className="p-4 font-mono text-sm">
              <div className="space-y-1.5">
                <div className="text-zinc-600">
                  <span className="text-emerald-600">$</span> Generating payout draft…
                </div>
                {ACTIVITY_SOURCES.map(({ key, label }) => {
                  const done = detectedSources.has(key);
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-zinc-500">{done ? "✓" : "○"}</span>
                      <span className={done ? "text-emerald-600" : "text-zinc-500"}>{label}</span>
                      {!done && <span className="animate-pulse text-zinc-400">_</span>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── WORKFLOW STEPPER + ACTION (hidden during loading) ───────────────────── */}
      {!showLoading && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <nav className="flex flex-1 items-center gap-6 sm:gap-8" aria-label="Payout workflow">
              {STEPS.map((step, i) => (
                <span key={step.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => canNavigateTo(step.id) ? setCurrentStep(step.id) : undefined}
                    title={step.id === 3 && !canNavigateTo(step.id) ? "Resolve blocking issues before approval" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[15px] font-medium transition",
                      currentStep === step.id
                        ? "text-primary"
                        : step.id < currentStep
                          ? "text-emerald-600 dark:text-emerald-400 hover:bg-muted"
                          : "text-muted-foreground cursor-default",
                      step.id === 3 && !canNavigateTo(step.id) && "cursor-not-allowed opacity-70",
                    )}
                  >
                    {step.id < currentStep ? (
                      <CheckCircleBold className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    ) : currentStep === step.id ? (
                      <CheckCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                    ) : (
                      <MenuDotsCircle className="h-5 w-5 shrink-0 text-muted-foreground/60" aria-hidden />
                    )}
                    {step.label}
                  </button>
                  {i < STEPS.length - 1 && (
                    <span className="h-px w-6 flex-shrink-0 bg-border sm:w-8" aria-hidden />
                  )}
                </span>
              ))}
            </nav>
            <div className="shrink-0 self-center">
              {currentStep === 1 && (
                <Button onClick={() => setCurrentStep(2)}>
                  Continue to Exceptions
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              {currentStep === 2 && (
                <Button onClick={() => setCurrentStep(3)} disabled={!canContinueToApproval} title={!canContinueToApproval ? "Resolve blocking issues first" : undefined}>
                  Continue to Approval
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              {currentStep === 3 && (
                <Button onClick={() => setRunStatus("Approved")} disabled={!canApprove} title={!canApprove ? "Resolve all blocking issues first" : undefined}>
                  <Check className="h-4 w-4" />
                  Approve payout
                </Button>
              )}
            </div>
          </div>

          {/* Run Summary — compact horizontal metrics */}
          <Card className="shadow-card">
            <CardContent className="py-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span><span className="text-muted-foreground">Professionals</span> <span className="font-semibold text-foreground">{kpis.professionalCount}</span></span>
                <span className="text-muted-foreground/60">|</span>
                <span><span className="text-muted-foreground">Activity records</span> <span className="font-semibold text-foreground">2,140</span></span>
                <span className="text-muted-foreground/60">|</span>
                <span><span className="text-muted-foreground">Total payout</span> <span className="font-semibold text-foreground">${kpis.totalPayoutUsd.toLocaleString()}</span></span>
                <span className="text-muted-foreground/60">|</span>
                <span><span className="text-muted-foreground">Issues detected</span> <span className={cn("font-semibold", kpis.flagged > 0 ? "text-amber-600" : "text-foreground")}>{kpis.flagged}</span></span>
                <span className="text-muted-foreground/60">|</span>
                <span><span className="text-muted-foreground">Confidence</span> <Badge variant={kpis.flagged === 0 ? "default" : kpis.flagged <= 2 ? "secondary" : "destructive"} className="ml-1 text-xs">{kpis.flagged === 0 ? "High" : kpis.flagged <= 2 ? "Medium" : "Low"}</Badge></span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE 3 — REVIEW TABLE (step 1)
      ══════════════════════════════════════════════════════════════════════ */}
      {!showLoading && currentStep === 1 && (
        <div className="space-y-6">
          {/* Sheet sub-tabs */}
          <Tabs
            tabs={[
              { id: "tfp", label: "TFP sheet" },
              { id: "hotline", label: "Hotline Ops sheet" },
            ]}
            activeId={draftSheetTab}
            onChange={setDraftSheetTab}
          />

          {/* ── TFP Sheet ── */}
          {draftSheetTab === "tfp" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search professional…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Flagged">Flagged</SelectItem>
                    <SelectItem value="Hold">Hold</SelectItem>
                    <SelectItem value="Too small">Too small</SelectItem>
                    <SelectItem value="Unclaimed">Unclaimed</SelectItem>
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={exceptionsOnly} onCheckedChange={(v) => setExceptionsOnly(Boolean(v))} />
                  Show issues only
                </label>
              </div>

              {selectedTfpIds.size > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/30 px-4 py-3 shadow-card">
                  <span className="text-sm font-medium">{selectedTfpIds.size} selected</span>
                  <Select onValueChange={bulkAssignReviewerTfp}>
                    <SelectTrigger className="w-[180px] h-8"><SelectValue placeholder="Assign reviewer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— No reviewer</SelectItem>
                      <SelectItem value="Sarah Lee">Sarah Lee</SelectItem>
                      <SelectItem value="Anton Kraskov">Anton Kraskov</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => bulkSetStatusTfp("Ready")}>Mark Ready</Button>
                  <Button size="sm" variant="outline" onClick={() => bulkSetStatusTfp("Hold")}>Hold</Button>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Add note…" className="h-8 w-[160px]" value={bulkNote} onChange={(e) => setBulkNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && bulkAddNoteTfp()} />
                    <Button size="sm" variant="outline" onClick={bulkAddNoteTfp}><MessageSquare className="h-4 w-4" />Add note</Button>
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
                          <Checkbox
                            checked={paginatedTFPRows.length > 0 && paginatedTFPRows.every((r) => selectedTfpIds.has(r.id))}
                            onCheckedChange={() => paginatedTFPRows.every((r) => selectedTfpIds.has(r.id))
                              ? setSelectedTfpIds((p) => { const n = new Set(p); paginatedTFPRows.forEach((r) => n.delete(r.id)); return n; })
                              : selectAllTfpOnPage()
                            }
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>Professional</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Sessions</TableHead>
                        <TableHead className="text-right">Chat hrs</TableHead>
                        <TableHead className="text-right">Gigs</TableHead>
                        <TableHead className="text-right">Claims</TableHead>
                        <TableHead className="text-right">Adjustments</TableHead>
                        <TableHead className="text-right">Total payout</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTFPRows.map((r) => {
                        const sessionsCount = r.therapy.videoCount + r.therapy.f2fCount;
                        const chatHours = r.chat.tfpTime + r.chat.clientTime;
                        const gigsCount = r.eventsEngagements.clinicalEvents;
                        const adjustments = r.bonuses.otherAdjustments + r.reconciliation;
                        const statusLabel = r.status === "Ready" ? "OK" : r.status === "Flagged" ? "Review" : "Blocked";
                        const hasIssue = r.status !== "Ready";
                        return (
                        <TableRow
                          key={r.id}
                          className={cn(
                            "cursor-pointer hover:bg-muted/50",
                            selectedTfpIds.has(r.id) && "bg-muted/50",
                            hasIssue && "bg-amber-50/50 dark:bg-amber-950/20"
                          )}
                          onClick={() => openDrawerTFP(r)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox checked={selectedTfpIds.has(r.id)} onCheckedChange={() => toggleTfpSelection(r.id)} aria-label={`Select ${r.name}`} />
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{r.name}</p>
                            <p className="text-xs text-muted-foreground">{r.id.startsWith("p") ? `TF${r.id.slice(1).padStart(4, "0")}` : r.id}</p>
                          </TableCell>
                          <TableCell className="text-sm">{r.country}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === "Ready" ? "default" : r.status === "Flagged" ? "destructive" : "secondary"}>
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">{sessionsCount}</TableCell>
                          <TableCell className="text-right text-sm">{chatHours}</TableCell>
                          <TableCell className="text-right text-sm">{gigsCount}</TableCell>
                          <TableCell className="text-right text-sm">$0</TableCell>
                          <TableCell className="text-right text-sm">{adjustments >= 0 ? `+$${adjustments}` : `$${adjustments}`}</TableCell>
                          <TableCell className="text-right font-medium">${r.total}</TableCell>
                          <TableCell>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" aria-label="Actions">⋯</Button>
                          </TableCell>
                        </TableRow>
                      );})}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination total={filteredTFPRows.length} page={tfpPage} pageSize={tfpPageSize} onPageChange={setTfpPage} onPageSizeChange={(s) => { setTfpPageSize(s); setTfpPage(1); }} />
              </Card>
            </div>
          )}

          {/* ── Hotline Sheet ── */}
          {draftSheetTab === "hotline" && (
            <div className="space-y-4">
              {selectedHotlineIds.size > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/30 px-4 py-3 shadow-card">
                  <span className="text-sm font-medium">{selectedHotlineIds.size} selected</span>
                  <Select onValueChange={bulkAssignReviewerHotline}>
                    <SelectTrigger className="w-[180px] h-8"><SelectValue placeholder="Assign reviewer" /></SelectTrigger>
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
                          <Checkbox
                            checked={paginatedHotlineRows.length > 0 && paginatedHotlineRows.every((r) => selectedHotlineIds.has(r.id))}
                            onCheckedChange={() => paginatedHotlineRows.every((r) => selectedHotlineIds.has(r.id))
                              ? setSelectedHotlineIds((p) => { const n = new Set(p); paginatedHotlineRows.forEach((r) => n.delete(r.id)); return n; })
                              : selectAllHotlineOnPage()
                            }
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>Professional</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Hotline activity</TableHead>
                        <TableHead>Rate / adjustments</TableHead>
                        <TableHead className="text-right">Total pay</TableHead>
                        <TableHead>Validation flags</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedHotlineRows.map((r) => (
                        <TableRow key={r.id} className={cn("cursor-pointer hover:bg-muted/50", selectedHotlineIds.has(r.id) && "bg-muted/50")} onClick={() => openDrawerHotline(r)}>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox checked={selectedHotlineIds.has(r.id)} onCheckedChange={() => toggleHotlineSelection(r.id)} aria-label={`Select ${r.name}`} />
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{r.name}</p>
                            <p className="text-xs text-muted-foreground">{r.professionalId.startsWith("p") ? `TF${r.professionalId.slice(1).padStart(4, "0")}` : r.professionalId}</p>
                            <div className="mt-1 flex gap-1">
                              {r.roles.map((role) => <Badge key={role} variant="outline" className="text-xs">{role}</Badge>)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{r.country}</TableCell>
                          <TableCell>{r.shiftHours}h · {r.sessionsHandled} sessions</TableCell>
                          <TableCell className="text-muted-foreground">{r.rateNote}</TableCell>
                          <TableCell className="text-right font-medium">${r.hotlineTotalPay}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{r.validationFlags.join(", ") || "—"}</TableCell>
                          <TableCell><Badge variant={r.status === "Ready" ? "default" : "destructive"}>{r.status}</Badge></TableCell>
                          <TableCell><Button type="button" variant="ghost" size="icon" className="h-6 w-6" aria-label="Actions">⋯</Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination total={hotlineRowsWithOverrides.length} page={hotlinePage} pageSize={hotlinePageSize} onPageChange={setHotlinePage} onPageSizeChange={(s) => { setHotlinePageSize(s); setHotlinePage(1); }} />
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 2 — EXCEPTIONS & RECONCILIATION (operational triage)
      ══════════════════════════════════════════════════════════════════════ */}
      {!showLoading && currentStep === 2 && (
        <div className="space-y-6">
          {/* Exceptions summary bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/50 bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-xl font-semibold text-foreground">{exceptionsTotal}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Blocking</p>
                <p className={cn("text-xl font-semibold", blockingExceptionCount > 0 ? "text-destructive" : "text-foreground")}>
                  {blockingExceptionCount}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Warnings</p>
                <p className="text-xl font-semibold text-foreground">{warningExceptions.length}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Resolved</p>
                <p className="text-xl font-semibold text-foreground">{exceptionsResolved}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {blockingExceptionCount > 0
                ? "Resolve blocking issues before continuing to approval."
                : "All blocking issues resolved. You may proceed to approval."}
            </p>
          </div>

          {/* Filters: priority tabs + category chips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Exceptions & reconciliation</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Identify what is wrong and take action before approving the payout run.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                tabs={[
                  { id: "blocking", label: "Blocking", suffix: blockingExceptionCount > 0 ? <Badge variant="destructive" className="ml-1.5 text-xs">{blockingExceptionCount}</Badge> : undefined },
                  { id: "warnings", label: "Warnings", suffix: warningExceptions.length > 0 ? <Badge variant="secondary" className="ml-1.5 text-xs">{warningExceptions.length}</Badge> : undefined },
                  { id: "resolved", label: "Resolved" },
                  { id: "all", label: "All" },
                ]}
                activeId={exceptionTab}
                onChange={(id) => setExceptionTab(id as typeof exceptionTab)}
              />
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-muted-foreground pt-1">Category:</span>
                {(["flagged_delta", "too_small", "unclaimed", "fx_recon", "failed_payment"] as const).map((cat) => (
                  <Badge
                    key={cat}
                    variant={exceptionCategory === cat ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setExceptionCategory(exceptionCategory === cat ? null : cat)}
                  >
                    {categoryLabels[cat]}
                  </Badge>
                ))}
              </div>

              {/* Dense operational table */}
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Issue</TableHead>
                      <TableHead>Professional</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="w-20">Severity</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-[140px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExceptions.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{categoryLabels[e.category] ?? e.category}</TableCell>
                        <TableCell>{e.professionalName}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{e.reason}</TableCell>
                        <TableCell>
                          <Badge
                            variant={e.severity === "Blocking" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {e.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={e.effectiveStatus === "Resolved" ? "default" : "outline"}>
                            {e.effectiveStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {e.effectiveStatus !== "Resolved" ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  const row = tfpRowsWithOverrides.find((r) => r.id === e.professionalId);
                                  if (row) openDrawerTFP(row);
                                }}
                              >
                                <FileText className="h-3.5 w-3.5" />
                                View payout
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => resolveException(e, "Approve exception")}>
                                    <CheckCircle className="h-4 w-4" />
                                    Approve exception
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => resolveException(e, "Resolve")}>
                                    <Check className="h-4 w-4" />
                                    Resolve
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredExceptions.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No exceptions in this view.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 3 — APPROVE
      ══════════════════════════════════════════════════════════════════════ */}
      {!showLoading && currentStep === 3 && (
        <div className="space-y-6">
          {/* Final summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payout summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Payout period</p>
                  <p className="text-sm font-semibold text-foreground">{periodLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Professionals</p>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xl font-semibold text-foreground">{kpis.professionalCount}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total payout</p>
                  <p className="text-xl font-semibold text-foreground">${kpis.totalPayoutUsd.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Exceptions resolved</p>
                  <div className="flex items-center gap-1.5">
                    {exceptionsResolved === exceptionsTotal ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <p className="text-xl font-semibold text-foreground">{exceptionsResolved} / {exceptionsTotal}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Readiness checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" /> All flagged entries reviewed
              </p>
              <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" /> Exceptions resolved or held
              </p>
              <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" /> Hotline review completed
              </p>
            </CardContent>
          </Card>

          {/* Secondary actions — primary Approve is in the stepper row */}
          {!canApprove && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Resolve all blocking issues (Hold, Too small, Unclaimed) before approving.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline">
              <Send className="h-4 w-4" />
              Send to finance
            </Button>
            <Button variant="outline">
              <Play className="h-4 w-4" />
              Trigger payment
            </Button>
          </div>

          {/* Audit log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit log</CardTitle>
            </CardHeader>
            <CardContent>
              {auditEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Key actions during this review will appear here.</p>
              ) : (
                <div className="space-y-3">
                  {auditEvents.map((event) => (
                    <div key={event.id} className="rounded-md border border-border/60 p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(event.ts).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>By {event.actor}</span>
                        {event.detail && <span>· {event.detail}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── DRAWER STACK: shared backdrop + receipt + activity ─────────────────── */}
      {drawerOpen && (selectedTFP || selectedHotline) && (
        <>
          {/* Single shared backdrop — fades in on stack open only; stable when activity toggles */}
          <div
            className="fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-200"
            aria-hidden
            onClick={() => (activityDrawerOpen ? setActivityDrawerOpen(false) : setDrawerOpen(false))}
          />
          <div
            className={cn(
              "fixed top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-border/50 bg-card shadow-panel transition-[right] duration-300 ease-out",
              activityDrawerOpen ? "right-[28rem]" : "right-0 animate-in slide-in-from-right"
            )}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border/50 bg-card p-4">
              <h2 className="font-semibold">{selectedTFP?.name ?? selectedHotline?.name}</h2>
              <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {selectedTFP && (() => {
                const pid = selectedTFP.id;
                const baseActivity = selectedTFP.therapy.earnings;
                const baseChat = selectedTFP.chat.earnings;
                const baseEvents = selectedTFP.eventsEngagements.earnings + selectedTFP.leadership.podLeaderEarnings + selectedTFP.leadership.otLdpEarnings;
                const baseBonuses = selectedTFP.bonuses.languageBonus + selectedTFP.bonuses.otherAdjustments + selectedTFP.reconciliation;
                const ov = receiptOverrides[pid] ?? {};
                const reasons = receiptReasons[pid] ?? {};
                const savedOverrides = receiptOverridesSaved[pid] ?? {};
                const savedReasons = receiptReasonsSaved[pid] ?? {};
                const adjustmentsEnabled = receiptManualBonusEnabled[pid] ?? false;
                const activityVal = ov.activity ?? baseActivity;
                const chatVal = ov.chat ?? baseChat;
                const eventsVal = ov.events ?? baseEvents;
                const bonusesVal = ov.bonuses ?? baseBonuses;
                const activitySaved = savedOverrides.activity ?? baseActivity;
                const chatSaved = savedOverrides.chat ?? baseChat;
                const eventsSaved = savedOverrides.events ?? baseEvents;
                const bonusesSaved = savedOverrides.bonuses ?? baseBonuses;
                const activityReasonSaved = savedReasons.activity ?? "";
                const chatReasonSaved = savedReasons.chat ?? "";
                const eventsReasonSaved = savedReasons.events ?? "";
                const bonusesReasonSaved = savedReasons.bonuses ?? "";
                const activityReasonDraft = reasons.activity ?? "";
                const chatReasonDraft = reasons.chat ?? "";
                const eventsReasonDraft = reasons.events ?? "";
                const bonusesReasonDraft = reasons.bonuses ?? "";
                const activityDraftAdjusted = activityVal !== baseActivity;
                const chatDraftAdjusted = chatVal !== baseChat;
                const eventsDraftAdjusted = eventsVal !== baseEvents;
                const bonusesDraftAdjusted = bonusesVal !== baseBonuses;
                const activityAppliedValue = activitySaved ?? baseActivity;
                const chatAppliedValue = chatSaved ?? baseChat;
                const eventsAppliedValue = eventsSaved ?? baseEvents;
                const bonusesAppliedValue = bonusesSaved ?? baseBonuses;
                const activityHasAdjustment = activityDraftAdjusted || activityAppliedValue !== baseActivity;
                const chatHasAdjustment = chatDraftAdjusted || chatAppliedValue !== baseChat;
                const eventsHasAdjustment = eventsDraftAdjusted || eventsAppliedValue !== baseEvents;
                const bonusesHasAdjustment = bonusesDraftAdjusted || bonusesAppliedValue !== baseBonuses;
                const subtotal = activityVal + chatVal + eventsVal + bonusesVal;
                const baseSubtotal = baseActivity + baseChat + baseEvents + baseBonuses;
                const adjustmentDelta = subtotal - baseSubtotal;
                const hasMissingReason =
                  (activityDraftAdjusted && !activityReasonDraft.trim())
                  || (chatDraftAdjusted && !chatReasonDraft.trim())
                  || (eventsDraftAdjusted && !eventsReasonDraft.trim())
                  || (bonusesDraftAdjusted && !bonusesReasonDraft.trim());
                const hasUnsavedChanges =
                  activityVal !== activitySaved
                  || chatVal !== chatSaved
                  || eventsVal !== eventsSaved
                  || bonusesVal !== bonusesSaved
                  || activityReasonDraft.trim() !== activityReasonSaved.trim()
                  || chatReasonDraft.trim() !== chatReasonSaved.trim()
                  || eventsReasonDraft.trim() !== eventsReasonSaved.trim()
                  || bonusesReasonDraft.trim() !== bonusesReasonSaved.trim();
                const canSaveAll = hasUnsavedChanges && !hasMissingReason;
                const hasSavedAdjustments =
                  activitySaved !== baseActivity
                  || chatSaved !== baseChat
                  || eventsSaved !== baseEvents
                  || bonusesSaved !== baseBonuses
                  || activityReasonSaved.trim().length > 0
                  || chatReasonSaved.trim().length > 0
                  || eventsReasonSaved.trim().length > 0
                  || bonusesReasonSaved.trim().length > 0;
                const saveAndApplyAdjustments = () => {
                  if (!canSaveAll) return;
                  setReceiptOverridesSaved((p) => ({
                    ...p,
                    [pid]: {
                      ...p[pid],
                      activity: activityVal,
                      chat: chatVal,
                      events: eventsVal,
                      bonuses: bonusesVal,
                    },
                  }));
                  setReceiptReasonsSaved((p) => ({
                    ...p,
                    [pid]: {
                      ...p[pid],
                      activity: activityReasonDraft.trim(),
                      chat: chatReasonDraft.trim(),
                      events: eventsReasonDraft.trim(),
                      bonuses: bonusesReasonDraft.trim(),
                    },
                  }));
                  setReceiptOverrides((p) => ({
                    ...p,
                    [pid]: {
                      ...p[pid],
                      activity: activityVal,
                      chat: chatVal,
                      events: eventsVal,
                      bonuses: bonusesVal,
                    },
                  }));
                  if (hasSavedAdjustments || hasUnsavedChanges) {
                    logAuditEvent({
                      ts: Date.now(),
                      actor: currentActor,
                      title: `Adjustments saved & applied — ${selectedTFP.name}`,
                      detail: `${formatCurrency(baseSubtotal)} → ${formatCurrency(subtotal)}`,
                    });
                  }
                };
                const setReason = (k: ReceiptFeeKey, v: string) =>
                  setReceiptReasons((p) => ({ ...p, [pid]: { ...p[pid], [k]: v } }));
                const FeeCard = ({ label, base, value, onValueChange, reason, onReasonChange, adjusted, showReason, showRequired, editable, children }: {
                  label: string; base: number; value: number; onValueChange: (v: number) => void;
                  reason: string; onReasonChange: (v: string) => void; adjusted: boolean; showReason: boolean; showRequired: boolean;
                  editable: boolean; children?: React.ReactNode;
                }) => (
                  <Card className={cn(adjusted && "ring-1 ring-amber-200 dark:ring-amber-800")}>
                    <CardHeader className="py-2 flex flex-row items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium">{label}</CardTitle>
                      {adjusted && (
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                          Adjusted
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Amount</span>
                        <span>${adjusted ? value : base}</span>
                      </div>
                      {editable && (
                        <>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-muted-foreground">Adjusted amount</span>
                            <Input type="number" value={value} onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)} className="h-8 w-20 text-right text-sm" />
                          </div>
                          {showReason && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Reason for adjustment</span>
                                {showRequired && <span className="text-xs text-muted-foreground">(Required)</span>}
                              </div>
                              <div className="relative">
                                <Input
                                  placeholder={showRequired ? "Required" : "Optional"}
                                  value={reason}
                                  onChange={(e) => onReasonChange(e.target.value)}
                                  className="text-sm h-8 w-full"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {children}
                    </CardContent>
                  </Card>
                );
                return (
                  <>
                    {selectedTFP.status === "Flagged" && (
                      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">AI recommendation — review</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <p className="text-foreground">Potential anomaly: month-over-month payout spike exceeds threshold. Worth confirming.</p>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm">Mark Ready</Button>
                            <Button size="sm" variant="outline">Hold</Button>
                            <Button size="sm" variant="outline">Request info</Button>
                            <Button size="sm" variant="outline">Assign reviewer</Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Manual adjustment toggle — enables Adjusted amount fields in all cards */}
                    <div className="flex flex-wrap items-center justify-between gap-3 py-2">
                      <span className="text-sm font-medium">Manual adjustment</span>
                      <div className="flex items-center gap-2">
                        {adjustmentsEnabled && (
                          <Button size="sm" variant="ghost" onClick={saveAndApplyAdjustments} disabled={!canSaveAll}>
                            <Check className="h-4 w-4" />
                            Save and Apply
                          </Button>
                        )}
                        <Switch checked={adjustmentsEnabled} onCheckedChange={(c) => setReceiptManualBonusEnabled((p) => ({ ...p, [pid]: c }))} />
                      </div>
                    </div>

                    {/* Activity fees */}
                    <FeeCard
                      key="activity"
                      label="Activity fees"
                      base={baseActivity}
                      value={activityVal}
                      onValueChange={(v) => updateReceiptOverride(pid, "activity", v)}
                      reason={reasons.activity ?? ""}
                      onReasonChange={(v) => setReason("activity", v)}
                      adjusted={activityDraftAdjusted}
                      showReason={activityHasAdjustment}
                      showRequired={activityDraftAdjusted}
                      editable={adjustmentsEnabled}
                    >
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setActivityDrawerSource("sessions"); setActivityDrawerOpen(true); }}>
                        View sessions
                      </Button>
                    </FeeCard>

                    {/* Chat fees */}
                    <FeeCard
                      key="chat"
                      label="Chat fees"
                      base={baseChat}
                      value={chatVal}
                      onValueChange={(v) => updateReceiptOverride(pid, "chat", v)}
                      reason={reasons.chat ?? ""}
                      onReasonChange={(v) => setReason("chat", v)}
                      adjusted={chatDraftAdjusted}
                      showReason={chatHasAdjustment}
                      showRequired={chatDraftAdjusted}
                      editable={adjustmentsEnabled}
                    >
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setActivityDrawerSource("chat"); setActivityDrawerOpen(true); }}>
                        View chat logs
                      </Button>
                    </FeeCard>

                    {/* Event fees */}
                    <FeeCard
                      key="events"
                      label="Event fees"
                      base={baseEvents}
                      value={eventsVal}
                      onValueChange={(v) => updateReceiptOverride(pid, "events", v)}
                      reason={reasons.events ?? ""}
                      onReasonChange={(v) => setReason("events", v)}
                      adjusted={eventsDraftAdjusted}
                      showReason={eventsHasAdjustment}
                      showRequired={eventsDraftAdjusted}
                      editable={adjustmentsEnabled}
                    >
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setActivityDrawerSource("events"); setActivityDrawerOpen(true); }}>
                        View event
                      </Button>
                    </FeeCard>

                    {/* Bonuses — same Amount + Adjusted amount pattern */}
                    <FeeCard
                      key="bonuses"
                      label="Bonuses"
                      base={baseBonuses}
                      value={bonusesVal}
                      onValueChange={(v) => updateReceiptOverride(pid, "bonuses", v)}
                      reason={reasons.bonuses ?? ""}
                      onReasonChange={(v) => setReason("bonuses", v)}
                      adjusted={bonusesDraftAdjusted}
                      showReason={bonusesHasAdjustment}
                      showRequired={bonusesDraftAdjusted}
                      editable={adjustmentsEnabled}
                    />

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                      <Input placeholder="Add note…" className="text-sm" />
                    </div>

                    {/* Total payout summary — bottom */}
                    <div className="border-t border-border pt-4 mt-4 space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>${baseSubtotal}</span>
                      </div>
                      {adjustmentDelta !== 0 && (
                        <div className="flex justify-between">
                          <span>Adjustments</span>
                          <span className={adjustmentDelta >= 0 ? "text-emerald-600" : "text-destructive"}>{adjustmentDelta >= 0 ? "+" : ""}${adjustmentDelta}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-foreground pt-2">
                        <span>Total payout</span>
                        <span>${subtotal}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
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
                      <li className={cn("flex items-center gap-2")}>
                        {selectedHotline.validationFlags.includes("Missing check-in") ? (
                          <span className="text-destructive">✗</span>
                        ) : (
                          <Check className="h-4 w-4 text-emerald-600" />
                        )}
                        Check-in present
                      </li>
                      <li className="flex items-center gap-2">
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
                          <span className="text-destructive">!</span> {f}
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
                    <Input placeholder="Add note…" className="text-sm" />
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

          {/* Activity drawer — secondary level: Back | Title | Close */}
          {activityDrawerOpen && activityDrawerSource && selectedTFP && (
            <div className="fixed right-0 top-0 z-[60] h-full w-[28rem] max-w-md overflow-y-auto border-l border-border/50 bg-card shadow-panel animate-in slide-in-from-right duration-300 ease-out">
              <div className="sticky top-0 flex items-center gap-3 border-b border-border/50 bg-card p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-sm shrink-0"
                  onClick={() => setActivityDrawerOpen(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to payout receipt
                </Button>
                <h3 className="flex-1 min-w-0 text-base font-semibold tracking-tight text-foreground truncate">
                  {activityDrawerSource === "sessions" && "Sessions contributing to payout"}
                  {activityDrawerSource === "chat" && "Chat logs contributing to payout"}
                  {activityDrawerSource === "events" && "Events contributing to payout"}
                  {activityDrawerSource === "claims" && "Claims contributing to payout"}
                </h3>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setActivityDrawerOpen(false)} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {selectedTFP.name} — {monthLabel}
                </p>
              {activityDrawerSource === "sessions" && (
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Fee rule</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: Math.min(selectedTFP.therapy.videoCount + selectedTFP.therapy.f2fCount, 8) }, (_, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">S-{1000 + i}</TableCell>
                          <TableCell>Mar {3 + i * 2}, 2026</TableCell>
                          <TableCell>{45 + i * 5} min</TableCell>
                          <TableCell>Appointment fee</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {activityDrawerSource === "chat" && (
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm text-muted-foreground">Chat activity records for this professional. (Mock data)</p>
                </div>
              )}
              {activityDrawerSource === "events" && (
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm text-muted-foreground">Event attendance records. (Mock data)</p>
                </div>
              )}
              {activityDrawerSource === "claims" && (
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm text-muted-foreground">Claim attachments. (Mock data)</p>
                </div>
              )}
            </div>
          </div>
          )}
        </>
      )}
    </div>
  );
}
