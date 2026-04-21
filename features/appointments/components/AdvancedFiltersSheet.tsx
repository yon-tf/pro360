"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  getUniqueOrganisations,
  type AppointmentContext,
} from "@/features/appointments/mock/appointments";
import { pods } from "@/features/team/mock/pods";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AttendanceFilter = "attended" | "partial" | "missed" | "no_show";
export type QualityFlag = "late_notes" | "missing_notes" | "no_show" | "rule_hits" | "below_threshold_ai_score" | "partial_attendance" | "below_expected_volume";

export interface AdvancedFilters {
  orgId: string | null;
  podId: string | null;
  attendanceStatuses: AttendanceFilter[];
  hasTranscript: boolean | null;
  hasAiSummary: boolean | null;
  hasCaseNotes: boolean | null;
  hasPodNotes: boolean | null;
  aiRatingMin: number | null;
  qualityFlags: QualityFlag[];
}

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  orgId: null,
  podId: null,
  attendanceStatuses: [],
  hasTranscript: null,
  hasAiSummary: null,
  hasCaseNotes: null,
  hasPodNotes: null,
  aiRatingMin: null,
  qualityFlags: [],
};

export function countAppliedFilters(f: AdvancedFilters): number {
  let n = 0;
  if (f.orgId) n++;
  if (f.podId) n++;
  if (f.attendanceStatuses.length > 0) n++;
  if (f.hasTranscript != null) n++;
  if (f.hasAiSummary != null) n++;
  if (f.hasCaseNotes != null) n++;
  if (f.hasPodNotes != null) n++;
  if (f.aiRatingMin != null) n++;
  if (f.qualityFlags.length > 0) n++;
  return n;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ATTENDANCE_OPTIONS: { value: AttendanceFilter; label: string }[] = [
  { value: "attended", label: "Attended" },
  { value: "partial", label: "Partial" },
  { value: "missed", label: "Missed" },
  { value: "no_show", label: "No-show" },
];

const QUALITY_FLAG_OPTIONS: { value: QualityFlag; label: string }[] = [
  { value: "late_notes", label: "Late notes" },
  { value: "missing_notes", label: "Missing notes" },
  { value: "no_show", label: "No-show" },
  { value: "rule_hits", label: "Rule engine hits" },
  { value: "partial_attendance", label: "Partial attendance" },
  { value: "below_expected_volume", label: "Below expected volume" },
  { value: "below_threshold_ai_score", label: "Below AI threshold" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AdvancedFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applied: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
  activeContext?: AppointmentContext;
}

export function AdvancedFiltersSheet({
  open,
  onOpenChange,
  applied,
  onApply,
  activeContext,
}: AdvancedFiltersSheetProps) {
  const [draft, setDraft] = useState<AdvancedFilters>(() => ({ ...applied }));

  useEffect(() => {
    if (open) setDraft({ ...applied, attendanceStatuses: [...applied.attendanceStatuses], qualityFlags: [...applied.qualityFlags] });
  }, [open, applied]);

  const orgOptions = useMemo(() => getUniqueOrganisations(), []);
  const activePods = useMemo(() => pods.filter((p) => p.status === "Active"), []);
  const orgLocked = activeContext === "internal";

  const [orgSearch, setOrgSearch] = useState("");
  const filteredOrgs = useMemo(() => {
    if (!orgSearch.trim()) return orgOptions;
    const q = orgSearch.toLowerCase();
    return orgOptions.filter((o) => o.name.toLowerCase().includes(q));
  }, [orgOptions, orgSearch]);

  const patch = useCallback((partial: Partial<AdvancedFilters>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleAttendance = useCallback((val: AttendanceFilter) => {
    setDraft((prev) => {
      const list = prev.attendanceStatuses.includes(val)
        ? prev.attendanceStatuses.filter((v) => v !== val)
        : [...prev.attendanceStatuses, val];
      return { ...prev, attendanceStatuses: list };
    });
  }, []);

  const toggleQualityFlag = useCallback((val: QualityFlag) => {
    setDraft((prev) => {
      const list = prev.qualityFlags.includes(val)
        ? prev.qualityFlags.filter((v) => v !== val)
        : [...prev.qualityFlags, val];
      return { ...prev, qualityFlags: list };
    });
  }, []);

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  const handleClearAll = () => {
    setDraft({ ...DEFAULT_ADVANCED_FILTERS, attendanceStatuses: [], qualityFlags: [] });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>Narrow down appointments with advanced criteria. Press Apply to update results.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 py-4">
          <div className="space-y-8">

            {/* ── 1) TARGET ────────────────────────────────────────────── */}
            <FilterSection title="Target">
              <FilterField label="Organisation">
                {orgLocked ? (
                  <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">ThoughtFull</div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="search"
                      placeholder="Search organisations…"
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Select value={draft.orgId ?? "__none"} onValueChange={(v) => patch({ orgId: v === "__none" ? null : v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All organisations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">All organisations</SelectItem>
                        {filteredOrgs.map((o) => (
                          <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </FilterField>
            </FilterSection>

            {/* ── 2) APPOINTMENT DETAILS ────────────────────────────────── */}
            <FilterSection title="Appointment details">
              <FilterField label="Pod">
                <Select value={draft.podId ?? "__none"} onValueChange={(v) => patch({ podId: v === "__none" ? null : v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All pods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">All pods</SelectItem>
                    {activePods.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            </FilterSection>

            {/* ── 3) ATTENDANCE ─────────────────────────────────────────── */}
            <FilterSection title="Attendance">
              <FilterField label="Status">
                <div className="grid grid-cols-2 gap-3">
                  {ATTENDANCE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={draft.attendanceStatuses.includes(opt.value)}
                        onCheckedChange={() => toggleAttendance(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </FilterField>
            </FilterSection>

            {/* ── 4) DOCUMENTATION & CONTENT ────────────────────────────── */}
            <FilterSection title="Documentation & content">
              <div className="space-y-3">
                <TriStateSwitch label="Has transcript" value={draft.hasTranscript} onChange={(v) => patch({ hasTranscript: v })} />
                <TriStateSwitch label="Has AI summary" value={draft.hasAiSummary} onChange={(v) => patch({ hasAiSummary: v })} />
                <TriStateSwitch label="Has case notes" value={draft.hasCaseNotes} onChange={(v) => patch({ hasCaseNotes: v })} />
                <TriStateSwitch label="Has pod notes / topics" value={draft.hasPodNotes} onChange={(v) => patch({ hasPodNotes: v })} />
              </div>
            </FilterSection>

            {/* ── 5) QUALITY ────────────────────────────────────────────── */}
            <FilterSection title="Quality">
              <FilterField label="AI rating minimum">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {draft.aiRatingMin != null ? `${draft.aiRatingMin} / 5` : "Any"}
                    </span>
                    {draft.aiRatingMin != null && (
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => patch({ aiRatingMin: null })}>
                        Clear
                      </Button>
                    )}
                  </div>
                  <Slider
                    min={1}
                    max={5}
                    step={0.5}
                    value={[draft.aiRatingMin ?? 1]}
                    onValueChange={([v]) => patch({ aiRatingMin: v })}
                  />
                </div>
              </FilterField>
              <FilterField label="Quality flags">
                <div className="space-y-2">
                  {QUALITY_FLAG_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={draft.qualityFlags.includes(opt.value)}
                        onCheckedChange={() => toggleQualityFlag(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </FilterField>
            </FilterSection>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row gap-2 border-t border-border pt-4">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>Cancel</Button>
          <Button variant="ghost" className="flex-1" onClick={handleClearAll}>Clear all</Button>
          <Button className="flex-1" onClick={handleApply}>Apply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {children}
    </div>
  );
}

function TriStateSwitch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  const cycle = () => {
    if (value === null) onChange(true);
    else if (value === true) onChange(false);
    else onChange(null);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Switch checked={value === true} onCheckedChange={cycle} />
        <span
          role="button"
          tabIndex={0}
          onClick={cycle}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cycle(); } }}
          className="w-8 cursor-pointer select-none text-xxs tabular-nums text-muted-foreground"
        >
          {value === null ? "Any" : value ? "Yes" : "No"}
        </span>
      </div>
    </div>
  );
}
