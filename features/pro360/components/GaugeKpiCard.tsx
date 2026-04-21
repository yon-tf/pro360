"use client";

import { cn } from "@/lib/utils";

export type TrendDirection = "up" | "down" | "stable";

export interface GaugeSegment {
  color: string;
  /** End of this segment as 0–100 percentage of the gauge range */
  end: number;
  /** Optional human-readable label for the legend, e.g. "≥ 75%" */
  label?: string;
}

export interface GaugeKpiCardProps {
  title: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  unit?: string;
  subvalue?: string;
  /** 0–100 */
  pct: number;
  segments?: GaugeSegment[];
  minLabel?: string;
  maxLabel?: string;
  target?: string;
  trend?: string;
  trendDirection?: TrendDirection;
  footer?: React.ReactNode;
}

export const DEFAULT_GAUGE_SEGMENTS: GaugeSegment[] = [
  { color: "hsl(var(--destructive))", end: 40, label: "< 40%" },
  { color: "hsl(var(--warning))", end: 75, label: "40–75%" },
  { color: "hsl(var(--success))", end: 100, label: "> 75%" },
];

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

// ViewBox "0 0 200 130" — extra 10px at bottom for target label
const CX = 100;
const CY = 100;
const R = 80;
const SW = 20; // matches donut visual weight

function arcPt(pct: number, r = R) {
  const angle = pct * Math.PI;
  return {
    x: CX - r * Math.cos(angle),
    y: CY - r * Math.sin(angle),
  };
}

export function GaugeKpiCard({
  title,
  value,
  icon,
  unit = "",
  subvalue,
  pct,
  segments = DEFAULT_GAUGE_SEGMENTS,
  minLabel,
  maxLabel,
  target,
  trend,
  trendDirection = "stable",
  footer,
}: GaugeKpiCardProps) {
  const clampedPct = Math.min(100, Math.max(0, pct));
  const needleRot = (clampedPct / 100) * 180 - 180;

  const minLbl = minLabel ?? `0${unit}`;
  const maxLbl = maxLabel ?? `100${unit}`;

  const valueText = typeof value === "number" || typeof value === "string" ? String(value) : "";
  const valueFontSize =
    valueText.length <= 2 ? 24 : valueText.length <= 3 ? 22 : valueText.length <= 4 ? 20 : 18;

  // Only show legend for segments that carry a label
  const legendItems = segments.filter((s) => s.label);

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
          <p className="text-sm font-medium text-foreground">{title}</p>
        </div>
        {trend != null && (
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 whitespace-nowrap text-xxs font-medium leading-none tabular-nums",
              TREND_STYLE[trendDirection],
            )}
          >
            {trend}
            <span className="text-xxs leading-none">{TREND_ARROW[trendDirection]}</span>
          </span>
        )}
      </div>

      <div className="mb-3">
        <h3 className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">
          Professional Performance
        </h3>
      </div>

      {/* ── Gauge SVG ── */}
      <div className="relative mt-1 flex flex-col items-center">
        <svg viewBox="0 0 200 130" className="w-full max-w-[210px]" aria-hidden="true">
          {/* Background track */}
          <path
            d={`M 20 100 A ${R} ${R} 0 0 1 180 100`}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={SW}
            strokeLinecap="butt"
          />

          {/* Coloured zone segments */}
          {segments.map((seg, i) => {
            const prevEnd = i === 0 ? 0 : segments[i - 1].end;
            const p1 = arcPt(prevEnd / 100);
            const p2 = arcPt(seg.end / 100);
            return (
              <path
                key={i}
                d={`M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${R} ${R} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`}
                fill="none"
                stroke={seg.color}
                strokeWidth={SW}
                strokeLinecap="butt"
              />
            );
          })}

          {/* Tick marks */}
          {Array.from({ length: 11 }, (_, i) => {
            const inner = arcPt(i / 10, R - SW / 2 - 2);
            const outer = arcPt(i / 10, R - SW / 2 - 8);
            return (
              <line
                key={i}
                x1={inner.x.toFixed(2)} y1={inner.y.toFixed(2)}
                x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)}
                stroke="currentColor"
                strokeWidth={1}
                strokeOpacity={0.2}
              />
            );
          })}

          {/* Needle */}
          <g
            style={{
              transform: `rotate(${needleRot}deg)`,
              transformOrigin: `${CX}px ${CY}px`,
              transition: "transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <line
              x1={CX} y1={CY}
              x2={CX + 20} y2={CY}
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeOpacity={0.75}
            />
          </g>
          <circle cx={CX} cy={CY} r={5} fill="currentColor" fillOpacity={0.65} />

          {/* Value — centred in the arc, needle is too short to reach */}
          <text
            x={CX} y={76}
            textAnchor="middle"
            fontSize={valueFontSize}
            fontWeight={700}
            fill="currentColor"
          >
            {value}
          </text>

          {/* Sub-label (e.g. "lower is better") */}
          {subvalue && (
            <text
              x={CX} y={85}
              textAnchor="middle"
              fontSize={6}
              fill="currentColor"
              opacity={0.4}
            >
              {subvalue}
            </text>
          )}

          {/* Min / Max edge labels */}
          <text x={8} y={116} fontSize={7} fill="currentColor" opacity={0.35} fontWeight={600}>{minLbl}</text>
          <text x={192} y={116} fontSize={7} textAnchor="end" fill="currentColor" opacity={0.35} fontWeight={600}>{maxLbl}</text>

          {/* Target — sits below the needle pivot, centred */}
          {target && (
            <text
              x={CX} y={128}
              textAnchor="middle"
              fontSize={9}
              fill="currentColor"
              opacity={0.55}
            >
              {target}
            </text>
          )}
        </svg>
      </div>

      {/* ── Threshold legend — pinned to card bottom ── */}
      {legendItems.length > 0 && (
        <div className="mt-auto pt-2 flex flex-wrap justify-center gap-x-3 gap-y-0.5">
          {legendItems.map((seg, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-xs text-muted-foreground">{seg.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer section for At-Risk Professionals ── */}
      {footer && (
        <div className="mt-3 pt-3 border-t border-border/50">
          {footer}
        </div>
      )}
    </div>
  );
}
