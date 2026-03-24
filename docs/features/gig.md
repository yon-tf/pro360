# Feature: Gig
> Tier: 2 | Created: 2026-03-20 | Status: implementation

---

## Phase 1 — Discovery

### Problem & goal
- Provide visibility into gig opportunities and applicant status.
- Allow quick editing of gig details.

### Personas / primary user
- Primary user: Clinical Ops
- Secondary user: Hiring manager

### User flow (high‑level)
1. Open Gig list.
2. Filter/search gigs by status.
3. Open edit modal or apply action.

### Screens & routes
- Route: `/gig`
  - Screen: Gig List
  - Purpose: Browse gigs and applicants.

### Scope — What This Is Not
<!-- Add explicit exclusions when scope is defined -->

### Risks & open questions
- Define edit permissions and status transitions.

### Success Criteria
<!-- Add observable, verifiable criteria when feature is scoped -->

---

## Phase 2 — Architecture & IA

### IA / navigation map
- Ops sidebar → Gig

### Interaction model (states + transitions)
- Loading: card skeletons.
- Empty: no gigs.
- Error: failed to load gigs.

### Data requirements
- Entity: GigJob
  - Fields: id, title, status, location, date, payment, applicants
  - Source: gigs API

### Component map
- Reusable components: Card, Button, Input
- New components: StatusPill (optional)

### Cross-Feature Dependencies
<!-- Reference docs/modules/DEPENDENCY_MAP.md -->

---

## Phase 3 — Interface plan

### Screen layout plan
- Screen: Gig List
  - Sections: KPI row, filters, job cards, action buttons

### Token / design system impact
- New tokens: none expected
- Component variants: Badge (status)

### Implementation order
1. KPI row + filters
2. Job cards + edit modal

---

## Phase 4 — Implementation Log
> Maintained by: Claude Code | Append-only — never edit existing entries

<!-- No entries yet. First entry added when implementation begins. -->

---

## Phase 5 — Debug & Finetune
> Maintained by: Antigravity QA + Claude Code | Append-only

<!-- QA findings and debug entries appended here -->
<!-- Format:
### [YYYY-MM-DD] [Issue or polish item]
**Found by:** [Review / Antigravity QA / user feedback]
**Fix:** [What was done]
**Files changed:** [list]
**Status:** [resolved / in progress / deferred]
-->
