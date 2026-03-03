export type DocsSlug =
  | "overview"
  | "professionals"
  | "team-management"
  | "payout"
  | "rule-engine"
  | "chat"
  | "growth"
  | "gig"
  | "appointments"
  | "design-language";

export const DOCS_SECTIONS: { slug: DocsSlug; label: string }[] = [
  { slug: "overview", label: "Overview" },
  { slug: "professionals", label: "Professionals" },
  { slug: "team-management", label: "Team Management" },
  { slug: "payout", label: "Payout" },
  { slug: "rule-engine", label: "Rule Engine" },
  { slug: "chat", label: "Chat" },
  { slug: "growth", label: "Growth" },
  { slug: "gig", label: "Gig" },
  { slug: "appointments", label: "Appointments" },
  { slug: "design-language", label: "Design Language" },
];

