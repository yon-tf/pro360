# Feature: LMS

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

### Risks & open questions
- Confirm module categories and progress definitions.

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

## Phase 4 — Implementation log

### Summary
- 

### Files changed
- 

### Follow‑ups
- 

