"use client";

import { useState, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { pods } from "@/features/team/mock/pods";
import { professionals } from "@/features/professionals/mock/professionals";
import { Plus, UserX } from "@/components/ui/solar-icons";
import { Card, CardContent } from "@/components/ui/card";
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
import { ClickableTableRow } from "@/components/ui/clickable";

const UnassignedTfpDialog = dynamic(
  () =>
    import("@/features/team/components/UnassignedTfpDialog").then(
      (m) => m.UnassignedTfpDialog
    ),
  { ssr: false }
);


function getLeaderName(leaderId: string | null): string {
  if (!leaderId) return "—";
  const p = professionals.find((x) => x.id === leaderId);
  return p?.name ?? leaderId;
}

export default function TeamManagementPage() {
  const router = useRouter();
  const [data] = useState(pods);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterLeader, setFilterLeader] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [unassignedModalOpen, setUnassignedModalOpen] = useState(false);
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const leaderOptions = useMemo(() => {
    const ids = new Set(data.map((pod) => pod.leaderId).filter(Boolean));
    return Array.from(ids).map((id) => ({
      id: id!,
      name: getLeaderName(id!),
    }));
  }, [data]);

  const filteredPods = useMemo(() => {
    return data.filter((pod) => {
      const matchSearch =
        !deferredSearch ||
        pod.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        getLeaderName(pod.leaderId).toLowerCase().includes(deferredSearch.toLowerCase());
      const matchLeader =
        filterLeader === "all" || pod.leaderId === filterLeader;
      const matchStatus =
        filterStatus === "all" || pod.status === filterStatus;
      return matchSearch && matchLeader && matchStatus;
    });
  }, [data, deferredSearch, filterLeader, filterStatus]);

  const paginatedPods = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPods.slice(start, start + pageSize);
  }, [filteredPods, page, pageSize]);

  const unassignedList = useMemo(() => {
    const assignedIds = new Set<string>();
    data.forEach((pod) => pod.members.forEach((m) => assignedIds.add(m.tfpId)));
    return professionals.filter(
      (p) => p.status === "Active" && !assignedIds.has(p.id)
    );
  }, [data]);
  const unassignedCount = unassignedList.length;

  const filteredUnassigned = useMemo(() => {
    if (!unassignedSearch.trim()) return unassignedList;
    const q = unassignedSearch.trim().toLowerCase();
    return unassignedList.filter((p) => {
      const name = p.name.toLowerCase();
      const email = ("email" in p && p.email ? String(p.email) : "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [unassignedList, unassignedSearch]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Pod list</h2>
            <p className="text-sm text-muted-foreground">Manage pod ownership, membership, and assignment coverage.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setUnassignedModalOpen(true)}>
              <UserX className="h-4 w-4" />
              View unassigned TFP ({unassignedCount})
            </Button>
            <Button asChild>
              <Link href="/team/new">
                <Plus className="h-4 w-4" />
                Create new pod
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto">
          <Input
            type="search"
            placeholder="Search by pod name or leader..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs shrink-0"
          />
          <Select value={filterLeader} onValueChange={(v) => { setFilterLeader(v); setPage(1); }}>
            <SelectTrigger className="w-[200px] shrink-0">
              <SelectValue placeholder="Pod leader" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All leaders</SelectItem>
              {leaderOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pod name</TableHead>
                  <TableHead>Assigned pod leader</TableHead>
                  <TableHead>Total members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created date</TableHead>
                  <TableHead>Last edited</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPods.map((pod) => (
                  <ClickableTableRow key={pod.id} onActivate={() => router.push(`/team/${pod.id}`)}>
                    <TableCell className="font-medium">{pod.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {getLeaderName(pod.leaderId)}
                    </TableCell>
                    <TableCell>{pod.members.length}</TableCell>
                    <TableCell>
                      <Badge
                        variant={pod.status === "Active" ? "default" : "secondary"}
                        className={pod.status === "Inactive" ? "text-muted-foreground" : undefined}
                      >
                        {pod.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(pod.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(pod.updatedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </ClickableTableRow>
                ))}
                {paginatedPods.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No pods found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              total={filteredPods.length}
              pageSize={pageSize}
              page={page}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {unassignedModalOpen && (
        <UnassignedTfpDialog
          open={unassignedModalOpen}
          onOpenChange={(open) => {
            setUnassignedModalOpen(open);
            if (!open) setUnassignedSearch("");
          }}
          search={unassignedSearch}
          onSearchChange={setUnassignedSearch}
          unassignedCount={unassignedList.length}
          filteredUnassigned={filteredUnassigned.map((p) => ({
            id: p.id,
            name: p.name,
            email: "email" in p && p.email ? String(p.email) : undefined,
          }))}
        />
      )}

    </div>
  );
}
