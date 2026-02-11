"use client";

import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";

export function PageHeader({
  items,
  cta,
  subtitle,
}: {
  items: BreadcrumbItem[];
  cta?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumbs items={items} />
        {cta != null && <div className="shrink-0">{cta}</div>}
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
