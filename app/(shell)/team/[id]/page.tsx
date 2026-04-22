"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { pods, podHistory, type Pod, type PodHistoryEntry } from "@/features/team/mock/pods";
import { professionals } from "@/features/professionals/mock/professionals";
import { tfpIdToProId } from "@/features/professionals/mock/professionalProfiles";
import {
  ChevronLeft,
  UserPlus,
  UserMinus,
  Crown,
  Monitor,
  Pencil,
  AddSquareBold,
} from "@/components/ui/solar-icons";
import { DatePicker } from "@/components/ui/date-picker";
import { clsx } from "clsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBreadcrumb } from "@/components/BreadcrumbContext";
import { systemToast } from "@/lib/systemToast";

const DeactivatePodDialog = dynamic(
  () =>
    import("@/features/team/components/DeletePodDialog").then(
      (m) => m.DeactivatePodDialog
    ),
  { ssr: false }
);
import { useEffect } from "react";

function getTfpById(id: string) {
  return professionals.find((p) => p.id === id);
}

function getLeaderName(leaderId: string | null): string {
  if (!leaderId) return "—";
  const p = getTfpById(leaderId);
  return p?.name ?? leaderId;
}

function getInitials(name: string): string {
  const parts = name.replace(/^Dr\.\s*/i, "").trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0]?.[0]?.toUpperCase() ?? "?";
}

function formatHistoryEntry(h: PodHistoryEntry): string {
  switch (h.type) {
    case "member_joined":
      return `${h.tfpName ?? h.tfpId} joined the pod`;
    case "member_removed":
      return `${h.tfpName ?? h.tfpId} removed from pod`;
    case "leader_assigned":
      return `${h.tfpName ?? h.tfpId} assigned as pod leader`;
    case "leader_changed":
      return `Pod leader changed — ${h.tfpName ?? h.tfpId}`;
    case "pod_deactivated":
      return "Pod deactivated";
    case "pod_created":
      return "Pod created";
    case "pod_name_changed":
      return "Pod name changed";
    case "pod_description_changed":
      return "Pod description changed";
    case "chat_group_notified":
      return "Chat group notification sent";
    default:
      return h.type;
  }
}

