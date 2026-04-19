# Feature: Appointments
> Tier: 2 | Created: 2026-03-20 | Status: implementation

---

## Phase 1 — Discovery

### Problem & goal
- Provide visibility into appointments across types (client, pod, townhall).
- Enable quick filtering, QA checks, and drill‑downs into appointment details.

### Personas / primary user
- Primary user: Clinical Ops
- Secondary user: Pod lead

### User flow (high‑level)
1. Open Appointments table.
2. Filter by type/status/attendance/period.
3. Drill into appointment detail.

### Screens & routes
- Route: `/appointments`
  - Screen: Appointments Table
  - Purpose: Browse and filter all appointments.
- Route: `/appointments/[id]`
  - Screen: Appointment Detail
  - Purpose: View appointment metadata, roster, and outcomes.
- Route: `/appointments/create`
  - Screen: Create Appointment (mock)
  - Purpose: Placeholder for creation workflow.

### Scope — What This Is Not
<!-- Add explicit exclusions when scope is defined -->

### Risks & open questions
- Confirm taxonomy for appointment types and status labels.
- Define audit trail fields for appointment detail.

### Success Criteria
<!-- Add observable, verifiable criteria when feature is scoped -->

---

## Phase 2 — Architecture & IA

### IA / navigation map
- Ops sidebar → Appointments

### Interaction model (states + transitions)
- Loading: table skeleton and filters placeholder.
- Empty: no appointments for filter.
- Error: data load failed (retry).

### Data requirements
- Entity: Appointment
  - Fields: id, type, category, context, scheduledAt, professionalDisplay, clientDisplay, status
  - Source: appointments API

### Component map
- Reusable components: Table, TableToolbar, MoreFiltersSheet, PeriodFilter
- New components: AppointmentStatusBadge (optional)

### Cross-Feature Dependencies
See `docs/modules/DEPENDENCY_MAP.md`.

---

## Phase 3 — Interface plan

### Screen layout plan
- Screen: Appointments Table
  - Sections: KPI row, filter bar, table, pagination
- Screen: Appointment Detail
  - Sections: Overview, roster, notes, timeline

### Token / design system impact
- New tokens: none expected
- Component variants: Badge (status)

### Implementation order
1. Table + filters
2. Detail view + metadata

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
