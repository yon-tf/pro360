"use client";

import { useState, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/Tabs";
import { payoutStats, payoutHistory, payoutTasks, currentMonthActivity } from "@/features/payout/mock/payout";
import {
  FileText, Play, DollarSign, CheckCircle, Zap, Loader2,
} from "@/components/ui/solar-icons";
import { KpiCard } from "@/features/pro360/components/KpiCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/TablePagination";
import { TableToolbar } from "@/features/filters/components/TableToolbar";
import { MoreFiltersSheet } from "@/features/filters/components/MoreFiltersSheet";
import { useAdvancedFilters } from "@/lib/filters/useAdvancedFilters";
import { payoutFilterConfig, type PayoutAdvanced } from "@/lib/filter-configs/payout";
import type { FilterContext } from "@/lib/filters/types";

const HISTORY_TABS = [
  { id: "history", label: "History" },
  { id: "tasks", label: "Tasks" },
];

function statusBadge(status: string) {
  if (status === "Paid") return <Badge variant="success">Paid</Badge>;
  if (status === "Draft") return <Badge variant="secondary">Draft</Badge>;
  if (status === "Blocked") return <Badge variant="destructive">Blocked</Badge>;
  return <Badge variant="outline">Not started</Badge>;
}

export default function PayoutPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksPageSize, setTasksPageSize] = useState(10);

  const filterCtx: FilterContext = useMemo(() => ({ activeTab }), [activeTab]);
  const adv = useAdvancedFilters<PayoutAdvanced>(payoutFilterConfig, filterCtx);

  const filteredHistory = useMemo(() => {
    if (!deferredSearch) return payoutHistory;
    const q = deferredSearch.toLowerCase();
    return payoutHistory.filter((r) => r.month.toLowerCase().includes(q));
  }, [deferredSearch]);

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * historyPageSize;
    return filteredHistory.slice(start, start + historyPageSize);
  }, [filteredHistory, historyPage, historyPageSize]);

  const filteredTasks = useMemo(() => {
    if (!deferredSearch) return payoutTasks;
    const q = deferredSearch.toLowerCase();
    return payoutTasks.filter(
      (t) => t.reviewer.toLowerCase().includes(q) || t.taskType.toLowerCase().includes(q),
    );
  }, [deferredSearch]);

  const paginatedTasks = useMemo(() => {
    const start = (tasksPage - 1) * tasksPageSize;
    return filteredTasks.slice(start, start + tasksPageSize);
  }, [filteredTasks, tasksPage, tasksPageSize]);

  const { period, runId: currentRunId, detected } = currentMonthActivity;
  const totalActivityRecords = detected.sessions + detected.chatHours + detected.gigs + detected.claims;

  return (
    <div className="space-y-6">
      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Payout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Financial health of the professional network — March 2026
        </p>
      </div>

      {/* ── KPI METRICS ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          variant="primary"
          title="Total payout"
          value={payoutStats.totalMtd}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title="Monthly avg payout"
          value={payoutStats.avgPayoutPerPro}
          icon={<DollarSign className="h-5 w-5" />}
          trend={payoutStats.comparison}
          trendDirection="up"
          sublabel="Per professional this cycle"
        />
        <KpiCard
          title="Total activity records"
          value={totalActivityRecords.toLocaleString()}
          icon={<Zap className="h-5 w-5" />}
          sublabel="Sessions, chat hours, gigs, claims"
        />
      </div>

      {/* ── PAYOUT READINESS CARD ────────────────────────────────────────── */}
      <Card className="overflow-hidden border-2 border-dashed border-primary/40 bg-muted/30 shadow-panel">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
            {/* Left: readiness message */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Ready for payout</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The current billing cycle for{" "}
                  <span className="font-medium text-foreground">{period.start} – {period.end}</span>
                  {" "}is finalized. Ready to distribute funds to{" "}
                  <span className="font-medium text-foreground">{payoutStats.professionalsWithPayout} professionals</span>.
                </p>
              </div>
            </div>

            {/* Middle: total to process */}
            <div className="flex flex-col justify-center px-6 border-l border-border shrink-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total to process</p>
              <p className="text-2xl font-bold text-foreground mt-1">{payoutStats.totalMtd}</p>
            </div>

            {/* Right: generate button — disabled/loading on click, navigates with ?generate=1 */}
            <div className="flex items-center shrink-0">
              <Button
                size="lg"
                disabled={isGenerating}
                onClick={() => {
                  setIsGenerating(true);
                  router.push(`/payout/run/${currentRunId}?generate=1`);
                }}
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <DollarSign className="h-5 w-5" />
                )}
                Generate payout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION 3: HISTORY + TASKS ──────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Payout history</h2>

        <Tabs tabs={HISTORY_TABS} activeId={activeTab} onChange={setActiveTab} />

        <TableToolbar
          search={search}
          onSearchChange={(v) => { setSearch(v); setHistoryPage(1); setTasksPage(1); }}
          searchPlaceholder="Search by period…"
          appliedCount={adv.appliedCount}
          onMoreFilters={() => adv.setSheetOpen(true)}
          chips={adv.activeChips}
          onRemoveChip={adv.removeAppliedFilter}
          onClearAllChips={adv.clearAllApplied}
        />

        <MoreFiltersSheet
          open={adv.sheetOpen}
          onOpenChange={adv.setSheetOpen}
          visibleGroups={adv.visibleGroups}
          draft={adv.draft}
          patchDraft={adv.patchDraft}
          onApply={adv.applyDraft}
          onClear={adv.clearVisibleDraft}
          onCancel={adv.cancelDraft}
          context={adv.filterContext}
          title="Payout filters"
          description="Narrow down payout records. Press Apply to update results."
        />

        {activeTab === "history" && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Professionals</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Exceptions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHistory.map((row) => (
                    <TableRow key={row.runId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{row.month}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{row.professionals}</TableCell>
                      <TableCell className="text-right font-medium">{row.total}</TableCell>
                      <TableCell className="text-right">
                        {row.exceptions > 0 ? (
                          <span className="text-warning font-medium">{row.exceptions}</span>
                        ) : (
                          <span className="text-muted-foreground flex items-center justify-end gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-success" /> 0
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{statusBadge(row.status)}</TableCell>
                      <TableCell className="text-right">
                        {row.status === "Paid" ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/payout/run/${row.runId}`}>
                              View
                            </Link>
                          </Button>
                        ) : row.status === "Draft" ? (
                          <Button size="sm" asChild>
                            <Link href={`/payout/run/${row.runId}`}>
                              Continue
                            </Link>
                          </Button>
                        ) : row.status === "Blocked" ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/payout/run/${row.runId}`}>
                              Review
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" asChild>
                            <Link href={`/payout/run/${row.runId}`}>
                              <Play className="h-4 w-4" />
                              Generate
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                total={filteredHistory.length}
                pageSize={historyPageSize}
                page={historyPage}
                onPageChange={setHistoryPage}
                onPageSizeChange={(size) => { setHistoryPageSize(size); setHistoryPage(1); }}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "tasks" && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Task type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.reviewer}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.status === "Completed" ? "success" :
                            t.status === "In progress" ? "warning" : "outline"
                          }
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{t.taskType}</TableCell>
                      <TableCell className="text-muted-foreground">{t.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                total={filteredTasks.length}
                pageSize={tasksPageSize}
                page={tasksPage}
                onPageChange={setTasksPage}
                onPageSizeChange={(size) => { setTasksPageSize(size); setTasksPage(1); }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
