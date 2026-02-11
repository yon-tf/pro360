"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBreadcrumb } from "@/components/BreadcrumbContext";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";

function getDefaultBreadcrumb(pathname: string): BreadcrumbItem[] {
  if (pathname === "/payout") return [{ label: "Payout" }];
  if (pathname.startsWith("/payout/run/")) {
    const runId = pathname.replace("/payout/run/", "").split("/")[0];
    if (runId) {
      const [y, m] = runId.split("-");
      const mm = m ? m.padStart(2, "0") : "00";
      const runPayoutId = `#P${mm}${y ?? ""}`;
      return [{ label: "Payout", href: "/payout" }, { label: `Generate payout ${runPayoutId}` }];
    }
  }
  if (pathname === "/rules") return [{ label: "Rule Engine" }];
  if (pathname === "/chat") return [{ label: "Chat" }];
  if (pathname === "/lms") return [{ label: "Growth", href: "/lms" }];
  if (pathname === "/gig") return [{ label: "Gig", href: "/gig" }];
  if (pathname === "/appointments") return [{ label: "Appointments" }];
  if (pathname === "/calendar") return [{ label: "Calendar" }];
  if (pathname === "/docs") return [{ label: "Documentation" }];
  if (pathname.startsWith("/professional/")) {
    return [{ label: "Professionals", href: "/professional/1" }];
  }
  return [];
}

export function PathnameBreadcrumbSync({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems(getDefaultBreadcrumb(pathname));
  }, [pathname, setItems]);

  return <>{children}</>;
}
