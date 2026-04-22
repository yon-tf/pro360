"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  appointments,
  KIND_LABELS,
  SERVICE_TYPE_LABELS,
  CONTEXT_LABELS,
  CATEGORY_LABELS,
  ACTIVATION_STATUS_LABELS,
  isOfflineType,
  type Appointment,
} from "@/features/appointments/mock/appointments";
import { WELLBEING_PILLAR_LABELS } from "@/features/org/mock/organizations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, FileText } from "@/components/ui/solar-icons";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
      <FileText className="h-8 w-8 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function formatDt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-xs font-medium text-muted-foreground">{label}</p><div className="mt-1">{children}</div></div>;
}

function targetValue(a: Appointment): string {
  if (a.context === "internal") return "ThoughtFull (Internal)";
  if (a.category === "activation" && a.organisationName) return a.organisationName;
  if (a.clientDisplay) return a.clientDisplay;
  if (a.organisationName) return a.organisationName;
  return "—";
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function OverviewSection({ a }: { a: Appointment }) {
  const typeLabel = a.serviceType ? SERVICE_TYPE_LABELS[a.serviceType] : KIND_LABELS[a.type];
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Overview</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <Field label="Scheduled at">{formatDt(a.scheduledAt)}</Field>
          {a.startedAt && <Field label="Started">{formatDt(a.startedAt)}</Field>}
          {a.endedAt && <Field label="Ended">{formatDt(a.endedAt)}</Field>}
          <Field label="Duration">{a.duration ?? "—"}</Field>
          <Field label="Type"><Badge variant="secondary">{typeLabel}</Badge></Field>
          <Field label="Category">
            <Badge variant="outline">{CATEGORY_LABELS[a.category]}</Badge>
          </Field>
          {a.context === "internal" ? (
            <Field label="Hosted by">
              <p>{a.expectedRoster.find((p) => p.role === "host" || p.role === "presenter")?.name ?? "ThoughtFull"}</p>
            </Field>
          ) : (
            <>
              <Field label="Professional"><p>{a.professionalDisplay}</p></Field>
              <Field label={a.category === "activation" ? "Organisation" : "Client"}><p>{targetValue(a)}</p></Field>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

function AttendanceSection({ a }: { a: Appointment }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Attendance — {a.joinedRoster.length} / {a.expectedRoster.length} joined</CardTitle></CardHeader>
      <CardContent>
        {a.expectedRoster.length === 0 ? (
          <p className="text-sm text-muted-foreground">No roster information.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {a.expectedRoster.map((p) => {
              const joined = a.joinedRoster.some((j) => j.id === p.id);
              return (
                <li key={p.id} className="flex items-center gap-2">
                  <span className={joined ? "text-success" : "text-destructive"}>{joined ? "●" : "○"}</span>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">({p.role})</span>
                  {!joined && <Badge variant="destructive" className="text-xxxs px-2 py-0">absent</Badge>}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// AI Summary + Takeaways (with transcript modal)
// ---------------------------------------------------------------------------

function AiSummarySection({ a }: { a: Appointment }) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const hasSummary = a.aiSummary || (a.aiTakeaways && a.aiTakeaways.length > 0);
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">AI Summary</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-2 text-xs text-muted-foreground"
            onClick={() => setTranscriptOpen(true)}
            disabled={!a.transcript}
          >
            <FileText className="h-3.5 w-3.5" />
            View transcript
          </Button>
        </CardHeader>
        <CardContent>
          {hasSummary ? (
            <div className="space-y-4 text-sm">
              {a.aiSummary && <p className="leading-relaxed">{a.aiSummary}</p>}
              {a.aiTakeaways && a.aiTakeaways.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Takeaways</p>
                  <ul className="space-y-2">
                    {a.aiTakeaways.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <EmptyState message="AI summary not yet generated." />
          )}
        </CardContent>
      </Card>

      <Dialog open={transcriptOpen} onOpenChange={setTranscriptOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session Transcript</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{a.transcript}</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// AI Rating & Quality
// ---------------------------------------------------------------------------

function AiRatingSection({ a }: { a: Appointment }) {
  const hasRating = a.aiQualityScore != null || a.aiReview;
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">AI Rating &amp; Quality</CardTitle></CardHeader>
      <CardContent>
        {hasRating ? (
          <div className="space-y-4 text-sm">
            {a.aiQualityScore != null && (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums">{a.aiQualityScore}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
            )}
            {a.aiQualitySignals && a.aiQualitySignals.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {a.aiQualitySignals.map((s) => (
                  <Badge key={s} variant="secondary" className="capitalize text-xs">{s.replace(/_/g, " ")}</Badge>
                ))}
              </div>
            )}
            {a.aiReview && (
              <div className="space-y-1">
                <p>{a.aiReview.primary}</p>
                {a.aiReview.secondary && <p className="text-muted-foreground">{a.aiReview.secondary}</p>}
              </div>
            )}
          </div>
        ) : (
          <EmptyState message="AI rating not available." />
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Case Notes SOAP (core services only, scrollable)
// ---------------------------------------------------------------------------

function CaseNotesSection({ a }: { a: Appointment }) {
  if (a.type !== "client_session") return null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Case Notes (SOAP)</CardTitle></CardHeader>
      <CardContent>
        {a.caseNotesSOAP ? (
          <div className="max-h-[350px] overflow-y-auto rounded-md border border-border p-4">
            <dl className="space-y-4 text-sm">
              {(["subjective", "objective", "assessment", "plan"] as const).map((key) => (
                <div key={key}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{key}</dt>
                  <dd className="mt-1 leading-relaxed">{a.caseNotesSOAP![key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <EmptyState message="Case notes have not been submitted." />
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Pod Documentation (internal pod appointments)
// ---------------------------------------------------------------------------

function PodDocumentationSection({ a }: { a: Appointment }) {
  if (a.type !== "pod_appointment") return null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Pod Notes</CardTitle></CardHeader>
      <CardContent>
        {a.podDocumentation ? (
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topics</p>
              <ul className="list-inside list-disc space-y-1">
                {a.podDocumentation.topics.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
              <p className="leading-relaxed">{a.podDocumentation.notes}</p>
            </div>
          </div>
        ) : (
          <EmptyState message="Pod notes have not been documented." />
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Activation Metadata (activation appointments)
// ---------------------------------------------------------------------------

function ActivationMetadataSection({ a }: { a: Appointment }) {
  if (a.category !== "activation") return null;
  const typeLabel = a.serviceType ? SERVICE_TYPE_LABELS[a.serviceType] : KIND_LABELS[a.type];
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Activation Details</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <Field label="Activation type"><Badge variant="secondary">{typeLabel}</Badge></Field>
          {a.organisationName && <Field label="Organisation"><p>{a.organisationName}</p></Field>}
          {a.activationStatus && (
            <Field label="Status">
              <Badge variant="outline" className="capitalize text-xs">{ACTIVATION_STATUS_LABELS[a.activationStatus]}</Badge>
            </Field>
          )}
          {a.wellbeingPillars && a.wellbeingPillars.length > 0 && (
            <Field label="Wellbeing Pillars">
              <div className="flex flex-wrap gap-2">
                {a.wellbeingPillars.map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs">{WELLBEING_PILLAR_LABELS[p]}</Badge>
                ))}
              </div>
            </Field>
          )}
          <Field label="Participants"><p>{a.participantCount ?? 0} attendees</p></Field>
          <Field label="Duration"><p>{a.duration ?? "—"}</p></Field>
          {a.professionalRating != null && (
            <Field label="Professional Rating"><p className="tabular-nums">{a.professionalRating.toFixed(1)} / 5</p></Field>
          )}
          {a.programRating != null && (
            <Field label="Program Rating"><p className="tabular-nums">{a.programRating.toFixed(1)} / 5</p></Field>
          )}
          {a.engagementRate != null && (
            <Field label="Engagement Rate"><p className="tabular-nums">{a.engagementRate}%</p></Field>
          )}
          {a.programScore != null && (
            <Field label="Program Score"><p className="tabular-nums">{a.programScore}%</p></Field>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Commercial
// ---------------------------------------------------------------------------

function CommercialSection({ a }: { a: Appointment }) {
  if (!a.commercial) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Commercial</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 text-sm">
          {a.commercial.payoutBatchId && <Field label="Payout batch">{a.commercial.payoutBatchId}</Field>}
          {a.commercial.payoutStatus && (
            <Field label="Payout status">
              <Badge variant={a.commercial.payoutStatus === "flagged" ? "destructive" : a.commercial.payoutStatus === "paid" ? "default" : "secondary"} className="capitalize">{a.commercial.payoutStatus}</Badge>
            </Field>
          )}
          {a.commercial.pricingBasis && <Field label="Pricing basis"><p className="capitalize">{a.commercial.pricingBasis.replace(/_/g, " ")}</p></Field>}
          {a.commercial.commercialFlags && a.commercial.commercialFlags.length > 0 && (
            <Field label="Flags"><div className="flex flex-wrap gap-2">{a.commercial.commercialFlags.map((f) => <Badge key={f} variant="outline" className="capitalize text-xs">{f.replace(/_/g, " ")}</Badge>)}</div></Field>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Quality Flags
// ---------------------------------------------------------------------------

function QualitySection({ a }: { a: Appointment }) {
  if (!a.quality || a.quality.flags.length === 0) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Quality Flags</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">{a.quality.flags.map((f) => <Badge key={f} variant="destructive" className="capitalize">{f.replace(/_/g, " ")}</Badge>)}</div>
        {a.quality.ruleHits && a.quality.ruleHits.length > 0 && (
          <div><p className="text-xs text-muted-foreground">Rule engine hits</p><div className="flex flex-wrap gap-2 mt-1">{a.quality.ruleHits.map((r) => <Badge key={r} variant="outline" className="text-xs capitalize">{r.replace(/_/g, " ")}</Badge>)}</div></div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const appointment = appointments.find((a) => a.id === id);
  if (!appointment) notFound();

  const typeLabel = appointment.serviceType
    ? SERVICE_TYPE_LABELS[appointment.serviceType]
    : KIND_LABELS[appointment.type];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/appointments"><ChevronLeft className="mr-1 h-4 w-4" />Back to list</Link>
        </Button>
        <Badge variant="secondary">{typeLabel}</Badge>
        <Badge variant="outline">{CONTEXT_LABELS[appointment.context]}</Badge>
      </div>

      <OverviewSection a={appointment} />
      <AttendanceSection a={appointment} />
      {!isOfflineType(appointment.serviceType) && <AiSummarySection a={appointment} />}
      {!isOfflineType(appointment.serviceType) && <AiRatingSection a={appointment} />}
      <CaseNotesSection a={appointment} />
      <PodDocumentationSection a={appointment} />
      <ActivationMetadataSection a={appointment} />
      <CommercialSection a={appointment} />
      <QualitySection a={appointment} />
    </div>
  );
}
