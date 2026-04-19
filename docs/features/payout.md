# Feature: Payout
> Tier: 2 | Created: 2026-03-20 | Status: implementation

---

## Phase 1 — Discovery

### Problem & goal
- Allow Clinical Ops to review payout status and resolve issues.
- Provide downloadable reports and task tracking.

### Personas / primary user
- Primary user: Clinical Ops
- Secondary user: Finance reviewer

### User flow (high‑level)
1. Open Payout overview.
2. Review status and monthly reports.
3. Drill into a payout run and resolve exceptions.

### Screens & routes
- Route: `/payout`
  - Screen: Payout Overview
  - Purpose: Reports + tasks + status summary.
- Route: `/payout/run/[runId]`
  - Screen: Payout Run Detail
  - Purpose: Review rows, exceptions, and finalize.

### Scope — What This Is Not
<!-- Add explicit exclusions when scope is defined -->

### Risks & open questions
- Confirm payout calculation rules and SLA thresholds.
- Define reviewer roles and audit history.

### Success Criteria
<!-- Add observable, verifiable criteria when feature is scoped -->

---

## Phase 2 — Architecture & IA

### IA / navigation map
- Ops sidebar → Payout

### Interaction model (states + transitions)
- Loading: status + table skeleton.
- Empty: no reports for selected month.
- Error: failed to load payout run.

### Data requirements
- Entity: PayoutRun
  - Fields: id, month, status, totals, exceptions
  - Source: payouts API
- Entity: PayoutRow
  - Fields: professionalId, hours, rate, total, flags
  - Source: payouts API

### Component map
- Reusable components: Tabs, Table, TablePagination, Select, Badge
- New components: PayoutStatusPill (optional)

### Cross-Feature Dependencies
See `docs/modules/DEPENDENCY_MAP.md`.

---

## Phase 3 — Interface plan

### Screen layout plan
- Screen: Payout Overview
  - Sections: status bar, reports table, tasks table
- Screen: Payout Run Detail
  - Sections: summary, rows table, exception panel

### Token / design system impact
- New tokens: none expected
- Component variants: Badge (status)

### Implementation order
1. Overview page
2. Run detail

---

## Phase 4 — Implementation Log
> Maintained by: Claude Code | Append-only — never edit existing entries

<!-- No entries yet. First entry added when Phase 4 starts. -->

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
