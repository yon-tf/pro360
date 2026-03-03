"use client";

import { useState, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import { Tabs } from "@/components/Tabs";
import { payoutStats, monthlyReports, payoutTasks } from "@/lib/mock/payout";
import { FileText, Download, Play } from "@/components/ui/solar-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/TablePagination";
import { PeriodFilter, defaultPeriodValue, type PeriodValue } from "@/components/filters/PeriodFilter";
import { TableToolbar } from "@/components/filters/TableToolbar";
import { MoreFiltersSheet } from "@/components/filters/MoreFiltersSheet";
import { useAdvancedFilters } from "@/lib/filters/useAdvancedFilters";
import { payoutFilterConfig, type PayoutAdvanced } from "@/lib/filter-configs/payout";
import type { FilterContext } from "@/lib/filters/types";

const PAYOUT_TABS = [
  { id: "reports", label: "Reports" },
  { id: "tasks", label: "Tasks" },
];

export default function PayoutPage() {
  const [activeTab, setActiveTab] = useState("reports");
  const [period, setPeriod] = useState<PeriodValue>(defaultPeriodValue());
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsPageSize, setReportsPageSize] = useState(10);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksPageSize, setTasksPageSize] = useState(10);

  const filterCtx: FilterContext = useMemo(() => ({ activeTab }), [activeTab]);
  const adv = useAdvancedFilters<PayoutAdvanced>(payoutFilterConfig, filterCtx);

  const filteredReports = useMemo(() => {
    const vk = adv.visibleKeys;
    const af = adv.applied;
    return monthlyReports.filter((row) => {
      if (deferredSearch) {
        const q = deferredSearch.toLowerCase();
        if (!row.month.toLowerCase().includes(q) && !row.reviewer.toLowerCase().includes(q)) return false;
      }
      if (vk.has("reviewer") && af.reviewer) {
        const match = af.reviewer === "sarah" ? "Sarah Lee" : af.reviewer === "anton" ? "Anton Kraskov" : null;
        if (match && row.reviewer !== match) return false;
      }
      if (vk.has("statusFilter") && af.statusFilter) {
        if (row.status !== af.statusFilter) return false;
      }
      return true;
    });
  }, [deferredSearch, adv.applied, adv.visibleKeys]);

  const paginatedReports = useMemo(() => {
    const start = (reportsPage - 1) * reportsPageSize;
    return filteredReports.slice(start, start + reportsPageSize);
  }, [filteredReports, reportsPage, reportsPageSize]);

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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total payout this month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{payoutStats.totalThisMonth}</p>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vs last month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">{payoutStats.comparison}</p>
            <p className="text-xs text-muted-foreground">Compared to Jan 2026</p>
          </CardContent>
        </Card>
      </div>

      <Tabs tabs={PAYOUT_TABS} activeId={activeTab} onChange={setActiveTab} />

      <TableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setReportsPage(1); setTasksPage(1); }}
        searchPlaceholder="Search by professional or reviewer…"
        appliedCount={adv.appliedCount}
        onMoreFilters={() => adv.setSheetOpen(true)}
        chips={adv.activeChips}
        onRemoveChip={adv.removeAppliedFilter}
        onClearAllChips={adv.clearAllApplied}
      >
        <PeriodFilter value={period} onChange={setPeriod} />
      </TableToolbar>

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

      {activeTab === "reports" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.map((row) => {
                  const isNotStarted = row.status === "Not started";
                  const isDraft = row.status === "Draft";
                  return (
                    <TableRow key={row.month}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{row.month}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.reviewer}</TableCell>
                      <TableCell className="text-muted-foreground">{row.generated}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "Completed" ? "default" :
                            row.status === "Draft" ? "secondary" :
                            row.status === "Blocked" ? "destructive" : "outline"
                          }
                          className={row.status === "Not started" ? "border-amber-300 text-amber-800" : undefined}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isNotStarted ? (
                          <Button size="sm" asChild>
                            <Link href={`/payout/run/${(row as { runId?: string }).runId ?? row.month.replace(/\s/g, "-").toLowerCase()}`}>
                              <Play className="h-4 w-4" />
                              Generate
                            </Link>
                          </Button>
                        ) : isDraft ? (
                          <Button size="sm" asChild>
                            <Link href={`/payout/run/${(row as { runId?: string }).runId ?? row.month.replace(/\s/g, "-").toLowerCase()}`}>
                              Continue
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                            Export to PDF
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <TablePagination
              total={filteredReports.length}
              pageSize={reportsPageSize}
              page={reportsPage}
              onPageChange={setReportsPage}
              onPageSizeChange={(size) => { setReportsPageSize(size); setReportsPage(1); }}
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
                          t.status === "Completed" ? "default" :
                          t.status === "In progress" ? "secondary" : "outline"
                        }
                        className={t.status === "In progress" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""}
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
  );
}
