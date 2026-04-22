"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Info } from "@/components/ui/solar-icons";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type TrendDirection = "up" | "down" | "stable";

export interface KpiCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  /** Primary variant: blue bg, white text/icon */
  variant?: "default" | "primary";
  trend?: string;
  trendDirection?: TrendDirection;
  /** Small contextual label shown top-right when there is no trend (e.g. "Monthly Total") */
  badge?: string;
  /** Target pill rendered inline beside the value */
  target?: string;
  /** Progress bar shown below the value */
  progress?: { current: number; total: number };
  sublabel?: string;
  onClick?: () => void;
  clickable?: boolean;
  info?: string;
}

const TREND_STYLE: Record<TrendDirection, string> = {
  up: "text-success",
  down: "text-destructive",
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
  variant = "default",
  trend,
  trendDirection = "stable",
  badge,
  target,
  progress,
  sublabel,
  onClick,
  clickable,
  info,
}: KpiCardProps) {
  const Wrapper = clickable ? "button" : "div";

  const pct = progress ? Math.round((progress.current / (progress.total || 1)) * 100) : 0;

  const isPrimary = variant === "primary";

  return (
    <Wrapper
      className={cn(
        "flex h-full flex-col gap-2 rounded-xl p-3 text-left shadow-card transition-shadow",
        "min-h-[100px]",
        isPrimary
          ? "bg-primary text-primary-foreground"
          : "bg-card",
        clickable && "cursor-pointer hover:shadow-panel",
      )}
      onClick={onClick}
    >
      {/* Top row: icon + title left, trend/badge right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                isPrimary
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground",
              )}
            >
              {icon}
            </div>
          )}
          <div className="flex items-center gap-1 min-w-0">
            <p className={cn("text-sm font-medium leading-tight line-clamp-2", isPrimary ? "text-primary-foreground" : "text-foreground")}>
              {title}
            </p>
            {info && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-full p-1 text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 text-xs" side="top" align="start">
                  {info}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {progress ? (
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xxxs font-medium tabular-nums text-muted-foreground">{pct}% Completion</span>
            <div className="h-1 w-10 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ) : trend != null ? (
              <span
            className={cn(
              "flex shrink-0 items-center gap-1 whitespace-nowrap text-xxxs font-medium leading-none tabular-nums",
              isPrimary ? "text-primary-foreground/90" : TREND_STYLE[trendDirection]
            )}
          >
            {trend} <span className="text-xxxs leading-none">{TREND_ARROW[trendDirection]}</span>
          </span>
        ) : badge ? (
          <span className={cn("shrink-0 rounded-full px-2 py-1 text-micro font-medium", isPrimary ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
            {badge}
          </span>
        ) : null}
      </div>

      {/* Value row */}
      <div className="mt-auto">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className={cn("text-xl font-semibold leading-tight tabular-nums", isPrimary ? "text-primary-foreground" : "text-foreground")}>
            {value}
          </p>
          {target && (
            <Badge
              variant="secondary"
              className={cn(
                "h-5 whitespace-nowrap px-2 py-0 text-xxxs font-medium leading-none",
                isPrimary
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              Target {target}
            </Badge>
          )}
        </div>

        {/* Sublabel */}
        {sublabel && (
          <p className={cn("mt-1 text-micro", isPrimary ? "text-primary-foreground/80" : "text-muted-foreground")}>{sublabel}</p>
        )}
      </div>
    </Wrapper>
  );
}
