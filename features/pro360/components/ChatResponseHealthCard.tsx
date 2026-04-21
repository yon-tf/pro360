"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

function SignalBars({ level, activeFill }: { level: number; activeFill: string }) {
  const bars = [1, 2, 3, 4, 5];
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="fill-none overflow-visible">
      {bars.map((bar) => {
        const height = bar * 2.2 + 2; // Max height is 5 * 2.2 + 2 = 13
        const y = 14 - height; 
        const isActive = bar <= level;
        return (
          <rect
            key={bar}
            x={(bar - 1) * 2.8 + 1}
            y={y}
            width="2"
            height={height}
            rx="0.8"
            className={cn("transition-colors duration-300", isActive ? activeFill : "fill-muted/40")}
          />
        );
      })}
    </svg>
  );
}

interface ChatResponseHealthCardProps {
  healthyCount: number | string;
  lateCount: number | string;
  inactiveCount: number | string;
  icon?: React.ReactNode;
}

export function ChatResponseHealthCard({
  healthyCount,
  lateCount,
  inactiveCount,
  icon,
}: ChatResponseHealthCardProps) {
  const toNumber = (value: number | string) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const healthy = toNumber(healthyCount);
  const late = toNumber(lateCount);
  const inactive = toNumber(inactiveCount);
  const totalThreads = healthy + late + inactive;
  
  // Calculate percentages for the stacked bar
  const healthyPct = totalThreads > 0 ? (healthy / totalThreads) * 100 : 0;
  const latePct = totalThreads > 0 ? (late / totalThreads) * 100 : 0;
  const inactivePct = totalThreads > 0 ? (inactive / totalThreads) * 100 : 0;

  // Determine overall status based on health
  const status = useMemo(() => {
    if (totalThreads === 0)
      return {
        label: "No Active Threads",
        color: "text-muted-foreground",
        bgColor: "bg-muted/50",
        level: 0,
        fillClass: "fill-muted",
      };
    if (healthyPct >= 90 && inactive === 0)
      return {
        label: "Optimal",
        color: "text-success",
        bgColor: "bg-success/12",
        level: 5,
        fillClass: "fill-success",
      };
    if (healthyPct >= 75)
      return {
        label: "Good",
        color: "text-success",
        bgColor: "bg-success/12",
        level: 4,
        fillClass: "fill-success",
      };
    if (latePct > 15 || inactive > 0)
      return {
        label: "Attention Needed",
        color: "text-warning",
        bgColor: "bg-warning/12",
        level: 2,
        fillClass: "fill-warning",
      };
    return {
      label: "Fair",
      color: "text-warning",
      bgColor: "bg-warning/12",
      level: 1,
      fillClass: "fill-warning",
    };
  }, [healthyPct, latePct, inactive, totalThreads]);

  return (
      <div className="flex h-full flex-col rounded-xl bg-card p-4 shadow-card">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                {icon}
              </div>
            )}
            <p className="text-sm font-medium text-foreground">Chat Response Health</p>
          </div>
          <div className="flex items-center gap-2">
          <span className={cn("whitespace-nowrap text-xxs font-bold leading-none tabular-nums", status.color)}>
            {status.label}
          </span>
            <div className="shrink-0 flex items-center justify-center">
              {status.level > 0 && (
                <SignalBars level={status.level} activeFill={status.fillClass} />
              )}
            </div>
          </div>
        </div>

      <div className="flex flex-1 flex-col">
        {/* ── Section Label ── */}
        <div className="mb-3">
          <h3 className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">
            Chat Response Distribution
          </h3>
        </div>

        {/* ── Stacked Bar Visual ── */}
        <div className="relative mb-5 flex h-9 w-full overflow-hidden rounded-full bg-muted">
          {healthyPct > 0 && (
            <div
              className={cn(
                "relative flex h-full items-center justify-center bg-success transition-all duration-500",
                "rounded-l-full",
                (latePct === 0 && inactivePct === 0) && "rounded-r-full",
                (latePct > 0 || inactivePct > 0) && "border-r-2 border-white",
              )}
              style={{ width: `${healthyPct}%` }}
            >
              <span className="text-xxs font-bold text-white drop-shadow-sm">
                {Math.round(healthyPct)}%
              </span>
            </div>
          )}
          {latePct > 0 && (
            <div
              className={cn(
                "h-full bg-warning transition-all duration-500",
                healthyPct === 0 && "rounded-l-full",
                inactivePct === 0 && "rounded-r-full",
                inactivePct > 0 && "border-r-2 border-white",
              )}
              style={{ width: `${latePct}%` }}
            />
          )}
          {inactivePct > 0 && (
            <div
              className={cn(
                "h-full bg-destructive transition-all duration-500",
                (healthyPct === 0 && latePct === 0) && "rounded-l-full",
                "rounded-r-full",
              )}
              style={{ width: `${inactivePct}%` }}
            />
          )}
        </div>

        {/* ── Breakdown List ── */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center justify-between rounded-xl bg-card/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="text-xsplus font-medium text-foreground">Healthy</span>
            </div>
            <span className="text-smplus font-bold text-foreground">{healthy}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-card/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <span className="text-xsplus font-medium text-foreground">Late (&gt;24h)</span>
            </div>
            <span className="text-smplus font-bold text-foreground">{late}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-card/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-xsplus font-medium text-foreground">Unreplied (&gt;5d)</span>
            </div>
            <span className="text-smplus font-bold text-foreground">{inactive}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
