"use client";

import type { ProfessionalProfile } from "@/features/professionals/mock/professionalProfiles";

const STORAGE_KEY = "pro360:professional-profiles";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredProfessionalProfiles(): ProfessionalProfile[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProfessionalProfile[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredProfessionalProfiles(profiles: ProfessionalProfile[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function upsertStoredProfessionalProfile(profile: ProfessionalProfile) {
  const current = getStoredProfessionalProfiles();
  const next = current.filter((p) => p.id !== profile.id);
  next.push(profile);
  saveStoredProfessionalProfiles(next);
}

export function getMergedProfessionalProfiles(
  baseProfiles: ProfessionalProfile[]
): ProfessionalProfile[] {
  const stored = getStoredProfessionalProfiles();
  if (stored.length === 0) return baseProfiles;
  const byId = new Map(baseProfiles.map((p) => [p.id, p]));
  stored.forEach((p) => byId.set(p.id, p));
  return Array.from(byId.values());
}

export function getNextProfessionalId(existingIds: string[]): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 900) + 100);
  let seq = 1;
  while (existingIds.includes(`PRO${rand}${year}${String(seq).padStart(3, "0")}`)) {
    seq++;
  }
  return `PRO${rand}${year}${String(seq).padStart(3, "0")}`;
}
