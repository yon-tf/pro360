"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBreadcrumb } from "@/components/BreadcrumbContext";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { professionalProfiles } from "@/lib/mock/professionalProfiles";

function getProfessionalLabel(profId: string): string {
  const profile = professionalProfiles.find((p) => p.id === profId);
  if (profile) return `${profile.firstName} ${profile.lastName} (${profId})`;
  return profId;
}

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
  if (pathname === "/team") return [{ label: "Pod Management" }];
  if (pathname === "/team/new") return [{ label: "Pod Management", href: "/team" }, { label: "Create new pod" }];
  if (pathname === "/team/unassigned") return [{ label: "Pod Management", href: "/team" }, { label: "Unassigned TFPs" }];
  if (pathname.startsWith("/team/") && pathname !== "/team/new" && pathname !== "/team/unassigned") {
    const rest = pathname.replace("/team/", "").split("/")[0];
    if (rest) return [{ label: "Pod Management", href: "/team" }, { label: "Pod detail" }];
  }
  if (pathname === "/professionals") return [{ label: "Professionals" }];
  if (pathname === "/professionals/new") return [{ label: "Professionals", href: "/professionals" }, { label: "Add professional" }];
  if (pathname.startsWith("/professionals/") && pathname.endsWith("/profile/edit")) {
    const profId = pathname.replace("/professionals/", "").replace("/profile/edit", "");
    return [{ label: "Professionals", href: "/professionals" }, { label: getProfessionalLabel(profId), href: `/professionals/${profId}/profile` }, { label: "Edit Profile" }];
  }
  if (pathname.startsWith("/professionals/") && pathname.endsWith("/profile")) {
    const profId = pathname.replace("/professionals/", "").replace("/profile", "");
    return [{ label: "Professionals", href: "/professionals" }, { label: getProfessionalLabel(profId), href: `/professionals/${profId}/profile` }, { label: "Profile" }];
  }
  if (pathname === "/pro360") return [{ label: "Professional 360" }];
  if (pathname === "/pro360/attention") return [{ label: "Professional 360", href: "/pro360" }, { label: "Needs attention" }];
  if (pathname.match(/^\/pro360\/[^/]+\/client\/[^/]+$/)) {
    const profId = pathname.replace("/pro360/", "").split("/")[0];
    return [
      { label: "Professional 360", href: "/pro360" },
      { label: getProfessionalLabel(profId), href: `/pro360/${profId}` },
      { label: "Client" },
    ];
  }
  if (pathname.startsWith("/pro360/")) {
    const profId = pathname.replace("/pro360/", "").split("/")[0];
    return [{ label: "Professional 360", href: "/pro360" }, { label: getProfessionalLabel(profId) }];
  }
  if (pathname === "/rules") return [{ label: "Rule Engine" }];
  if (pathname === "/chat") return [{ label: "Chat" }];
  if (pathname === "/lms") return [{ label: "Growth", href: "/lms" }];
  if (pathname === "/gig") return [{ label: "Gig", href: "/gig" }];
  if (pathname === "/appointments") return [{ label: "Appointments" }];
  if (pathname === "/appointments/create") return [{ label: "Appointments", href: "/appointments?context=internal" }, { label: "Create internal appointment" }];
  if (pathname.startsWith("/appointments/") && pathname !== "/appointments") {
    return [{ label: "Appointments", href: "/appointments" }, { label: "Appointment detail" }];
  }
  if (pathname === "/calendar") return [{ label: "Calendar" }];
  if (pathname === "/docs") return [{ label: "Documentation" }];
  if (pathname.startsWith("/docs/")) {
    const slug = pathname.replace("/docs/", "").split("/")[0];
    const labelMap: Record<string, string> = {
      overview: "Overview",
      professionals: "Professionals",
      "team-management": "Team Management",
      payout: "Payout",
      "rule-engine": "Rule Engine",
      chat: "Chat",
      growth: "Growth",
      gig: "Gig",
      appointments: "Appointments",
      "design-language": "Design Language",
    };
    return [
      { label: "Documentation", href: "/docs/overview" },
      { label: labelMap[slug] ?? "Module" },
    ];
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
