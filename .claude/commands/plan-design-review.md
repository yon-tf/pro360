# /plan-design-review

Design audit gate before building. Run this after specs exist but before
writing implementation code. Catches design system violations, missing states,
and pattern inconsistencies before they become technical debt.

## When To Run

Mandatory before implementing any new screen or significant UI change.
Optional (but recommended) before adding a new component variant.

## Steps

### 1. Read context (targeted, in order)
```
design-system/DESIGN.md              ← intent layer, full read
design-system/component-contracts.md ← existing patterns, full read
docs/features/$ARGUMENTS/03-interface-plan.md ← what's planned
docs/features/$ARGUMENTS/02-ia.md    ← IA context
```

If `$ARGUMENTS` not provided, ask: "Which feature are you reviewing?"

### 2. Run the audit

Evaluate the interface plan against these dimensions:

**Design language compliance**
- Does the plan follow DESIGN.md rules explicitly?
- Any proposed patterns that violate stated rules? (e.g., using borders where
  background shifts are required, hardcoded values where tokens exist)

**Component reuse**
- Which planned UI elements already exist in component-contracts.md?
- Which are net-new? Are they genuinely new or a variant of something existing?
- Flag any "almost existing" components — better to extend than duplicate.

**State completeness**
- Every screen must account for: empty, loading, error, success, edge cases
- Every interactive element must account for: hover, focus, active, disabled
- Flag any missing states in the plan

**Information hierarchy**
- Is the most important thing visually dominant?
- Is the hierarchy consistent with other screens in the product?

**Interaction patterns**
- Are forms using the correct pattern (wizard/single-page/progressive)?
- Are modals used only when interruption is genuinely necessary?
- Are destructive actions guarded appropriately?

**Accessibility flags**
- Any patterns that will be difficult to make accessible?
- Color-only information encoding?
- Complex interactions without keyboard paths?

### 3. Output format

```markdown
## Plan Design Review — [Feature] — [date]

### Design language: [PASS / NEEDS WORK]
[Findings or "No violations found"]

### Component reuse opportunities
| Planned element | Existing component | Action |
|---|---|---|
| [element] | [component] | Use as-is / Extend / New |

### Missing states
| Screen/Component | Missing state | Required because |
|---|---|---|
| [name] | [state] | [reason] |

### Pattern flags
- [Flag with specific recommendation]

### Accessibility flags
- [Flag with specific recommendation]

### Verdict
**[CLEAR TO BUILD / NEEDS REVISION]**

[If NEEDS REVISION: list the 1-3 specific changes needed before building.
Be surgical. Don't rewrite the spec — call out exactly what to fix.]
```

### 4. If CLEAR TO BUILD

Log to `04-implementation-log.md`:
```markdown
## [date] Plan design review: passed
**Reviewer:** Claude Code /plan-design-review
**Spec:** docs/features/$ARGUMENTS/03-interface-plan.md
**Verdict:** Clear to build
**Notes:** [any minor observations that don't block build]
```

### 5. If NEEDS REVISION

Do not log as passed. Tell the user specifically what to update in the spec
before running this command again. Do not start building.

## Hard Rules

- This command reads and evaluates. It does not write code.
- If DESIGN.md doesn't exist: stop. "Run think-design in Claude Web to create
  design-system/DESIGN.md before reviewing any plans."
- If 03-interface-plan.md doesn't exist: stop. "No interface plan found.
  Run think-design in Claude Web to create one first."
