"use client";

import { memo, useState, useMemo, useRef, useEffect, useDeferredValue } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Plus, Upload } from "@/components/ui/solar-icons";
import { useRouter } from "next/navigation";
import {
  professionalProfiles,
  credentialRecords,
  tfpIdToProId,
  type ProfessionalProfile,
  type CredentialType,
} from "@/features/professionals/mock/professionalProfiles";
import { pods } from "@/features/team/mock/pods";
import { Card, CardContent } from "@/components/ui/card";
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
import { ClickableTableRow } from "@/components/ui/clickable";
import { getMergedProfessionalProfiles } from "@/features/professionals/mock/professionalProfileStore";
import { measureInDev } from "@/lib/devPerf";
import { TableToolbar } from "@/features/filters/components/TableToolbar";
import { MoreFiltersSheet } from "@/features/filters/components/MoreFiltersSheet";
import { useAdvancedFilters } from "@/lib/filters/useAdvancedFilters";
import { professionalsFilterConfig, type ProfessionalsAdvanced } from "@/lib/filter-configs/professionals";

type RoleLabel = "TFP" | "Hotline Operator" | "Trainer" | "Pod Leader";

const EXTRA_ROLE_MAP: Record<string, RoleLabel[]> = {
  "PRO8092025007": ["Trainer"],
  "PRO1532025008": ["Hotline Operator"],
  "PRO2182025004": ["Trainer"],
  "PRO3742025006": ["Hotline Operator"],
};

function getRoleLabels(p: ProfessionalProfile, podLeaderProIds: Set<string>): RoleLabel[] {
  const roles: RoleLabel[] = ["TFP"];
  if (podLeaderProIds.has(p.id)) roles.push("Pod Leader");
  const extraRoles = EXTRA_ROLE_MAP[p.id] ?? [];
  extraRoles.forEach((role) => {
    if (!roles.includes(role)) roles.push(role);
  });
  return roles;
}

