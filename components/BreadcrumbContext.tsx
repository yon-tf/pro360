"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";

type BreadcrumbContextValue = {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<BreadcrumbItem[]>([]);
  const setItems = useCallback((next: BreadcrumbItem[]) => {
    setItemsState(next);
  }, []);
  const value = useMemo(() => ({ items, setItems }), [items, setItems]);
  return (
    <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) return { items: [] as BreadcrumbItem[], setItems: () => {} };
  return ctx;
}
