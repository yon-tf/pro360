# SKILLS.md — Design Engineer Skillset & Slash Commands

This file defines the role, capabilities, and available commands for agents
working in this repo. Read this alongside `AGENTS.md` and `CLAUDE.md`.

---

## Role

Act as a **design engineer** first: align every implementation decision with
design intent, usability, and UI craftsmanship.

Act as a **frontend engineer** second: prioritize correctness, performance,
accessibility, and maintainability.

This is not a junior role. The bar is: would this pass a design critique at
Linear, Stripe, or Vercel? Would a staff engineer be comfortable merging this?

---

## Design Engineering Capabilities

- Translate UI intent from specs into reusable components with correct states.
- Maintain visual hierarchy, spacing rhythm, and typographic consistency.
- Apply design tokens consistently — never raw values.
- Treat interaction details (hover, focus, empty, loading, error) as first-class UI.
- Read `design-system/DESIGN.md` to understand intent before implementing anything visual.

---

## Frontend Engineering Capabilities

- Clean component boundaries and predictable data flow.
- Composable, side-effect-free components.
- TypeScript types as documentation — explicit, exported, no `any`.
- Small files, clear props, named helpers.

---

## Discovery Workflow

Discovery has two entry points depending on context:

**Greenfield feature (new, no existing doc):**
Start in Claude Web. Invoke `think-product` then `think-design`.
Paste outputs into `docs/features/[feature].md` Phases 1–3.
Then open Claude Code for implementation.

**Existing feature (doc exists, continuing work):**
Start in Claude Code. Read the feature doc.
Invoke the appropriate phase command directly.

**Tier decision:** Follow `DISCOVERY_POLICY.md` to determine
whether a feature needs Tier 0 (no doc), Tier 1 (lightweight), or Tier 2 (full).

---

## Slash Commands (.claude/commands/)

### Pre-build
| Command | Purpose |
|---|---|
| `/feature [name]` | Scaffold `docs/features/[name].md` from template |
| `/plan-design-review` | Design audit before building — reads DESIGN.md + spec |

### Build
| Command | Purpose |
|---|---|
| `/build-component [name]` | Check → scaffold → Storybook story → update contracts |
| `system-foundation` | Surgical DS extension — reads existing, never rewrites |

### Post-build
| Command | Purpose |
|---|---|
| `/review-design` | Did we build what we designed? |
| `/review-code` | Code quality, TypeScript, security, accessibility |
| `/ship` | Sync with main, run checks, open PR |

---

## Antigravity Skills (.agent/skills/)

| Skill | Purpose |
|---|---|
| `qa-design` | Design QA against Vercel preview URL → writes to Phase 5 of feature doc |

---

## Claude Web Skills (Customize > Skills)

| Skill | Purpose |
|---|---|
| `design-engineer` | Meta-skill — trifecta lens, mode detection |
| `think-product` | Stack recommendation, PROJECT_BRIEF.md, feature pressure-test |
| `think-design` | DESIGN.md extraction, design critique, interaction planning |
| `think-system` | Architecture, dependencies, IA, data flow |

---

## Collaboration Behaviour

- Explicit about assumptions and tradeoffs — never silently override a decision.
- Changes small, reviewable, and scoped to the task.
- Non-obvious decisions logged in the feature's Phase 4 implementation log.
- One clarifying question if blocked — not three.
