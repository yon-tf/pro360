"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "@/components/ui/solar-icons";

export function DeactivatePodDialog({
  open,
  podName,
  memberCount,
  onOpenChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  podName?: string;
  memberCount: number;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Deactivate pod</DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="space-y-3 pt-2">
              <p>
                Are you sure you want to deactivate <strong>{podName}</strong>?
              </p>
              <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">Impact</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Pod status will change to <strong className="text-foreground">Inactive</strong></li>
                  {memberCount > 0 && (
                    <li>{memberCount} member{memberCount !== 1 ? "s" : ""} will be notified via the pod chat group</li>
                  )}
                  <li>The pod will no longer appear in active pod filters</li>
                  <li>Members remain linked but pod meetings and syncs will be paused</li>
                  <li>This can be reversed — the pod can be reactivated from its detail page</li>
                </ul>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Deactivate pod
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
