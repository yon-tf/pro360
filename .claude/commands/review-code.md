# /review-code

Staff-engineer level code review. Checks for correctness, performance,
security, and maintainability issues that pass visual inspection but
cause production problems.

## Steps

### 1. Identify scope
```bash
rg "$ARGUMENTS" features/ app/ --type tsx --type ts -l
```
If $ARGUMENTS is empty, check git diff:
```bash
git diff --name-only main
```
Read the identified files (max 6, targeted sections, max 200 lines each).

### 2. Run the review

**TypeScript correctness**
- No `any` types. No implicit returns on async functions.
- All exported functions have explicit return types.
- Props interfaces exported for reuse.
- No type assertions (`as Type`) unless absolutely necessary and commented.

**Data flow**
- No derived state that could be computed from source props.
- `useMemo` and `useCallback` only where re-render cost is measurable.
- Async fetch logic isolated in `features/[module]/api/` — not in components.
- No direct DOM manipulation in React components.

**Security**
- No sensitive data (tokens, keys, PII) in component state or local storage.
- User-generated content rendered through safe methods (no `dangerouslySetInnerHTML`
  without explicit sanitization).
- API calls validate response shape before using data.

**Performance**
- No N+1 patterns in list renders (mapping → fetching inside map).
- Images use Next.js `<Image>` component, not raw `<img>`.
- Dynamic imports for heavy components not needed on initial render.
- No unnecessary re-renders from unstable object references in props.

**Maintainability**
- Files under 250 lines. Flag anything longer with a split suggestion.
- No magic numbers — all values either tokens or named constants.
- Non-obvious logic has a comment explaining why, not what.
- Index exports per module (`features/[module]/index.ts`).

**Error handling**
- Async operations have try/catch or error boundaries.
- Error states are handled in UI, not silently swallowed.
- Loading states are handled before data is available.

**Accessibility**
- All interactive elements reachable by keyboard.
- All images have `alt` text.
- Form inputs have associated labels.
- Color is never the only means of conveying information.

### 3. Output format

```markdown
## Code Review — [Feature/Files] — [date]

### TypeScript: [PASS / ISSUES]
[Issues with file:line references]

### Data flow: [PASS / ISSUES]
[Issues]

### Security: [PASS / FLAGS]
[Flags]

### Performance: [PASS / FLAGS]
[Flags]

### Maintainability: [PASS / FLAGS]
[Flags]

### Error handling: [PASS / GAPS]
[Gaps]

### Accessibility: [PASS / FLAGS]
[Flags]

### Priority fixes
| Priority | Issue | File:line | Fix |
|---|---|---|---|
| P0 | [blocks ship] | [ref] | [specific fix] |
| P1 | [should fix] | [ref] | [specific fix] |
| P2 | [nice to fix] | [ref] | [specific fix] |

### Verdict: [READY TO SHIP / FIX P0s FIRST / FIX P0s + P1s FIRST]
```

### 4. Auto-fix P0s

P0 issues (security, data loss, broken functionality) get fixed inline
with surgical edits. Show the diff. Log each fix to `04-implementation-log.md`.

P1 and P2: list only. User decides whether to fix before ship.

## Hard Rules

- P0 = security issue, data loss, broken core functionality, type errors
  that will cause runtime failures.
- P1 = performance issue, missing error handling, accessibility violation.
- P2 = style, naming, structure improvement.
- Never reformat code that isn't related to the review scope (AGENTS.md rule).
- Never rename files or folders (AGENTS.md rule).
