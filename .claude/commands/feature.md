# /feature

Scaffold a new feature doc from the project template.
Run this before writing any code for a new feature.
Creates a single flat file — not a directory.

## Steps

### 1. Check tier
Ask: "What's the scope — minor screen, new workflow, or cross-module feature?"
Map to Tier 0/1/2 per `docs/DISCOVERY_POLICY.md`.
If Tier 0: stop. "Tier 0 changes don't need a feature doc. Go build it."

### 2. Check if doc exists
```bash
ls docs/features/$ARGUMENTS.md
```
If exists: "docs/features/$ARGUMENTS.md already exists. Open it and continue
from the current phase." Stop.

### 3. Scaffold the flat file
Copy `docs/features/_FEATURE_TEMPLATE.md` to `docs/features/$ARGUMENTS.md`.

Set the header:
```markdown
# Feature: $ARGUMENTS
> Tier: [detected tier] | Created: [today's date] | Status: discovery
```

### 4. Check DEPENDENCY_MAP.md
```bash
rg "$ARGUMENTS" docs/modules/DEPENDENCY_MAP.md
```
If found as a dependency: add a note to Phase 2 cross-feature section.

### 5. Log to Phase 4
```markdown
### [date] Feature scaffolded
**Decision:** Created docs/features/$ARGUMENTS.md
**Tier:** [0/1/2]
**Next:** [Tier 1: Claude Web think-product → paste into Phase 1 / Tier 2: Claude Web think-product + think-system + think-design → paste into Phases 1-3]
```

### 6. Output
```
Scaffolded: docs/features/$ARGUMENTS.md

Tier: [tier] — [what phases are required]

Next steps:
[Tier 1]: Claude Web → think-product → paste into Phase 1
          Claude Web → think-design → paste into Phase 3
          Then: /plan-design-review → /build-component

[Tier 2]: Claude Web → think-product → paste Phase 1
          Claude Web → think-system → paste Phase 2
          Claude Web → think-design → paste Phase 3
          Then: /plan-design-review → /build-component
```

## Rules
- One flat file. Never create a subdirectory for a feature.
- Never create implementation files from this command — docs only.
- If $ARGUMENTS is missing: "Usage: /feature [feature-name]"
