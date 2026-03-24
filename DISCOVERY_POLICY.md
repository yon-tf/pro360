# Discovery Policy — Tiered

Keeps discovery lightweight while maintaining a single source of truth
per feature. Read this before starting any feature work.

---

## Tier Decision

| Change type | Tier | Doc required | Entry point |
|---|---|---|---|
| Copy, spacing, minor UI tweak | 0 | No | Claude Code directly |
| New screen or simple workflow | 1 | Lightweight | Claude Web `think-product` |
| Multi-step flow, new data model, cross-module impact | 2 | Full | Claude Web `think-product` + `think-system` |

When in doubt, go one tier up. Over-documenting costs 20 minutes.
Under-documenting costs days of rework.

---

## Tier 0 — Micro Change

No doc required. Update code only.

Examples: button label change, spacing fix, color correction,
single-component state fix.

Go straight to Claude Code. Log the change in the nearest feature doc's
Phase 4 if it's related to an existing feature.

---

## Tier 1 — Medium Feature

**Doc:** `docs/features/[feature].md` — lightweight

**Required phases:**
- Phase 1 (partial): Problem & goal, screens & routes
- Phase 3 (partial): Key states (empty/loading/error), component mapping
- Phase 4: Implementation log

**Skip:** Full user flow, personas, data model, dependency analysis.

**Entry point:**
Claude Web → `think-product` (quick brief) → paste into Phase 1
Claude Web → `think-design` (key states + component map) → paste into Phase 3

---

## Tier 2 — Large Feature

**Doc:** `docs/features/[feature].md` — full

**Required phases:** All five phases, all sections.

**Required before implementation:**
- Phase 1: Problem & goal, user flow, screens & routes, risks
- Phase 2: IA, navigation, data requirements, dependency map check
- Phase 3: All states, interaction patterns, microcopy, component mapping
- `/plan-design-review` passed

**Entry point:**
Claude Web → `think-product` → `think-system` → `think-design`
Paste each output into the corresponding phase.
Do not start Phase 4 until all three phases are populated and reviewed.

---

## Definition of Ready (before Phase 4)

Before implementation starts, confirm all of these:

- [ ] Feature doc exists at `docs/features/[feature].md`
- [ ] Phase 1 populated (problem, users, scope)
- [ ] Phase 3 populated (screens, states, component mapping)
- [ ] `/plan-design-review` returned CLEAR TO BUILD
- [ ] Cross-feature dependencies checked in `DEPENDENCY_MAP.md`
- [ ] shadcn/ui rules in `AGENTS.md` reviewed

If any are unchecked: do not proceed to Phase 4.

---

## Single Source of Truth

The feature doc is the canonical source for scope and UI intent.
Update it when scope changes — not after.

If the code diverges from the doc, the doc is wrong and needs updating.
If the doc diverges from the design intent, the doc is wrong and needs updating.

The doc is always the authority. Code is the implementation of the doc.