const RoleChips = memo(function RoleChips({ roles, max = 2 }: { roles: RoleLabel[]; max?: number }) {
  const normalized = roles.length > 0 ? roles : (["TFP"] as RoleLabel[]);
  const visible = normalized.slice(0, max);
  const hidden = normalized.slice(max);
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((role) => (
        <Badge key={role} variant="secondary" className="text-xs">
          {role}
        </Badge>
      ))}
      {hidden.length > 0 && (
        <div className="relative inline-flex group" onClick={(e) => e.stopPropagation()}>
          <Badge
            variant="outline"
            className="text-xs"
            aria-label={`${hidden.length} more roles`}
          >
            +{hidden.length}
          </Badge>
          <div
            className="absolute left-0 top-full z-30 hidden w-56 pt-2 group-hover:block group-focus-within:block"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-md border border-border bg-popover p-3 shadow-panel">
              <p className="text-xs font-semibold text-foreground">Roles</p>
              <div className="mt-2 space-y-1">
                {normalized.map((role) => (
                  <p key={role} className="text-xs text-muted-foreground">{role}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const PodChips = memo(function PodChips({ pods: podList }: { pods: { id: string; name: string }[] }) {
  if (podList.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <div className="relative inline-flex group" onClick={(e) => e.stopPropagation()}>
      <Badge variant="secondary" className="text-xs">
        {podList.length} {podList.length === 1 ? "pod" : "pods"}
      </Badge>
      <div
        className="absolute left-0 top-full z-30 hidden w-56 pt-2 group-hover:block group-focus-within:block"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-md border border-border bg-popover p-3 shadow-panel">
          <p className="text-xs font-semibold text-foreground">Pods</p>
          <div className="mt-2 space-y-1">
            {podList.map((p) => (
              <p key={p.id} className="text-xs text-muted-foreground">{p.name}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

const MiniCapacity = memo(function MiniCapacity({
  activeClients,
  maximumClients,
}: {
  activeClients: number;
  maximumClients: number;
}) {
  const max = Math.max(0, maximumClients);
  const active = Math.max(0, activeClients);
  const usage = max > 0 ? (active / max) * 100 : active > 0 ? 100 : 0;
  const clampedUsage = Math.min(usage, 100);

  const ringColorClass =
    usage >= 100 ? "text-destructive" : usage >= 80 ? "text-amber-500" : "text-emerald-500";

  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clampedUsage / 100);
  const usageRounded = Math.round(usage);
  const tooltipText = `Active clients: ${active}\nMax clients: ${max}\nUsage: ${usageRounded}%`;

  return (
    <div className="inline-flex items-center gap-2 whitespace-nowrap" title={tooltipText}>
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
        <circle cx="12" cy="12" r={radius} className="stroke-muted-foreground/25" strokeWidth="3" fill="none" />
        <circle
          cx="12"
          cy="12"
          r={radius}
          className={ringColorClass}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 12 12)"
        />
      </svg>
      <span className="text-sm">{`${active}/${max}`}</span>
    </div>
  );
});

type AttentionStatus = "Expired" | "Expiring soon";

interface CredentialAttentionGroup {
  type: CredentialType;
  status: AttentionStatus;
  count: number;
}

const BulkImportDialog = dynamic(
  () =>
    import("@/features/professionals/components/BulkImportDialog").then(
      (m) => m.BulkImportDialog
    ),
  { ssr: false }
);

const ProfessionalRowActions = dynamic(
  () =>
    import("@/features/professionals/components/ProfessionalRowActions").then(
      (m) => m.ProfessionalRowActions
    ),
  { ssr: false }
);

const CredentialsSummaryCell = memo(function CredentialsSummaryCell({
  professionalId,
  groups,
}: {
  professionalId: string;
  groups: CredentialAttentionGroup[];
}) {
  const needsAttention = groups.length > 0;

  if (!needsAttention) {
    return (
      <Badge
        variant="secondary"
        className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
      >
        All good
      </Badge>
    );
  }

  return (
    <div className="relative inline-flex group" onClick={(e) => e.stopPropagation()}>
      <Badge variant="destructive">Needs attention</Badge>
      <div
        className="absolute left-0 top-full z-30 hidden w-72 pt-2 group-hover:block group-focus-within:block"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-md border border-border bg-popover p-3 shadow-panel">
          <p className="text-xs font-semibold text-foreground">Credentials summary</p>
          <div className="mt-2 space-y-1">
            {groups.map((g) => (
              <p key={`${g.status}-${g.type}`} className="text-xs text-muted-foreground">
                {g.count} {g.type.toLowerCase()} · {g.status.toLowerCase()}
              </p>
            ))}
          </div>
          <div className="mt-3">
            <Link
              href={`/professionals/${professionalId}#credentials-compliance`}
              className="text-xs font-medium text-primary hover:underline"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              View credentials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function ProfessionalsListPage() {
  const router = useRouter();
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState(professionalProfiles);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [importOpen, setImportOpen] = useState(false);

  const adv = useAdvancedFilters<ProfessionalsAdvanced>(professionalsFilterConfig);

  useEffect(() => {
    setData(getMergedProfessionalProfiles(professionalProfiles));
  }, []);

  const credentialStatusByProfessional = useMemo(() => {
    return measureInDev("professionals:credentialStatusMap", () => {
      const statusById = new Map<string, string | null>();
      const statusCounts = new Map<
        string,
        { expired: number; expiringSoon: number; valid: number }
      >();

      credentialRecords.forEach((record) => {
        if (record.archived) return;
        const current = statusCounts.get(record.professionalId) ?? {
          expired: 0,
          expiringSoon: 0,
          valid: 0,
        };
        if (record.status === "Expired") current.expired += 1;
        else if (record.status === "Expiring soon") current.expiringSoon += 1;
        else if (record.status === "Valid") current.valid += 1;
        statusCounts.set(record.professionalId, current);
      });

      data.forEach((profile) => {
        const counts = statusCounts.get(profile.id);
        if (!counts) {
          statusById.set(profile.id, null);
          return;
        }
        if (counts.expired > 0) statusById.set(profile.id, "Expired");
        else if (counts.expiringSoon > 0) statusById.set(profile.id, "Expiring soon");
        else if (counts.valid > 0) statusById.set(profile.id, "Valid");
        else statusById.set(profile.id, null);
      });

      return statusById;
    });
  }, [data]);

  const podLeaderProIds = useMemo(
    () => new Set(
      pods.map((pod) => pod.leaderId).filter(Boolean).map((id) => tfpIdToProId(id!))
    ),
    []
  );

  const podsByProfessionalId = useMemo(() => {
    const result = new Map<string, { id: string; name: string }[]>();
    pods.forEach((pod) => {
      pod.members.forEach((m) => {
        const proId = tfpIdToProId(m.tfpId);
        const existing = result.get(proId) ?? [];
        existing.push({ id: pod.id, name: pod.name });
        result.set(proId, existing);
      });
    });
    return result;
  }, []);

  const roleLabelsById = useMemo(() => {
    return measureInDev("professionals:roleLabelsMap", () => {
      const roles = new Map<string, RoleLabel[]>();
      data.forEach((profile) => {
        roles.set(profile.id, getRoleLabels(profile, podLeaderProIds));
      });
      return roles;
    });
  }, [data, podLeaderProIds]);

  const filtered = useMemo(() => {
    return measureInDev("professionals:filteredRows", () => {
      const vk = adv.visibleKeys;
      const af = adv.applied;
      return data.filter((p) => {
        const q = deferredSearch.toLowerCase();
        const matchSearch =
          !q ||
          p.id.toLowerCase().includes(q) ||
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q);
        if (!matchSearch) return false;

        if (vk.has("profileStatus") && af.profileStatus) {
          if (p.profileStatus !== af.profileStatus) return false;
        }
        if (vk.has("credentialStatus") && af.credentialStatus) {
          if (credentialStatusByProfessional.get(p.id) !== af.credentialStatus) return false;
        }
        if (vk.has("country") && af.country) {
          if (p.country !== af.country) return false;
        }
        if (vk.has("podId") && af.podId) {
          const proPods = podsByProfessionalId.get(p.id) ?? [];
          if (!proPods.some((pod) => pod.id === af.podId)) return false;
        }
        if (vk.has("profession") && af.profession) {
          if (p.profession !== af.profession) return false;
        }
        if (vk.has("isPodLeader") && af.isPodLeader !== null) {
          const isLeader = podLeaderProIds.has(p.id);
          if (af.isPodLeader && !isLeader) return false;
          if (af.isPodLeader === false && isLeader) return false;
        }
        return true;
      });
    });
  }, [data, deferredSearch, adv.applied, adv.visibleKeys, credentialStatusByProfessional, podsByProfessionalId, podLeaderProIds]);

  const credentialGroupsByProfessional = useMemo(() => {
    return measureInDev("professionals:credentialGroupsMap", () => {
      const counts = new Map<string, number>();
      credentialRecords.forEach((record) => {
        if (record.archived) return;
        if (record.status !== "Expired" && record.status !== "Expiring soon") return;
        const key = `${record.professionalId}::${record.status}::${record.type}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });

      const statusOrder: AttentionStatus[] = ["Expired", "Expiring soon"];
      const typeOrder: CredentialType[] = [
        "Contract",
        "License",
        "Training Certificate",
        "Other",
      ];

      const byProfessional = new Map<string, CredentialAttentionGroup[]>();
      data.forEach((profile) => {
        const groups: CredentialAttentionGroup[] = [];
        statusOrder.forEach((status) => {
          typeOrder.forEach((type) => {
            const key = `${profile.id}::${status}::${type}`;
            const count = counts.get(key) ?? 0;
            if (count > 0) groups.push({ type, status, count });
          });
        });
        byProfessional.set(profile.id, groups);
      });
      return byProfessional;
    });
  }, [data]);

  const paginated = useMemo(() => {
    return measureInDev("professionals:paginatedRows", () => {
      const start = (page - 1) * pageSize;
      return filtered.slice(start, start + pageSize);
    });
  }, [filtered, page, pageSize]);

  function openImportDialog() {
    setImportOpen(true);
  }

  async function handleDownloadTemplateCsv() {
    const { buildProfessionalTemplateCsv } = await import(
      "@/features/professionals/mock/professionalImport"
    );
    const csv = buildProfessionalTemplateCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "professional-import-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleMockUpload() {
    setImportOpen(false);
    router.push("/professionals/import/review?source=mock");
  }

  function handleDropUpload(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMockUpload();
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleMockUpload();
    e.currentTarget.value = "";
  }

  function handleCancelImport() {
    setImportOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Professionals</h2>
            <p className="text-sm text-muted-foreground">Manage professional profiles, credentials, and availability.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={openImportDialog}>
              <Upload className="h-4 w-4" />
              Bulk import CSV
            </Button>
            <Button asChild>
              <Link href="/professionals/new">
                <Plus className="h-4 w-4" />
                Add professional
              </Link>
            </Button>
          </div>
        </div>
        <TableToolbar
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search by name, email, or ID…"
          appliedCount={adv.appliedCount}
          onMoreFilters={() => adv.setSheetOpen(true)}
          chips={adv.activeChips}
          onRemoveChip={adv.removeAppliedFilter}
          onClearAllChips={adv.clearAllApplied}
        />


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
          title="Professional filters"
          description="Filter the professionals list. Press Apply to update results."
        />
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Pods</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Credentials</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((p) => (
                  <ClickableTableRow
                    key={p.id}
                    onActivate={() => router.push(`/professionals/${p.id}/profile`)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.id}</TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/professionals/${p.id}/profile`} className="text-primary hover:underline">
                        {p.firstName} {p.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <RoleChips roles={roleLabelsById.get(p.id) ?? ["TFP"]} max={2} />
                    </TableCell>
                    <TableCell>
                      <PodChips pods={podsByProfessionalId.get(p.id) ?? []} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.country || "—"}</TableCell>
                    <TableCell>
                      <CredentialsSummaryCell
                        professionalId={p.id}
                        groups={credentialGroupsByProfessional.get(p.id) ?? []}
                      />
                    </TableCell>
                    <TableCell><MiniCapacity activeClients={p.activeClients} maximumClients={p.maximumClients} /></TableCell>
                    <TableCell>
                      <ProfessionalRowActions professionalId={p.id} />
                    </TableCell>
                  </ClickableTableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      No professionals found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              total={filtered.length}
              pageSize={pageSize}
              page={page}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            />
          </CardContent>
        </Card>
      </div>

      {importOpen && (
        <BulkImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          importFileInputRef={importFileInputRef}
          onDownloadTemplateCsv={handleDownloadTemplateCsv}
          onDropUpload={handleDropUpload}
          onFileInputChange={handleFileInputChange}
          onCancel={handleCancelImport}
        />
      )}
    </div>
  );
}
