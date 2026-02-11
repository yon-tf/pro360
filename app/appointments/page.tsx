"use client";

import { useState, useMemo } from "react";
import { appointments, type AppointmentType } from "@/lib/mock/appointments";
import { User, Users, Eye, Calendar, CheckCircle, XCircle, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: { id: AppointmentType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "user", label: "User" },
  { id: "pod", label: "Pod" },
  { id: "townhall", label: "Townhall" },
];

function StarRating({ score, max = 5, notRated }: { score: number | null; max?: number; notRated?: boolean }) {
  if (notRated || score == null) {
    return <span className="text-sm text-muted-foreground">Not rated</span>;
  }
  const full = Math.round(score);
  const empty = max - full;
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-amber-500">
        {"★".repeat(full)}
        <span className="text-muted-foreground/50">{"☆".repeat(empty)}</span>
      </span>
      <span className="text-muted-foreground">{score}</span>
    </span>
  );
}

export default function AppointmentsPage() {
  const [typeFilter, setTypeFilter] = useState<AppointmentType | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = typeFilter === "all" ? appointments : appointments.filter((a) => a.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.participants.toLowerCase().includes(q) ||
          (a.notes && a.notes.toLowerCase().includes(q)) ||
          (a.aiReview?.primary && a.aiReview.primary.toLowerCase().includes(q)) ||
          (a.aiReview?.secondary && a.aiReview.secondary.toLowerCase().includes(q))
      );
    }
    return list;
  }, [typeFilter, search]);

  const counts = useMemo(() => {
    const all = appointments;
    return {
      total: all.length,
      user: all.filter((a) => a.type === "user").length,
      pod: all.filter((a) => a.type === "pod").length,
      townhall: all.filter((a) => a.type === "townhall").length,
    };
  }, []);

  const kpis = useMemo(() => {
    const attended = appointments.filter((a) => a.attendance === "Attended").length;
    const noShows = appointments.filter((a) => a.attendance === "No-Show").length;
    const withScore = appointments.filter((a) => a.aiScore != null && a.attendance !== "Scheduled");
    const avgRating = withScore.length ? withScore.reduce((s, a) => s + (a.aiScore ?? 0), 0) / withScore.length : 0;
    return {
      total: appointments.length,
      attendanceRate: appointments.length ? Math.round((attended / appointments.length) * 100) : 0,
      avgAiRating: avgRating,
      noShows,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
              <p className="text-2xl font-semibold text-foreground">{kpis.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
              <p className="text-2xl font-semibold text-foreground">{kpis.attendanceRate}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average AI Rating</p>
              <p className="text-2xl font-semibold text-foreground">
                {kpis.avgAiRating > 0 ? `${kpis.avgAiRating.toFixed(1)} / 5` : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">No-Shows</p>
              <p className="text-2xl font-semibold text-foreground">{kpis.noShows}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <Input
            type="search"
            placeholder="Search by participant name or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <div className="flex flex-wrap gap-1.5">
            {TYPE_OPTIONS.map((opt) => {
              const count = opt.id === "all" ? counts.total : opt.id === "user" ? counts.user : opt.id === "pod" ? counts.pod : counts.townhall;
              return (
                <Button
                  key={opt.id}
                  variant={typeFilter === opt.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(opt.id)}
                >
                  {opt.label} ({count})
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>AI Rating</TableHead>
                <TableHead>AI Review</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium tabular-nums">{a.dateTime}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {a.type === "user" && <User className="mr-1 h-3 w-3" />}
                      {a.type === "pod" && <Users className="mr-1 h-3 w-3" />}
                      {a.type === "townhall" && <Megaphone className="mr-1 h-3 w-3" />}
                      {a.type === "user" && "User"}
                      {a.type === "pod" && "Pod"}
                      {a.type === "townhall" && "Townhall"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.participants}</TableCell>
                  <TableCell className="text-muted-foreground">{a.duration ?? "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={a.attendance === "Attended" ? "default" : a.attendance === "No-Show" ? "destructive" : "secondary"}
                      className={cn(
                        a.attendance === "Scheduled" && "bg-muted text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {a.attendance === "No-Show" ? "No-Show" : a.attendance}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StarRating
                      score={a.aiScore}
                      notRated={a.attendance === "Scheduled" || a.aiScore == null}
                    />
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    {a.aiReview ? (
                      <div className="space-y-0.5">
                        <p className="truncate text-sm text-foreground">{a.aiReview.primary}</p>
                        {a.aiReview.secondary && (
                          <p className="truncate text-xs text-muted-foreground">{a.aiReview.secondary}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
