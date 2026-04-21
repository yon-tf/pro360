"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Crown,
  Search,
  UserMinus,
  UserPlus,
} from "@/components/ui/solar-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormActions } from "@/components/FormActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { professionals } from "@/features/professionals/mock/professionals";

interface NewMember {
  tfpId: string;
  name: string;
}

export default function CreatePodPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [members, setMembers] = useState<NewMember[]>([]);
  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const deferredSearch = useDeferredValue(memberSearch);

  const memberIds = useMemo(() => new Set(members.map((m) => m.tfpId)), [members]);

  const filteredCandidates = useMemo(() => {
    const active = professionals.filter(
      (p) => p.status === "Active" && !memberIds.has(p.id)
    );
    if (!deferredSearch.trim()) return active;
    const q = deferredSearch.toLowerCase();
    return active.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p as { email?: string }).email?.toLowerCase().includes(q)
    );
  }, [deferredSearch, memberIds]);

  function handleAddMember(p: { id: string; name: string }) {
    setMembers((prev) => [...prev, { tfpId: p.id, name: p.name }]);
    setMemberSearch("");
  }

  function handleRemoveMember(tfpId: string) {
    setMembers((prev) => prev.filter((m) => m.tfpId !== tfpId));
    if (leaderId === tfpId) setLeaderId(null);
  }

  function handleAssignLeader(tfpId: string | null) {
    setLeaderId(tfpId && tfpId.trim() ? tfpId : null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `pod-${Date.now()}`;
    router.push(`/team/${newId}`);
  };

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create new pod</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Pod name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Clinical Psychologists – North"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Description (optional)
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Brief description or notes"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Pod Members</CardTitle>
              {members.length > 0 && (
                <Badge variant="secondary">{members.length} added</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search TFP by name or ID..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {memberSearch.trim() && (
              <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border">
                {filteredCandidates.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No matching TFPs found.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {filteredCandidates.slice(0, 10).map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 px-4 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {p.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ID: {p.id}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => handleAddMember(p)}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Add members
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {members.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[160px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.tfpId}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {m.tfpId}
                      </TableCell>
                      <TableCell>
                        {leaderId === m.tfpId ? (
                          <Badge variant="default" className="gap-1">
                            <Crown className="h-3 w-3" />
                            Pod Leader
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Member
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {leaderId === m.tfpId ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAssignLeader(null)}
                              title="Unassign pod leader"
                            >
                              <Crown className="h-4 w-4" />
                              Unassign
                            </Button>
                          ) : (
                            !leaderId && (
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={() => handleAssignLeader(m.tfpId)}
                                title="Assign as pod leader"
                              >
                                <Crown className="h-4 w-4" />
                                Assign
                              </Button>
                            )
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveMember(m.tfpId)}
                          >
                            <UserMinus className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No members added yet. Search above to add TFPs to this pod.
              </div>
            )}
          </CardContent>
        </Card>

        <FormActions className="pt-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/team">Cancel</Link>
          </Button>
          <Button type="submit">Create pod</Button>
        </FormActions>
      </form>
    </div>
  );
}
