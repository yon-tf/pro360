"use client";

import React from "react";
import { Icon } from "@iconify/react";

/**
 * Radar (spider) chart: performance strengths and areas for improvement.
 * Scale 0–5. Rendered on electric blue background; grid webs are white/transparent.
 * Axes below improvementThreshold show a Solar warning icon.
 * Hover on axis labels shows a tooltip with the criterion description.
 */
const DEFAULT_SIZE = 200;
/** White with transparency for grid rings and axes (webs) on electric blue */
const WEB_STROKE = "rgba(255, 255, 255, 0.5)";
const WEB_STROKE_OPACITY = 0.7;
/** Data polygon on electric blue: light fill, white stroke */
const FILL_COLOR = "rgba(255, 255, 255, 0.35)";
const STROKE_COLOR = "rgba(255, 255, 255, 0.9)";
const IMPROVEMENT_THRESHOLD_DEFAULT = 4;
const WARNING_ICON_SIZE = 14;

export interface SpiderChartDatum {
  label: string;
  value: number;
  max?: number;
  /** Shown on hover; explains what this criterion means and how it's measured */
  description?: string;
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
}

const LABEL_PADDING = 24;

/** Solar icon set: danger/warning triangle for "needs improvement" axis */
function WarningIconSvg({ x, y }: { x: number; y: number }) {
  const half = WARNING_ICON_SIZE / 2;
  return (
    <g transform={`translate(${x - half}, ${y - half})`}>
      <foreignObject width={WARNING_ICON_SIZE} height={WARNING_ICON_SIZE} className="overflow-visible">
        <div
          {...({ xmlns: "http://www.w3.org/1999/xhtml" } as React.HTMLAttributes<HTMLDivElement>)}
          className="flex items-center justify-center"
          style={{ width: WARNING_ICON_SIZE, height: WARNING_ICON_SIZE }}
        >
          <Icon
            icon="solar:danger-triangle-bold"
            width={WARNING_ICON_SIZE}
            height={WARNING_ICON_SIZE}
            color="hsl(var(--destructive))"
          />
        </div>
      </foreignObject>
    </g>
  );
}

export function SpiderChart({
  data,
  size = DEFAULT_SIZE,
  className,
  improvementThreshold = IMPROVEMENT_THRESHOLD_DEFAULT,
}: {
  data: SpiderChartDatum[];
  size?: number;
  className?: string;
  /** Axes with value below this show a "needs improvement" alert icon. Scale is 0–5. */
  improvementThreshold?: number;
}) {
  const totalSize = size + 2 * LABEL_PADDING;
  const cx = LABEL_PADDING + size / 2;
  const cy = LABEL_PADDING + size / 2;
  const maxRadius = (size / 2) * 0.78;
  const n = data.length;
  const angles = data.map((_, i) => (360 * i) / n);

  const rings = [0.2, 0.4, 0.6, 0.8, 1];
  const maxVal = 5;

  const points = data
    .map((d, i) => {
      const r = (d.value / (d.max ?? maxVal)) * maxRadius;
      return polarToCartesian(cx, cy, r, angles[i]);
    })
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      className={className}
      aria-hidden
    >
      {/* Grid rings (webs): white, transparent */}
      {rings.map((r) => {
        const radius = maxRadius * r;
        const ringPoints = angles
          .map((a) => polarToCartesian(cx, cy, radius, a))
          .map(([x, y]) => `${x},${y}`)
          .join(" ");
        return (
          <polygon
            key={r}
            points={ringPoints}
            fill="none"
            stroke={WEB_STROKE}
            strokeWidth="0.5"
            strokeOpacity={WEB_STROKE_OPACITY}
          />
        );
      })}
      {/* Axes (webs) */}
      {angles.map((a, i) => {
        const [x, y] = polarToCartesian(cx, cy, maxRadius, a);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={WEB_STROKE}
            strokeWidth="0.5"
            strokeOpacity={WEB_STROKE_OPACITY}
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={points}
        fill={FILL_COLOR}
        stroke={STROKE_COLOR}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Axis labels with tooltip and optional improvement alert */}
      {data.map((d, i) => {
        const [x, y] = polarToCartesian(cx, cy, maxRadius * 1.05, angles[i]);
        const anchor = x < cx - 2 ? "end" : x > cx + 2 ? "start" : "middle";
        const needsImprovement = d.value < improvementThreshold;
        const tooltipText = d.description
          ? `${d.label} (${d.value}/${d.max ?? maxVal}): ${d.description}`
          : `${d.label}: ${d.value} / ${d.max ?? maxVal}`;
        const iconOffset = 10;
        const iconX = anchor === "end" ? x + iconOffset : anchor === "start" ? x - iconOffset : x + iconOffset;
        return (
          <g key={i}>
            <title>{tooltipText}</title>
            <text
              x={x}
              y={y}
              textAnchor={anchor}
              className="fill-white/90"
              style={{ fontSize: 10, fontFamily: "inherit" }}
            >
              {d.label}
            </text>
            {needsImprovement && (
              <WarningIconSvg x={iconX} y={y} />
            )}
          </g>
        );
      })}
    </svg>
  );
}
