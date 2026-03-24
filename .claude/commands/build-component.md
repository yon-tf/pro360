# /build-component

Scaffold a new component with full design-system awareness.
Three mandatory outputs: component file, Storybook story, contracts update.

## Steps

### 1. Check existence (rg first, always)
```bash
rg "$ARGUMENTS" components/ui/ features/ --type tsx -l
```
If found: list the file and ask "Extend this or create a new variant?"
Stop and wait for answer.

### 2. Read design system context (targeted reads only)
Read these three files. Do not read entire files — use targeted sections:
- `design-system/DESIGN.md` — full read (intent layer, must understand completely)
- `design-system/component-contracts.md` — search for $ARGUMENTS and related patterns
- `design-system/tokens.json` — search for relevant token categories only

### 3. Determine location
```
Shared primitive (used across 2+ features):  components/ui/[ComponentName].tsx
Feature-specific (one feature only):          features/[module]/components/[ComponentName].tsx
```

### 4. Scaffold the component

Requirements (non-negotiable):
- TypeScript with explicit exported types
- `cva` for variants — never ad-hoc className strings
- All states: default, hover, focus, active, disabled, loading, empty (where applicable)
- Semantic tokens only — no hardcoded hex, px, or magic numbers
- `aria-*` labels on all interactive elements
- Keyboard navigation for interactive components
- Controlled pattern for form inputs: expose `value`, `defaultValue`, `onChange`
- Props documented with JSDoc if non-obvious

Component structure:
```tsx
// [ComponentName].tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const [componentName]Variants = cva(
  '[base classes using semantic tokens]',
  {
    variants: {
      variant: {
        default: '[token-based classes]',
        // defined variants from contracts
      },
      size: {
        sm: '[token-based classes]',
        md: '[token-based classes]',
        lg: '[token-based classes]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface [ComponentName]Props
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof [componentName]Variants> {
  // additional props
}

export function [ComponentName]({ variant, size, className, ...props }: [ComponentName]Props) {
  return (
    <element
      className={cn([componentName]Variants({ variant, size }), className)}
      {...props}
    />
  )
}
```

### 5. Scaffold the Storybook story (mandatory)

```tsx
// [ComponentName].stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { [ComponentName] } from './[ComponentName]'

const meta: Meta<typeof [ComponentName]> = {
  title: '[Location]/[ComponentName]',
  component: [ComponentName],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof [ComponentName]>

// One story per variant defined in contracts
export const Default: Story = {}

export const [VariantName]: Story = {
  args: {
    variant: '[variant]',
  },
}

// Always include these state stories:
export const Disabled: Story = {
  args: { disabled: true },
}

export const Loading: Story = {
  args: { loading: true }, // if component has loading state
}
```

### 6. Update component-contracts.md (mandatory)

Add entry using str_replace. Find the correct alphabetical position.
Never rewrite the whole file.

```markdown
### [ComponentName]
**Location:** `[path]`
**Use for:** [specific use case]
**Variants:** [list]
**States:** default, hover, focus, disabled[, loading, empty if applicable]
**Tokens used:** [list semantic tokens]
**Do not use for:** [anti-patterns]
**Story:** `[ComponentName].stories.tsx`
```

### 7. Log the decision

Append to `docs/features/[relevant-feature]/04-implementation-log.md`
or `docs/IMPLEMENTATION_LOG.md` if cross-feature:

```markdown
## [date] New component: [ComponentName]
**Location:** [path]
**Variants:** [list]
**Tokens:** [list]
**Story:** created
**Contracts:** updated
**Why new (not extending existing):** [reason]
```

### 8. Output summary

```
Built: [ComponentName]
─────────────────────────────
Component:  [path]/[ComponentName].tsx
Story:      [path]/[ComponentName].stories.tsx
Contracts:  updated (component-contracts.md)
Log:        updated (04-implementation-log.md)

Variants: [list]
States: default, hover, focus, disabled[, loading, empty]
Tokens used: [list]

Run: npm run storybook → verify all stories render correctly
```

## Hard Rules

- Never hardcode a design value. If a token doesn't exist for what you need,
  stop and run `system-foundation` first.
- Never skip the story. A component without a story is undocumented.
- Never skip the contracts update. An undocumented component gets rebuilt.
- Never exceed 250 lines in a single component file. Split if needed.
- If $ARGUMENTS is missing: "Usage: /build-component [ComponentName]"
