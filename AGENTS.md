# AGENTS.md — Repo Agent Operating Rules

## Goal
Work in small, safe increments. Prefer diffs over rewrites. Do not scan the entire repo unless explicitly asked.

## How to work
1) Always start with a **Plan (max 8 bullets)**.
2) Then propose **File targets** (max 5 files) before editing.
3) Prefer **surgical edits** and **patch-style diffs**.
4) Never reformat unrelated code.
5) Never rename files/folders unless requested.
6) If unsure, ask a single clarifying question OR choose a conservative default.

## Scope limits (default)
- Use `ripgrep (rg)` to locate relevant code; do not open dozens of files.
- Max files to read in one pass: **15**
- Max lines per file to read: **200** (use targeted ranges)
- Max files to modify in one task: **6**

## Commands you may run
- `rg`, `ls`, `cat`, `sed -n`, `head`, `tail`
- `npm test`, `pnpm test`, `bun test` (whichever exists)
- `npm run lint`, `npm run typecheck`, `npm run build` (only when needed)

## Design system principles
- Prefer **semantic tokens** (e.g. `color.text.primary`) over raw values.
- Avoid token explosion: if a value appears < 3 times, don’t make a token yet.
- Components should be built around **variants/states/props**.

## Component quality bar
- Build **composable primitives** first; avoid one-off page-only components unless necessary.
- Keep components **pure + predictable**: inputs via props, outputs via callbacks.
- Prefer **controlled components** for forms; expose `value`, `defaultValue`, `onChange`.
- Define **variants** using `cva`/class-variance patterns; avoid ad-hoc class soup.
- Ensure **accessibility**: labels, focus states, `aria-*`, keyboard navigation.
- Keep layout flexible: avoid hard-coded widths unless the design demands it.

## Architecture & structure
- Feature code lives in `features/<module>/...` with `components`, `mock`, and (when needed) `api`.
- Shared UI primitives stay in `components/ui`.
- Cross-feature helpers live in `lib/` and must be **side-effect free**.
- Prefer **index exports** per module to reduce import churn.

## State & data flow
- Keep derived values in `useMemo` and handlers in `useCallback` when non-trivial.
- Avoid derived state when it can be computed from source props/state.
- For async: isolate fetch logic in `features/<module>/api` (or `lib/api`) and keep UI components data-agnostic.

## Styling & theming
- Use design tokens / CSS variables for colors, radius, spacing, and typography.
- Avoid magic numbers unless they map directly to the design system.
- Ensure visual states: default, hover, active, focus, disabled, loading, empty.

## Performance & DX
- Avoid unnecessary re-renders; memoize only when it matters.
- Keep components small; split when file > ~250 lines or responsibilities are mixed.
- Prefer typed props and exported types for reuse.

## Documentation
- For non-obvious components, add a short usage example in the file or `docs/`.
- Update `docs/HANDOFF.md` if you introduce new architectural patterns.

## Figma operations (IMPORTANT)
We use two different integrations:

### 1) Codex = CODEBASE ONLY (read/modify repo files)
- Codex may read and edit code in this repository.
- Codex must NOT attempt to write into Figma using the official Figma MCP capture flow.
- If asked to create or edit Figma frames/components, Codex should instead output a short “Figma Build Plan” OR instruct the Talk To Figma plugin tools to do the writing.

### 2) Talk To Figma plugin = FIGMA WRITES
- All Figma writing actions (create frames, text, rectangles, components) MUST be executed via the Talk To Figma MCP Plugin (websocket bridge).
- Assume the plugin is connected on port 3055 and a micro-write test has succeeded.
- Write actions must be chunked: max 24 nodes per run.
- After each write run, STOP and confirm what was created.

### Working pattern
- Codex produces artifacts in /design-system:
  - tokens.json
  - token-mapping.md
  - component-contracts.md
- Then Talk To Figma writes the Figma DS file:
  - 00 Tokens (swatches/scales)
  - 01 Components (masters only)
- Human converts masters → component sets in Figma.

## Output expectations
- Provide: summary, changed files list, and next steps.

## UI work reminder
- For any UI change, consult `docs/SHADCN_UI_MIGRATION_CHECKLIST.md` before editing.
