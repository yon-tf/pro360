# CLAUDE.md — Session Bootstrap

Read this file first, every session. Then read `AGENTS.md` and `SKILLS.md`.

---

## What This Project Is

PRO360 is a B2B professional services platform built with:
- **Next.js 14+** (App Router) + **TypeScript** + **Tailwind CSS** + **shadcn/ui**
- Deployed on **Vercel** — every PR gets a preview URL automatically

Read `docs/PRO360_PRD.md` for full product context before any feature work.

---

## Read Order Every Session

1. `CLAUDE.md` (this file)
2. `AGENTS.md` — operating rules, scope limits, tool boundary
3. `SKILLS.md` — role, capabilities, available commands
4. `docs/features/[feature].md` — the active feature doc (all phases in one file)

---

## Feature Doc Structure

Every feature lives in a single flat file: `docs/features/[feature].md`

```
docs/features/gig.md
docs/features/payout.md
docs/features/appointments.md
...
```

Each file contains all phases:
- Phase 1 — Discovery
- Phase 2 — Architecture & IA
- Phase 3 — Interface Plan
- Phase 4 — Implementation Log (append-only, agent writes)
- Phase 5 — Debug & Finetune (append-only, Antigravity + agent write)

**Never create subdirectories for features.** One file, all phases.

---

## Before Starting Any Task

### New feature
1. Check `DISCOVERY_POLICY.md` — what tier is this?
2. Run `/feature [name]` to scaffold `docs/features/[name].md` (single flat file)
3. If Tier 1 or 2: go to Claude Web first, invoke `think-product` + `think-design`
4. Paste outputs into the feature doc Phases 1–3
5. Run `/plan-design-review` before writing any code

### Existing feature
1. Read `docs/features/[feature].md` in full — all phases
2. Read `docs/modules/DEPENDENCY_MAP.md` — what does this touch?
3. Never modify a dependent module without flagging the impact

### Any UI change
1. Check the shadcn/ui rules in `AGENTS.md` first
2. Read `design-system/DESIGN.md` — full read, every time
3. Run `rg` before creating any component — never duplicate

### Any component
1. `rg [ComponentName] components/ui/ features/ --type tsx -l`
2. Read `design-system/component-contracts.md` — does it exist?
3. Read `design-system/tokens.json` — what tokens apply?
4. Run `/build-component [name]` if new

### Any DS value
- No hardcoded hex, px, or magic numbers. Ever.
- If the token doesn't exist: run `system-foundation` to add it first.

---

## Phased Workflow

Follow `AI_WORKFLOW.md` for the full phased process with Socratic
checkpoints. In brief:

```
Phase 1 — Discovery        → understand why and what
Phase 2 — Architecture     → define structure before UI
Phase 3 — Interface Plan   → commit to UI approach before code
Phase 4 — Implementation   → build in small safe increments
Phase 5 — Debug & Finetune → stabilise, polish, edge cases
```

**Socratic checkpoints are not optional.** Stop at the end of each phase
and confirm with the user before proceeding.

---

## Slash Commands

See `SKILLS.md` for the full command list. Quick reference:

```
/feature [name]         → scaffold feature doc
/plan-design-review     → design audit before building
/build-component [name] → check → scaffold → story → contracts
/review-design          → post-build design check
/review-code            → code quality check
/ship                   → sync, check, PR
system-foundation       → extend DS tokens/contracts
```

---

## Logging Rules

Phase 4 and Phase 5 in the feature doc are **append-only**.

Phase 4 entry format:
```markdown
### [YYYY-MM-DD] [Short description]
**Decision:** [What was decided]
**Why:** [Reasoning]
**Files changed:** [list]
```

Phase 5 entry format:
```markdown
### [YYYY-MM-DD] [Issue or polish item]
**Found by:** [Review / Antigravity QA / user feedback]
**Fix:** [What was done]
**Files changed:** [list]
```

Agent writes these. Not the user.

---

## Design System Read Order

```
design-system/DESIGN.md              → WHY (intent, rules, personality)
design-system/tokens.json            → WHAT (values)
design-system/component-contracts.md → HOW (component behaviour)
design-system/token-mapping.md       → WHERE (token to CSS variable)
```

Read top-down. Never skip a layer for UI work.

---

## Cross-Feature Awareness

Read `docs/modules/DEPENDENCY_MAP.md` before any cross-feature work.
Never change a load-bearing module without flagging downstream impact first.

---

## Commit Convention

```
feat(module): description
fix(module): description
ds: design system change
docs: documentation update
refactor(module): description
qa: phase 5 / QA update
```

---

## gstack (if installed)

If `.claude/skills/gstack/` exists:
- Use `/browse` for all web browsing and visual inspection
- Use `/ship` for release (sync + test + PR)
- Use `/review` for non-DS-specific code review

Do NOT use gstack's `/plan-design-review`, `/design-consultation`,
or `/qa-design-review` — they conflict with our `design-system/DESIGN.md`.
