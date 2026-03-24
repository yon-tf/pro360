# /review-design

Post-build design review. Compare implemented UI against the interface plan
and DESIGN.md. Catches drift between intent and implementation before QA.

Run after building, before pushing to Vercel for Antigravity QA.

## Steps

### 1. Read context
```
design-system/DESIGN.md
docs/features/$ARGUMENTS/03-interface-plan.md
docs/features/$ARGUMENTS/04-implementation-log.md
```

Then read the implementation files:
```bash
rg "$ARGUMENTS" app/ features/ --type tsx -l
```
Read the returned files (max 5, targeted sections).

### 2. Compare intent to implementation

For each screen or component in the interface plan, check:

**Token compliance**
```bash
rg "color:|background:|#[0-9a-fA-F]|px\b" features/$ARGUMENTS/ app/\(shell\)/$ARGUMENTS/ --type tsx
```
Flag any hardcoded values. Every value should reference a token or Tailwind
class that maps to a token.

**Variant completeness**
- Are all planned variants implemented?
- Are all states (empty, loading, error, success, disabled) implemented?
- Do states match DESIGN.md rules?

**Pattern fidelity**
- Are forms using the correct pattern (wizard/single-page/progressive)?
- Are borders absent where DESIGN.md prohibits them?
- Are background color shifts used correctly?
- Is spacing using the base unit system?

**Component usage**
- Are existing components from `components/ui/` being used?
- Are any components being recreated inline instead of imported?

**Accessibility**
```bash
rg "aria-|role=|tabIndex|onKeyDown" features/$ARGUMENTS/ --type tsx
```
Flag any interactive elements missing aria labels or keyboard handlers.

### 3. Output format

```markdown
## Design Review — [Feature] — [date]
**Mode:** Post-build
**Compared against:** docs/features/$ARGUMENTS/03-interface-plan.md

### Token compliance: [PASS / VIOLATIONS FOUND]
[List any hardcoded values with file + line reference]

### State coverage: [COMPLETE / MISSING STATES]
| Component | Missing state |
|---|---|
| [name] | [state] |

### Pattern fidelity: [PASS / DEVIATIONS FOUND]
[List deviations from DESIGN.md rules]

### Component reuse: [CLEAN / INLINE DUPLICATION]
[List any components being recreated instead of imported]

### Accessibility: [PASS / FLAGS]
[List missing aria labels or keyboard handlers]

### Overall: [READY FOR QA / NEEDS FIXES FIRST]
```

### 4. If READY FOR QA

Log to `04-implementation-log.md`:
```markdown
## [date] Design review: passed
**Verdict:** Ready for Antigravity QA
**Notes:** [any minor observations]
```

Tell the user: "Push to Vercel preview. Then open Antigravity and run
the qa-design skill with the preview URL."

### 5. If NEEDS FIXES

List each fix with file path and specific change needed.
Make surgical fixes inline if they're < 5 lines each.
Log all changes to `04-implementation-log.md`.
Re-run this command after fixes.

## Hard Rules

- This command reads implementation files and evaluates. Surgical fixes only.
- Never rewrite a whole component file from this command.
- Never redesign — evaluate against the existing spec, not your preferences.
