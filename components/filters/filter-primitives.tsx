"use client";

import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterFieldDef, FilterContext, FilterOption } from "@/lib/filters/types";

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

export function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tri-state switch (null → true → false → null)
// ---------------------------------------------------------------------------

export function TriStateSwitch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  const cycle = () => {
    if (value === null) onChange(true);
    else if (value === true) onChange(false);
    else onChange(null);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Switch checked={value === true} onCheckedChange={cycle} />
        <span
          role="button"
          tabIndex={0}
          onClick={cycle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              cycle();
            }
          }}
          className="w-8 cursor-pointer select-none text-[11px] tabular-nums text-muted-foreground"
        >
          {value === null ? "Any" : value ? "Yes" : "No"}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Select field (single value, optional search)
// ---------------------------------------------------------------------------

function resolveOptions(opts: FilterFieldDef["options"]): FilterOption[] {
  if (!opts) return [];
  return typeof opts === "function" ? opts() : opts;
}

function SelectField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FilterFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled?: boolean;
}) {
  const allOptions = useMemo(() => resolveOptions(field.options), [field.options]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!field.searchable || !search.trim()) return allOptions;
    const q = search.toLowerCase();
    return allOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [allOptions, field.searchable, search]);

  return (
    <div className="space-y-2">
      {field.searchable && (
        <Input
          type="search"
          placeholder={`Search ${field.label.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      )}
      <Select
        value={(value as string) ?? "__none"}
        onValueChange={(v) => onChange(v === "__none" ? null : v)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`All ${field.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">All {field.label.toLowerCase()}</SelectItem>
          {filtered.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multi-select (checkbox group)
// ---------------------------------------------------------------------------

function MultiSelectField({
  field,
  value,
  onChange,
}: {
  field: FilterFieldDef;
  value: unknown;
  onChange: (v: string[]) => void;
}) {
  const options = useMemo(() => resolveOptions(field.options), [field.options]);
  const arr = Array.isArray(value) ? (value as string[]) : [];
  const hasGroups = options.some((o) => o.heading);

  const toggle = (val: string) => {
    onChange(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  return (
    <div className={hasGroups ? "space-y-1" : "grid grid-cols-2 gap-3"}>
      {options.map((opt) =>
        opt.heading ? (
          <p key={opt.value} className="pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:pt-0">
            {opt.label}
          </p>
        ) : (
          <label key={opt.value} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
            <Checkbox checked={arr.includes(opt.value)} onCheckedChange={() => toggle(opt.value)} />
            {opt.label}
          </label>
        ),
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slider field
// ---------------------------------------------------------------------------

function SliderField({
  field,
  value,
  onChange,
}: {
  field: FilterFieldDef;
  value: unknown;
  onChange: (v: number | null) => void;
}) {
  const cfg = field.sliderConfig ?? { min: 0, max: 100, step: 1 };
  const numVal = typeof value === "number" ? value : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {numVal != null ? `${numVal}${cfg.suffix ? ` ${cfg.suffix}` : ""}` : "Any"}
        </span>
        {numVal != null && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => onChange(null)}>
            Clear
          </Button>
        )}
      </div>
      <Slider
        min={cfg.min}
        max={cfg.max}
        step={cfg.step}
        value={[numVal ?? cfg.min]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Text field
// ---------------------------------------------------------------------------

function TextField({
  value,
  onChange,
  disabled,
}: {
  value: unknown;
  onChange: (v: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <Input
      type="text"
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
    />
  );
}

// ---------------------------------------------------------------------------
// Dispatcher: renders the right control based on field.type
// ---------------------------------------------------------------------------

export function FilterFieldRenderer({
  field,
  value,
  onChange,
  context,
}: {
  field: FilterFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  context: FilterContext;
}) {
  const enabled = !field.isEnabled || field.isEnabled(context);

  if (!enabled && field.lockedDisplay) {
    return (
      <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
        {field.lockedDisplay}
      </div>
    );
  }

  switch (field.type) {
    case "select":
      return <SelectField field={field} value={value} onChange={onChange} disabled={!enabled} />;
    case "multi-select":
      return <MultiSelectField field={field} value={value} onChange={onChange as (v: string[]) => void} />;
    case "slider":
      return <SliderField field={field} value={value} onChange={onChange as (v: number | null) => void} />;
    case "text":
      return <TextField value={value} onChange={onChange as (v: string | null) => void} disabled={!enabled} />;
    case "tri-state":
      return null;
    default:
      return null;
  }
}
