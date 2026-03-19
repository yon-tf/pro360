# Feature: Professionals

## Phase 1 — Discovery

### Problem & goal
- Provide a clear roster of professionals with fast filtering and drill‑downs.
- Support profile review, credential checks, and bulk import.

### Personas / primary user
- Primary user: Clinical Ops
- Secondary user: Pod lead

### User flow (high‑level)
1. Open Professionals list.
2. Filter/search and review key metrics.
3. Open profile; edit credentials or bio info.
4. Bulk import (review flow).

### Screens & routes
- Route: `/professionals`
  - Screen: Professionals Table
  - Purpose: Browse and filter all professionals.
- Route: `/professionals/[id]/profile`
  - Screen: Professional Profile
  - Purpose: View and edit profile details.
- Route: `/professionals/import/review`
  - Screen: Bulk Import Review
  - Purpose: Validate and finalize imports.

### Risks & open questions
- Confirm role taxonomy and credential expiry rules.
- Define import schema and validation rules.

---

## Phase 2 — Architecture & IA

### IA / navigation map
- Ops sidebar → Professionals

### Interaction model (states + transitions)
- Loading: table/profile skeleton.
- Empty: no professionals for filter.
- Error: failed to load profile.

### Data requirements
- Entity: Professional
  - Fields: id, name, avatar, roles, metrics, credentials
  - Source: professionals API

### Component map
- Reusable components: TableToolbar, MoreFiltersSheet, CredentialsTab
- New components: CredentialStatusBadge (optional)

---

## Phase 3 — Interface plan

### Screen layout plan
- Screen: Professionals Table
  - Sections: filter bar, table, pagination
- Screen: Profile
  - Sections: header, credentials, details, notes

### Token / design system impact
- New tokens: none expected
- Component variants: Badge (status)

### Implementation order
1. Table + filters
2. Profile view + edit
3. Import flow

---

## Phase 4 — Implementation log

### Summary
- 

### Files changed
- 

### Follow‑ups
- 

