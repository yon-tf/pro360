"use client";

import { useMemo, useState, useCallback } from "react";
import { clsx } from "clsx";
import Link from "next/link";
import { mockTFPRows } from "@/lib/mock/payoutRun";
import { professionals } from "@/lib/mock/professionals";
import { professionalProfiles } from "@/lib/mock/professionalProfiles";
import { appointments, KIND_LABELS } from "@/lib/mock/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/Tabs";
import { buildPayoutLink, buildAppointmentsLink } from "@/lib/routes";
import { defaultPeriodValue, type PeriodValue } from "@/components/filters/PeriodFilter";
import {
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "@/components/ui/solar-icons";
import { systemToast } from "@/lib/systemToast";
import { QualityByProfessional } from "@/components/pro360/QualityByProfessional";
import { QualityByOrganization } from "@/components/pro360/QualityByOrganization";
import {
  buildChatRows,
  buildAppointmentRows,
  buildProfessionalRows,
  buildPodRows,
  buildLearnRows,
  buildGigRows,
  buildSystemRows,
  ATTENTION_TAB_LABELS,
  type AttentionTabId,
  type AttentionRow,
} from "@/lib/attention-rows";

// ---------------------------------------------------------------------------
// Leaderboards
// ---------------------------------------------------------------------------

interface LeaderboardItem { id: string; name: string; value: string }

function getEarningsLeaderboard(): LeaderboardItem[] {
  return [...mockTFPRows]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((r) => ({
      id: r.id,
      name: r.name,
      value: `$${r.total.toLocaleString()}`,
    }));
}

function getClientCountLeaderboard(): LeaderboardItem[] {
  return [...professionalProfiles]
    .filter((p) => p.activeClients > 0)
    .sort((a, b) => b.activeClients - a.activeClients)
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      value: `${p.activeClients}`,
    }));
}

function getSessionVolumeLeaderboard(): LeaderboardItem[] {
  return [...professionals]
    .filter((p) => p.totalAppointments > 0)
    .sort((a, b) => b.totalAppointments - a.totalAppointments)
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      name: p.name,
      value: `${p.totalAppointments}`,
    }));
}

// ---------------------------------------------------------------------------
// Ops calendar
// ---------------------------------------------------------------------------

type OpsEventType = "townhall" | "pod" | "workshop" | "other";

interface OpsCalEvent {
  id: string;
  title: string;
  participants: string;
  startHour: number;
  start: string;
  end: string;
  eventType: OpsEventType;
  date: Date;
}

function toOpsType(type: string): OpsEventType {
  if (type === "townhall") return "townhall";
  if (type === "pod_appointment") return "pod";
  if (type === "workshop") return "workshop";
  return "other";
}

const EVENT_STYLE: Record<OpsEventType, string> = {
  townhall: "border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
  pod: "border-l-4 border-l-violet-500 bg-violet-50/50 dark:bg-violet-950/20",
  workshop: "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
  other: "border-l-4 border-l-primary bg-primary/5",
};

const EVENT_DOT: Record<OpsEventType, string> = {
  townhall: "bg-emerald-500",
  pod: "bg-violet-500",
  workshop: "bg-amber-500",
  other: "bg-primary",
};

const EVENT_BADGE: Record<OpsEventType, string> = {
  townhall: "border-emerald-500 text-emerald-700 dark:text-emerald-400",
  pod: "border-violet-500 text-violet-700 dark:text-violet-400",
  workshop: "border-amber-500 text-amber-700 dark:text-amber-400",
  other: "border-primary text-primary",
};

const DAY_SLOTS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

