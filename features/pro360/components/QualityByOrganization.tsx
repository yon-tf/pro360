"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  organizationQuality,
  WELLBEING_PILLAR_LABELS,
  type OrganizationQuality,
  type OrgCoreServiceRecord,
  type OrgActivationRecord,
} from "@/features/org/mock/organizations";
import { tfpIdToProId } from "@/features/professionals/mock/professionalProfiles";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ViewModeToggle, type ViewMode } from "@/components/ui/view-mode-toggle";
import { TablePagination } from "@/components/TablePagination";
import { PeriodFilter, defaultPeriodValue, formatPeriodLabel, type PeriodValue } from "@/features/filters/components/PeriodFilter";
import {
  Search, Building2Bold, UsersBold, StarBold, SparklesBold, ZapBold, BarChart3Bold, DollarSignBold,
} from "@/components/ui/solar-icons";
import { Tabs } from "@/components/Tabs";
import { ModalListShell } from "./ModalListShell";
import { KpiCard } from "./KpiCard";
import { cn } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

type OrgSortKey = "omwa" | "tfpCount" | "customerRating" | "aiRating" | "activationRating" | "activations" | "dass" | "chatHours" | "payout";

function SortableHead({
  children, sortKey: key, activeSortKey, sortDir, onSort, className,
}: {
  children: React.ReactNode; sortKey: string; activeSortKey: string | null;
  sortDir: "asc" | "desc"; onSort: (key: string) => void; className?: string;
}) {
  const isActive = activeSortKey === key;
  return (
    <TableHead
      className={cn("cursor-pointer select-none hover:text-foreground", className)}
      onClick={() => onSort(key)}
    >
      <div className="flex items-center gap-1">
        {children}
        <span className={cn("text-xxxs", isActive ? "text-foreground" : "text-muted-foreground/50")}>
          {isActive ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </div>
    </TableHead>
  );
}

type ModalState =
  | { type: "professionals"; org: OrganizationQuality }
  | { type: "payout"; org: OrganizationQuality }
  | null;

export function QualityByOrganization({ hideMetrics = false }: { hideMetrics?: boolean } = {}) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [period, setPeriod] = useState<PeriodValue>(defaultPeriodValue());
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const pageSize = viewMode === "card" ? 6 : 5;
  const [modal, setModal] = useState<ModalState>(null);
  const [payoutTab, setPayoutTab] = useState<string>("coreServices");
  const [sortKey, setSortKey] = useState<OrgSortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key as OrgSortKey);
      setSortDir("desc");
    }
    setPage(1);
  };

  const filteredOrgs = useMemo(() => {
    if (!deferredSearch) return organizationQuality;
    const q = deferredSearch.toLowerCase();
    return organizationQuality.filter((o) => o.name.toLowerCase().includes(q));
  }, [deferredSearch]);

  const sortedOrgs = useMemo(() => {
    if (!sortKey) return filteredOrgs;
    const getValue = (org: (typeof filteredOrgs)[0]): number => {
      switch (sortKey) {
        case "omwa": return org.omwaScore;
        case "tfpCount": return org.tfpCount;
        case "customerRating": return org.customerRatingAvg;
        case "aiRating": return org.aiRatingAvg;
        case "activationRating": return org.activationRatingAvg;
        case "activations": return org.activationTotal;
        case "dass": return org.dassAvg;
        case "chatHours": return org.chatHoursTotal;
        case "payout": return org.payout;
      }
    };
    return [...filteredOrgs].sort((a, b) => {
      const diff = getValue(a) - getValue(b);
      return sortDir === "asc" ? diff : -diff;
    });
  }, [filteredOrgs, sortKey, sortDir]);

  const headerMetrics = useMemo(() => {
    const orgs = filteredOrgs;
    const totalOrgs = orgs.length;
    const safeDivisor = totalOrgs || 1;
    const totalPros = orgs.reduce((s, o) => s + o.tfpCount, 0);
    const avgCustomerRating = orgs.reduce((s, o) => s + o.customerRatingAvg, 0) / safeDivisor;
    const avgAiRating = orgs.reduce((s, o) => s + o.aiRatingAvg, 0) / safeDivisor;
    const totalActivations = orgs.reduce((s, o) => s + o.activationTotal, 0);
    const avgActivationRating = orgs.reduce((s, o) => s + o.activationRatingAvg, 0) / safeDivisor;
    const totalPayout = orgs.reduce((s, o) => s + o.payout, 0);
    return {
      totalOrgs,
      totalPros,
      avgCustomerRating: avgCustomerRating.toFixed(1),
      avgAiRating: avgAiRating.toFixed(1),
      totalActivations,
      avgActivationRating: avgActivationRating.toFixed(1),
      totalPayout,
    };
  }, [filteredOrgs]);

  const paginatedOrgs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedOrgs.slice(start, start + pageSize);
  }, [sortedOrgs, page, pageSize]);

  const openPayoutModal = (org: OrganizationQuality) => {
    setPayoutTab("coreServices");
    setModal({ type: "payout", org });
  };

  return (
    <div className="space-y-4">
      {!hideMetrics && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Quality by Organization</h2>
              <p className="text-xs text-muted-foreground">{formatPeriodLabel(period)}</p>
            </div>
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          {/* Header summary metrics */}
          <div className="grid grid-cols-3 gap-3 md:grid-cols-4 xl:grid-cols-7">
            <KpiCard title="Total Organizations" value={headerMetrics.totalOrgs} icon={<Building2Bold className="h-5 w-5" />} trend="+1" trendDirection="up" />
            <KpiCard title="Total Professionals" value={headerMetrics.totalPros} icon={<UsersBold className="h-5 w-5" />} trend="+3" trendDirection="up" />
            <KpiCard title="Avg Customer Rating" value={<>{headerMetrics.avgCustomerRating} <span className="text-sm font-normal text-muted-foreground">out of 5</span></>} icon={<StarBold className="h-5 w-5" />} trend="+0.1" trendDirection="up" />
            <KpiCard title="Avg AI Rating" value={<>{headerMetrics.avgAiRating} <span className="text-sm font-normal text-muted-foreground">out of 5</span></>} icon={<SparklesBold className="h-5 w-5" />} badge="Stable" />
            <KpiCard title="Total Activations" value={headerMetrics.totalActivations} icon={<ZapBold className="h-5 w-5" />} trend="+4" trendDirection="up" />
            <KpiCard title="Activation Rating" value={<>{headerMetrics.avgActivationRating} <span className="text-sm font-normal text-muted-foreground">out of 5</span></>} icon={<BarChart3Bold className="h-5 w-5" />} trend="-0.1" trendDirection="down" />
            <KpiCard title="Total Payout" value={`$${headerMetrics.totalPayout.toLocaleString()}`} icon={<DollarSignBold className="h-5 w-5" />} trend="+8%" trendDirection="up" />
          </div>
        </>
      )}

      {/* Organization table */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by organization name…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Organization</TableHead>
                    <SortableHead sortKey="omwa" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">OMWA</SortableHead>
                    <SortableHead sortKey="tfpCount" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-center">No. of TFP</SortableHead>
                    <SortableHead sortKey="customerRating" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Customer Rating</SortableHead>
                    <SortableHead sortKey="aiRating" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">AI Rating</SortableHead>
                    <SortableHead sortKey="activationRating" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Activation Rating</SortableHead>
                    <SortableHead sortKey="activations" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Activations</SortableHead>
                    <SortableHead sortKey="dass" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">DASS Avg</SortableHead>
                    <SortableHead sortKey="chatHours" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Chat Hours</SortableHead>
                    <SortableHead sortKey="payout" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Payout</SortableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrgs.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="text-sm font-medium text-foreground">{org.name}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{org.omwaScore}</TableCell>
                      <TableCell className="text-center">
                        <button
                          className="tabular-nums text-sm text-primary hover:underline"
                          onClick={() => setModal({ type: "professionals", org })}
                        >
                          {org.tfpCount}
                        </button>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{org.customerRatingAvg}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{org.aiRatingAvg}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{org.activationRatingAvg}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{org.activationTotal}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{org.dassAvg}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{org.chatHoursTotal}</TableCell>
                      <TableCell className="text-right">
                        <button
                          className="tabular-nums text-sm font-medium text-primary hover:underline"
                          onClick={() => openPayoutModal(org)}
                        >
                          ${org.payout.toLocaleString()}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedOrgs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8 text-center text-sm text-muted-foreground">No organizations found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {paginatedOrgs.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No organizations found.</p>
              )}
              {paginatedOrgs.map((org) => (
                <div key={org.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{org.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        OMWA <span className="font-medium text-foreground tabular-nums">{org.omwaScore}</span>
                        {" · "}
                        <button
                          className="text-primary hover:underline"
                          onClick={() => setModal({ type: "professionals", org })}
                        >
                          {org.tfpCount} TFP
                        </button>
                      </p>
                    </div>
                    <button
                      className="shrink-0 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-lg font-semibold tabular-nums text-primary hover:bg-primary/10"
                      onClick={() => openPayoutModal(org)}
                    >
                      ${org.payout.toLocaleString()}
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>Customer <span className="font-medium text-foreground tabular-nums">{org.customerRatingAvg}</span></span>
                    <span className="text-border">·</span>
                    <span>AI <span className="font-medium text-foreground tabular-nums">{org.aiRatingAvg}</span></span>
                    <span className="text-border">·</span>
                    <span>Activation Rating <span className="font-medium text-foreground tabular-nums">{org.activationRatingAvg}</span></span>
                    <span className="text-border">·</span>
                    <span>Activations <span className="font-medium text-foreground tabular-nums">{org.activationTotal}</span></span>
                    <span className="text-border">·</span>
                    <span>DASS Avg <span className="font-medium text-foreground tabular-nums">{org.dassAvg}</span></span>
                    <span className="text-border">·</span>
                    <span>Chat Hours <span className="font-medium text-foreground tabular-nums">{org.chatHoursTotal}</span></span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-primary hover:bg-muted/50"
                      onClick={() => { setPayoutTab("coreServices"); setModal({ type: "payout", org }); }}
                    >
                      Core Services
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-primary hover:bg-muted/50"
                      onClick={() => { setPayoutTab("activations"); setModal({ type: "payout", org }); }}
                    >
                      Activations
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <TablePagination
            total={filteredOrgs.length}
            pageSize={pageSize}
            page={page}
            onPageChange={setPage}
            onPageSizeChange={() => setPage(1)}
          />
        </CardContent>
      </Card>

      {/* Professionals Modal */}
      <Dialog open={modal?.type === "professionals"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Professionals — {modal?.type === "professionals" ? modal.org.name : ""}</DialogTitle>
            <DialogDescription>Professionals assigned to this organization.</DialogDescription>
          </DialogHeader>
          {modal?.type === "professionals" && (
            <ModalListShell
              key={`pros-${modal.org.id}`}
              items={modal.org.professionals}
              searchPlaceholder="Search by name…"
              searchFn={(pro, q) => pro.name.toLowerCase().includes(q)}
              emptyMessage="No professionals found."
              renderItem={(pro) => (
                <div key={pro.id} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{pro.name}</p>
                      <p className="text-xs text-muted-foreground">{tfpIdToProId(pro.id)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{pro.ratingAvg} / 5</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <DetailRow label="Rating Avg" value={String(pro.ratingAvg)} />
                    <DetailRow label="AI Rating" value={String(pro.aiRatingAvg)} />
                  </div>
                </div>
              )}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Payout Breakdown Modal (tabbed: Core Services | Activations) */}
      <Dialog open={modal?.type === "payout"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {modal?.type === "payout" && (
            <>
              <DialogHeader>
                <DialogTitle>Payout Breakdown — {modal.org.name}</DialogTitle>
                <DialogDescription>
                  Total payout: <span className="font-semibold tabular-nums">${modal.org.payout.toLocaleString()}</span>
                </DialogDescription>
              </DialogHeader>

              <Tabs
                tabs={[
                  {
                    id: "coreServices",
                    label: `Core Services ($${modal.org.coreServices.reduce((s, svc) => s + svc.amount, 0).toLocaleString()})`,
                  },
                  {
                    id: "activations",
                    label: `Activations ($${modal.org.activations.reduce((s, a) => s + a.amount, 0).toLocaleString()})`,
                  },
                ]}
                activeId={payoutTab}
                onChange={setPayoutTab}
              />

              {payoutTab === "coreServices" && (
                <ModalListShell
                  key={`cs-${modal.org.id}`}
                  items={modal.org.coreServices}
                  searchPlaceholder="Search by TFP, client ID, or type…"
                  searchFn={(svc, q) =>
                    svc.tfpName.toLowerCase().includes(q) ||
                    svc.clientId.toLowerCase().includes(q) ||
                    svc.serviceType.toLowerCase().includes(q)
                  }
                  emptyMessage="No core services found."
                  total={{
                    label: "Core Services Total",
                    value: `$${modal.org.coreServices.reduce((s, svc) => s + svc.amount, 0).toLocaleString()}`,
                  }}
                  renderItem={(svc, i) => (
                    <CoreServiceReceiptCard key={i} service={svc} />
                  )}
                />
              )}

              {payoutTab === "activations" && (
                <ModalListShell
                  key={`act-${modal.org.id}`}
                  items={modal.org.activations}
                  searchPlaceholder="Search by name, type, or TFP…"
                  searchFn={(act, q) =>
                    act.name.toLowerCase().includes(q) ||
                    act.type.toLowerCase().includes(q) ||
                    act.tfpName.toLowerCase().includes(q)
                  }
                  emptyMessage="No activations found."
                  total={{
                    label: "Activations Total",
                    value: `$${modal.org.activations.reduce((s, a) => s + a.amount, 0).toLocaleString()}`,
                  }}
                  renderItem={(act, i) => (
                    <ActivationReceiptCard key={i} activation={act} />
                  )}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActivationReceiptCard({ activation }: { activation: OrgActivationRecord }) {
  const formattedDate = new Date(activation.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{activation.name}</p>
          <p className="text-xs text-muted-foreground">{activation.type}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">${activation.amount.toLocaleString()}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <DetailRow label="Date" value={formattedDate} />
        <DetailRow label="TFP" value={activation.tfpName} />
        <DetailRow label="Duration" value={activation.duration} />
        <DetailRow label="Wellbeing Pillar" value={WELLBEING_PILLAR_LABELS[activation.wellbeingPillar]} />
        <DetailRow label="Participants" value={String(activation.participantCount)} />
        <DetailRow label="Program Rating" value={`${activation.programRating} / 5`} />
        <DetailRow label="Engagement Rate" value={`${activation.engagementRate}%`} />
        <DetailRow label="Program Score" value={`${activation.programScore}%`} />
      </div>
    </div>
  );
}

function CoreServiceReceiptCard({ service }: { service: OrgCoreServiceRecord }) {
  const formattedDate = new Date(service.sessionDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-block rounded px-2 py-1 text-xxxs font-medium",
              service.serviceType === "Video call"
                ? "bg-chart-2/15 text-chart-2 dark:bg-chart-2/20"
                : "bg-chart-1/15 text-chart-1 dark:bg-chart-1/20"
            )}>
              {service.serviceType}
            </span>
            <p className="text-sm font-medium text-foreground">{formattedDate}</p>
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">${service.amount}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <DetailRow label="TFP" value={service.tfpName} />
        <DetailRow label="Duration" value={service.duration} />
        <DetailRow label="Client" value={service.clientId} />
      </div>
    </div>
  );
}
