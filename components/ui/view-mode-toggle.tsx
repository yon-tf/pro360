"use client";

import { Button } from "@/components/ui/button";
import { List, LayoutGrid } from "@/components/ui/solar-icons";

export type ViewMode = "table" | "card";

export function ViewModeToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex items-center rounded-md border border-border bg-background p-1">
      <Button
        type="button"
        variant={value === "table" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2"
        onClick={() => onChange("table")}
        aria-label="Table view"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={value === "card" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2"
        onClick={() => onChange("card")}
        aria-label="Card view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
