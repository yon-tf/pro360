"use client";

import * as React from "react";
import { TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ClickableTableRowProps extends React.ComponentProps<typeof TableRow> {
  onActivate: () => void;
}

export function ClickableTableRow({
  onActivate,
  className,
  onClick,
  onKeyDown,
  children,
  ...props
}: ClickableTableRowProps) {
  return (
    <TableRow
      role="button"
      tabIndex={0}
      className={cn("cursor-pointer", className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onActivate();
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      {...props}
    >
      {children}
    </TableRow>
  );
}

interface ClickableCardSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  onActivate: () => void;
}

export function ClickableCardSurface({
  onActivate,
  className,
  onClick,
  onKeyDown,
  children,
  ...props
}: ClickableCardSurfaceProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn("cursor-pointer", className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onActivate();
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
}
