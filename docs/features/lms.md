# Feature: LMS
> Tier: 2 | Created: 2026-03-20 | Status: implementation

---

## Phase 1 — Discovery

### Problem & goal
- Provide visibility into learning modules and engagement.
- Support enrollment and module analytics.

### Personas / primary user
- Primary user: Clinical Ops
- Secondary user: Learning admin

### User flow (high‑level)
1. Open LMS list.
2. Filter/search modules.
3. View module stats and enrollments.

### Screens & routes
- Route: `/lms`
  - Screen: LMS Modules
  - Purpose: Browse and manage modules.

### Scope — What This Is Not
<!-- Add explicit exclusions when scope is defined -->

### Risks & open questions
- Confirm module categories and progress definitions.

### Success Criteria
<!-- Add observable, verifiable criteria when feature is scoped -->

---

## Phase 2 — Architecture & IA

### IA / navigation map
- Ops sidebar → LMS

### Interaction model (states + transitions)
- Loading: module list skeleton.
- Empty: no modules.
- Error: failed to load modules.

### Data requirements
- Entity: LMSModule
  - Fields: id, name, category, timeSpent, usersTaken, passCount
  - Source: lms API

### Component map
- Reusable components: Card, Input, Button
- New components: ModuleStatCard (optional)

### Cross-Feature Dependencies
<!-- Reference docs/modules/DEPENDENCY_MAP.md -->

---

## Phase 3 — Interface plan

### Screen layout plan
- Screen: LMS Modules
  - Sections: KPI row, filters, module cards/list

### Token / design system impact
- New tokens: none expected
- Component variants: Badge (status)

### Implementation order
1. KPI row + filters
2. Module list + actions

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
