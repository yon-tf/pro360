"use client";

import type {
  CredentialHistoryEntry,
  CredentialRecord,
} from "@/features/professionals/mock/professionalProfiles";

const RECORDS_KEY = "pro360:credential-records";
const HISTORY_KEY = "pro360:credential-history";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function getStoredCredentialRecords(): CredentialRecord[] {
  if (!canUseStorage()) return [];
  return safeParseArray<CredentialRecord>(window.localStorage.getItem(RECORDS_KEY));
}

export function saveStoredCredentialRecords(records: CredentialRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function upsertStoredCredentialRecords(records: CredentialRecord[]) {
  const current = getStoredCredentialRecords();
  const byId = new Map(current.map((c) => [c.id, c]));
  records.forEach((c) => byId.set(c.id, c));
  saveStoredCredentialRecords(Array.from(byId.values()));
}

export function getMergedCredentialRecords(baseRecords: CredentialRecord[]): CredentialRecord[] {
  const stored = getStoredCredentialRecords();
  if (stored.length === 0) return baseRecords;
  const byId = new Map(baseRecords.map((c) => [c.id, c]));
  stored.forEach((c) => byId.set(c.id, c));
  return Array.from(byId.values());
}

export function getStoredCredentialHistory(): CredentialHistoryEntry[] {
  if (!canUseStorage()) return [];
  return safeParseArray<CredentialHistoryEntry>(window.localStorage.getItem(HISTORY_KEY));
}

export function saveStoredCredentialHistory(entries: CredentialHistoryEntry[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

export function upsertStoredCredentialHistory(entries: CredentialHistoryEntry[]) {
  const current = getStoredCredentialHistory();
  const byId = new Map(current.map((h) => [h.id, h]));
  entries.forEach((h) => byId.set(h.id, h));
  saveStoredCredentialHistory(Array.from(byId.values()));
}

export function getMergedCredentialHistory(
  baseHistory: CredentialHistoryEntry[]
): CredentialHistoryEntry[] {
  const stored = getStoredCredentialHistory();
  if (stored.length === 0) return baseHistory;
  const byId = new Map(baseHistory.map((h) => [h.id, h]));
  stored.forEach((h) => byId.set(h.id, h));
  return Array.from(byId.values());
}

export function relinkStoredCredentialProfessionalId({
  fromProfessionalId,
  toProfessionalId,
}: {
  fromProfessionalId: string;
  toProfessionalId: string;
}) {
  const current = getStoredCredentialRecords();
  const next = current.map((c) =>
    c.professionalId === fromProfessionalId ? { ...c, professionalId: toProfessionalId } : c
  );
  saveStoredCredentialRecords(next);
}

