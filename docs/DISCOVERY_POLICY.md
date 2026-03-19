# Discovery Policy (Tiered)

This policy keeps discovery lightweight while still creating a single source of truth per feature.

## When discovery is required

- **Small change** (copy tweaks, spacing, minor UI): no discovery doc needed.
- **Medium feature** (new screen or workflow): lightweight feature doc required.
- **Large feature** (multi‑step flow, new data model, or cross‑module impact): full discovery required.

## Tiers

### Tier 0 — Micro change
- No doc required.
- Update code only.

### Tier 1 — Medium feature (lightweight doc)
- Create or update: `docs/features/<feature>.md`
- Required sections:
  - Problem & goal
  - Screens & routes
  - Key states (empty/loading/error)
  - Data requirements (fields only)
  - Reusable components

### Tier 2 — Large feature (full discovery)
- Create or update: `docs/features/<feature>.md`
- Required sections:
  - Problem & goal
  - Personas / primary user
  - User flow (steps)
  - Screens & routes
  - Key states (empty/loading/error)
  - Data requirements (entities + fields)
  - Reusable components & tokens
  - Analytics / events (if applicable)
  - Risks & open questions

## Definition of Ready (DoR)

Before implementation starts, confirm:
- Feature doc exists and is up to date.
- Routes and screens are listed.
- Data requirements are clear.
- Reusable components are identified.
- Open questions are explicit.

## Single source of truth

- The **feature doc** is the canonical source for scope and UI intent.
- Update it when scope changes.

