"use client";

import { useState, useMemo } from "react";
import {
  gigJobs,
  gigContacts,
  gigApplicants,
  gigStats,
  type GigJob,
  type GigJobStatus,
} from "@/lib/mock/gig";
import {
  Plus,
  Briefcase,
  Cloud,
  CheckCircle2,
  User,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Pencil,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<GigJobStatus, string> = {
  open: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0",
  approved: "bg-primary/10 text-primary border-0",
  completed: "bg-muted text-muted-foreground border-0",
};

const METRIC_ICON_WRAP = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full";
const METRIC_ICONS = {
  total: `${METRIC_ICON_WRAP} bg-muted text-muted-foreground`,
  open: `${METRIC_ICON_WRAP} bg-primary/10 text-primary`,
  approved: `${METRIC_ICON_WRAP} bg-emerald-500/15 text-emerald-600 dark:text-emerald-400`,
  completed: `${METRIC_ICON_WRAP} bg-muted text-muted-foreground`,
};

const AVATAR_STACK_MAX = 6;

function StackedAvatars({ applicantIds }: { applicantIds: string[] }) {
  const userMap = useMemo(
    () => new Map(gigApplicants.map((a) => [a.id, a])),
    []
  );
  const display = applicantIds.slice(0, AVATAR_STACK_MAX);

  return (
    <div className="flex -space-x-2">
      {display.map((id) => {
        const user = userMap.get(id);
        if (!user) return null;
        return (
          <div
            key={id}
            className={cn(
              "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-muted ring-2 ring-background"
            )}
            title={user.name}
          >
            <img
              src={user.avatar}
              alt=""
              className="h-full w-full object-cover"
              width={32}
              height={32}
            />
          </div>
        );
      })}
    </div>
  );
}

function JobCard({
  job,
  onEdit,
}: {
  job: GigJob;
  onEdit: (job: GigJob) => void;
}) {
  const contact = gigContacts.find((c) => c.id === job.contactId);
  const applicantCount = job.applicantIds.length;

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-panel">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 font-semibold leading-tight text-foreground">
            {job.title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(job)}
            aria-label="Edit job"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
              STATUS_STYLES[job.status]
            )}
          >
            {job.status}
          </span>
          {job.claimableExpenses && (
            <span className="inline-flex rounded-full border border-amber-300 bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
              Claimable Expenses
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {job.description}
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{job.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-foreground">{job.payment}</span>
          </div>
          {contact && (
            <p className="text-sm text-muted-foreground">
              Posted by {contact.name}
            </p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <StackedAvatars applicantIds={job.applicantIds} />
            <span className="text-sm text-muted-foreground">
              {applicantCount === 0
                ? "No one applied yet"
                : `${applicantCount} applied`}
            </span>
          </div>
        </div>
        <Button
          className="w-full"
          size="sm"
          disabled={job.actionLabel === "View Application" && applicantCount === 0}
        >
          {job.actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function GigPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GigJobStatus | "all">("all");

  const filteredJobs = useMemo(() => {
    let list = gigJobs;
    if (statusFilter !== "all") {
      list = list.filter((j) => j.status === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, statusFilter]);

  const filters: { id: GigJobStatus | "all"; label: string; count: number }[] = [
    { id: "all", label: "All", count: gigStats.total },
    { id: "open", label: "Open", count: gigStats.open },
    { id: "approved", label: "Approved", count: gigStats.approved },
    { id: "completed", label: "Completed", count: gigStats.completed },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={METRIC_ICONS.total}>
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Jobs
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {gigStats.total}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={METRIC_ICONS.open}>
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Open Jobs
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {gigStats.open}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={METRIC_ICONS.approved}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Approved Jobs
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {gigStats.approved}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={METRIC_ICONS.completed}>
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed Jobs
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {gigStats.completed}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <Button
                key={f.id}
                variant={statusFilter === f.id ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label} ({f.count})
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Create Job
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onEdit={() => {}}
          />
        ))}
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create job</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add a new job under Activation. (Placeholder – no backend.)
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Title
              </label>
              <Input placeholder="Job title" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Input placeholder="Full details..." className="min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Claim categories
              </label>
              <Input placeholder="e.g. Supervision, Hotline" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateModalOpen(false)}>Create job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
