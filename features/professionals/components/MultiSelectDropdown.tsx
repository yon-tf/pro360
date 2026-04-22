"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Info, X } from "@/components/ui/solar-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MultiSelectDropdownProps {
  label: string;
  helperText?: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelectDropdown({
  label,
  helperText,
  options,
  selected,
  onChange,
  placeholder = "Select...",
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      options.filter(
        (opt) =>
          !selected.includes(opt) && opt.toLowerCase().includes(search.toLowerCase())
      ),
    [options, search, selected]
  );

  function handleSelect(item: string) {
    onChange([...selected, item]);
    setSearch("");
    inputRef.current?.focus();
  }

  function handleRemove(item: string) {
    onChange(selected.filter((s) => s !== item));
  }

  return (
    <Field>
      <div className="flex items-center gap-2">
        <FieldLabel>{label}</FieldLabel>
        {helperText && (
          <span
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/90"
            title={helperText}
            aria-label={`${label} helper information`}
          >
            <Info className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="rounded-full border-primary/30 bg-primary/10 text-primary hover:bg-primary/10"
            >
              {item}
              <Button
                type="button"
                onClick={() => handleRemove(item)}
                variant="ghost"
                size="icon"
                className="ml-1 h-4 w-4 rounded-full p-0 text-primary hover:bg-primary/20 hover:text-primary"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setSearch("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-9 w-full justify-between px-3 font-normal",
              !selected.length && "text-muted-foreground"
            )}
          >
            <span className="truncate">
              {selected.length > 0 ? `${selected.length} selected` : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-2"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="space-y-2">
            <Input
              ref={inputRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={selected.length > 0 ? "Add more..." : placeholder}
              className="h-8"
            />
            <div className="max-h-[200px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-2 py-2 text-sm text-muted-foreground">
                  {search ? "No matches" : "All options selected"}
                </p>
              ) : (
                filtered.map((opt) => (
                  <Button
                    key={opt}
                    type="button"
                    variant="ghost"
                    className="h-8 w-full justify-start px-2"
                    onClick={() => handleSelect(opt)}
                  >
                    <Check className="mr-2 h-3.5 w-3.5 text-primary" />
                    {opt}
                  </Button>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <FieldDescription>Search and select one or more options.</FieldDescription>
    </Field>
  );
}
