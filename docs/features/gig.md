# Feature: Gig

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

### Risks & open questions
- Define edit permissions and status transitions.

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

## Phase 4 — Implementation log

### Summary
- 

### Files changed
- 

### Follow‑ups
- 

