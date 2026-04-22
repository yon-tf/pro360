"use client";

import { memo, useState, useMemo, useDeferredValue } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  gigJobs,
  gigContacts,
  gigApplicants,
  gigStats,
  type GigJob,
  type GigJobStatus,
} from "@/features/gig/mock/gig";
import {
  Plus,
  BriefcaseBold,
  CloudBold,
  CheckCircleBold,
  UserBold,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Pencil,
} from "@/components/ui/solar-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { KpiCard } from "@/features/pro360/components/KpiCard";

const CreateJobDialog = dynamic(
  () => import("@/features/gig/components/CreateJobDialog").then((m) => m.CreateJobDialog),
  { ssr: false }
);

const STATUS_STYLES: Record<GigJobStatus, string> = {
  open: "bg-success/15 text-success border-0 dark:bg-success/20",
  approved: "bg-primary/10 text-primary border-0",
  completed: "bg-muted text-muted-foreground border-0",
};


const AVATAR_STACK_MAX = 6;

const StackedAvatars = memo(function StackedAvatars({ applicantIds }: { applicantIds: string[] }) {
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
            <Image
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
});

const JobCard = memo(function JobCard({
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
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize",
              STATUS_STYLES[job.status]
            )}
          >
            {job.status}
          </span>
          {job.claimableExpenses && (
            <span className="inline-flex rounded-full border border-warning/35 bg-warning/15 px-3 py-1 text-xs font-medium text-warning dark:bg-warning/20">
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
});

export default function GigPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<GigJobStatus | "all">("all");

  const filteredJobs = useMemo(() => {
    let list = gigJobs;
    if (statusFilter !== "all") {
      list = list.filter((j) => j.status === statusFilter);
    }
    const q = deferredSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [deferredSearch, statusFilter]);

  const filters: { id: GigJobStatus | "all"; label: string; count: number }[] = [
    { id: "all", label: "All", count: gigStats.total },
    { id: "open", label: "Open", count: gigStats.open },
    { id: "approved", label: "Approved", count: gigStats.approved },
    { id: "completed", label: "Completed", count: gigStats.completed },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Gig opportunities</h2>
          <p className="text-sm text-muted-foreground">Track activation jobs, applicant demand, and posting status in one queue.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Create Job
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Jobs" value={gigStats.total} icon={<BriefcaseBold className="h-5 w-5" />} />
        <KpiCard title="Open Jobs" value={gigStats.open} icon={<CloudBold className="h-5 w-5" />} />
        <KpiCard title="Approved Jobs" value={gigStats.approved} icon={<CheckCircleBold className="h-5 w-5" />} />
        <KpiCard title="Completed Jobs" value={gigStats.completed} icon={<UserBold className="h-5 w-5" />} />
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
          <div className="flex flex-wrap gap-2">
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

      {createModalOpen && (
        <CreateJobDialog open={createModalOpen} onOpenChange={setCreateModalOpen} />
      )}
    </div>
  );
}
