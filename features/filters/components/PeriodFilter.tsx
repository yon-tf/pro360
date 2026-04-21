"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type PeriodType = "month" | "quarter" | "year";

export interface PeriodValue {
  type: PeriodType;
  year: number;
  month?: number;
  quarter?: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export function resolvePeriodRange(value: PeriodValue): DateRange {
  const { type, year } = value;
  if (type === "month" && value.month != null) {
    const m = value.month - 1;
    return { startDate: new Date(year, m, 1), endDate: new Date(year, m + 1, 0, 23, 59, 59) };
  }
  if (type === "quarter" && value.quarter != null) {
    const startMonth = (value.quarter - 1) * 3;
    return { startDate: new Date(year, startMonth, 1), endDate: new Date(year, startMonth + 3, 0, 23, 59, 59) };
  }
  return { startDate: new Date(year, 0, 1), endDate: new Date(year, 11, 31, 23, 59, 59) };
}

export function formatPeriodLabel(value: PeriodValue): string {
  if (value.type === "month" && value.month != null) {
    return new Date(value.year, value.month - 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }
  if (value.type === "quarter" && value.quarter != null) return `Q${value.quarter} ${value.year}`;
  return `${value.year}`;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const QUARTERS = [
  { value: "1", label: "Q1 (Jan–Mar)" },
  { value: "2", label: "Q2 (Apr–Jun)" },
  { value: "3", label: "Q3 (Jul–Sep)" },
  { value: "4", label: "Q4 (Oct–Dec)" },
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

interface PeriodFilterProps {
  value: PeriodValue;
  onChange: (value: PeriodValue) => void;
  className?: string;
}

export function PeriodFilter({ value, onChange, className }: PeriodFilterProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={value.type}
        onValueChange={(t: string) => {
          const periodType = t as PeriodType;
          const next: PeriodValue = { type: periodType, year: value.year };
          if (periodType === "month") next.month = value.month ?? new Date().getMonth() + 1;
          if (periodType === "quarter") next.quarter = value.quarter ?? Math.ceil((new Date().getMonth() + 1) / 3);
          onChange(next);
        }}
      >
        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Month</SelectItem>
          <SelectItem value="quarter">Quarter</SelectItem>
          <SelectItem value="year">Year</SelectItem>
        </SelectContent>
      </Select>

      {value.type === "month" && (
        <>
          <Select value={String(value.month ?? 1)} onValueChange={(v) => onChange({ ...value, month: Number(v) })}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(value.year)} onValueChange={(v) => onChange({ ...value, year: Number(v) })}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </>
      )}

      {value.type === "quarter" && (
        <>
          <Select value={String(value.quarter ?? 1)} onValueChange={(v) => onChange({ ...value, quarter: Number(v) })}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{QUARTERS.map((q) => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(value.year)} onValueChange={(v) => onChange({ ...value, year: Number(v) })}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </>
      )}

      {value.type === "year" && (
        <Select value={String(value.year)} onValueChange={(v) => onChange({ ...value, year: Number(v) })}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
      )}
    </div>
  );
}

export function defaultPeriodValue(): PeriodValue {
  const now = new Date();
  return { type: "month", year: now.getFullYear(), month: now.getMonth() + 1 };
}
