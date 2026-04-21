"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, FileText, Pencil, Plus, RefreshCw, Upload } from "@/components/ui/solar-icons";
import {
  calculateCredentialStatus,
  credentialHistory,
  credentialRecords,
  type CredentialHistoryEntry,
  type CredentialRecord,
  type CredentialStatus,
  type CredentialType,
} from "@/features/professionals/mock/professionalProfiles";
import {
  getMergedCredentialHistory,
  getMergedCredentialRecords,
  upsertStoredCredentialHistory,
  upsertStoredCredentialRecords,
} from "@/features/professionals/mock/credentialRecordStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClickableCardSurface } from "@/components/ui/clickable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CREDENTIAL_TYPES: CredentialType[] = [
  "Contract",
  "License",
  "Training Certificate",
  "Other",
];

const STATUS_VARIANT: Record<CredentialStatus, "default" | "secondary" | "destructive"> = {
  Valid: "default",
  "Expiring soon": "secondary",
  Expired: "destructive",
};

interface CredentialFormData {
  type: CredentialType | "";
  name: string;
  issuingBody: string;
  startDate: string;
  expiryDate: string;
  notes: string;
  fileName: string;
}

const EMPTY_FORM: CredentialFormData = {
  type: "",
  name: "",
  issuingBody: "",
  startDate: "",
  expiryDate: "",
  notes: "",
  fileName: "",
};

function formatDate(dateValue: string | null) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xxs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value ?? "—"}</p>
    </div>
  );
}

