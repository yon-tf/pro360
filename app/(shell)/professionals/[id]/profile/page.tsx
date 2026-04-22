"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronUp, Copy, Check, Info, Pencil, RotateCcw, Save, Sparkles } from "@/components/ui/solar-icons";
import {
  professionalProfiles,
  SUPPORTED_LANGUAGES,
  type TranslationDraft,
} from "@/features/professionals/mock/professionalProfiles";
import { ProfessionalForm } from "../../ProfessionalForm";
import { getMergedProfessionalProfiles, upsertStoredProfessionalProfile } from "@/features/professionals/mock/professionalProfileStore";
import { pods } from "@/features/team/mock/pods";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CredentialsTab } from "../CredentialsTab";
import { useBreadcrumb } from "@/components/BreadcrumbContext";

const STATUS_LABEL: Record<string, string> = {
  pending_introduction: "Pending introduction",
  updated_introduction: "Updated introduction",
  imported: "Imported",
};

function formatSystemDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Field({ label, value, system }: { label: string; value: React.ReactNode; system?: boolean }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-2">
        {label}
        {system && <Badge variant="secondary" className="text-xxxs px-1 py-0 leading-tight">System</Badge>}
      </div>
      <div className="text-sm text-foreground">{value ?? "—"}</div>
    </div>
  );
}

