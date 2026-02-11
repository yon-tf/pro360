"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Tabs } from "@/components/Tabs";
import { payoutStats, monthlyReports, payoutTasks } from "@/lib/mock/payout";
import { FileText, Download, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const PAYOUT_TABS = [
  { id: "reports", label: "Reports" },
  { id: "tasks", label: "Tasks" },
];

export default function PayoutPage() {
  const [activeTab, setActiveTab] = useState("reports");
  const [search, setSearch] = useState("");
  const [filterReviewer, setFilterReviewer] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsPageSize, setReportsPageSize] = useState(10);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksPageSize, setTasksPageSize] = useState(10);

  const filteredReports = useMemo(() => {
    return monthlyReports.filter((row) => {
      const matchSearch = !search || row.month.toLowerCase().includes(search.toLowerCase()) || row.reviewer.toLowerCase().includes(search.toLowerCase());
      const matchReviewer = filterReviewer === "all" || (filterReviewer === "sarah" && row.reviewer === "Sarah Lee") || (filterReviewer === "anton" && row.reviewer === "Anton Kraskov");
      const matchStatus = filterStatus === "all" || row.status === filterStatus;
      return matchSearch && matchReviewer && matchStatus;
    });
  }, [search, filterReviewer, filterStatus]);
  const sortedReports = useMemo(
    () => [...filteredReports],
    [filteredReports]
  );

  const paginatedReports = useMemo(() => {
    const start = (reportsPage - 1) * reportsPageSize;
    return sortedReports.slice(start, start + reportsPageSize);
  }, [sortedReports, reportsPage, reportsPageSize]);

  const paginatedTasks = useMemo(() => {
    const start = (tasksPage - 1) * tasksPageSize;
    return payoutTasks.slice(start, start + tasksPageSize);
  }, [tasksPage, tasksPageSize]);

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

      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={filterReviewer} onValueChange={(v) => { setFilterReviewer(v); setReportsPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Reviewer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reviewers</SelectItem>
                <SelectItem value="sarah">Sarah Lee</SelectItem>
                <SelectItem value="anton">Anton Kraskov</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setReportsPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Not started">Not started</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                total={sortedReports.length}
                pageSize={reportsPageSize}
                page={reportsPage}
                onPageChange={setReportsPage}
                onPageSizeChange={(size) => { setReportsPageSize(size); setReportsPage(1); }}
              />
            </CardContent>
          </Card>
        </div>
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
              total={payoutTasks.length}
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
