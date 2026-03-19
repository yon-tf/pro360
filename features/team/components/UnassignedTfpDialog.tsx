"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type UnassignedPerson = {
  id: string;
  name: string;
  email?: string;
};

export function UnassignedTfpDialog({
  open,
  onOpenChange,
  search,
  onSearchChange,
  unassignedCount,
  filteredUnassigned,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  unassignedCount: number;
  filteredUnassigned: UnassignedPerson[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Unassigned ThoughtFull Professionals</DialogTitle>
          <DialogDescription>
            Search and select active TFPs not assigned to any pod. Notification will be sent to pod members when you add someone.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="search"
          placeholder="Search TFP by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
        <div className="overflow-y-auto -mx-1 px-1">
          {unassignedCount === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No unassigned TFPs.</p>
          ) : filteredUnassigned.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No matches for &quot;{search}&quot;.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredUnassigned.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {p.email || "—"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
