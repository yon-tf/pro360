import { readFileSync } from "fs";
import path from "path";
import { DOCS_SECTIONS, type DocsSlug } from "@/app/docs/constants";

const PLAN_FILE_PATH =
  "/Users/yonyusuff/.cursor/plans/pro360_pitch_pages_72f3dc74.plan.md";

function safeRead(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function getOverviewFromPlan(planContent: string): string {
  const overviewMatch = planContent.match(/^\s*overview:\s*"([^"]+)"/m);
  if (overviewMatch?.[1]) return overviewMatch[1];
  return "Frontend-only Clinical Ops experience for Pro360 with modern SaaS patterns and mock-data-only workflows.";
}

function buildOverviewMarkdown(planOverview: string): string {
  return `# Overview

${planOverview}

## What this documentation covers

- Route-level module docs for Clinical Ops workflows.
- User flows and Mermaid diagrams for each module.
- Dependency links between modules to speed up navigation.
- A Design Language page generated from the current codebase tokens and components.

## Platform map

\`\`\`mermaid
flowchart LR
  Professionals["Professionals"]
  Team["Team Management"]
  Payout["Payout"]
  Rules["Rule Engine"]
  Chat["Chat"]
  Growth["Growth"]
  Gig["Gig"]
  Appointments["Appointments"]
  Design["Design Language"]

  Professionals --> Team
  Professionals --> Chat
  Professionals --> Gig
  Professionals --> Appointments
  Payout --> Rules
  Growth --> Professionals
  Gig --> Professionals
  Team --> Professionals
\`\`\`

## Modules

- [Professionals](/docs/professionals)
- [Team Management](/docs/team-management)
- [Payout](/docs/payout)
- [Rule Engine](/docs/rule-engine)
- [Chat](/docs/chat)
- [Growth](/docs/growth)
- [Gig](/docs/gig)
- [Appointments](/docs/appointments)
- [Design Language](/docs/design-language)
`;
}

export function getDocContent(slug: DocsSlug): { title: string; markdown: string } {
  const section = DOCS_SECTIONS.find((item) => item.slug === slug);
  const title = section?.label ?? "Documentation";

  if (slug === "overview") {
    const planContent = safeRead(PLAN_FILE_PATH);
    if (!planContent) {
      return {
        title,
        markdown:
          "# Overview\n\nPlan document could not be loaded from the local plans directory.",
      };
    }
    return {
      title,
      markdown: buildOverviewMarkdown(getOverviewFromPlan(planContent)),
    };
  }

  const filePath = path.join(process.cwd(), "docs", "modules", `${slug}.md`);
  const markdown = safeRead(filePath);
  if (!markdown) {
    return {
      title,
      markdown: `# ${title}\n\nDocumentation content is not available yet for this module.`,
    };
  }

  return { title, markdown };
}

