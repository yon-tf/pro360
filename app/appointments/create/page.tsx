"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { professionals } from "@/lib/mock/professionals";
import { pods } from "@/lib/mock/pods";
import { KIND_LABELS, type AppointmentKind } from "@/lib/mock/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel as Label } from "@/components/ui/field";
import { ChevronLeft } from "@/components/ui/solar-icons";
import { systemToast } from "@/lib/systemToast";

const INTERNAL_KINDS: { value: AppointmentKind; label: string }[] = [
  { value: "townhall", label: KIND_LABELS.townhall },
  { value: "workshop", label: KIND_LABELS.workshop },
  { value: "pod_appointment", label: KIND_LABELS.pod_appointment },
];

export default function CreateInternalAppointmentPage() {
  const router = useRouter();
  const [kind, setKind] = useState<AppointmentKind | "">("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");
  const [selectedPod, setSelectedPod] = useState<string>("");
  const [selectedProfessionals, setSelectedProfessionals] = useState<Set<string>>(new Set());
  const [allTfps, setAllTfps] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const podMembers = useMemo(() => {
    if (!selectedPod) return [];
    const pod = pods.find((p) => p.id === selectedPod);
    if (!pod) return [];
    return pod.members.map((m) => professionals.find((p) => p.id === m.tfpId)).filter(Boolean);
  }, [selectedPod]);

  const toggleProfessional = (id: string) => {
    setSelectedProfessionals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAllTfps = (checked: boolean) => {
    setAllTfps(checked);
    if (checked) {
      setSelectedProfessionals(new Set(professionals.map((p) => p.id)));
    } else {
      setSelectedProfessionals(new Set());
    }
  };

  const isValid = kind !== "" && date !== "" && time !== "" && (selectedProfessionals.size > 0 || allTfps);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      systemToast.success("Appointment created", `${KIND_LABELS[kind as AppointmentKind]} scheduled for ${date} at ${time}.`);
      router.push("/appointments?context=internal");
    }, 600);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/appointments?context=internal"><ChevronLeft className="mr-1 h-4 w-4" />Back to appointments</Link>
      </Button>

      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">Create internal appointment</h1>
        <p className="text-sm text-muted-foreground">Schedule a new townhall, workshop, or pod appointment for the clinical ops team.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Appointment details</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="kind">Type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as AppointmentKind)}>
              <SelectTrigger id="kind"><SelectValue placeholder="Select appointment type" /></SelectTrigger>
              <SelectContent>
                {INTERNAL_KINDS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" placeholder="e.g. February Townhall, CBT Workshop" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (min)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["30", "45", "60", "90", "120"].map((d) => (
                    <SelectItem key={d} value={d}>{d} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" placeholder="Agenda, topics, or instructions…" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {kind === "pod_appointment" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Select pod</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedPod} onValueChange={(v) => {
              setSelectedPod(v);
              const pod = pods.find((p) => p.id === v);
              if (pod) {
                setSelectedProfessionals(new Set(pod.members.map((m) => m.tfpId)));
                setAllTfps(false);
              }
            }}>
              <SelectTrigger><SelectValue placeholder="Choose a pod" /></SelectTrigger>
              <SelectContent>
                {pods.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.members.length} members)</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPod && podMembers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Pod members (auto-selected)</p>
                <div className="flex flex-wrap gap-1.5">
                  {podMembers.map((p) => p && (
                    <Badge key={p.id} variant="secondary" className="text-xs">Dr. {p.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {kind !== "pod_appointment" && kind !== "" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Participants</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={allTfps} onCheckedChange={(c) => handleAllTfps(c === true)} />
              <span className="text-sm font-medium">All TFPs</span>
            </label>
            {!allTfps && (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {professionals.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer transition-colors">
                    <Checkbox checked={selectedProfessionals.has(p.id)} onCheckedChange={() => toggleProfessional(p.id)} />
                    <span className="text-sm">{p.name}</span>
                    <Badge variant="outline" className="ml-auto text-[10px]">{p.role}</Badge>
                  </label>
                ))}
              </div>
            )}
            {selectedProfessionals.size > 0 && !allTfps && (
              <p className="text-xs text-muted-foreground">{selectedProfessionals.size} professional{selectedProfessionals.size !== 1 ? "s" : ""} selected</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-end gap-3 pb-8">
        <Button variant="outline" asChild>
          <Link href="/appointments?context=internal">Cancel</Link>
        </Button>
        <Button disabled={!isValid || submitting} onClick={handleSubmit}>
          {submitting ? "Creating…" : "Create appointment"}
        </Button>
      </div>
    </div>
  );
}
