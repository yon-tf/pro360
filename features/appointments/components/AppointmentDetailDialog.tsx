"use client";

import type { Appointment } from "@/features/appointments/mock/appointments";
import { KIND_LABELS, CONTEXT_LABELS } from "@/features/appointments/mock/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatDt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export function AppointmentDetailDialog({
  open,
  appointment,
  onOpenChange,
  onClose,
}: {
  open: boolean;
  appointment: Appointment | null;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}) {
  const targetLabel = appointment
    ? appointment.context === "internal" ? "ThoughtFull (Internal)"
      : appointment.category === "activation" && appointment.organisationName ? appointment.organisationName
      : appointment.clientDisplay ?? appointment.organisationName ?? "—"
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Appointment detail</DialogTitle>
          <DialogDescription>Overview of the selected appointment record.</DialogDescription>
        </DialogHeader>
        {appointment && (
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Scheduled at</p>
              <p>{formatDt(appointment.scheduledAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <Badge variant="secondary">{KIND_LABELS[appointment.type]}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Context</p>
              <Badge variant="outline">{CONTEXT_LABELS[appointment.context]}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Professional</p>
              <p>{appointment.professionalDisplay}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{appointment.context === "internal" ? "Organisation" : appointment.category === "activation" ? "Organisation" : "Client"}</p>
              <p>{targetLabel ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p>{appointment.duration ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Attendance</p>
              <p>{appointment.joinedRoster.length} / {appointment.expectedRoster.length} joined</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">AI rating</p>
              <p>
                {appointment.aiQualityScore != null
                  ? `${appointment.aiQualityScore} / 5`
                  : "Not rated"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">AI review</p>
              {appointment.aiReview ? (
                <div className="space-y-1">
                  <p>{appointment.aiReview.primary}</p>
                  {appointment.aiReview.secondary && (
                    <p className="text-muted-foreground">{appointment.aiReview.secondary}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
