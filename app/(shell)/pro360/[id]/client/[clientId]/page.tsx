"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { clients, clientAssessments, moodHistory, MOOD_EMOJI, MOOD_LABEL } from "@/features/professionals/mock/professionals";
import { appointments, type Appointment } from "@/features/appointments/mock/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, User, Building2, MessageSquare, FileText, ExternalLink } from "@/components/ui/solar-icons";

function formatDateGB(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

type CaseNoteStatus = "submitted" | "late" | "missing" | "scheduled" | "no_show";

const CASE_NOTE_BADGE: Record<CaseNoteStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  submitted: { label: "Submitted", variant: "default" },
  late: { label: "Late", variant: "secondary" },
  missing: { label: "Missing", variant: "destructive" },
  scheduled: { label: "Scheduled", variant: "outline" },
  no_show: { label: "No-show", variant: "outline" },
};

const LATE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

function deriveCaseNoteStatus(a: Appointment): CaseNoteStatus {
  if (a.category !== "core_service" || a.type !== "client_session") return "scheduled";
  const isNoShow = a.expectedRoster.some((r) => r.role === "attendee" && r.attendance === "no_show");
  if (isNoShow) return "no_show";
  const isPast = new Date(a.scheduledAt).getTime() < Date.now();
  if (!isPast) return "scheduled";
  if (!a.caseNotesSOAP) return "missing";
  if (a.caseNotesSubmittedAt && a.endedAt) {
    const gap = new Date(a.caseNotesSubmittedAt).getTime() - new Date(a.endedAt).getTime();
    if (gap > LATE_THRESHOLD_MS) return "late";
  }
  return "submitted";
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string; clientId: string }> }) {
  const { id: professionalId, clientId } = use(params);
  const client = clients.find((c) => c.id === clientId);
  if (!client) notFound();

  const assessments = clientAssessments.filter((a) => a.clientId === clientId);
  const moods = moodHistory.filter((m) => m.clientId === clientId);

  const clientAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.category === "core_service" && a.type === "client_session" && a.expectedRoster.some((r) => r.id === clientId))
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }, [clientId]);
  const daysSince = Math.floor((Date.now() - new Date(client.lastContact).getTime()) / (1000 * 60 * 60 * 24));
  const isActive = daysSince <= 7;
  const packageLabel = client.packageType === "corporate" ? "Corporate package" : "Personal package";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/pro360/${professionalId}`}><ChevronLeft className="mr-1 h-4 w-4" />Back to Professional 360</Link>
      </Button>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6">
          {client.avatar ? (
            <Image src={client.avatar} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" width={64} height={64} />
          ) : (
            <div className="h-16 w-16 shrink-0 rounded-full bg-muted" />
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{client.name}</h1>
              <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">ID: {client.clientId}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><User className="h-3.5 w-3.5" />{client.age} years · {client.gender}</span>
              <span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />{client.organisation ?? "Personal"}</span>
            </div>
            <p className="text-xs text-muted-foreground">{packageLabel} ending on {formatDateGB(client.packageEndDate)}</p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href={`/chat?view=tfp-client&professionalId=${professionalId}&clientId=${clientId}`}><MessageSquare className="mr-2 h-4 w-4" />View Chat</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Case Notes</CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {(() => {
                const submitted = clientAppointments.filter((a) => deriveCaseNoteStatus(a) === "submitted").length;
                const late = clientAppointments.filter((a) => deriveCaseNoteStatus(a) === "late").length;
                const missing = clientAppointments.filter((a) => deriveCaseNoteStatus(a) === "missing").length;
                const total = clientAppointments.filter((a) => ["submitted", "late", "missing"].includes(deriveCaseNoteStatus(a))).length;
                return (
                  <>
                    <span>{submitted + late}/{total} submitted</span>
                    {missing > 0 && <Badge variant="destructive" className="text-xxxs px-2 py-0">{missing} missing</Badge>}
                    {late > 0 && <Badge variant="secondary" className="text-xxxs px-2 py-0">{late} late</Badge>}
                  </>
                );
              })()}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Appointment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientAppointments.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No client sessions found for this client.</TableCell></TableRow>
              ) : clientAppointments.map((a) => {
                const status = deriveCaseNoteStatus(a);
                const badge = CASE_NOTE_BADGE[status];
                const serviceLabel = a.serviceType === "video_call" ? "Video call" : a.serviceType === "face_to_face" ? "Face-to-face" : (a.serviceType ?? "—");
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium tabular-nums">{a.id.toUpperCase()}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{formatDateGB(a.scheduledAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{serviceLabel}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {a.caseNotesSubmittedAt
                        ? new Date(a.caseNotesSubmittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </TooltipTrigger>
                          {status === "late" && <TooltipContent>Submitted &gt;24 h after session ended</TooltipContent>}
                          {status === "missing" && <TooltipContent>Case notes not yet submitted for a past session</TooltipContent>}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      {a.caseNotesSOAP ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/appointments/${a.id}`}><FileText className="mr-1 h-3.5 w-3.5" />View<ExternalLink className="ml-1 h-3 w-3" /></Link>
                        </Button>
                      ) : status === "missing" ? (
                        <span className="text-xs text-destructive font-medium">Pending submission</span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Assessments Taken</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Taken Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No assessments recorded for this client.</TableCell></TableRow>
              ) : assessments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.assessmentName}</TableCell>
                  <TableCell className="text-muted-foreground">{a.organisation ?? "Personal"}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{formatDateGB(a.takenDate)}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "completed" ? "default" : a.status === "in_progress" ? "secondary" : "outline"}>
                      {a.status === "in_progress" ? "In progress" : a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Mood History</CardTitle></CardHeader>
        <CardContent>
          {moods.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No mood entries recorded for this client.</p>
          ) : (
            <ul className="divide-y divide-border">
              {moods.map((m) => {
                const dt = new Date(m.recordedAt);
                const dateStr = dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                const timeStr = dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
                return (
                  <li key={m.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="mt-1 text-2xl leading-none" aria-label={MOOD_LABEL[m.mood]}>{MOOD_EMOJI[m.mood]}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground">{MOOD_LABEL[m.mood]}</span>
                      <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{dateStr} at {timeStr}{m.organisation && <> · {m.organisation}</>}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
