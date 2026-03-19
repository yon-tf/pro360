# Contributing

This document is for any developer — frontend, backend, or full-stack —
picking up this codebase. Read it before writing a line of code.

---

## Stack

See `TECH_STACK.md` for the full rationale. In brief:

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode — no `any`, no implicit types)
- **Styling:** Tailwind CSS + design tokens (never hardcode values)
- **Components:** shadcn/ui base, owned and modified in `components/ui/`
- **State:** React Query for server state, `useState` for local, Zustand only if needed
- **Testing:** Vitest + Testing Library (run `npm test`)
- **Component docs:** Storybook (run `npm run storybook`)
- **Deployment:** Vercel (auto-deploys on PR, production on main merge)

---

## Before You Write Code

### Understand the feature
Every feature has docs in `docs/features/[feature]/`:
- `01-discovery.md` — why this exists
- `02-ia.md` — information architecture and mental model
- `03-interface-plan.md` — what it should look and feel like
- `04-implementation-log.md` — decisions already made and why
- `05-qa-log.md` — QA findings

**Read all of these before touching the code.** The implementation log
explains non-obvious decisions. If you override a decision without reading
the log, you'll reintroduce a problem that was already solved.

### Understand the design system
Before creating any component or writing any CSS:
1. Read `design-system/DESIGN.md` — the design language and its rules
2. Read `design-system/component-contracts.md` — what components exist
3. Check `design-system/tokens.json` — use these, never hardcode values

If a token doesn't exist for what you need, ask before hardcoding.

### Check what already exists
```bash
# Find existing components
rg "[ComponentName]" components/ui/ features/ --type tsx -l

# Find existing utilities
rg "[functionName]" lib/ --type ts -l
```

`rg` before creating. Never duplicate what exists.

---

## Code Conventions

### TypeScript
- Strict mode. No `any`. No type assertions without a comment explaining why.
- All exported functions have explicit return types.
- All component props have exported interfaces.

### Components
- Variants via `cva` (class-variance-authority). Never ad-hoc className strings.
- All states implemented: default, hover, focus, active, disabled.
- Accessible: `aria-*` labels, keyboard navigation, focus visible states.
- Under 250 lines per file. Split if longer.
- Storybook story required for every component in `components/ui/`.

### File structure
```
features/[module]/
  api/        ← data fetching, mutations (no UI here)
  components/ ← UI components specific to this module
  mock/       ← mock data for development and testing
  index.ts    ← exports (named, not default)
```

### Imports
Use path aliases, not relative paths:
```ts
import { Button } from '@/components/ui/Button'
import { useGigs } from '@/features/gig'
import { cn } from '@/lib/utils'
```

---

## Backend Handoff (Work Projects)

If you are a backend developer joining this project:

**The frontend is designed to be backend-agnostic.** Data fetching is
isolated in `features/[module]/api/`. Mock data in `features/[module]/mock/`
shows the expected data shape.

**API contract:** The data shapes used by the UI are documented in
`docs/API_CONTRACTS.md` (if present). If it doesn't exist, derive from
the mock data in `features/[module]/mock/`.

**Do not modify** `components/ui/`, `design-system/`, or `docs/features/`
unless you are also the product/design owner. These are the frontend's
source of truth.

---

## Running Locally

```bash
npm install
npm run dev          # localhost:3000
npm run storybook    # localhost:6006 — component library
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm test             # Vitest
npm run build        # Production build check
```

**Before every PR:** run `typecheck`, `lint`, and `test`. The CI will catch
failures, but catching locally is faster.

---

## Commit Convention

```
feat(module): what was added
fix(module): what was fixed
ds: design system change
docs: documentation only
refactor(module): what was restructured
qa: QA log update
```

One logical change per commit. If you can't describe it in one line,
split it into multiple commits.

---

## PR Process

1. Branch from `main` (`git checkout -b feat/[feature-name]`)
2. Make changes
3. Run checks (`npm run typecheck && npm run lint && npm test`)
4. Push → Vercel preview auto-deploys
5. Open PR — the description template is in `.github/pull_request_template.md`
6. Get review → merge

PRs should be small. If a PR touches more than 6 files unrelated to each
other, consider splitting it.

---

## Questions

Check `docs/features/[feature]/04-implementation-log.md` first —
the answer is probably already there. If not, ask.
