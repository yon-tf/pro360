"use client";

import { Suspense, memo, useState, useMemo, useDeferredValue, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  appointments,
  CONTEXT_PRESETS,
  KIND_LABELS,
  INTERNAL_TYPES,
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_BY_CATEGORY,
  ACTIVATION_STATUS_LABELS,
  type Appointment,
  type AppointmentKind,
  type AppointmentCategory,
  type ServiceType,
  type ActivationStatus,
  type ContextPreset,
} from "@/features/appointments/mock/appointments";
import { WELLBEING_PILLAR_LABELS, type WellbeingPillar } from "@/features/org/mock/organizations";
import { ChevronDown } from "@/components/ui/solar-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ClickableTableRow } from "@/components/ui/clickable";
import { TablePagination } from "@/components/TablePagination";
import { PeriodFilter, defaultPeriodValue, type PeriodValue } from "@/features/filters/components/PeriodFilter";
import { TableToolbar } from "@/features/filters/components/TableToolbar";
import { MoreFiltersSheet } from "@/features/filters/components/MoreFiltersSheet";
import { useAdvancedFilters } from "@/lib/filters/useAdvancedFilters";
import {
  appointmentsFilterConfig,
  type AppointmentsAdvanced,
  type AttendanceFilter,
} from "@/lib/filter-configs/appointments";
import type { FilterContext } from "@/lib/filters/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function attendanceInfo(a: Appointment): { label: string; full: boolean } {
  const expected = a.expectedRoster.length;
  const joined = a.joinedRoster.length;
  if (expected === 0 && joined === 0) return { label: "Scheduled", full: false };
  if (joined === 0 && expected > 0) return { label: "No-Show", full: false };
  return { label: `${joined}/${expected}`, full: joined >= expected };
}

function attendanceVariant(a: Appointment): "default" | "destructive" | "secondary" {
  const joined = a.joinedRoster.length;
  const expected = a.expectedRoster.length;
  if (joined === 0 && expected > 0) return "destructive";
  if (joined === 0 && expected === 0) return "secondary";
  if (joined < expected) return "secondary";
  return "default";
}

const StarRating = memo(function StarRating({ score, max = 5 }: { score: number | null; max?: number }) {
  if (score == null) return <span className="text-sm text-muted-foreground">Not rated</span>;
  const full = Math.round(score);
  const empty = max - full;
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-amber-500">{"★".repeat(full)}<span className="text-muted-foreground/50">{"☆".repeat(empty)}</span></span>
      <span className="text-muted-foreground">{score}</span>
    </span>
  );
});

function formatScheduledAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function TargetCell({ appointment }: { appointment: Appointment }) {
  const value = appointment.category === "activation"
    ? appointment.organisationName ?? "—"
    : appointment.clientDisplay ?? "—";
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="max-w-[200px] truncate">{value}</div>
        </TooltipTrigger>
        {value.length > 18 && <TooltipContent><p>{value}</p></TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

function ProfessionalCell({ appointment }: { appointment: Appointment }) {
  const display = appointment.professionalDisplay;
  const plusMatch = display.match(/^(.+?)\s*\+(\d+)$/);
  if (!plusMatch) return <span className="truncate">{display}</span>;

  const [, primary, count] = plusMatch;
  const others = appointment.expectedRoster
    .filter((p) => p.role === "host" || p.role === "presenter" ? false : true)
    .map((p) => p.name);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate">{primary} <span className="text-muted-foreground">+{count}</span></span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <ul className="space-y-0.5 text-xs">{others.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function classifyAttendance(a: Appointment): AttendanceFilter | null {
  const expected = a.expectedRoster.length;
  const joined = a.joinedRoster.length;
  if (expected === 0 && joined === 0) return null;
  if (joined === 0 && expected > 0) return "no_show";
  if (joined < expected) return "partial";
  return "attended";
}

function AttendanceCell({ appointment: a }: { appointment: Appointment }) {
  const att = attendanceInfo(a);
  const variant = attendanceVariant(a);
  const hasRoster = a.expectedRoster.length > 0;

  const badge = (
    <div className="flex items-center gap-1.5">
      <Badge variant={variant} className={cn(variant === "secondary" && "bg-muted text-muted-foreground hover:bg-muted")}>
        {att.label}
      </Badge>
      {att.full && <Badge variant="success" className="text-[10px] px-1.5 py-0">Full</Badge>}
    </div>
  );

  if (!hasRoster) return badge;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs p-3">
          <ul className="space-y-1 text-xs">
            {a.expectedRoster.map((p) => {
              const joined = a.joinedRoster.some((j) => j.id === p.id);
              return (
                <li key={p.id} className="flex items-center gap-1.5">
                  <span className={joined ? "text-emerald-500" : "text-destructive"}>
                    {joined ? "●" : "○"}
                  </span>
                  <span>{p.name}</span>
                  {!joined && <span className="text-destructive/70">(absent)</span>}
                </li>
              );
            })}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TypeBadge({ appointment: a }: { appointment: Appointment }) {
  const label = a.context === "internal"
    ? KIND_LABELS[a.type]
    : (a.serviceType ? SERVICE_TYPE_LABELS[a.serviceType] : KIND_LABELS[a.type]);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="max-w-[120px] truncate font-normal">{label}</Badge>
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PillarsCell({ pillars }: { pillars?: WellbeingPillar[] }) {
  if (!pillars || pillars.length === 0) return <span className="text-muted-foreground">—</span>;
  const labels = pillars.map((p) => WELLBEING_PILLAR_LABELS[p] ?? p);
  const display = labels.length <= 2 ? labels.join(", ") : `${labels[0]} +${labels.length - 1}`;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="max-w-[140px] truncate text-sm">{display}</span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <ul className="space-y-0.5 text-xs">{labels.map((l, i) => <li key={i}>{l}</li>)}</ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function StatusBadge({ status }: { status?: ActivationStatus }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const variant = status === "attended"
    ? "success"
    : status === "in_progress"
      ? "warning"
      : "outline";
  return <Badge variant={variant} className="text-xs font-normal">{ACTIVATION_STATUS_LABELS[status]}</Badge>;
}

// ---------------------------------------------------------------------------
// Column counts per view
// ---------------------------------------------------------------------------

const COL_CORE = 8;
const COL_ACTIVATION = 10;
const COL_INTERNAL = 7;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AppointmentsPage() {
  return (
    <Suspense>
      <AppointmentsContent />
    </Suspense>
  );
}

type ExternalSubTab = "core" | "activation";

function AppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const contextParam = (searchParams.get("context") ?? "external") as string;
  const preset: ContextPreset = CONTEXT_PRESETS[contextParam] ?? CONTEXT_PRESETS.external;
  const activeContext = preset.context!;

  const serviceTypeParam = (searchParams.get("serviceType") as ExternalSubTab | null) ?? "core";
  const externalTab: ExternalSubTab = serviceTypeParam === "activation" ? "activation" : "core";

  // Primary (immediate) — unified type filter holds AppointmentKind (internal) or ServiceType (external) values
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [period, setPeriod] = useState<PeriodValue>(defaultPeriodValue());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toggleType = useCallback((val: string) => {
    setSelectedTypes((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
    setPage(1);
  }, []);

  // Advanced (shared system)
  const filterCtx: FilterContext = useMemo(() => ({ activeContext }), [activeContext]);
  const adv = useAdvancedFilters<AppointmentsAdvanced>(appointmentsFilterConfig, filterCtx);

  const switchContext = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("context", key);
      params.delete("serviceType");
      router.push(`/appointments?${params.toString()}`);
      setPage(1);
      setSelectedTypes([]);
      if (adv.applied.orgId) {
        adv.removeAppliedFilter("orgId");
      }
    },
    [router, searchParams, adv],
  );

  const switchExternalTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("serviceType", tab);
      router.push(`/appointments?${params.toString()}`);
      setPage(1);
      setSelectedTypes([]);
    },
    [router, searchParams],
  );

  const activeCategoryFilter: AppointmentCategory | null =
    activeContext === "external" ? (externalTab === "activation" ? "activation" : "core_service") : null;

  // Filter pipeline
  const filtered = useMemo(() => {
    let list = [...appointments];
    const vk = adv.visibleKeys;
    const af = adv.applied;

    if (activeContext) list = list.filter((a) => a.context === activeContext);
    if (activeCategoryFilter) list = list.filter((a) => a.category === activeCategoryFilter);
    if (selectedTypes.length > 0) {
      list = list.filter((a) =>
        selectedTypes.includes(a.type) || (a.serviceType != null && selectedTypes.includes(a.serviceType)),
      );
    }

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase();
      list = list.filter(
        (a) =>
          a.professionalDisplay.toLowerCase().includes(q) ||
          (a.clientDisplay && a.clientDisplay.toLowerCase().includes(q)) ||
          (a.organisationName && a.organisationName.toLowerCase().includes(q)) ||
          a.participantsSummary.toLowerCase().includes(q) ||
          (a.notes && a.notes.toLowerCase().includes(q)) ||
          (a.aiReview?.primary && a.aiReview.primary.toLowerCase().includes(q)) ||
          (a.aiReview?.secondary && a.aiReview.secondary.toLowerCase().includes(q)) ||
          KIND_LABELS[a.type].toLowerCase().includes(q),
      );
    }

    if (vk.has("orgId") && af.orgId) list = list.filter((a) => a.organisationId === af.orgId);

    if (vk.has("attendanceStatuses") && af.attendanceStatuses.length > 0) {
      list = list.filter((a) => {
        const cls = classifyAttendance(a);
        return cls != null && af.attendanceStatuses.includes(cls);
      });
    }

    if (vk.has("hasTranscript") && af.hasTranscript === true) list = list.filter((a) => !!a.transcript);
    if (vk.has("hasTranscript") && af.hasTranscript === false) list = list.filter((a) => !a.transcript);
    if (vk.has("hasAiSummary") && af.hasAiSummary === true) list = list.filter((a) => !!a.aiSummary);
    if (vk.has("hasAiSummary") && af.hasAiSummary === false) list = list.filter((a) => !a.aiSummary);
    if (vk.has("hasCaseNotes") && af.hasCaseNotes === true) list = list.filter((a) => !!a.caseNotesSOAP);
    if (vk.has("hasCaseNotes") && af.hasCaseNotes === false) list = list.filter((a) => !a.caseNotesSOAP);
    if (vk.has("hasPodNotes") && af.hasPodNotes === true) list = list.filter((a) => !!a.podDocumentation);
    if (vk.has("hasPodNotes") && af.hasPodNotes === false) list = list.filter((a) => !a.podDocumentation);

    if (vk.has("aiRatingMin") && af.aiRatingMin != null) {
      list = list.filter((a) => a.aiQualityScore != null && a.aiQualityScore >= af.aiRatingMin!);
    }

    if (vk.has("qualityFlags") && af.qualityFlags.length > 0) {
      list = list.filter((a) => {
        const flags = a.quality?.flags ?? [];
        return af.qualityFlags.some((f) => flags.includes(f));
      });
    }

    list.sort((a, b) => {
      const dir = preset.defaultSort.dir === "asc" ? 1 : -1;
      return a.scheduledAt < b.scheduledAt ? dir : a.scheduledAt > b.scheduledAt ? -dir : 0;
    });

    return list;
  }, [activeContext, activeCategoryFilter, preset, selectedTypes, deferredSearch, adv.applied, adv.visibleKeys]);

  const typeFilterLabel = useMemo(() => {
    if (selectedTypes.length === 0) return "Type";
    if (selectedTypes.length === 1) {
      const v = selectedTypes[0];
      return SERVICE_TYPE_LABELS[v as ServiceType] ?? KIND_LABELS[v as AppointmentKind] ?? v;
    }
    return `Type (${selectedTypes.length})`;
  }, [selectedTypes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const colSpan =
    activeContext === "internal" ? COL_INTERNAL
    : externalTab === "activation" ? COL_ACTIVATION
    : COL_CORE;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-foreground">{preset.label}</h2>
            <Tabs value={contextParam} onValueChange={(v) => switchContext(v)}>
              <TabsList className="h-8">
                <TabsTrigger value="internal" className="text-xs px-2.5">Internal</TabsTrigger>
                <TabsTrigger value="external" className="text-xs px-2.5">External</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {activeContext === "internal" && (
            <Button asChild size="sm">
              <Link href="/appointments/create">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                Create appointment
              </Link>
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {activeContext === "internal"
            ? "Review attendance, AI ratings, and summaries for internal sessions."
            : "Review attendance, AI ratings, and summaries for client and activation sessions."}
        </p>
      </div>

      {/* Sub-tabs for external context */}
      {activeContext === "external" && (
        <Tabs value={externalTab} onValueChange={(v) => switchExternalTab(v)}>
          <TabsList className="h-8">
            <TabsTrigger value="core" className="text-xs px-3">Core services</TabsTrigger>
            <TabsTrigger value="activation" className="text-xs px-3">Activation</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Toolbar (shared system) */}
      <TableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={
          activeContext === "internal"
            ? "Search by professional, type, or notes…"
            : externalTab === "activation"
              ? "Search by organisation, professional, or activation type…"
              : "Search by professional, organisation, or client…"
        }
        appliedCount={adv.appliedCount}
        onMoreFilters={() => adv.setSheetOpen(true)}
        chips={adv.activeChips}
        onRemoveChip={adv.removeAppliedFilter}
        onClearAllChips={adv.clearAllApplied}
      >
        <PeriodFilter value={period} onChange={setPeriod} />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={selectedTypes.length > 0 ? "secondary" : "outline"} size="sm" className="shrink-0 gap-1.5">
              {typeFilterLabel}
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 max-h-80 overflow-y-auto p-3">
            {activeContext === "internal" ? (
              INTERNAL_TYPES.map((k) => (
                <label key={k} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer">
                  <Checkbox checked={selectedTypes.includes(k)} onCheckedChange={() => toggleType(k)} />
                  {KIND_LABELS[k]}
                </label>
              ))
            ) : (
              (activeCategoryFilter === "activation" ? SERVICE_TYPE_BY_CATEGORY.activation : SERVICE_TYPE_BY_CATEGORY.core_service).map((st) => (
                <label key={st} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer">
                  <Checkbox checked={selectedTypes.includes(st)} onCheckedChange={() => toggleType(st)} />
                  {SERVICE_TYPE_LABELS[st]}
                </label>
              ))
            )}
            {selectedTypes.length > 0 && (
              <Button variant="ghost" size="sm" className="mt-2 w-full text-xs" onClick={() => { setSelectedTypes([]); setPage(1); }}>
                Clear all
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </TableToolbar>

      {/* Advanced filters Sheet (shared system) */}
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
      />

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {activeContext === "external" && externalTab === "activation" ? (
                  <>
                    <TableHead>Date</TableHead>
                    <TableHead>Activation Type</TableHead>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Pillars</TableHead>
                    <TableHead>Professional</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Program Rating</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Status</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    {activeContext === "external" && <TableHead>{externalTab === "activation" ? "Organisation" : "Client"}</TableHead>}
                    <TableHead>Professional</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>AI Rating</TableHead>
                    <TableHead>AI Review</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-8 text-center text-muted-foreground">
                    No appointments match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {paged.map((a) => {
                if (activeContext === "external" && externalTab === "activation") {
                  return (
                    <ClickableTableRow key={a.id} onActivate={() => router.push(`/appointments/${a.id}`)}>
                      <TableCell className="font-medium tabular-nums whitespace-nowrap">
                        {new Date(a.scheduledAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell>
                        <TypeBadge appointment={a} />
                      </TableCell>
                      <TableCell>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="max-w-[140px] truncate text-sm">{a.organisationName ?? "—"}</span>
                            </TooltipTrigger>
                            {(a.organisationName ?? "").length > 16 && <TooltipContent>{a.organisationName}</TooltipContent>}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell><PillarsCell pillars={a.wellbeingPillars} /></TableCell>
                      <TableCell className="max-w-[180px]"><ProfessionalCell appointment={a} /></TableCell>
                      <TableCell className="text-muted-foreground">{a.duration ?? "—"}</TableCell>
                      <TableCell className="tabular-nums">{a.participantCount ?? "—"}</TableCell>
                      <TableCell>
                        {a.programRating != null
                          ? <span className="text-sm tabular-nums">{a.programRating.toFixed(1)}/5</span>
                          : <span className="text-sm text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {a.engagementRate != null
                          ? <span className="text-sm tabular-nums">{a.engagementRate}%</span>
                          : <span className="text-sm text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell><StatusBadge status={a.activationStatus} /></TableCell>
                    </ClickableTableRow>
                  );
                }
                return (
                  <ClickableTableRow key={a.id} onActivate={() => router.push(`/appointments/${a.id}`)}>
                    <TableCell className="font-medium tabular-nums">{formatScheduledAt(a.scheduledAt)}</TableCell>
                    <TableCell><TypeBadge appointment={a} /></TableCell>
                    {activeContext === "external" && <TableCell><TargetCell appointment={a} /></TableCell>}
                    <TableCell className="max-w-[180px]"><ProfessionalCell appointment={a} /></TableCell>
                    <TableCell className="text-muted-foreground">{a.duration ?? "—"}</TableCell>
                    <TableCell><AttendanceCell appointment={a} /></TableCell>
                    <TableCell><StarRating score={a.aiQualityScore} /></TableCell>
                    <TableCell className="max-w-[240px]">
                      {a.aiReview ? (
                        <div className="space-y-0.5">
                          <p className="truncate text-sm text-foreground">{a.aiReview.primary}</p>
                          {a.aiReview.secondary && <p className="truncate text-xs text-muted-foreground">{a.aiReview.secondary}</p>}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </ClickableTableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TablePagination
        page={safePage}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    </div>
  );
}
