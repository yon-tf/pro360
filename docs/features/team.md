# Feature: Team Management
> Tier: 2 | Created: 2026-03-20 | Status: implementation

---

## Phase 1 — Discovery

### Problem & goal
- Help ops manage pods, leaders, and assignments.
- Provide visibility into pod composition and changes.

### Personas / primary user
- Primary user: Clinical Ops
- Secondary user: Pod lead

### User flow (high‑level)
1. Open Team list.
2. View pod details or create a new pod.
3. Reassign or remove professionals.

### Screens & routes
- Route: `/team`
  - Screen: Team Pods
  - Purpose: List and manage pods.
- Route: `/team/[id]`
  - Screen: Pod Detail
  - Purpose: Pod overview, roster, history.
- Route: `/team/unassigned`
  - Screen: Unassigned Professionals
  - Purpose: Assign to pods.

### Scope — What This Is Not
<!-- Add explicit exclusions when scope is defined -->

### Risks & open questions
- Define pod leadership rules and history audit.

### Success Criteria
<!-- Add observable, verifiable criteria when feature is scoped -->

---

## Phase 2 — Architecture & IA

### IA / navigation map
- Ops sidebar → Team

### Interaction model (states + transitions)
- Loading: pods list skeleton.
- Empty: no pods.
- Error: failed to load pod data.

### Data requirements
- Entity: Pod
  - Fields: id, name, leader, members
  - Source: team API

### Component map
- Reusable components: Table, Dialogs (DeletePod, UnassignedTfp)
- New components: PodRosterCard (optional)

### Cross-Feature Dependencies
<!-- Reference docs/modules/DEPENDENCY_MAP.md -->

---

## Phase 3 — Interface plan

### Screen layout plan
- Screen: Team Pods
  - Sections: pods list, actions
- Screen: Pod Detail
  - Sections: header, roster, history

### Token / design system impact
- New tokens: none expected
- Component variants: Badge (status)

### Implementation order
1. Pods list
2. Pod detail
3. Unassigned flow

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
