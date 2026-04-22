"use client";

import * as React from "react";
import { Tooltip as RechartsTooltip } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  { label: string; color: string; icon?: React.ComponentType }
>;

type ChartContextState = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextState | null>(null);

export function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within <ChartContainer>");
  return ctx;
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { config: ChartConfig; children: React.ReactNode }) {
  const id = React.useId();
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis-tick_text]:text-xs",
          "[&_.recharts-cartesian-grid_line]:stroke-border/50",
          className,
        )}
        {...props}
      >
        <ChartStyle id={id} config={config} />
        {children}
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const css = Object.entries(config)
    .map(([key, { color }]) => `[data-chart="${id}"] { --color-${key}: ${color}; }`)
    .join("\n");
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  indicator = "dot",
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
  hideLabel?: boolean;
  indicator?: "dot" | "line" | "dashed";
  formatter?: (value: number, name: string) => React.ReactNode;
}) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[8rem] rounded-lg border border-border bg-card px-3 py-2 shadow-panel">
      {!hideLabel && label && (
        <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry) => {
          const cfg = config[entry.dataKey];
          const displayLabel = cfg?.label ?? entry.name;
          const color = cfg?.color ?? entry.color;
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {indicator === "dot" && (
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                )}
                {indicator === "line" && (
                  <span className="h-0.5 w-3 shrink-0 rounded" style={{ backgroundColor: color }} />
                )}
                {indicator === "dashed" && (
                  <span className="h-0.5 w-3 shrink-0 rounded border-t-2 border-dashed" style={{ borderColor: color }} />
                )}
                <span className="text-xs text-muted-foreground">{displayLabel}</span>
              </div>
              <span className="text-xs font-medium tabular-nums text-foreground">
                {formatter ? formatter(entry.value, entry.name) : entry.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type LegendSeriesType = "bar" | "line" | "area";

export interface ChartLegendContentProps {
  /** Recharts Legend payload - pass props.payload from Legend content */
  payload?: unknown;
  order?: string[];
  seriesTypes?: Record<string, LegendSeriesType>;
  dashedKeys?: string[];
  wrapperClassName?: string;
}

export function ChartLegendContent({
  payload: rawPayload,
  order,
  seriesTypes = {},
  dashedKeys = [],
  wrapperClassName,
}: ChartLegendContentProps) {
  const { config } = useChart();
  const payload = Array.isArray(rawPayload) ? rawPayload : [];
  const items = order
    ? order.map((key) => payload.find((p: Record<string, unknown>) => String(p.dataKey ?? p.id ?? p.value) === key)).filter(Boolean)
    : payload;

  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2", wrapperClassName)}>
      {items.map((entry: Record<string, unknown>) => {
        const key = String(entry.dataKey ?? entry.id ?? entry.value ?? "");
        const type = seriesTypes[key] ?? "bar";
        const label = config[key]?.label ?? entry.value ?? key;
        const isDashed = dashedKeys.includes(key);
        const color = (entry.color as string) ?? "var(--muted-foreground)";
        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            {type === "line" ? (
              <span
                className={cn("h-0.5 w-3 shrink-0 rounded", isDashed && "border-t-2 border-dashed")}
                style={isDashed ? { borderColor: color } : { backgroundColor: color }}
              />
            ) : (
              <span
                className="h-2.5 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: color }}
              />
            )}
            <span className="text-muted-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export { RechartsTooltip as ChartTooltip };
