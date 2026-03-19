"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function CreateJobDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create job</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add a new job under Activation. (Placeholder - no backend.)
          </p>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Title
            </label>
            <Input placeholder="Job title" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Description
            </label>
            <Input placeholder="Full details..." className="min-h-[80px]" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Claim categories
            </label>
            <Input placeholder="e.g. Supervision, Hotline" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Create job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
