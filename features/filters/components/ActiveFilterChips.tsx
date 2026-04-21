"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "@/components/ui/solar-icons";

interface ActiveFilterChipsProps {
  chips: { key: string; label: string }[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({ chips, onRemove, onClearAll }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 pr-1 text-xs">
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            className="ml-1 rounded-sm p-1 hover:bg-muted-foreground/20"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="link" size="sm" className="h-auto px-1 py-0 text-xs" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}
