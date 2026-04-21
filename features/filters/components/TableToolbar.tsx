"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "@/components/ui/solar-icons";
import { ActiveFilterChips } from "./ActiveFilterChips";

interface TableToolbarProps {
  children?: ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  appliedCount: number;
  onMoreFilters: () => void;
  chips?: { key: string; label: string }[];
  onRemoveChip?: (key: string) => void;
  onClearAllChips?: () => void;
  className?: string;
}

export function TableToolbar({
  children,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  appliedCount,
  onMoreFilters,
  chips,
  onRemoveChip,
  onClearAllChips,
}: TableToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 overflow-x-auto">
        {children}
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="min-w-[180px] max-w-md shrink"
        />
        <Button
          variant={appliedCount > 0 ? "secondary" : "outline"}
          size="sm"
          className="shrink-0 gap-2"
          onClick={onMoreFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          More filters{appliedCount > 0 && ` (${appliedCount})`}
        </Button>
      </div>
      {chips && chips.length > 0 && onRemoveChip && onClearAllChips && (
        <ActiveFilterChips chips={chips} onRemove={onRemoveChip} onClearAll={onClearAllChips} />
      )}
    </div>
  );
}
