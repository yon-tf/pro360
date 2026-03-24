# Feature: Automation Rules
> Tier: 2 | Created: 2026-03-20 | Status: finetune

---

## Phase 1 — Discovery

### Problem & goal
- Allow Clinical Ops to build operational automations with a visual IFTTT-style workflow.
- Reduce cognitive load by making Trigger → Conditions → Actions instantly legible on the dashboard and in the builder.
- Keep the experience aligned with existing Pro360 design language and token usage.

### Personas / primary user
- Primary user: Clinical Ops
- Secondary user: Pod lead / operations owner

### User flow (high-level)
1. Open `/rules` and scan rule cards.
2. Launch `/rules/new` to create a rule, or open `/rules/[ruleId]` to edit one.
3. Choose a preset, configure the trigger, conditions, and actions in the rule builder.
4. Validate and save the logic stack.

### Screens & routes
- Route: `/rules`
  - Screen: Automation Rules dashboard
  - Purpose: Browse rules, filter by team, toggle status, and enter authoring.
- Route: `/rules/new`
  - Screen: Rule Builder (Create)
  - Purpose: Build a new rule definition.
- Route: `/rules/[ruleId]`
  - Screen: Rule Builder (Edit)
  - Purpose: Review and update an existing rule.

### Scope — What This Is Not
- AND/OR condition grouping is reserved in the interface but not implemented in v1.
- Action reordering is local-state only until backend persistence exists.

### Risks & open questions
- AND/OR grouping is reserved in the interface but not implemented in v1.
- Action reordering is local-state only until backend persistence exists.

### Success Criteria
<!-- Add observable, verifiable criteria when feature is scoped -->

---

## Phase 2 — Architecture & IA

### IA / navigation map
- Ops sidebar → Automation Rules dashboard
- Dashboard CTA → Create canvas
- Rule card click → Edit canvas

### Interaction model (states + transitions)
- Dashboard:
  - Default: hero + rule cards
  - Empty: no rules found for selected tab
  - Toggle update: optimistic status change on card
- Canvas:
  - Pristine: no unsaved changes
  - Dirty: current draft differs from saved snapshot
  - Valid: trigger, conditions, and actions are complete
  - Invalid: missing trigger, incomplete condition row, or incomplete action
  - Saving: primary action disabled while save is in progress
  - Preset start: a preset can prefill trigger, condition, and action

### Data requirements
- Entity: `RuleSummary`
  - Fields: `id`, `name`, `type`, `status`, `enabled`, `team`, `lastRunAt`, `triggerPreview`, `actionPreview`
  - Source: rules API summary list
- Entity: `RuleDefinition`
  - Fields: `summary`, `trigger`, `conditions`, `actions`, `metadata`
  - Source: rules API detail fetch / draft factory
- Entity: `RuleTrigger`
  - Fields: `family`, `signal`, `source` where `source` is internal metadata only and the UI only exposes the trigger text
- Entity: `RuleCondition`
  - Fields: `id`, `parameter`, `operator`, `value`
- Entity: `RuleAction`
  - Fields: `id`, `actionType`, `title`, `description`, `order`
- Entity: `RuleMetadata`
  - Fields: `executionCount`, `successRate`, `lastModified`, `owner`, `environment`

### Component map
- Reusable shared components: `Card`, `Badge`, `Switch`, `Select`, `Input`, `Button`, `Tabs`
- Feature-level composition: `RuleDashboard`, `RuleCard`, `RuleCanvas`, metadata cards, validation banner, preset chooser, trigger picker

### Cross-Feature Dependencies
- Pro360 Dashboard: rule hit counts surface as quality signals on the dashboard
- Reference: docs/modules/DEPENDENCY_MAP.md

---

## Phase 3 — Interface plan

### Screen layout plan
- Screen: Automation Rules dashboard
  - Sections: hero entry point, rules header, tabs, responsive card grid
- Screen: Rule Builder
  - Sections: preset reveal toggle + chooser, trigger section, conditions block, actions block, validation banner, bottom action bar, sticky metadata rail

### Token / design system impact
- New tokens: none expected
- Component variants:
  - `Badge` for active / paused / invalid states
  - existing button hierarchy for primary and secondary actions
- Visual direction:
  - use Pro360 spacing scale, card radius, shadow, and semantic colors
  - preserve ideation layout structure without copying non-Pro360 palette choices

### Implementation order
1. Expand mock interfaces and API helpers for summaries, details, and draft creation.
2. Replace `/rules` with the dashboard hero, tabs, and rule-card grid.
3. Add optimistic toggle and card navigation behaviors.
4. Add `/rules/new` builder with preset chooser, trigger, conditions, actions, metadata, and validation.
5. Reuse the same canvas for `/rules/[ruleId]` with hydrated rule data.
6. Refine responsive behavior and accessibility.

---

## Phase 4 — Implementation Log
> Maintained by: Claude Code | Append-only — never edit existing entries

### 2026-03-20 Dashboard + canvas workflow
**Decision:** Replaced the legacy form-and-table page with a dashboard + separate-route canvas workflow. Added structured mock rule definitions and canvas-ready state handling. Added dedicated create and edit routes for the rule builder.
**Files changed:** `features/rules/mock/rules.ts`, `features/rules/api/index.ts`, `features/rules/components/RuleBuilder.tsx`, `app/(shell)/rules/page.tsx`, `app/(shell)/rules/new/page.tsx`, `app/(shell)/rules/[ruleId]/page.tsx`, `docs/modules/rule-engine.md`, `docs/features/rules.md`
**Next:** Add persistent save/update behavior when backend contracts are ready. Add real team ownership filtering and persisted action ordering. Add future AND/OR group authoring when logic nesting is scoped.

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
