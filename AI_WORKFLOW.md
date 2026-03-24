# AI Workflow — Phased, Tool-Agnostic

The core principle: **never build everything at once.**
Move through phases. Keep one feature doc as the source of truth.
Stop at each checkpoint. Get explicit approval before proceeding.

---

## Source of Truth

Each feature has exactly one doc: `docs/features/[feature].md`

All phases live in that file. Nothing is split across directories.
Use `docs/features/_FEATURE_TEMPLATE.md` to scaffold new features.

---

## Inputs

- Rough notes, a problem statement, or a mini-PRD
- Optional: Stitch-generated screens, reference images, existing UI screenshots
- For new projects: run `think-product` in Claude Web first to generate a PROJECT_BRIEF

---

## Tier Decision (before any phase)

Read `docs/DISCOVERY_POLICY.md` to decide how much discovery is needed:

| Change type | Tier | Doc required? |
|---|---|---|
| Copy, spacing, minor UI | 0 | No |
| New screen or workflow | 1 | Lightweight |
| Multi-step flow, new data model, cross-module | 2 | Full |

Tier 0 goes straight to implementation. Tiers 1–2 follow the phases below.

---

## Phase 1 — Discovery

**Goal:** Clarify why and what before anything else.

**Entry point:**
- Greenfield: Claude Web → `think-product` skill → paste output into Phase 1
- Existing feature continuation: Claude Code → read feature doc → update Phase 1

**Agent actions:**
- Read `AGENTS.md` + `SKILLS.md`
- Apply discovery tier from `DISCOVERY_POLICY.md`
- Populate Phase 1 in `docs/features/[feature].md` only
- Do not touch Phase 2 or beyond

**Example prompt:**
```
Phase 1 only. Here's my rough notes for [feature].
Populate Phase 1 in docs/features/[feature].md using the template.
Do not implement UI.
```

**Checkpoint — stop and ask:**
- Is the problem framing correct?
- Are the user flow and routes accurate?
- Anything missing before Phase 2?

Proceed only after explicit approval.

---

## Phase 2 — Architecture & IA

**Goal:** Define structure before UI. No code yet.

**Entry point:** Claude Web → `think-system` skill → paste output into Phase 2

**Agent actions:**
- Read Phase 1 of the feature doc
- Read `docs/modules/DEPENDENCY_MAP.md`
- Populate Phase 2: IA, navigation, data requirements, component map
- Flag any cross-feature dependencies

**Example prompt:**
```
Phase 2 for [feature]. Update docs/features/[feature].md with IA,
interaction model, data requirements, and component map. No UI yet.
```

**Checkpoint — stop and ask:**
- Does the IA map look right?
- Are data requirements complete?
- Any component map changes before Phase 3?

Proceed only after explicit approval.

---

## Phase 3 — Interface Plan

**Goal:** Commit to the UI approach before writing code.

**Entry point:** Claude Web → `think-design` skill → paste output into Phase 3

**Agent actions:**
- Read Phases 1–2 of the feature doc
- Read `design-system/DESIGN.md`
- Run `/plan-design-review` to audit the plan before approving build
- Populate Phase 3: screens, states, interactions, microcopy, component mapping

**Example prompt:**
```
Phase 3 for [feature]. Update docs/features/[feature].md with interface
plan, states, and implementation order.
```

**Checkpoint — stop and ask:**
- Is the layout plan correct?
- Any token or variant changes?
- Ready to implement?

Proceed only after explicit approval.

---

## Phase 4 — Implementation

**Goal:** Build UI in small, safe increments.

**Agent actions:**
- Check the shadcn/ui rules in `AGENTS.md` before any UI work
- Read `design-system/DESIGN.md` before any component work
- Use `/build-component [name]` for new components
- Build UI in `features/[module]/components/`
- Use mock data in `features/[module]/mock/`
- Add API stubs in `features/[module]/api/`
- Update routes under `app/(shell)/`
- Append to Phase 4 log in the feature doc after each increment

**Example prompt:**
```
Phase 4 for [feature]. Implement the UI based on the Phase 3 plan.
Append to Phase 4 log with summary, files changed, and follow-ups.
```

**Checkpoint — stop and ask:**
- Are changes aligned with the plan?
- Any adjustments before next increment?

**Run before proceeding to Phase 5:**
```
/review-design   → did we build what we designed?
/review-code     → code quality, TypeScript, security, accessibility
```

---

## Phase 5 — Debug & Finetune

**Goal:** Stabilise behaviour and polish UX based on real usage.

**Entry points:**
- Antigravity: open project folder → `qa-design` skill → give Vercel preview URL
- Claude Code: read Phase 5 log entries → fix flagged issues

**Agent actions:**
- Debug issues found during review or QA
- Tighten all UI states: loading, empty, error, disabled, focus
- Reduce regressions and edge cases
- Append to Phase 5 log in the feature doc

**Example prompt:**
```
Phase 5 for [feature]. Debug and finetune based on QA findings.
Append to Phase 5 log with fixes, files changed, and remaining risks.
```

**Checkpoint — stop and ask:**
- Do fixes resolve reported issues?
- Any remaining rough edges before closing?

**Ship when Phase 5 is clean:**
```
/ship
```

---

## Slash Command Reference

| Phase | Command | Purpose |
|---|---|---|
| Pre-1 | `/feature [name]` | Scaffold feature doc |
| Pre-4 | `/plan-design-review` | Audit plan before build |
| 4 | `/build-component [name]` | Build with DS awareness |
| 4 | `system-foundation` | Extend DS if token missing |
| 4→5 | `/review-design` | Post-build design check |
| 4→5 | `/review-code` | Code quality check |
| 5 | `qa-design` (Antigravity) | Visual QA on Vercel preview |
| Post-5 | `/ship` | Sync, check, PR |
