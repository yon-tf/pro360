"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FilterSection,
  FilterField,
  FilterFieldRenderer,
  TriStateSwitch,
} from "./filter-primitives";
import type { VisibleGroup, FilterContext } from "@/lib/filters/types";

interface MoreFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibleGroups: VisibleGroup[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draft: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patchDraft: (patch: Record<string, any>) => void;
  onApply: () => void;
  onClear: () => void;
  onCancel: () => void;
  context: FilterContext;
  title?: string;
  description?: string;
}

export function MoreFiltersSheet({
  open,
  onOpenChange,
  visibleGroups,
  draft,
  patchDraft,
  onApply,
  onClear,
  onCancel,
  context,
  title = "More filters",
  description = "Narrow down results with advanced criteria. Press Apply to update.",
}: MoreFiltersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 py-4">
          <div className="space-y-8">
            {visibleGroups.map((group) => (
              <FilterSection key={group.title} title={group.title}>
                {group.fields.map((field) => {
                  const val = draft[field.key];
                  const onChange = (v: unknown) => patchDraft({ [field.key]: v });

                  if (field.type === "tri-state") {
                    return (
                      <TriStateSwitch
                        key={field.key}
                        label={field.label}
                        value={val as boolean | null}
                        onChange={onChange as (v: boolean | null) => void}
                      />
                    );
                  }

                  const enabled = !field.isEnabled || field.isEnabled(context);
                  if (!enabled && field.lockedDisplay) {
                    return (
                      <FilterField key={field.key} label={field.label}>
                        <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                          {field.lockedDisplay}
                        </div>
                      </FilterField>
                    );
                  }

                  return (
                    <FilterField key={field.key} label={field.label}>
                      <FilterFieldRenderer field={field} value={val} onChange={onChange} context={context} />
                    </FilterField>
                  );
                })}
              </FilterSection>
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row gap-2 border-t border-border pt-4">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button variant="ghost" className="flex-1" onClick={onClear}>Clear all</Button>
          <Button className="flex-1" onClick={onApply}>Apply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