function PublicProfileSection({ profile }: { profile: (typeof professionalProfiles)[number] }) {
  const [translationsOpen, setTranslationsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>(SUPPORTED_LANGUAGES[0]);
  const [translations, setTranslations] = useState<Record<string, TranslationDraft>>(profile.translations ?? {});
  const completedCount = Object.values(translations).filter((t) => t.complete).length;

  const currentDraft: TranslationDraft = translations[selectedLang] ?? {
    biography: "",
    specialisations: [],
    therapyApproaches: [],
    treatmentExperiences: [],
    complete: false,
  };

  function updateDraft(field: keyof TranslationDraft, value: unknown) {
    setTranslations((prev) => ({
      ...prev,
      [selectedLang]: { ...currentDraft, [field]: value },
    }));
  }

  function handleGenerateDraft() {
    setTranslations((prev) => ({
      ...prev,
      [selectedLang]: {
        biography: `[Auto-translated ${selectedLang}] ${profile.biography}`,
        specialisations: profile.specialisations.map((s) => `[${selectedLang}] ${s}`),
        therapyApproaches: profile.therapyApproaches.map((a) => `[${selectedLang}] ${a}`),
        treatmentExperiences: profile.treatmentExperiences.map((t) => `[${selectedLang}] ${t}`),
        complete: false,
      },
    }));
  }

  function handleSaveTranslation() {
    setTranslations((prev) => ({
      ...prev,
      [selectedLang]: { ...currentDraft, complete: true },
    }));
  }

  function handleResetTranslation() {
    setTranslations((prev) => {
      const next = { ...prev };
      delete next[selectedLang];
      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Public profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Biography</p>
          <p className="text-sm text-foreground leading-relaxed">{profile.biography}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Specialisation
            <span
              className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/90 align-middle"
              title="Client groups they commonly support"
              aria-label="Specialisation helper information"
            >
              <Info className="h-3.5 w-3.5" />
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.specialisations.map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Therapy approach
            <span
              className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/90 align-middle"
              title="Methods they use in sessions"
              aria-label="Therapy approach helper information"
            >
              <Info className="h-3.5 w-3.5" />
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.therapyApproaches.map((a) => (
              <Badge key={a} variant="secondary">{a}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Special populations
            <span
              className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/90 align-middle"
              title="Relevant backgrounds and care contexts this professional is equipped to support beyond standard presentation categories."
              aria-label="Special populations helper information"
            >
              <Info className="h-3.5 w-3.5" />
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.treatmentExperiences.map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-between px-0"
            onClick={() => setTranslationsOpen((prev) => !prev)}
          >
            <span className="font-medium">Translations</span>
            {translationsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {translationsOpen && (
            <div className="space-y-4 pt-3">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={selectedLang} onValueChange={setSelectedLang}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const done = translations[lang]?.complete;
                      return (
                        <SelectItem key={lang} value={lang}>
                          {lang} {done ? "✓" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Badge variant="secondary">
                  {completedCount}/{SUPPORTED_LANGUAGES.length} completed
                </Badge>
                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={handleGenerateDraft}>
                    <Sparkles className="h-4 w-4" /> Generate draft translation
                  </Button>
                  <Button size="sm" onClick={handleSaveTranslation} disabled={!currentDraft.biography}>
                    <Save className="h-4 w-4" /> Save translation
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleResetTranslation} disabled={!translations[selectedLang]}>
                    <RotateCcw className="h-4 w-4" /> Reset to English
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">English (source)</p>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Biography</p>
                    <p className="text-sm">{profile.biography}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Specialisation</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.specialisations.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Therapy approach</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.therapyApproaches.map((a) => (
                        <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Special populations</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.treatmentExperiences.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-border p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {selectedLang} (draft)
                    {currentDraft.complete && <Badge variant="default" className="ml-2 text-xxxs">Complete</Badge>}
                  </p>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Biography</p>
                    <Textarea
                      className="min-h-[80px] resize-y"
                      value={currentDraft.biography}
                      onChange={(e) => updateDraft("biography", e.target.value)}
                      placeholder="Enter translated biography..."
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Specialisation</p>
                    <Input
                      placeholder="Comma-separated translated labels..."
                      value={currentDraft.specialisations.join(", ")}
                      onChange={(e) => updateDraft("specialisations", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Therapy approach</p>
                    <Input
                      placeholder="Comma-separated translated labels..."
                      value={currentDraft.therapyApproaches.join(", ")}
                      onChange={(e) => updateDraft("therapyApproaches", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Special populations</p>
                    <Input
                      placeholder="Comma-separated translated labels..."
                      value={currentDraft.treatmentExperiences.join(", ")}
                      onChange={(e) => updateDraft("treatmentExperiences", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfessionalViewPage() {
  const { id } = useParams<{ id: string }>();
  const [profiles, setProfiles] = useState(professionalProfiles);
  const [profilesReady, setProfilesReady] = useState(false);
  const profile = profiles.find((p) => p.id === id);
  const { setItems } = useBreadcrumb();
  const [departureDate, setDepartureDate] = useState(profile?.leftDate ?? "");
  const [departureDialogOpen, setDepartureDialogOpen] = useState(false);
  const [departureDateInput, setDepartureDateInput] = useState(profile?.leftDate ?? "");
  const [copiedId, setCopiedId] = useState(false);
  const isCreate = id === "new";

  useEffect(() => {
    setProfiles(getMergedProfessionalProfiles(professionalProfiles));
    setProfilesReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#credentials-compliance") return;
    const target = document.getElementById("credentials-compliance");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.focus({ preventScroll: true });
  }, [id]);

  useEffect(() => {
    if (!profile) return;
    setItems([
      { label: "Professionals", href: "/professionals" },
      { label: `${profile.firstName} ${profile.lastName} (${profile.id})`, href: `/professionals/${profile.id}/profile` },
      { label: "Profile" },
    ]);
  }, [profile, setItems]);

  useEffect(() => {
    if (!isCreate) return;
    setItems([
      { label: "Professionals", href: "/professionals" },
      { label: "Add professional", href: "/professionals/new/profile" },
      { label: "Profile" },
    ]);
  }, [isCreate, setItems]);

  if (isCreate) {
    return <ProfessionalForm mode="create" />;
  }

  if (!profile && !profilesReady) {
    return <div className="text-sm text-muted-foreground">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/professionals"><ChevronLeft className="h-4 w-4" />Back to list</Link>
        </Button>
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  const numericId = profile.id.replace(/^PRO-/, "").replace(/^0+/, "");
  const assignedPod = pods.find((pod) =>
    pod.members.some((member) => member.tfpId === numericId)
  );

  const capacityPct = profile.maximumClients > 0
    ? Math.round((profile.activeClients / profile.maximumClients) * 100)
    : 0;

  function handleRecordDeparture() {
    if (departureDateInput && profile) {
      upsertStoredProfessionalProfile({ ...profile, leftDate: departureDateInput });
      setDepartureDate(departureDateInput);
      setProfiles(getMergedProfessionalProfiles(professionalProfiles));
    }
    setDepartureDialogOpen(false);
  }

  function handleDepartAsOfToday() {
    if (profile) {
      const date = new Date().toISOString().slice(0, 10);
      upsertStoredProfessionalProfile({ ...profile, leftDate: date });
      setDepartureDate(date);
      setProfiles(getMergedProfessionalProfiles(professionalProfiles));
    }
    setDepartureDialogOpen(false);
  }

  function handleUndoDeparture() {
    if (profile) {
      upsertStoredProfessionalProfile({ ...profile, leftDate: null });
      setDepartureDate("");
      setProfiles(getMergedProfessionalProfiles(professionalProfiles));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage identity details, credentials, availability, and admin controls.</p>
      </div>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/professionals"><ChevronLeft className="h-4 w-4" />Back to list</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/pro360/${profile.id}`}>View Pro360</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/professionals/${profile.id}/profile/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">User details</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {STATUS_LABEL[profile.profileStatus]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
              <span className="text-xl font-semibold text-muted-foreground">
                {profile.firstName[0]}{profile.lastName[0]}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold">{profile.firstName} {profile.lastName}</p>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(profile.id);
                  setCopiedId(true);
                  setTimeout(() => setCopiedId(false), 1500);
                }}
              >
                <span className="font-mono font-semibold">ID</span>
                <span className="font-mono">{profile.id}</span>
                {copiedId ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Email" value={profile.email} />
            <Field label="Mobile" value={`${profile.dialCode} ${profile.phoneNumber}`} />
            <Field label="Profession" value={profile.profession} />
            <Field label="License number" value={profile.licenseNumber} />
            <Field label="Languages" value={profile.languages.join(", ")} />
            <Field label="Country" value={profile.country} />
            <Field label="State / Region" value={profile.locationState} />
            <Field label="City" value={profile.city} />
            <Field
              label="Pod assignment"
              value={
                assignedPod ? (
                  <Link href={`/team/${assignedPod.id}`} className="text-primary hover:underline">
                    {assignedPod.name}
                  </Link>
                ) : (
                  "Not assigned"
                )
              }
            />
          </div>

          <div className="space-y-3 pt-3">
            <p className="text-sm font-medium text-foreground">Banking information</p>
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Bank name" value={profile.bankName || "—"} />
              <Field label="Bank account number" value={profile.bankAccountNumber || "—"} />
              <Field label="Bank SWIFT code" value={profile.bankSwiftCode || "—"} />
              <Field label="Payout currency" value={profile.payoutCurrency || "—"} />
            </div>
          </div>

          <div id="credentials-compliance" tabIndex={-1} className="border-t border-border pt-4 outline-none">
            <CredentialsTab professionalId={profile.id} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Availability &amp; capacity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Maximum clients" value={profile.maximumClients} />
            <Field label="Active clients" value={`${profile.activeClients} (${capacityPct}%)`} />
            <Field label="Check-in times" value={profile.checkInTimes.length > 0 ? profile.checkInTimes.join(", ") : "—"} />
            <Field
              label="Break period"
              value={
                profile.leaveStartDate && profile.leaveEndDate
                  ? `${profile.leaveStartDate} to ${profile.leaveEndDate}`
                  : "—"
              }
            />
            <Field label="Break reason" value={profile.leaveReason || "—"} />
          </div>
        </CardContent>
      </Card>

      <PublicProfileSection profile={profile} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Demo account" value={profile.demoAccount ? "Yes" : "No"} />
            <Field
              label="Departure (soft delete)"
              value={
                profile.leftDate || departureDate ? (
                  <Badge variant="secondary" className="text-xs">Departed {profile.leftDate || departureDate}</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs text-muted-foreground">Active</Badge>
                )
              }
            />
            <Field
              label="Deactivated"
              value={
                profile.leaveStartDate
                  ? profile.leaveEndDate
                    ? `${profile.leaveStartDate} → ${profile.leaveEndDate}`
                    : `From ${profile.leaveStartDate} (no end date)`
                  : "—"
              }
            />
            <Field label="Created" value={formatSystemDate(profile.createdAt)} system />
            <Field label="Last updated" value={formatSystemDate(profile.updatedAt)} system />
          </div>
        </CardContent>
      </Card>

      {/* ── Danger zone ── */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Departure (red) */}
          {(profile.leftDate || departureDate) ? (
            <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 px-5 py-4">
              <div>
                <p className="text-sm font-medium">Undo departure</p>
                <p className="text-xs text-muted-foreground">
                  This professional is marked as departed (left the platform). Reverse this if they return.
                </p>
              </div>
              <Button
                size="sm"
                className="shrink-0 bg-success text-white hover:bg-success/90"
                onClick={handleUndoDeparture}
              >
                Undo departure
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 px-5 py-4">
              <div>
                <p className="text-sm font-medium">Departure</p>
                <p className="text-xs text-muted-foreground">
                  Record that this professional has left the platform (soft delete). Can be reversed if they return.
                </p>
              </div>
              <Button variant="destructive" size="sm" className="shrink-0" onClick={() => setDepartureDialogOpen(true)}>
                Mark as departed
              </Button>
            </div>
          )}

          {/* Deactivate (yellow) */}
          {(() => {
            const today = new Date().toISOString().slice(0, 10);
            const isDeactivated = profile.leaveStartDate
              && (profile.leaveStartDate <= today)
              && (!profile.leaveEndDate || profile.leaveEndDate >= today);
            return isDeactivated ? (
              <div className="flex items-center justify-between rounded-lg border border-warning/35 bg-warning/8 dark:bg-warning/12 px-5 py-4">
                <div>
                  <p className="text-sm font-medium">Reactivate</p>
                  <p className="text-xs text-muted-foreground">
                    Professional is deactivated{profile.leaveEndDate ? ` until ${profile.leaveEndDate}` : ""}.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-warning/60 text-warning hover:bg-warning/12 dark:hover:bg-warning/12"
                  onClick={() => {
                    upsertStoredProfessionalProfile({
                      ...profile,
                      leaveStartDate: undefined,
                      leaveEndDate: undefined,
                      leaveReason: undefined,
                    });
                    setProfiles(getMergedProfessionalProfiles(professionalProfiles));
                  }}
                >
                  Reactivate
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-warning/35 bg-warning/8 dark:bg-warning/12 px-5 py-4">
                <div>
                  <p className="text-sm font-medium">Deactivate</p>
                  <p className="text-xs text-muted-foreground">
                    Temporarily deactivate (e.g. break, sabbatical). Edit profile to set Leave planning dates.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-warning/60 text-warning hover:bg-warning/12 dark:hover:bg-warning/12"
                  onClick={() => {
                    const start = new Date().toISOString().slice(0, 10);
                    const end = new Date();
                    end.setDate(end.getDate() + 14);
                    upsertStoredProfessionalProfile({
                      ...profile,
                      leaveStartDate: start,
                      leaveEndDate: end.toISOString().slice(0, 10),
                    });
                    setProfiles(getMergedProfessionalProfiles(professionalProfiles));
                  }}
                >
                  Deactivate
                </Button>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <Dialog
        open={departureDialogOpen}
        onOpenChange={setDepartureDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as departed</DialogTitle>
            <DialogDescription>
              Record that this professional has left the platform (soft delete). You can undo this later if they return.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-w-sm">
              <label className="text-sm font-medium">Departure date</label>
              <div className="mt-1">
                <DatePicker
                  value={departureDateInput}
                  onChange={setDepartureDateInput}
                  placeholder="Select departure date"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The date this professional left the platform. This is a soft delete — their data is retained.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setDepartureDialogOpen(false)}>Cancel</Button>
            <Button variant="outline" onClick={handleDepartAsOfToday}>Depart as of today</Button>
            <Button onClick={handleRecordDeparture} disabled={!departureDateInput}>Record departure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
