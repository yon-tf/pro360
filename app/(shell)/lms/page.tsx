"use client";

import { useState, useMemo, useDeferredValue } from "react";
import Image from "next/image";
import { lmsModules, lmsEnrolledUsers, lmsStats } from "@/features/lms/mock/lms";
import type { LMSModule, LMSCategory } from "@/features/lms/mock/lms";
import {
  BookOpenBold,
  Plus,
  BarChart3,
  Search,
  UsersBold,
  CheckCircleBold,
  Clock,
  ClockBold,
} from "@/components/ui/solar-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { KpiCard } from "@/features/pro360/components/KpiCard";

const CATEGORY_STYLES: Record<LMSCategory, string> = {
  "Onboarding Trial": "bg-primary/10 text-primary",
  "Core Training": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "Continuing Education": "bg-violet-500/15 text-violet-700 dark:text-violet-400",
};


const AVATAR_STACK_MAX = 6;

function StackedAvatars({ userIds }: { userIds: string[] }) {
  const userMap = useMemo(
    () => new Map(lmsEnrolledUsers.map((u) => [u.id, u])),
    []
  );
  const display = userIds.slice(0, AVATAR_STACK_MAX);
  const overflow = userIds.length - AVATAR_STACK_MAX;

  return (
    <div className="flex items-center">
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
      {overflow > 0 && (
        <span className="ml-1 text-xs font-medium text-muted-foreground">
          +{overflow}
        </span>
      )}
    </div>
  );
}

function ModuleCard({ module: m }: { module: LMSModule }) {
  const passedCount = m.passedCount;

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-panel">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
              CATEGORY_STYLES[m.category]
            )}
          >
            {m.category}
          </span>
        </div>
        <h3 className="font-semibold leading-tight text-foreground">
          {m.name}
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {m.timeSpentAvg}
          </span>
          <span className="flex items-center gap-1.5">
            <span>Pass rate</span>
            <span className="font-medium text-foreground">{m.passRate}%</span>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${m.passRate}%` }}
          />
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <StackedAvatars userIds={m.enrolledUserIds} />
          <span className="shrink-0 text-sm font-medium text-foreground">
            {passedCount} passed
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LMSPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filteredModules = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return lmsModules;
    return lmsModules.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }, [deferredSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Learning modules</h2>
          <p className="text-sm text-muted-foreground">Browse training inventory, enrollment progress, and completion performance.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            Add Module
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Modules" value={lmsStats.totalModules} icon={<BookOpenBold className="h-5 w-5" />} />
        <KpiCard title="Total Enrollments" value={lmsStats.totalEnrollments} icon={<UsersBold className="h-5 w-5" />} />
        <KpiCard title="Average Pass Rate" value={`${lmsStats.averagePassRate}%`} icon={<CheckCircleBold className="h-5 w-5" />} />
        <KpiCard title="Avg Time Spent" value={lmsStats.avgTimeSpent} icon={<ClockBold className="h-5 w-5" />} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search modules by name or label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredModules.map((m) => (
          <ModuleCard key={m.id} module={m} />
        ))}
      </div>
    </div>
  );
}
