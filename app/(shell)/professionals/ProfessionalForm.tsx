"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Upload, AlertTriangle, Copy, Check } from "@/components/ui/solar-icons";
import {
  professionalProfiles,
  type ProfessionalProfile,
  SPECIALISATION_OPTIONS,
  THERAPY_APPROACH_OPTIONS,
  ADDITIONAL_EXPERIENCE_OPTIONS,
  LANGUAGE_OPTIONS,
  COUNTRY_LIST,
  STATES_BY_COUNTRY,
  PROFESSION_OPTIONS,
  CHECK_IN_TIME_OPTIONS,
  PAYOUT_CURRENCY_OPTIONS,
} from "@/features/professionals/mock/professionalProfiles";
import {
  getMergedProfessionalProfiles,
  getNextProfessionalId,
  upsertStoredProfessionalProfile,
} from "@/features/professionals/mock/professionalProfileStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { FormActions } from "@/components/FormActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { parsePhoneNumber } from "react-phone-number-input";
import { MultiSelectDropdown } from "@/features/professionals/components/MultiSelectDropdown";
import { CredentialsTab } from "./[id]/CredentialsTab";
import { systemToast } from "@/lib/systemToast";
import { relinkStoredCredentialProfessionalId } from "@/features/professionals/mock/credentialRecordStore";

const STATUS_LABEL: Record<string, string> = {
  pending_introduction: "Pending introduction",
  updated_introduction: "Updated introduction",
  imported: "Imported",
};

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
        {label}
        <Badge variant="secondary" className="text-xxxs px-1 py-0 leading-tight">System</Badge>
      </div>
      <div className="text-sm text-foreground">{value ?? "—"}</div>
    </div>
  );
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phone: string;
  locationState: string;
  city: string;
  bankName: string;
  bankAccountNumber: string;
  bankSwiftCode: string;
  payoutCurrency: string;
  profession: string;
  licenseNumber: string;
  languages: string[];
  biography: string;
  specialisations: string[];
  therapyApproaches: string[];
  treatmentExperiences: string[];
  checkInTimes: string[];
  leaveStartDate: string;
  leaveEndDate: string;
  leaveReason: string;
  maximumClients: number;
  demoAccount: boolean;
  departureDate: string;
  avatarPreview: string | null;
}

function profileToForm(p: ProfessionalProfile): FormData {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    country: p.country,
    phone: `${p.dialCode}${p.phoneNumber.replace(/\s+/g, "")}`,
    locationState: p.locationState,
    city: p.city,
    bankName: p.bankName ?? "",
    bankAccountNumber: p.bankAccountNumber ?? "",
    bankSwiftCode: p.bankSwiftCode ?? "",
    payoutCurrency: p.payoutCurrency ?? "",
    profession: p.profession,
    licenseNumber: p.licenseNumber,
    languages: p.languages,
    biography: p.biography,
    specialisations: p.specialisations,
    therapyApproaches: p.therapyApproaches,
    treatmentExperiences: p.treatmentExperiences,
    checkInTimes: p.checkInTimes,
    leaveStartDate: p.leaveStartDate ?? "",
    leaveEndDate: p.leaveEndDate ?? "",
    leaveReason: p.leaveReason ?? "",
    maximumClients: p.maximumClients,
    demoAccount: p.demoAccount,
    departureDate: p.leftDate ?? "",
    avatarPreview: null,
  };
}

const EMPTY_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  country: "Singapore",
  phone: "",
  locationState: "",
  city: "",
  bankName: "",
  bankAccountNumber: "",
  bankSwiftCode: "",
  payoutCurrency: "",
  profession: "",
  licenseNumber: "",
  languages: [],
  biography: "",
  specialisations: [],
  therapyApproaches: [],
  treatmentExperiences: [],
  checkInTimes: [],
  leaveStartDate: "",
  leaveEndDate: "",
  leaveReason: "",
  maximumClients: 15,
  demoAccount: false,
  departureDate: "",
  avatarPreview: null,
};

