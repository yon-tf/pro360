"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  XCircle,
} from "@/components/ui/solar-icons";
import { cn } from "@/lib/utils";

const iconClassName = "h-4 w-4";

export function SystemToaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      closeButton
      duration={4000}
      className="toaster group"
      toastOptions={{
        classNames: {
          closeButton:
            "!right-3 !left-auto !top-1/2 !-translate-y-1/2",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground",
        },
      }}
      icons={{
        success: <CheckCircle className={cn(iconClassName, "text-success")} />,
        error: <XCircle className={cn(iconClassName, "text-destructive")} />,
        warning: <AlertTriangle className={cn(iconClassName, "text-warning")} />,
        info: <Info className={cn(iconClassName, "text-primary")} />,
        loading: (
          <Loader2 className={cn(iconClassName, "animate-spin text-warning")} />
        ),
      }}
      {...props}
    />
  );
}
