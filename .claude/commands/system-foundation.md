# system-foundation

Surgical design system extension. Reads existing DS files first.
Adds tokens, updates contracts, updates DESIGN.md rules.
Never rewrites. Never generates from scratch. Always extends.

## When To Run

- A new token is needed (color, spacing, radius, shadow, typography)
- A component contract needs a new variant or state
- A DESIGN.md rule needs to be added or updated
- The DS is drifting from the running code (audit mode)

## Steps

### 1. Identify what's needed

From $ARGUMENTS or context, determine:
- Token extension? (new value needed)
- Contract extension? (new variant/state needed)
- Rule update? (DESIGN.md needs a new decision)
- Audit? (check current code against DS for drift)

### 2. Read existing (targeted, never full files)

**For token extension:**
```bash
# Find the relevant token category
rg "[category]" design-system/tokens.json
```
Read only the relevant section. Understand the existing naming convention
before adding. Never break the naming pattern.

**For contract extension:**
```bash
rg "[ComponentName]" design-system/component-contracts.md
```
Read the existing component entry. Extend it, don't replace it.

**For rule update:**
Read the relevant section of `design-system/DESIGN.md` only.

**For audit:**
```bash
# Find hardcoded values in code
rg "#[0-9a-fA-F]{3,6}|color:|background-color:" features/ app/ --type tsx
rg "px\b" features/ app/ --type tsx | rg -v "tailwind|className"
```

### 3. Token naming convention

Follow the existing pattern exactly:

```
[category].[tier].[variant]
color.text.primary
color.background.surface-low
color.border.default
spacing.component.gap-sm
radius.component.md
shadow.elevation.low
```

Never invent new naming patterns. Extend existing ones.

### 4. Token addition format (str_replace, surgical)

Add to the correct category in `tokens.json`. Maintain JSON validity.
Never add a token that appears fewer than 3 times in the codebase.

### 5. Contract extension format (str_replace, surgical)

Find the component entry. Add the new variant or state to the existing
entry. Never replace the whole entry.

```markdown
### [ExistingComponent]
**Variants:** existing, existing, [NEW VARIANT]  ← add here
**States:** existing, existing, [NEW STATE]       ← add here
```

### 6. DESIGN.md rule addition (str_replace, surgical)

Find the correct section. Add the new rule in the existing format:
```markdown
- **[Rule name]:** [Explicit instruction — do or don't]
```

### 7. Token mapping update

After adding to `tokens.json`, update `design-system/token-mapping.md`
to document which CSS variable maps to the new token.

### 8. Log the change

```markdown
## [date] DS extension: [what was added]
**Type:** [token / contract / rule]
**Added:** [specific value or rule]
**Used by:** [component or feature that needed it]
**Rationale:** [why this token/rule/variant exists]
```

### 9. Output

```
Design system extended
─────────────────────────────
Type: [token/contract/rule]
Added: [specific entry]
Files changed:
  - design-system/tokens.json (if token)
  - design-system/component-contracts.md (if contract)
  - design-system/DESIGN.md (if rule)
  - design-system/token-mapping.md (if token)

Token count: [category] now has [n] tokens
Next: use [token-name] in your component instead of hardcoded value
```

## Hard Rules

- Never add a token for a value that appears fewer than 3 times. Not yet.
- Never rename existing tokens. Renaming breaks every file that uses them.
- Never rewrite whole files. `str_replace` only.
- Never generate a new tokens.json from scratch. This command extends only.
- If the design system needs a fundamental change: flag it and discuss.
  Don't unilaterally redesign.
