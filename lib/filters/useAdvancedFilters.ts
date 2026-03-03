"use client";

import { useState, useMemo, useCallback } from "react";
import {
  defaultIsActive,
  type AdvancedFilterConfig,
  type FilterContext,
  type FilterFieldDef,
  type VisibleGroup,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cloneValues<T extends Record<string, any>>(values: T): T {
  const copy = { ...values };
  for (const key of Object.keys(copy)) {
    if (Array.isArray(copy[key])) {
      (copy as Record<string, unknown>)[key] = [...(copy[key] as unknown[])];
    }
  }
  return copy as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseAdvancedFiltersReturn<TAdv extends Record<string, any>> {
  applied: TAdv;
  draft: TAdv;
  patchDraft: (patch: Partial<TAdv>) => void;
  toggleDraftArray: (key: keyof TAdv & string, value: string) => void;
  applyDraft: () => void;
  cancelDraft: () => void;
  clearVisibleDraft: () => void;
  removeAppliedFilter: (key: string) => void;
  clearAllApplied: () => void;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  appliedCount: number;
  activeChips: { key: string; label: string }[];
  visibleKeys: Set<string>;
  visibleGroups: VisibleGroup[];
  filterContext: FilterContext;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAdvancedFilters<TAdv extends Record<string, any>>(
  config: AdvancedFilterConfig<TAdv>,
  context?: FilterContext,
): UseAdvancedFiltersReturn<TAdv> {
  const [applied, setApplied] = useState<TAdv>(() => cloneValues(config.defaults));
  const [draft, setDraft] = useState<TAdv>(() => cloneValues(config.defaults));
  const [sheetOpenRaw, setSheetOpenRaw] = useState(false);

  const ctx: FilterContext = useMemo(() => ({ ...(context ?? {}) }), [context]);

  const setSheetOpen = useCallback(
    (open: boolean) => {
      if (open) setDraft(cloneValues(applied));
      setSheetOpenRaw(open);
    },
    [applied],
  );

  const visibleGroups = useMemo(() => {
    const result: VisibleGroup[] = [];
    for (const group of config.groups) {
      if (group.isVisible && !group.isVisible(ctx)) continue;
      const visibleFields = group.fields.filter((f) => !f.isVisible || f.isVisible(ctx));
      if (visibleFields.length === 0) continue;
      result.push({ title: group.title, fields: visibleFields });
    }
    return result;
  }, [config.groups, ctx]);

  const visibleKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const g of visibleGroups) for (const f of g.fields) keys.add(f.key);
    return keys;
  }, [visibleGroups]);

  const visibleFields = useMemo(() => visibleGroups.flatMap((g) => g.fields), [visibleGroups]);

  const isFieldActive = useCallback((field: FilterFieldDef, values: TAdv) => {
    const value = values[field.key as keyof TAdv];
    return field.isActive ? field.isActive(value) : defaultIsActive(value);
  }, []);

  const appliedCount = useMemo(() => {
    let n = 0;
    for (const field of visibleFields) {
      if (isFieldActive(field, applied)) n++;
    }
    return n;
  }, [visibleFields, applied, isFieldActive]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    for (const field of visibleFields) {
      if (!isFieldActive(field, applied)) continue;
      const value = applied[field.key as keyof TAdv];
      const label = field.chipLabel?.(value);
      if (label) chips.push({ key: field.key, label });
    }
    return chips;
  }, [visibleFields, applied, isFieldActive]);

  const patchDraft = useCallback((patch: Partial<TAdv>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleDraftArray = useCallback((key: keyof TAdv & string, value: string) => {
    setDraft((prev) => {
      const arr: string[] = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  }, []);

  const applyDraft = useCallback(() => {
    setApplied(cloneValues(draft));
    setSheetOpenRaw(false);
  }, [draft]);

  const cancelDraft = useCallback(() => {
    setSheetOpenRaw(false);
  }, []);

  const clearVisibleDraft = useCallback(() => {
    setDraft((prev) => {
      const next = { ...prev };
      for (const field of visibleFields) {
        const def = config.defaults[field.key as keyof TAdv];
        (next as Record<string, unknown>)[field.key] = Array.isArray(def) ? [...(def as unknown[])] : def;
      }
      return next;
    });
  }, [visibleFields, config.defaults]);

  const removeAppliedFilter = useCallback(
    (key: string) => {
      const def = config.defaults[key as keyof TAdv];
      const val = Array.isArray(def) ? [...(def as unknown[])] : def;
      setApplied((prev) => ({ ...prev, [key]: val }));
      setDraft((prev) => ({ ...prev, [key]: val }));
    },
    [config.defaults],
  );

  const clearAllApplied = useCallback(() => {
    setApplied((prev) => {
      const next = { ...prev };
      for (const field of visibleFields) {
        const def = config.defaults[field.key as keyof TAdv];
        (next as Record<string, unknown>)[field.key] = Array.isArray(def) ? [...(def as unknown[])] : def;
      }
      return next;
    });
    setDraft((prev) => {
      const next = { ...prev };
      for (const field of visibleFields) {
        const def = config.defaults[field.key as keyof TAdv];
        (next as Record<string, unknown>)[field.key] = Array.isArray(def) ? [...(def as unknown[])] : def;
      }
      return next;
    });
  }, [visibleFields, config.defaults]);

  return {
    applied,
    draft,
    patchDraft,
    toggleDraftArray,
    applyDraft,
    cancelDraft,
    clearVisibleDraft,
    removeAppliedFilter,
    clearAllApplied,
    sheetOpen: sheetOpenRaw,
    setSheetOpen,
    appliedCount,
    activeChips,
    visibleKeys,
    visibleGroups,
    filterContext: ctx,
  };
}
