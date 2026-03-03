# Plan vs codebase analysis (post–recent changes)

Comparison of `.cursor/plans/pro360_pitch_pages_72f3dc74.plan.md` with the current pro360 codebase.

---

## Matches (plan is correct)

- **Approach**: Persona (Sarah Lee), scope (frontend only, mock data), auth (none), design (drop shadows, modern SaaS).
- **Stacks**: Next.js 16 App Router, React 19, Tailwind, Radix UI, Solar icons via Iconify, SpiderChart, clsx, tailwind-merge, cva, tailwindcss-animate.
- **Shell**: Sidebar + top bar, breadcrumbs, theme toggle, user block, logout; root redirect to `/professionals/PRO-001/performance`.
- **Main nav routes**: Professional 360, Payout, Rule Engine, Chat, Growth, Gig, Appointments (all present in `Sidebar` and `app/`).
- **Page specs**: Payout (Reports/Tasks, run wizard 4 steps, bulk, drawer, exceptions tabs), Chat (view-only vs interactive), LMS, Gig, Appointments, Calendar — all align with implementation.
- **UI patterns**: shadow-card / shadow-panel in `globals.css`, TablePagination, Tabs, table-title-outside-card (e.g. Rules created).
- **File structure**: All listed `app/*` pages (except docs), `components/` (except MarkdownContent, PageHeader, SearchModal), `lib/mock/*` match.

---

## Gaps (plan was out of date → updated in plan)

| Area | Plan said | Codebase has |
|------|-----------|--------------|
| **Sidebar** | Only 7 main nav items. | **Documentation** link to `/docs` in sidebar (with Help and Support, Settings). |
| **Routes** | No `/docs`. | `app/docs/page.tsx` — renders `docs/PRO360_PITCH_PLAN.md` (pitch plan as in-app docs). |
| **Breadcrumbs** | Not specified for /docs. | `PathnameBreadcrumbSync`: `/docs` → "Documentation". |
| **Rule Engine form** | "variable, condition, action". | **Rule name** field first, then variable, condition, action. |
| **Rule Engine page** | Create card + Rules table. | **Top stats row**: Total Rules, Total Triggers, Active Today (3 cards), then Create card, then Rules table. |
| **File structure** | No docs route or MarkdownContent. | `app/docs/page.tsx`, `components/MarkdownContent.tsx`; `docs/PRO360_PITCH_PLAN.md` (and PRO360_FLYONUI_MAP.md). |
| **Stacks** | Not listed. | **react-markdown**, **remark-gfm** (for /docs). |
| **Info architecture** | No Documentation. | Documentation page reachable from shell (sidebar). |

---

## Optional (plan unchanged)

- **PageHeader.tsx**, **SearchModal.tsx**: Present in `components/` but not referenced in the plan; they are implementation details and don’t change the spec.
- **HotlineRow.reviewer**, **SpiderChart xmlns**: Type/implementation fixes only; no spec change.

---

## Summary

The plan was **mostly aligned** with the codebase; the main drift was the addition of the **Documentation** feature (`/docs`, sidebar link, breadcrumb, MarkdownContent, react-markdown/remark-gfm) and the **Rules** page details (rule name field, top stats row). The Cursor plan file has been updated so it matches the codebase as of this analysis.
