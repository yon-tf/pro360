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
    if (totalThreads === 0) return { label: "No Active Threads", color: "text-muted-foreground", bgColor: "bg-muted/50", level: 0, fillClass: "fill-muted" };
    if (healthyPct >= 90 && inactive === 0) return { label: "Optimal", color: "text-emerald-700", bgColor: "bg-emerald-50", level: 5, fillClass: "fill-emerald-500" };
    if (healthyPct >= 75) return { label: "Good", color: "text-emerald-600", bgColor: "bg-emerald-50", level: 4, fillClass: "fill-emerald-500" };
    if (latePct > 15 || inactive > 0) return { label: "Attention Needed", color: "text-amber-700", bgColor: "bg-amber-50", level: 2, fillClass: "fill-amber-500" };
    return { label: "Fair", color: "text-amber-600", bgColor: "bg-amber-50", level: 1, fillClass: "fill-amber-500" };
  }, [healthyPct, latePct, inactive, totalThreads]);

  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-4 shadow-card">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-500/10 text-slate-500">
              {icon}
            </div>
          )}
          <p className="text-sm font-medium text-foreground">Chat Response Health</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[11px] font-bold tabular-nums", status.color)}>
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
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Chat Response Distribution
          </h3>
        </div>

        {/* ── Stacked Bar Visual ── */}
        <div className="relative mb-5 flex h-9 w-full overflow-hidden rounded-full bg-slate-100">
          {healthyPct > 0 && (
            <div
              className={cn(
                "relative flex h-full items-center justify-center bg-[#22c55e] transition-all duration-500",
                "rounded-l-full",
                (latePct === 0 && inactivePct === 0) && "rounded-r-full",
                (latePct > 0 || inactivePct > 0) && "border-r-2 border-white",
              )}
              style={{ width: `${healthyPct}%` }}
            >
              <span className="text-[11px] font-bold text-white drop-shadow-sm">
                {Math.round(healthyPct)}%
              </span>
            </div>
          )}
          {latePct > 0 && (
            <div
              className={cn(
                "h-full bg-[#f97316] transition-all duration-500",
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
                "h-full bg-[#ef4444] transition-all duration-500",
                (healthyPct === 0 && latePct === 0) && "rounded-l-full",
                "rounded-r-full",
              )}
              style={{ width: `${inactivePct}%` }}
            />
          )}
        </div>

        {/* ── Breakdown List ── */}
        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              <span className="text-[13px] font-medium text-slate-700">Healthy</span>
            </div>
            <span className="text-[15px] font-bold text-slate-900">{healthy}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#f97316]" />
              <span className="text-[13px] font-medium text-slate-700">Late (&gt;24h)</span>
            </div>
            <span className="text-[15px] font-bold text-slate-900">{late}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
              <span className="text-[13px] font-medium text-slate-700">Unreplied (&gt;5d)</span>
            </div>
            <span className="text-[15px] font-bold text-slate-900">{inactive}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