export function CredentialsTab({ professionalId }: { professionalId: string }) {
  const [records, setRecords] = useState(() =>
    getMergedCredentialRecords(credentialRecords).filter((c) => c.professionalId === professionalId)
  );
  const [history, setHistory] = useState<CredentialHistoryEntry[]>(() =>
    (() => {
      const mergedRecords = getMergedCredentialRecords(credentialRecords).filter(
        (c) => c.professionalId === professionalId
      );
      const recordIds = new Set(mergedRecords.map((c) => c.id));
      return getMergedCredentialHistory(credentialHistory).filter((h) => recordIds.has(h.credentialId));
    })()
  );

  const fileUrls = useMemo(() => {
    const byId: Record<string, string> = {};
    records.forEach((r) => {
      if (!r.fileName) return;
      byId[r.id] = `https://mock-storage.local/credentials/${r.id}/${r.fileName}`;
    });
    return byId;
  }, [records]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [renewId, setRenewId] = useState<string | null>(null);
  const [form, setForm] = useState<CredentialFormData>(EMPTY_FORM);

  const activeRecords = useMemo(() => records.filter((c) => !c.archived), [records]);

  const filtered = useMemo(
    () =>
      activeRecords
        .filter((c) => filterStatus === "all" || c.status === filterStatus)
        .filter((c) => filterType === "all" || c.type === filterType),
    [activeRecords, filterStatus, filterType]
  );

  const PAGE_SIZE = 3;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const viewRecord = viewId ? records.find((c) => c.id === viewId) : null;
  const viewHistory = viewId ? history.filter((h) => h.credentialId === viewId) : [];

  function set<K extends keyof CredentialFormData>(key: K, val: CredentialFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function openAdd() {
    resetForm();
    setAddOpen(true);
  }

  function handleAdd() {
    if (!form.type || !form.name) return;
    const newId = `CRED-NEW-${Date.now()}`;
    const now = new Date().toISOString();
    const newRecord: CredentialRecord = {
      id: newId,
      professionalId,
      type: form.type,
      name: form.name,
      issuingBody: form.issuingBody,
      startDate: form.startDate || null,
      expiryDate: form.expiryDate || null,
      status: calculateCredentialStatus(form.expiryDate || null),
      notes: form.notes,
      fileName: form.fileName || null,
      archived: false,
      previousVersionId: null,
      createdAt: now,
      updatedAt: now,
    };
    setRecords((prev) => [...prev, newRecord]);
    upsertStoredCredentialRecords([newRecord]);
    const entry: CredentialHistoryEntry = {
      id: `CHIST-NEW-${Date.now()}`,
      credentialId: newId,
      action: "created",
      date: now,
      note: "Credential created from Professional record.",
    };
    setHistory((prev) => [...prev, entry]);
    upsertStoredCredentialHistory([entry]);
    setAddOpen(false);
  }

  function openEdit(cred: CredentialRecord) {
    setForm({
      type: cred.type,
      name: cred.name,
      issuingBody: cred.issuingBody,
      startDate: cred.startDate ?? "",
      expiryDate: cred.expiryDate ?? "",
      notes: cred.notes,
      fileName: cred.fileName ?? "",
    });
    setEditId(cred.id);
  }

  function handleEdit() {
    if (!editId) return;
    const now = new Date().toISOString();
    const current = records.find((c) => c.id === editId);
    if (!current) return;

    const updated: CredentialRecord = {
      ...current,
      type: (form.type as CredentialType) || current.type,
      name: form.name || current.name,
      issuingBody: form.issuingBody,
      startDate: form.startDate || null,
      expiryDate: form.expiryDate || null,
      status: calculateCredentialStatus(form.expiryDate || null),
      notes: form.notes,
      fileName: form.fileName || current.fileName,
      updatedAt: now,
    };

    setRecords((prev) => prev.map((c) => (c.id === editId ? updated : c)));
    upsertStoredCredentialRecords([updated]);

    const entry: CredentialHistoryEntry = {
      id: `CHIST-EDIT-${Date.now()}`,
      credentialId: editId,
      action: "edited",
      date: now,
      note: "Credential updated.",
    };
    setHistory((prev) => [...prev, entry]);
    upsertStoredCredentialHistory([entry]);
    setEditId(null);
  }

  function openRenew(cred: CredentialRecord) {
    setForm({
      type: cred.type,
      name: cred.name,
      issuingBody: cred.issuingBody,
      startDate: "",
      expiryDate: "",
      notes: "",
      fileName: "",
    });
    setRenewId(cred.id);
  }

  function handleRenew() {
    if (!renewId) return;
    const now = new Date().toISOString();
    const original = records.find((c) => c.id === renewId);
    if (!original) return;

    const newId = `CRED-RNW-${Date.now()}`;

    const archivedOriginal: CredentialRecord = { ...original, archived: true, updatedAt: now };
    const renewed: CredentialRecord = {
      id: newId,
      professionalId,
      type: "Contract",
      name: form.name || original.name,
      issuingBody: form.issuingBody || original.issuingBody,
      startDate: form.startDate || null,
      expiryDate: form.expiryDate || null,
      status: calculateCredentialStatus(form.expiryDate || null),
      notes: form.notes,
      fileName: form.fileName || null,
      archived: false,
      previousVersionId: renewId,
      createdAt: now,
      updatedAt: now,
    };

    setRecords((prev) => [
      ...prev.map((c) => (c.id === renewId ? archivedOriginal : c)),
      renewed,
    ]);
    upsertStoredCredentialRecords([archivedOriginal, renewed]);

    const entryRenew: CredentialHistoryEntry = {
      id: `CHIST-RNW-${Date.now()}`,
      credentialId: newId,
      action: "renewed",
      date: now,
      note: `Renewed from ${renewId}. Previous end date: ${original.expiryDate ?? "No expiry"}.`,
    };
    const entryArch: CredentialHistoryEntry = {
      id: `CHIST-ARCH-${Date.now() + 1}`,
      credentialId: renewId,
      action: "archived",
      date: now,
      note: "Archived after contract renewal.",
    };
    setHistory((prev) => [...prev, entryRenew, entryArch]);
    upsertStoredCredentialHistory([entryRenew, entryArch]);
    setRenewId(null);
  }

  function handleArchive(id: string) {
    const now = new Date().toISOString();
    const current = records.find((c) => c.id === id);
    if (!current) return;
    const archived: CredentialRecord = { ...current, archived: true, updatedAt: now };
    setRecords((prev) => prev.map((c) => (c.id === id ? archived : c)));
    upsertStoredCredentialRecords([archived]);

    const entry: CredentialHistoryEntry = {
      id: `CHIST-ARCH-${Date.now()}`,
      credentialId: id,
      action: "archived",
      date: now,
      note: "Credential archived.",
    };
    setHistory((prev) => [...prev, entry]);
    upsertStoredCredentialHistory([entry]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select
          value={filterStatus}
          onValueChange={(v) => {
            setFilterStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Valid">Valid</SelectItem>
            <SelectItem value="Expiring soon">Expiring soon</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterType}
          onValueChange={(v) => {
            setFilterType(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {CREDENTIAL_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add document
          </Button>
        </div>
      </div>

      {activeRecords.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-8 text-center">
          <p className="text-sm font-medium text-foreground">No documents added yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add contracts and licenses here to track expiry and compliance.
          </p>
          <Button className="mt-4" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add document
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.length === 0 ? (
            <div className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No credentials match current filters.
            </div>
          ) : (
            paginated.map((c) => (
              <ClickableCardSurface
                key={c.id}
                className="rounded-lg border border-border p-4 hover:border-primary/40 transition-colors"
                onActivate={() => setViewId(c.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{c.type}</Badge>
                      <Badge variant={STATUS_VARIANT[c.status]} className="text-xs">
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold truncate">{c.name}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(c);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {c.type === "Contract" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRenew(c);
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchive(c.id);
                      }}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-3">
                  <Info label="Issuing body" value={c.issuingBody || "—"} />
                  <Info label="Start date" value={formatDate(c.startDate)} />
                  <Info label="Expiry date" value={c.expiryDate ? formatDate(c.expiryDate) : "No expiry"} />
                  <Info label="Last edited" value={formatDate(c.updatedAt)} />
                </div>
              </ClickableCardSurface>
            ))
          )}

          {filtered.length > 0 && (
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add document</DialogTitle>
            <DialogDescription>Upload a new credential document for this professional.</DialogDescription>
          </DialogHeader>
          <CredentialForm form={form} set={set} submitLabel="Add document" onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit credential</DialogTitle>
            <DialogDescription>Update credential details.</DialogDescription>
          </DialogHeader>
          <CredentialForm form={form} set={set} submitLabel="Save changes" onSubmit={handleEdit} onCancel={() => setEditId(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!renewId} onOpenChange={(open) => !open && setRenewId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Renew contract</DialogTitle>
            <DialogDescription>
              Create a new version linked to the previous contract.
            </DialogDescription>
          </DialogHeader>
          <CredentialForm
            form={form}
            set={set}
            submitLabel="Renew contract"
            requireContract
            onSubmit={handleRenew}
            onCancel={() => setRenewId(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewId} onOpenChange={(open) => !open && setViewId(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewRecord?.name ?? "Credential detail"}
            </DialogTitle>
          </DialogHeader>
          {viewRecord && (
            <div className="overflow-y-auto space-y-5 -mx-1 px-1">
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <Info label="Type" value={viewRecord.type} />
                <Info
                  label="Status"
                  value={
                    <Badge variant={STATUS_VARIANT[viewRecord.status]} className="text-xs">
                      {viewRecord.status}
                      {!viewRecord.expiryDate && " (No expiry)"}
                    </Badge>
                  }
                />
                <Info label="Issuing body" value={viewRecord.issuingBody || "—"} />
                <Info label="Start date" value={formatDate(viewRecord.startDate)} />
                <Info label="Expiry date" value={viewRecord.expiryDate ? formatDate(viewRecord.expiryDate) : "No expiry"} />
                <Info label="Created" value={formatDate(viewRecord.createdAt)} />
                <Info label="Last edited" value={formatDate(viewRecord.updatedAt)} />
                {viewRecord.previousVersionId && (
                  <Info label="Previous version" value={viewRecord.previousVersionId} />
                )}
              </div>

              {viewRecord.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{viewRecord.notes}</p>
                </div>
              )}

              {viewRecord.fileName && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Attachment</p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <FileText className="h-4 w-4" />
                    {viewRecord.fileName}
                  </div>
                  {fileUrls[viewRecord.id] && (
                    <p className="text-xs text-muted-foreground mt-1">{fileUrls[viewRecord.id]}</p>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  History
                </p>
                {viewHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No history entries.</p>
                ) : (
                  <div className="space-y-3">
                    {viewHistory.map((h) => (
                      <div key={h.id} className="flex items-start gap-3 text-sm">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="font-medium capitalize">{h.action}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(h.date)}</p>
                          {h.note && <p className="text-muted-foreground mt-1">{h.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CredentialForm({
  form,
  set,
  submitLabel,
  onSubmit,
  onCancel,
  requireContract = false,
}: {
  form: CredentialFormData;
  set: <K extends keyof CredentialFormData>(key: K, val: CredentialFormData[K]) => void;
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
  requireContract?: boolean;
}) {
  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Type</label>
            <Select
              value={requireContract ? "Contract" : form.type}
              onValueChange={(v) => set("type", v as CredentialType)}
              disabled={requireContract}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {CREDENTIAL_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Credential name</label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Service Agreement 2025"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Issuing body</label>
          <Input
            value={form.issuingBody}
            onChange={(e) => set("issuingBody", e.target.value)}
            placeholder="e.g. Singapore Board of Psychology"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Start date (optional)</label>
            <DatePicker
              value={form.startDate}
              onChange={(value) => set("startDate", value)}
              placeholder="Select start date"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Expiry date (optional)</label>
            <DatePicker
              value={form.expiryDate}
              onChange={(value) => set("expiryDate", value)}
              placeholder="Select expiry date"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Notes (optional)</label>
          <Textarea
            className="mt-1 min-h-[72px] resize-y"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Upload file (PDF/image)</label>
          <div className="mt-1 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => set("fileName", `upload_${Date.now()}.pdf`)}
            >
              <Upload className="h-3.5 w-3.5" /> Choose file
            </Button>
            <span className="text-sm text-muted-foreground">{form.fileName || "No file selected"}</span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit} disabled={(!requireContract && !form.type) || !form.name}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