function slotLabel(h: number) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function getAllOpsEvents(): OpsCalEvent[] {
  return appointments
    .filter((a) => a.context === "internal")
    .map((a) => {
      const dt = new Date(a.scheduledAt);
      const endDt = a.endedAt ? new Date(a.endedAt) : null;
      return {
        id: a.id,
        title: KIND_LABELS[a.type] ?? a.type.replace(/_/g, " "),
        participants: a.participantsSummary ?? a.professionalDisplay,
        startHour: dt.getHours(),
        start: dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        end: endDt
          ? endDt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
          : a.duration ? `+${a.duration}` : "—",
        eventType: toOpsType(a.type),
        date: dt,
      } satisfies OpsCalEvent;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function monthGrid(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: total }, (_, i) => ({
    date: i + 1,
    col: (firstDow + i) % 7 + 1,
    row: Math.floor((firstDow + i) / 7) + 2,
  }));
}

function eventDatesInMonth(events: OpsCalEvent[], year: number, month: number): Set<number> {
  const s = new Set<number>();
  for (const e of events) {
    if (e.date.getFullYear() === year && e.date.getMonth() === month) s.add(e.date.getDate());
  }
  return s;
}

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const DASHBOARD_ITEM_LIMIT = 8;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Pro360AggregatePage() {
  const period = useMemo<PeriodValue>(defaultPeriodValue, []);

  const earningsLeaderboard = useMemo(getEarningsLeaderboard, []);
  const clientCountLeaderboard = useMemo(getClientCountLeaderboard, []);
  const sessionVolumeLeaderboard = useMemo(getSessionVolumeLeaderboard, []);

  const allOpsEvents = useMemo(getAllOpsEvents, []);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const calMonth = selectedDate.getMonth();
  const calYear = selectedDate.getFullYear();
  const calGrid = useMemo(() => monthGrid(calYear, calMonth), [calYear, calMonth]);
  const calMonthLabel = selectedDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const calDayLabel = selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const calDayWeekday = selectedDate.toLocaleDateString("en-GB", { weekday: "long" });
  const calDatesWithEvents = useMemo(() => eventDatesInMonth(allOpsEvents, calYear, calMonth), [allOpsEvents, calYear, calMonth]);

  const dayEvents = useMemo(
    () => allOpsEvents.filter((e) => sameDay(e.date, selectedDate)),
    [allOpsEvents, selectedDate],
  );
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return allOpsEvents.filter((e) => e.date > now).slice(0, 5);
  }, [allOpsEvents]);

  const shiftDay = useCallback((delta: number) => {
    setSelectedDate((d) => { const n = new Date(d); n.setDate(n.getDate() + delta); return n; });
  }, []);
  const shiftMonth = useCallback((delta: number) => {
    setSelectedDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() + delta, 1); return n; });
  }, []);
  const goToday = useCallback(() => setSelectedDate(new Date()), []);
  const pickDate = useCallback((day: number) => {
    setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), day));
  }, []);

  const chatRows = useMemo(() => buildChatRows(DASHBOARD_ITEM_LIMIT), []);
  const appointmentRows = useMemo(() => buildAppointmentRows(DASHBOARD_ITEM_LIMIT), []);
  const professionalRows = useMemo(() => buildProfessionalRows(), []);
  const podRows = useMemo(() => buildPodRows(), []);
  const learnRows = useMemo(() => buildLearnRows(), []);
  const gigRows = useMemo(() => buildGigRows(), []);
  const systemRows = useMemo(() => buildSystemRows(), []);

  const tabCounts = useMemo(() => ({
    chat: chatRows.length,
    appointments: appointmentRows.length,
    professional: professionalRows.length,
    pod: podRows.length,
    learn: learnRows.length,
    gig: gigRows.length,
    system: systemRows.length,
  }), [chatRows, appointmentRows, professionalRows, podRows, learnRows, gigRows, systemRows]);

  const totalAttention = Object.values(tabCounts).reduce((s, n) => s + n, 0);

  const defaultTab: AttentionTabId = useMemo(() => {
    const entries = Object.entries(tabCounts) as [AttentionTabId, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }, [tabCounts]);

  const [attentionTab, setAttentionTab] = useState<AttentionTabId>(defaultTab);
  const [attentionPage, setAttentionPage] = useState(1);
  const ATTENTION_PAGE_SIZE = 3;

  const handleTabChange = (id: string) => {
    setAttentionTab(id as AttentionTabId);
    setAttentionPage(1);
  };

  const rowMap: Record<AttentionTabId, AttentionRow[]> = {
    chat: chatRows,
    appointments: appointmentRows,
    professional: professionalRows,
    pod: podRows,
    learn: learnRows,
    gig: gigRows,
    system: systemRows,
  };
  const activeRows = rowMap[attentionTab];

  const attentionTotalPages = Math.max(1, Math.ceil(activeRows.length / ATTENTION_PAGE_SIZE));
  const safePage = Math.min(attentionPage, attentionTotalPages);
  const paginatedRows = activeRows.slice((safePage - 1) * ATTENTION_PAGE_SIZE, safePage * ATTENTION_PAGE_SIZE);

  const attentionViewAllHref = `/pro360/attention?tab=${attentionTab}`;

  const handleComingSoon = () => {
    systemToast.info("Coming soon", "This action is not yet available.");
  };

  return (
    <div className="space-y-6">
      {/* ── 1) PAGE HEADER ──────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Professional 360</h1>
        <p className="text-sm text-muted-foreground">Clinical ops overview</p>
      </div>

      {/* ── 2) NEEDS ATTENTION QUEUE (module-based tabs) ─────────────────── */}
      {totalAttention > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Needs attention
              </CardTitle>
              <Button variant="link" size="sm" className="text-xs" asChild>
                <Link href={attentionViewAllHref}>View all <ExternalLink className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Tabs
              tabs={Object.entries(tabCounts).map(([id, count]) => ({
                id,
                label: `${ATTENTION_TAB_LABELS[id as AttentionTabId]} (${count})`,
              }))}
              activeId={attentionTab}
              onChange={handleTabChange}
            />
            {activeRows.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No items in this category.</p>
            ) : (
              <>
                <ul className="divide-y divide-border">
                  {paginatedRows.map((row) => (
                    <li key={row.id} className="flex items-center gap-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{row.primaryLabel}</p>
                        <p className="text-xs text-muted-foreground">{row.secondaryLabel}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{row.ageLabel}</span>
                      <Button variant="outline" size="sm" className="shrink-0" onClick={handleComingSoon}>
                        {row.actionLabel}
                      </Button>
                      {row.secondaryAction && (
                        <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={handleComingSoon}>
                          {row.secondaryAction.label}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
                {attentionTotalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-xs text-muted-foreground">
                      {activeRows.length} item{activeRows.length !== 1 ? "s" : ""} · Page {safePage} of {attentionTotalPages}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={safePage <= 1} onClick={() => setAttentionPage(safePage - 1)}>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={safePage >= attentionTotalPages} onClick={() => setAttentionPage(safePage + 1)}>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── 3) QUALITY BY PROFESSIONAL ──────────────────────────────────── */}
      <QualityByProfessional />

      {/* ── 4) QUALITY BY ORGANIZATION ──────────────────────────────────── */}
      <QualityByOrganization />

      {/* ── 5) LEADERBOARDS ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Leaderboards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <LeaderboardCard title="Top 10 Earnings" items={earningsLeaderboard} viewAllHref={buildPayoutLink(undefined, period)} />
          <LeaderboardCard title="Top 10 Client Count" items={clientCountLeaderboard} unit="clients" />
          <LeaderboardCard title="Top 10 Session Volume" items={sessionVolumeLeaderboard} unit="sessions" />
        </div>
      </div>

      {/* ── 6) OPS SCHEDULE (calendar view) ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Your schedule</h2>
            <p className="text-sm text-muted-foreground">Internal events you&apos;re part of</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-[10px] bg-muted/30 p-1 shadow-sm">
              <Button variant="default" size="sm" className="rounded-lg text-xs h-7 px-3">Day</Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-xs h-7 px-3">Week</Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-xs h-7 px-3">Month</Button>
            </div>
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <Link href={buildAppointmentsLink({ context: "internal" })}>
                View all appointments <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Day view */}
          <div className="min-w-0 flex-1">
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border py-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" aria-label="Previous day" onClick={() => shiftDay(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{calDayLabel}</p>
                    <p className="text-xs text-muted-foreground">{calDayWeekday}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={goToday}>Today</Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" aria-label="Next day" onClick={() => shiftDay(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
                  {DAY_SLOTS.map((hour) => {
                    const evt = dayEvents.find((e) => e.startHour === hour);
                    return (
                      <div key={hour} className="flex min-h-[3.5rem]">
                        <div className="w-16 shrink-0 border-r border-border py-2.5 pl-3 pr-2">
                          <p className="text-xs font-medium text-muted-foreground">{slotLabel(hour)}</p>
                        </div>
                        <div className="min-w-0 flex-1 py-2 px-3">
                          {evt && (
                            <div className={clsx("rounded px-3 py-2", EVENT_STYLE[evt.eventType])}>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{evt.title}</span>
                                <Badge variant="outline" className={clsx("text-[10px] font-medium", EVENT_BADGE[evt.eventType])}>
                                  {evt.eventType === "pod" ? "Pod" : evt.eventType === "townhall" ? "Townhall" : evt.eventType === "workshop" ? "Workshop" : "Event"}
                                </Badge>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">{evt.participants}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{evt.start} – {evt.end}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar: mini calendar + upcoming */}
          <div className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
            {/* Mini month calendar */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm font-medium text-foreground">{calMonthLabel}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Next month" onClick={() => shiftMonth(1)}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <span key={d} className="text-[10px] font-medium text-muted-foreground">{d}</span>
                  ))}
                  {calGrid.map(({ date, col, row }) => {
                    const isSelected = date === selectedDate.getDate() && calMonth === selectedDate.getMonth() && calYear === selectedDate.getFullYear();
                    const hasEvent = calDatesWithEvents.has(date);
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => pickDate(date)}
                        className={clsx(
                          "relative h-7 w-7 rounded-lg text-xs font-medium transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                        style={{ gridColumn: col, gridRow: row }}
                      >
                        {date}
                        {hasEvent && !isSelected && (
                          <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming events */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium text-foreground">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                {upcomingEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No upcoming events.</p>
                ) : (
                  upcomingEvents.map((evt) => (
                    <div key={evt.id} className="flex gap-2.5">
                      <div className={clsx("w-1 shrink-0 rounded-full", EVENT_DOT[evt.eventType])} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{evt.title}</p>
                        <p className="text-xs text-muted-foreground">{evt.start} – {evt.end}</p>
                        <p className="text-xs text-muted-foreground">{evt.participants}</p>
                        <p className="text-[10px] text-muted-foreground/70">
                          {evt.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LeaderboardCard
// ---------------------------------------------------------------------------

function LeaderboardCard({
  title,
  items,
  unit,
  viewAllHref,
}: {
  title: string;
  items: LeaderboardItem[];
  unit?: string;
  viewAllHref?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50">
            <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">{idx + 1}</span>
            <div className="h-6 w-6 shrink-0 rounded-full bg-muted" />
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.name}</span>
            <span className="shrink-0 tabular-nums text-sm font-semibold text-foreground">
              {item.value}
              {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
            </span>
          </div>
        ))}
        {viewAllHref && (
          <div className="flex justify-end pt-1">
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
              <Link href={viewAllHref}>View all <ExternalLink className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
