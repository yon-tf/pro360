"use client";

import { Badge } from "@/components/ui/badge";
import type { AttentionRow } from "@/lib/attention-rows";

function getSeverityBadgeLabel(row: AttentionRow): string | null {
  if (row.severity === "low") return null;
  const sec = row.secondaryLabel.toLowerCase();
  if (row.severity === "critical") return "Critical";
  if (sec.includes("overdue")) return "Overdue";
  if (sec.includes("sla")) return "SLA Breach";
  if (row.severity === "high") return "Urgent";
  return "Review";
}

export function SeverityBadge({ row }: { row: AttentionRow }) {
  const label = getSeverityBadgeLabel(row);
  if (!label) return null;

  if (row.severity === "critical") {
    return (
      <Badge variant="destructive" className="text-[10px] uppercase tracking-wider shrink-0">
        {label}
      </Badge>
    );
  }
  if (row.severity === "high") {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 text-[10px] uppercase tracking-wider shrink-0">
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider shrink-0">
      {label}
    </Badge>
  );
}
