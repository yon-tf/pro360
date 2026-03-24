# AGENTS.md — Agent Operating Rules

## Goal
Work in small, safe increments. Prefer diffs over rewrites.
Do not scan the entire repo unless explicitly asked.

---

## How To Work

1. Always start with a **plan (max 8 bullets)**.
2. Propose **file targets (max 5 files)** before editing.
3. Prefer **surgical edits** — patch-style diffs, not full rewrites.
4. Never reformat unrelated code.
5. Never rename files or folders unless explicitly requested.
6. If unsure, ask one clarifying question or choose the conservative default.

---

## Scope Limits

- Use `rg` to locate relevant code — never open dozens of files speculatively.
- Max files to read in one pass: **15**
- Max lines per file to read: **200** (use targeted ranges)
- Max files to modify in one task: **6**

---

## Allowed Commands

```bash
# Search and inspection
rg, ls, cat, sed -n, head, tail

# Git (slash commands only — never run git on your own initiative)
git status, git diff, git add, git commit, git push, git fetch, git rebase

# Package management
npm install, npm run dev, npm run build
npm run lint, npm run typecheck, npm test
pnpm / bun equivalents if present
```

---

## Design System Rules

- Semantic tokens only — `color.text.primary`, never `#hex` or raw `px` values.
- Token explosion rule: if a value appears fewer than 3 times, don't promote it to a token yet.
- Every component built around variants, states, and props — never ad-hoc.
- Read `design-system/DESIGN.md` before any UI work. This is the intent layer.
- Read `design-system/component-contracts.md` before creating any component.
- Read `design-system/tokens.json` before using any value.

---

## Component Quality Bar

- Composable primitives first. One-off page-only components only when genuinely necessary.
- Pure and predictable: inputs via props, outputs via callbacks.
- Controlled components for forms: expose `value`, `defaultValue`, `onChange`.
- Variants via `cva` — never ad-hoc className strings.
- Accessibility non-negotiable: `aria-*` labels, focus states, keyboard navigation.
- Storybook story required for every component in `components/ui/`.
- Split when file exceeds ~250 lines or responsibilities are mixed.

### shadcn/ui usage rules

- Always use shared primitives: `Button`, `Input`, `Select`, `Dialog`, `Popover`,
  `Textarea`, `Checkbox`, `Switch`, `Tooltip`, `DatePicker`.
- Never use raw `<textarea>`, `<input type="checkbox">`, or custom switch elements
  in feature code — use the shadcn wrapper.
- If a primitive is missing from `components/ui/`, add it there first, then consume it.
- Never use Radix UI directly in feature pages — always go through the wrapper.
- Date rendering in client components: always set `timeZone` to avoid SSR/CSR mismatch.

**Known exceptions:**
- File upload: native `<input type="file">` hidden input is fine.
- Custom row wrappers: may stay as native `<button>` when `Button` changes layout semantics.

---

## Architecture & Structure

```
app/(shell)/          ← authenticated route pages
features/[module]/
  api/                ← data fetching and mutations (no UI)
  components/         ← UI components for this module
  mock/               ← mock data for dev and testing
  index.ts            ← named exports only
components/ui/        ← shared owned primitives (shadcn/ui base)
lib/                  ← cross-feature utilities, side-effect free
design-system/        ← DESIGN.md, tokens.json, component-contracts.md
docs/
  features/           ← one flat .md file per feature (all phases)
  modules/            ← module-level user flows + dependency map
.claude/commands/     ← Claude Code slash commands
.agent/skills/        ← Antigravity QA skills
```

---

## State & Data Flow

- Derived values in `useMemo`, handlers in `useCallback` — only when non-trivial.
- Never store derived state that can be computed from source props.
- Async fetch logic lives in `features/[module]/api/` — UI components stay data-agnostic.
- State hierarchy: URL state → server state (React Query) → component state → global (Zustand last resort).

---

## Styling & Theming

- Design tokens and CSS variables for all colors, radius, spacing, typography.
- No magic numbers unless they map directly to a token.
- All visual states required: default, hover, active, focus, disabled, loading, empty.

---

## Performance & DX

- Memoize only when re-render cost is measurable — not preemptively.
- Prefer typed props and exported interfaces for reuse.
- Dynamic imports for heavy components not needed on initial render.

---

## Documentation

- Log every non-obvious implementation decision in the feature's Phase 4 log.
 

---

## Design Tool Boundary

**Claude Code and Codex: codebase only.**
Read design context from `design-system/` files. Write code only.
Never write directly to any design tool.

**Figma MCP (read-only reference):**
Available for reading component specs or design context when needed.
Never a source of truth. Never written to from Claude Code.

**Penpot MCP (optional, when connected):**
`claude mcp add penpot -t http http://localhost:4401/mcp`
Read component specs or push rendered UI for visual review.
Optional — never a required step.

**Active QA tool:**
Antigravity via `.agent/skills/qa-design/` — writes findings to Phase 5 of the feature doc.

---

## Output Format

Every response includes:
1. Summary of what was done
2. List of changed files
3. Next steps
