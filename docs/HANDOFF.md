# Handoff Notes — Pro360

This repo is a frontend-only pitch/demo. The focus is clean structure and clear module boundaries for the next engineer to plug in real APIs.

## Quick orientation

- Routes live under `app/(shell)/...` (the shared app chrome). URLs are unchanged by the route group.
- Feature UI lives in `features/<module>/components`.
- Mock data lives in `features/<module>/mock` (placeholder-only).
- Shared UI primitives are in `components/ui`.
- Cross-feature utilities are in `lib/`.

## Mock data contract

- Treat all `features/<module>/mock` files as placeholder-only.
- These define the shape contract for future APIs.
- Replace module-by-module as backend integration begins.

## Known lint warnings (intentional for now)

Lint is clean of errors. The remaining warnings are primarily React hook dependency warnings (and a couple unused-expression warnings) in:

- `app/(shell)/payout/run/[runId]/page.tsx`
- `app/(shell)/pro360/page.tsx`
- `app/(shell)/team/[id]/page.tsx`
- `features/pro360/components/QualityByProfessional.tsx`

These were deferred to avoid behavior changes while the UI is still using mock data.

### When to address

- Fix during backend integration or a dedicated correctness/perf pass.
- If you see stale UI behavior after wiring real data, this is the first place to check.

### Safe patterns to fix

- Wrap derived objects in `useMemo` and include them in dependency arrays.
- Include missing dependencies in `useMemo` / `useCallback` when those values can change.
- Avoid unused-expression warnings by replacing `cond && expr` with an explicit `if (cond) expr`.

## UI migration checklist

- Before new UI work, review `docs/SHADCN_UI_MIGRATION_CHECKLIST.md`.

## Suggested next steps for backend integration

- Add an API layer in `lib/api` (or per-feature `features/<module>/api`).
- Replace `features/<module>/mock` with fetchers returning the same shape.
- Add `typecheck` script and CI checks when wiring data.
 - API stubs now exist for all user-facing modules under `features/<module>/api`.

## Good luck note

Good luck broski or sisturh who is taking this over! The structure is designed so you can replace mocks module-by-module without disrupting the rest of the UI. If anything feels unclear, check the route group layout in `app/(shell)` and the module boundaries under `features/`.