export function ProfessionalForm({
  profile,
  mode,
  backHref,
}: {
  profile?: ProfessionalProfile;
  mode: "create" | "edit";
  backHref?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(profile ? profileToForm(profile) : EMPTY_FORM);
  const [copiedId, setCopiedId] = useState(false);
  const [departureDialogOpen, setDepartureDialogOpen] = useState(false);
  const [departureDate, setDepartureDate] = useState(profile?.leftDate ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftProfessionalIdRef = useRef(
    `draft:new-professional:${Date.now()}:${Math.random().toString(16).slice(2)}`
  );

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCountryChange(country: string) {
    setForm((prev) => ({
      ...prev,
      country,
      locationState: "",
    }));
  }

  const stateOptions = useMemo(
    () => STATES_BY_COUNTRY[form.country] ?? [],
    [form.country]
  );

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("avatarPreview", reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    const nowIso = new Date().toISOString();
    const existingProfiles = getMergedProfessionalProfiles(professionalProfiles);
    const profileId =
      mode === "edit" && profile
        ? profile.id
        : getNextProfessionalId(existingProfiles.map((p) => p.id));

    const nextProfile: ProfessionalProfile = {
      id: profileId,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      profileStatus: profile?.profileStatus ?? "imported",
      published: profile?.published ?? false,
      trainingComplete: profile?.trainingComplete ?? false,
      demoAccount: form.demoAccount,
      leftDate: form.departureDate || null,
      country: form.country,
      dialCode: (() => { const pn = parsePhoneNumber(form.phone || ""); return pn ? `+${pn.countryCallingCode}` : profile?.dialCode ?? "+65"; })(),
      phoneNumber: (() => { const pn = parsePhoneNumber(form.phone || ""); return pn ? pn.nationalNumber : ""; })(),
      locationState: form.locationState,
      city: form.city,
      bankName: form.bankName || undefined,
      bankAccountNumber: form.bankAccountNumber || undefined,
      bankSwiftCode: form.bankSwiftCode || undefined,
      payoutCurrency: form.payoutCurrency || undefined,
      profession: form.profession,
      licenseNumber: form.licenseNumber,
      licenseExpiry: profile?.licenseExpiry ?? "",
      languages: form.languages,
      biography: form.biography,
      specialisations: form.specialisations,
      therapyApproaches: form.therapyApproaches,
      treatmentExperiences: form.treatmentExperiences,
      checkInTimes: form.checkInTimes,
      leaveStartDate: form.leaveStartDate || undefined,
      leaveEndDate: form.leaveEndDate || undefined,
      leaveReason: form.leaveReason || undefined,
      maximumClients: form.maximumClients,
      activeClients: profile?.activeClients ?? 0,
      translations: profile?.translations ?? {},
      createdAt: profile?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };

    upsertStoredProfessionalProfile(nextProfile);

    if (mode === "create") {
      relinkStoredCredentialProfessionalId({
        fromProfessionalId: draftProfessionalIdRef.current,
        toProfessionalId: profileId,
      });
    }

    systemToast.success(
      mode === "create" ? "Professional saved" : "Changes saved",
      "This action is currently running in mock mode."
    );
    router.push(`/professionals/${profileId}/profile`);
  }

  const resolvedBackHref =
    backHref ?? (mode === "edit" && profile ? `/professionals/${profile.id}/profile` : "/professionals");

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href={resolvedBackHref}><ChevronLeft className="h-4 w-4" />Back</Link>
        </Button>
      </div>

      {/* ── User details ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">User details</CardTitle>
            {mode === "edit" && profile && (
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
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-10 pt-2">
          {/* Profile photo + Name */}
          <div className="flex items-start gap-10">
            <div className="flex items-center gap-5 shrink-0">
              <div className="relative h-20 w-20 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                {form.avatarPreview ? (
                  <Image
                    src={form.avatarPreview}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    width={80}
                    height={80}
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl font-semibold text-muted-foreground">
                    {form.firstName?.[0] ?? ""}{form.lastName?.[0] ?? ""}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Profile photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 2MB.</p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload
                  </Button>
                  {form.avatarPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="text-destructive hover:text-destructive"
                      onClick={() => set("avatarPreview", null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>
            </div>
            <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 flex-1 self-center">
              <div>
                <label className="text-sm font-medium mb-2 block">First name</label>
                <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Last name</label>
                <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Email + Mobile + Profession */}
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-sm font-medium">Email</label>
                <span className="text-xs text-muted-foreground">This will be used as the login credential</span>
              </div>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phone number</label>
              <PhoneInput
                value={form.phone as never}
                onChange={(v) => set("phone", v as string)}
                defaultCountry="SG"
                placeholder="Enter a phone number"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Profession</label>
              <Select value={form.profession} onValueChange={(v) => set("profession", v)}>
                <SelectTrigger><SelectValue placeholder="Select profession" /></SelectTrigger>
                <SelectContent>
                  {PROFESSION_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Language */}
          <MultiSelectDropdown
            label="Languages"
            options={LANGUAGE_OPTIONS}
            selected={form.languages}
            onChange={(v) => set("languages", v)}
            placeholder="Search languages..."
          />

          {/* Location: Country → State → City */}
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Country</label>
              <Select value={form.country} onValueChange={handleCountryChange}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {COUNTRY_LIST.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">State / Region</label>
              <Select
                value={form.locationState}
                onValueChange={(v) => set("locationState", v)}
                disabled={stateOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={stateOptions.length > 0 ? "Select state" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
          </div>

          {/* Banking information */}
          <div className="space-y-5 border-t border-border pt-8">
            <p className="text-sm font-semibold text-foreground">Banking information</p>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bank name</label>
                <Input value={form.bankName} onChange={(e) => set("bankName", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Bank account number</label>
                <Input value={form.bankAccountNumber} onChange={(e) => set("bankAccountNumber", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Bank SWIFT code</label>
                <Input value={form.bankSwiftCode} onChange={(e) => set("bankSwiftCode", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Payout currency</label>
                <Select value={form.payoutCurrency} onValueChange={(v) => set("payoutCurrency", v)}>
                  <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                  <SelectContent>
                    {PAYOUT_CURRENCY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* ── Credentials ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Credentials</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <CredentialsTab professionalId={mode === "edit" && profile ? profile.id : draftProfessionalIdRef.current} />
        </CardContent>
      </Card>

      {/* ── Availability & capacity ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Availability &amp; capacity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
          <div className="max-w-sm">
            <label className="text-sm font-medium mb-2 block">Maximum clients</label>
            <Input
              type="number"
              min={0}
              value={form.maximumClients}
              onChange={(e) => set("maximumClients", Number(e.target.value))}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Check-in times</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {CHECK_IN_TIME_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer text-sm py-1">
                  <Checkbox
                    checked={form.checkInTimes.includes(opt)}
                    onCheckedChange={() =>
                      set(
                        "checkInTimes",
                        form.checkInTimes.includes(opt)
                          ? form.checkInTimes.filter((t) => t !== opt)
                          : [...form.checkInTimes, opt]
                      )
                    }
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          {mode === "edit" && (
            <div className="space-y-5 rounded-lg border border-border p-6">
              <p className="text-sm font-semibold text-foreground">Leave planning</p>
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Break start date</label>
                  <DatePicker
                    value={form.leaveStartDate}
                    onChange={(value) => set("leaveStartDate", value)}
                    placeholder="Select break start date"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Break end date</label>
                  <DatePicker
                    value={form.leaveEndDate}
                    onChange={(value) => set("leaveEndDate", value)}
                    placeholder="Select break end date"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Break reason</label>
                <Textarea
                  className="min-h-[80px] resize-y"
                  value={form.leaveReason}
                  onChange={(e) => set("leaveReason", e.target.value)}
                  placeholder="Describe the reason for this leave period..."
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Public profile content ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Public profile content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
          <div>
            <label className="text-sm font-medium mb-2 block">Biography</label>
            <Textarea
              className="min-h-[100px] resize-y"
              value={form.biography}
              onChange={(e) => set("biography", e.target.value)}
            />
          </div>
          <MultiSelectDropdown
            label="Specialisation"
            helperText="Client groups they commonly support"
            options={SPECIALISATION_OPTIONS}
            selected={form.specialisations}
            onChange={(v) => set("specialisations", v)}
            placeholder="Search specialisations..."
          />
          <MultiSelectDropdown
            label="Therapy approach"
            helperText="Methods they use in sessions"
            options={THERAPY_APPROACH_OPTIONS}
            selected={form.therapyApproaches}
            onChange={(v) => set("therapyApproaches", v)}
            placeholder="Search therapy approaches..."
          />
          <MultiSelectDropdown
            label="Special populations"
            helperText="Relevant backgrounds and care contexts this professional is equipped to support beyond standard presentation categories."
            options={ADDITIONAL_EXPERIENCE_OPTIONS}
            selected={form.treatmentExperiences}
            onChange={(v) => set("treatmentExperiences", v)}
            placeholder="Search additional experience..."
          />
        </CardContent>
      </Card>

      {/* ── Admin settings ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="flex items-center justify-between rounded-lg border border-border px-5 py-4">
            <div>
              <p className="text-sm font-medium">Demo account</p>
              <p className="text-xs text-muted-foreground mt-1">For testing and internal use only</p>
            </div>
            <Switch checked={form.demoAccount} onCheckedChange={(v) => set("demoAccount", v)} />
          </div>
          {mode === "edit" && profile && (
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-3 pt-4">
              <ReadOnlyField label="Training complete" value={profile.trainingComplete ? "Yes" : "No"} />
              <ReadOnlyField label="Profile status" value={
                <Badge variant="secondary" className="text-xs">{STATUS_LABEL[profile.profileStatus]}</Badge>
              } />
              <ReadOnlyField
                label="Last updated"
                value={new Date(profile.updatedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Danger zone ── */}
      {mode === "edit" && profile && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Danger zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Departure (red) — soft delete when leaving the platform */}
            {form.departureDate ? (
              <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 px-5 py-4">
                <div>
                  <p className="text-sm font-medium">Undo departure</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This professional is marked as departed (left the platform) since {form.departureDate}. Reverse this if they return.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="success"
                  className="shrink-0"
                  onClick={() => set("departureDate", "")}
                >
                  Undo departure
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 px-5 py-4">
                <div>
                  <p className="text-sm font-medium">Departure</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Record that this professional has left the platform (soft delete). Can be reversed if they return.
                  </p>
                </div>
                <Button variant="destructive" size="sm" className="shrink-0" onClick={() => setDepartureDialogOpen(true)}>
                  Mark as departed
                </Button>
              </div>
            )}

            {/* Deactivate (yellow) — temporary, for breaks and other reasons */}
            {(() => {
              const today = new Date().toISOString().slice(0, 10);
              const isDeactivated = form.leaveStartDate
                && (form.leaveStartDate <= today)
                && (!form.leaveEndDate || form.leaveEndDate >= today);
              return isDeactivated ? (
                <div className="flex items-center justify-between rounded-lg border border-warning/35 bg-warning/8 dark:bg-warning/12 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium">Reactivate</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Professional is deactivated{form.leaveEndDate ? ` until ${form.leaveEndDate}` : ""}. Uses Leave planning dates.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-warning/45 text-warning hover:bg-warning/12 dark:hover:bg-warning/18"
                    onClick={() => { set("leaveStartDate", ""); set("leaveEndDate", ""); set("leaveReason", ""); }}
                  >
                    Reactivate
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-warning/35 bg-warning/8 dark:bg-warning/12 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium">Deactivate</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Temporarily deactivate (e.g. break, sabbatical). Uses Leave planning dates above.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-warning/45 text-warning hover:bg-warning/12 dark:hover:bg-warning/18"
                    onClick={() => {
                      const start = new Date().toISOString().slice(0, 10);
                      const end = new Date();
                      end.setDate(end.getDate() + 14);
                      set("leaveStartDate", start);
                      set("leaveEndDate", end.toISOString().slice(0, 10));
                    }}
                  >
                    Deactivate
                  </Button>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {mode === "edit" && profile && (
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
                    value={departureDate}
                    onChange={setDepartureDate}
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
              <Button variant="outline" onClick={() => {
                set("departureDate", new Date().toISOString().slice(0, 10));
                setDepartureDialogOpen(false);
              }}>
                Depart as of today
              </Button>
              <Button
                onClick={() => {
                  if (departureDate) {
                    set("departureDate", departureDate);
                    setDepartureDialogOpen(false);
                  }
                }}
                disabled={!departureDate}
              >
                Record departure
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <FormActions className="pb-8">
        <Button variant="outline" asChild>
          <Link href={resolvedBackHref}>Cancel</Link>
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" />
          {mode === "create" ? "Save" : "Save changes"}
        </Button>
      </FormActions>
    </div>
  );
}
