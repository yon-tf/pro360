"use client";

import { cn } from "@/lib/utils";
import type { TrendDirection } from "./GaugeKpiCard";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutGroup {
  segments: DonutSegment[];
  centerLabel?: string;
  title?: string;
}

export interface DonutKpiCardProps {
  title: string;
  icon?: React.ReactNode;
  groups: DonutGroup[];
  trend?: string;
  trendDirection?: TrendDirection;
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

const CX = 56;
const CY = 56;
const R = 40;
const SW = 13;
const GAP = 2; // small gap between segments (in arc-length px)
const FULL = 2 * Math.PI * R;

export function DonutKpiCard({
  title,
  icon,
  groups,
  trend,
  trendDirection = "stable",
}: DonutKpiCardProps) {
  return (
    <TooltipProvider>
      <div className="flex h-full flex-col rounded-xl bg-card p-4 shadow-card">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-500/10 text-slate-500">
                {icon}
              </div>
            )}
            <p className="text-sm font-medium text-foreground">{title}</p>
          </div>
          {trend != null && (
            <span
              className={cn(
                "flex shrink-0 items-center gap-0.5 text-[11px] font-bold tabular-nums",
                TREND_STYLE[trendDirection]
              )}
            >
              {trend}
              <span className="text-[9px]">{TREND_ARROW[trendDirection]}</span>
            </span>
          )}
        </div>

        {/* ── Donut(s) ── */}
        <div className="flex flex-1 justify-around gap-4">
          {groups.map((group, gIdx) => {
            const total = group.segments.reduce((s, seg) => s + seg.value, 0);
            let accumulated = 0;
            const arcs = group.segments.map((seg) => {
              const frac = total > 0 ? seg.value / total : 0;
              const arcLen = Math.max(0, frac * FULL - GAP);
              const offset = accumulated;
              accumulated += frac * FULL;
              return { ...seg, arcLen, offset };
            });

            return (
              <div key={gIdx} className="flex flex-1 flex-col min-w-0">
                {group.title && (
                  <div className="mb-3">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                      {group.title}
                    </span>
                  </div>
                )}
                
                <div className="flex flex-col items-center w-full">
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div className="relative flex w-full items-center justify-center group/donut mb-5">
                        <svg
                          viewBox={`0 0 ${CX * 2} ${CY * 2}`}
                          className="w-full max-w-[118px]"
                          aria-hidden="true"
                        >
                          <circle
                            cx={CX}
                            cy={CY}
                            r={R + SW / 2}
                            fill="transparent"
                            className="pointer-events-auto"
                          />
                          <circle
                            cx={CX}
                            cy={CY}
                            r={R}
                            fill="none"
                            stroke="currentColor"
                            strokeOpacity={0.07}
                            strokeWidth={SW}
                          />
                          {arcs.map((arc, i) => (
                            <circle
                              key={i}
                              cx={CX}
                              cy={CY}
                              r={R}
                              fill="none"
                              stroke={arc.color}
                              strokeWidth={SW}
                              strokeDasharray={`${arc.arcLen} ${FULL - arc.arcLen}`}
                              strokeDashoffset={-arc.offset}
                              strokeLinecap="butt"
                              style={{
                                transform: "rotate(-90deg)",
                                transformOrigin: `${CX}px ${CY}px`,
                              }}
                            />
                          ))}
                        </svg>

                        <div className="pointer-events-none absolute flex flex-col items-center">
                          {(() => {
                            const totalLabel = Math.round(total).toLocaleString();
                            const sizeClass =
                              totalLabel.length <= 2
                                ? "text-2xl"
                                : totalLabel.length <= 4
                                  ? "text-xl"
                                  : "text-lg";
                            return (
                              <span className={cn("font-bold tabular-nums text-foreground leading-none", sizeClass)}>
                                {totalLabel}
                              </span>
                            );
                          })()}
                          {group.centerLabel && (
                            <span className="mt-1 text-[9px] text-muted-foreground">
                              {group.centerLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="min-w-[10rem] rounded-lg border border-border bg-card px-3 py-2 shadow-md"
                    >
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                        {group.title} Hours
                      </p>
                      <div className="space-y-1">
                        {group.segments.map((seg, i) => (
                          <div key={i} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: seg.color }}
                              />
                              <span className="text-xs text-muted-foreground">
                                {seg.label}
                              </span>
                            </div>
                            <span className="text-xs font-medium tabular-nums text-foreground">
                              {Math.round(seg.value).toLocaleString()}h
                            </span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* Legend per group - Width restricted to keep label/value closer and centered */}
                  <div className="mt-auto flex w-full max-w-[118px] flex-col gap-2">
                    {group.segments.map((seg, i) => (
                      <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-1.5 w-full">
                        <div
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-[12px] font-medium text-slate-500 whitespace-nowrap">
                          {seg.label}
                        </span>
                        <span className="text-[12px] font-normal text-slate-800 tabular-nums whitespace-nowrap text-right pl-2">
                          {Math.round(seg.value).toLocaleString()} h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
