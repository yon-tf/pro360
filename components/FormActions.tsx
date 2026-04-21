import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormActionsAlign = "start" | "end";

export function FormActions({
  children,
  align = "end",
  className,
}: {
  children: ReactNode;
  align?: FormActionsAlign;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        align === "end" ? "justify-end" : "justify-start",
        className
      )}
    >
      {children}
    </div>
  );
}

