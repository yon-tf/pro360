# PR Checklist

Use this checklist for any non-trivial change.

## Discovery
- Feature doc created/updated (if Tier 1 or Tier 2): `docs/features/<feature>.md`
- Scope and routes confirmed

## UI consistency
- Shared UI primitives used (`components/ui`) — see shadcn/ui rules in `AGENTS.md`

## Code quality
- Changes are scoped and minimal
- No unrelated formatting changes
- Types and props are explicit and readable

## Mock data + API
- Mock data stays in `features/<module>/mock`
- If creating API stubs, use `features/<module>/api`

## Checks
- `npm run lint` (when appropriate)
- `npm run typecheck` (if script exists)

