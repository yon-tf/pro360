"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TrendDirection = "up" | "down" | "stable";

export interface KpiCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: string;
  trendDirection?: TrendDirection;
  /** Small contextual label shown top-right when there is no trend (e.g. "Monthly Total") */
  badge?: string;
  /** Progress bar shown below the value */
  progress?: { current: number; total: number };
  sublabel?: string;
  onClick?: () => void;
  clickable?: boolean;
}

const TREND_STYLE: Record<TrendDirection, string> = {
  up: "text-emerald-600",
  down: "text-red-500",
  stable: "text-muted-foreground",
};

const TREND_ARROW: Record<TrendDirection, string> = {
  up: "↗",
  down: "↘",
  stable: "→",
};

export function KpiCard({
  title,
  value,
  icon,
  trend,
  trendDirection = "stable",
  badge,
  progress,
  sublabel,
  onClick,
  clickable,
}: KpiCardProps) {
  const Wrapper = clickable ? "button" : "div";

  const pct = progress ? Math.round((progress.current / (progress.total || 1)) * 100) : 0;

  return (
    <Wrapper
      className={cn(
        "flex flex-col gap-1.5 rounded-xl bg-card p-3 text-left shadow-card transition-shadow",
        "min-h-[100px]",
        clickable && "cursor-pointer hover:shadow-md",
      )}
      onClick={onClick}
    >
      {/* Top row: icon + trend/badge */}
      <div className="flex items-start justify-between">
        {icon ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        ) : (
          <div className="h-8 w-8" />
        )}

        {progress ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium tabular-nums text-muted-foreground">{pct}% Completion</span>
            <div className="h-1 w-10 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : trend != null ? (
          <span className={cn("flex items-center gap-0.5 text-[11px] font-medium tabular-nums", TREND_STYLE[trendDirection])}>
            {trend} <span className="text-[9px]">{TREND_ARROW[trendDirection]}</span>
          </span>
        ) : badge ? (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
            {badge}
          </span>
        ) : null}
      </div>

      {/* Title */}
      <p className="text-[11px] font-medium leading-tight text-muted-foreground line-clamp-2">
        {title}
      </p>

      {/* Value row */}
      <div className="mt-auto">
        <p className="text-xl font-semibold leading-tight tabular-nums text-foreground">
          {value}
        </p>

        {/* Sublabel */}
        {sublabel && (
          <p className="mt-0.5 text-[9px] text-muted-foreground">{sublabel}</p>
        )}
      </div>
    </Wrapper>
  );
}