export default function PodDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { setItems } = useBreadcrumb();

  const pod = useMemo(() => pods.find((p) => p.id === id), [id]);
  const placeholderPod = useMemo(
    () =>
      id.startsWith("pod-")
        ? {
            id,
            name: "New pod (mock)",
            leaderId: null,
            status: "Active" as const,
            notes: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            members: [] as { tfpId: string; joinedAt: string }[],
            maxCapacity: 6,
          }
        : null,
    [id]
  );
  const podOrPlaceholder: Pod | null = pod ?? placeholderPod;
  const podId = podOrPlaceholder?.id ?? "";

  const [podStatus, setPodStatus] = useState(podOrPlaceholder?.status ?? "Active");
  const [displayName, setDisplayName] = useState(podOrPlaceholder?.name ?? "");
  const [displayNotes, setDisplayNotes] = useState(podOrPlaceholder?.notes ?? "");
  const [displayUpdatedAt, setDisplayUpdatedAt] = useState(
    podOrPlaceholder?.updatedAt ?? new Date().toISOString()
  );
  const [memberList, setMemberList] = useState(
    podOrPlaceholder?.members ?? []
  );
  const [membersPage, setMembersPage] = useState(1);
  const [membersPageSize, setMembersPageSize] = useState(10);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [assignLeaderOpen, setAssignLeaderOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(podOrPlaceholder?.name ?? "");
  const [editNotes, setEditNotes] = useState(podOrPlaceholder?.notes ?? "");
  const [tfpSearch, setTfpSearch] = useState("");
  const [leaderSearch, setLeaderSearch] = useState("");
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>("");
  void selectedLeaderId;
  void setSelectedLeaderId;
  const [timelineDate, setTimelineDate] = useState("");
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    if (podOrPlaceholder) {
      setItems([
        { label: "Pod Management", href: "/team" },
        { label: displayName || podOrPlaceholder.name },
      ]);
    }
  }, [displayName, setItems, podOrPlaceholder]);

  useEffect(() => {
    if (!podOrPlaceholder) return;
    setDisplayName(podOrPlaceholder.name);
    setDisplayNotes(podOrPlaceholder.notes ?? "");
    setDisplayUpdatedAt(podOrPlaceholder.updatedAt ?? new Date().toISOString());
    setMemberList(podOrPlaceholder.members ?? []);
  }, [podId]);

  useEffect(() => {
    if (!notificationSent) return;
    systemToast.info("Notification sent to pod members (mock).");
    setNotificationSent(false);
  }, [notificationSent]);

  const currentMemberIds = useMemo(() => {
    if (!podOrPlaceholder) return new Set<string>();
    return new Set(memberList.map((m) => m.tfpId));
  }, [podOrPlaceholder, memberList]);

  const filteredForAdd = useMemo(() => {
    const active = professionals.filter(
      (p) => p.status === "Active" && !currentMemberIds.has(p.id)
    );
    if (!tfpSearch.trim()) return active;
    const q = tfpSearch.toLowerCase();
    return active.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p as { email?: string }).email?.toLowerCase().includes(q)
    );
  }, [tfpSearch, currentMemberIds]);

  const filteredLeaderCandidates = useMemo(() => {
    const active = professionals.filter((p) => p.status === "Active");
    if (!leaderSearch.trim()) return active;
    const q = leaderSearch.toLowerCase();
    return active.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p as { email?: string }).email?.toLowerCase().includes(q)
    );
  }, [leaderSearch]);

  const historyForPod = useMemo(() => {
    if (!pod) return [];
    let entries = podHistory
      .filter((h) => h.podId === pod.id && h.type !== "chat_group_notified")
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    if (timelineDate) {
      entries = entries.filter((h) => h.at.slice(0, 10) === timelineDate);
    }
    return entries;
  }, [pod, timelineDate]);

  const paginatedMembers = useMemo(() => {
    if (!podOrPlaceholder) return [];
    const start = (membersPage - 1) * membersPageSize;
    return memberList.slice(start, start + membersPageSize);
  }, [podOrPlaceholder, membersPage, membersPageSize, memberList]);

  const handleAddMember = (p: { id: string; name: string }) => {
    setMemberList((prev) => {
      if (prev.some((m) => m.tfpId === p.id)) return prev;
      return [...prev, { tfpId: p.id, joinedAt: new Date().toISOString() }];
    });
    setAddMembersOpen(false);
    systemToast.info("Notification sent to pod members (mock).");
  };

  const handleAssignLeader = (tfpId: string) => {
    if (tfpId === "_none") return;
    setSelectedLeaderId(tfpId);
    setAssignLeaderOpen(false);
    systemToast.info("Notification sent to pod members (mock).");
  };

  const handleRemoveMember = (tfpId: string) => {
    setMemberList((prev) => prev.filter((m) => m.tfpId !== tfpId));
    systemToast.info("Notification sent to pod members (mock).");
  };
  
  const handleOpenEdit = () => {
    setEditName(displayName);
    setEditNotes(displayNotes);
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    const nextName = editName.trim();
    if (!nextName) return;
    setDisplayName(nextName);
    setDisplayNotes(editNotes.trim());
    setDisplayUpdatedAt(new Date().toISOString());
    setEditOpen(false);
  };

  if (!podOrPlaceholder) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/team">
            <ChevronLeft className="h-4 w-4" />
            Back to pod list
          </Link>
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Pod not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/team">
            <ChevronLeft className="h-4 w-4" />
            Back to pod list
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{displayName}</CardTitle>
                <Badge variant={podStatus === "Active" ? "default" : "secondary"}>
                  {podStatus}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Leader: {getLeaderName(podOrPlaceholder.leaderId)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenEdit}
                aria-label="Edit pod details"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayNotes && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Description</p>
              <p className="text-sm text-muted-foreground">{displayNotes}</p>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Created {new Date(podOrPlaceholder.createdAt).toLocaleString("en-GB")} · Last edited{" "}
            {new Date(displayUpdatedAt).toLocaleString("en-GB")}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Members</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => setAddMembersOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Add members
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedLeaderId(podOrPlaceholder.leaderId ?? "");
                setAssignLeaderOpen(true);
              }}
            >
              <Crown className="h-4 w-4" />
              Assign leader
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined date</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.map((m) => {
                  const tfp = getTfpById(m.tfpId);
                  return (
                    <TableRow key={m.tfpId}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/pro360/${tfpIdToProId(m.tfpId)}`}
                          className="text-primary hover:underline"
                        >
                          {tfp?.name ?? m.tfpId}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">{m.tfpId}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {tfp && "phone" in tfp ? String(tfp.phone ?? "—") : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tfp && "email" in tfp ? String(tfp.email ?? "—") : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(m.joinedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveMember(m.tfpId)}
                        >
                          <UserMinus className="h-4 w-4" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {memberList.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No members yet. Add members using the button above.
              </div>
            ) : (
              <TablePagination
                total={memberList.length}
                pageSize={membersPageSize}
                page={membersPage}
                onPageChange={setMembersPage}
                onPageSizeChange={(size) => {
                  setMembersPageSize(size);
                  setMembersPage(1);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Activity Timeline</h2>
          <div className="flex items-center gap-2">
            <DatePicker
              value={timelineDate}
              onChange={setTimelineDate}
              placeholder="Filter by date"
              className="w-[200px]"
            />
            <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
              View history
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="p-5">
            {historyForPod.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {timelineDate ? "No activity on this date." : "No activity history yet."}
              </p>
            ) : (
              <div className="space-y-0">
                {historyForPod.map((h, idx) => {
                  const isSystem = !h.tfpName;
                  const isLast = idx === historyForPod.length - 1;
                  return (
                    <div key={h.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={clsx(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xxs font-semibold",
                          h.type === "member_removed"
                            ? "bg-destructive/15 text-destructive"
                            : isSystem
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                        )}>
                          {isSystem ? (
                            <Monitor className="h-3.5 w-3.5" />
                          ) : (
                            getInitials(h.tfpName!)
                          )}
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="min-w-0 pb-5">
                        <p className="text-sm text-foreground leading-8">
                          {formatHistoryEntry(h)}
                          <span className="ml-2 text-xs text-muted-foreground">
                            · {new Date(h.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            {" "}
                            {new Date(h.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </p>
                        {h.detail && (
                          <p className="text-xs text-muted-foreground -mt-1">{h.detail}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {podStatus === "Active" ? (
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Deactivate pod</p>
                <p className="text-xs text-muted-foreground">
                  Set this pod to Inactive. Members will be notified and the pod can be reactivated later.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0"
                onClick={() => setDeactivateOpen(true)}
              >
                Deactivate
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-success/35 bg-success/8 dark:bg-success/12 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Reactivate pod</p>
                <p className="text-xs text-muted-foreground">
                  This pod is currently inactive. Reactivate to restore normal operations and notify members.
                </p>
              </div>
              <Button
                size="sm"
                className="shrink-0 bg-success text-white hover:bg-success/90"
                onClick={() => {
                  setPodStatus("Active");
                  setNotificationSent(true);
                }}
              >
                Reactivate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addMembersOpen} onOpenChange={setAddMembersOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Search and select active TFPs to add. Members can belong to multiple pods.
          </p>
          <Input
            placeholder="Search TFP by name or email..."
            value={tfpSearch}
            onChange={(e) => setTfpSearch(e.target.value)}
            className="mt-2"
          />
          <div className="max-h-[240px] overflow-y-auto rounded-lg border border-border">
            {filteredForAdd.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No active TFPs available to add.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredForAdd.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium block truncate">{p.name}</span>
                      <span className="text-sm text-muted-foreground truncate block">
                        {"email" in p && p.email ? String(p.email) : "—"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 shrink-0 text-primary hover:text-primary hover:bg-primary/10 [&_svg]:!h-8 [&_svg]:!w-8"
                      onClick={() => handleAddMember(p)}
                      aria-label={`Add ${p.name}`}
                    >
                      <AddSquareBold />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMembersOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignLeaderOpen} onOpenChange={setAssignLeaderOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Assign pod leader</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Search and select any active TFP as the pod leader. Leaders can lead multiple pods. All pod members will be notified.
          </p>
          <Input
            placeholder="Search TFP by name..."
            value={leaderSearch}
            onChange={(e) => setLeaderSearch(e.target.value)}
          />
          <div className="max-h-[280px] overflow-y-auto rounded-lg border border-border">
            {filteredLeaderCandidates.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No matching TFPs found.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredLeaderCandidates.map((p) => {
                  const isCurrentLeader = p.id === podOrPlaceholder.leaderId;
                  return (
                    <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-medium block truncate">{p.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {p.id}</span>
                      </div>
                      {isCurrentLeader ? (
                        <Badge variant="secondary" className="shrink-0 text-xs">Current leader</Badge>
                      ) : (
                        <Button size="sm" className="shrink-0" onClick={() => handleAssignLeader(p.id)}>
                          Assign
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignLeaderOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Full pod activity history</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            {historyForPod.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No history yet.</p>
            ) : (
              <div className="space-y-0">
                {historyForPod.map((h, idx) => {
                  const isSystem = !h.tfpName;
                  const isLast = idx === historyForPod.length - 1;
                  return (
                    <div key={h.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={clsx(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xxs font-semibold",
                          h.type === "member_removed"
                            ? "bg-destructive/15 text-destructive"
                            : isSystem
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                        )}>
                          {isSystem ? (
                            <Monitor className="h-3.5 w-3.5" />
                          ) : (
                            getInitials(h.tfpName!)
                          )}
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="min-w-0 pb-5">
                        <p className="text-sm text-foreground leading-8">
                          {formatHistoryEntry(h)}
                          <span className="ml-2 text-xs text-muted-foreground">
                            · {new Date(h.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            {" "}
                            {new Date(h.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </p>
                        {h.detail && (
                          <p className="text-xs text-muted-foreground -mt-1">{h.detail}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deactivateOpen && (
        <DeactivatePodDialog
          open={deactivateOpen}
          podName={displayName}
          memberCount={memberList.length}
          onOpenChange={(open) => {
            if (!open) setDeactivateOpen(false);
          }}
          onCancel={() => setDeactivateOpen(false)}
          onConfirm={() => {
            setPodStatus("Inactive");
            setNotificationSent(true);
            setDeactivateOpen(false);
          }}
        />
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit pod details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Pod name
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Clinical Psychologists – North"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
