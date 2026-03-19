# DS Inventory (Codebase-Only, No Figma)

## Scope + method
- Read: `AGENTS.md`, `DS_SCOPE.md`
- Discovery: targeted `rg` only
- Files opened: 10 total (2 instruction/scope + 8 source-value files)

## 1) Styling approach
- **Primary styling system:** Tailwind CSS with extended theme tokens in [`tailwind.config.ts`](/Users/yonyusuff/CursorProjects/pro360/tailwind.config.ts).
- **Global stylesheet:** [`app/globals.css`](/Users/yonyusuff/CursorProjects/pro360/app/globals.css) defines Tailwind layers, utility classes (`shadow-card`, `shadow-panel`, sidebar utilities), base typography/body rules.
- **Token model:** CSS custom properties in `:root` and `.dark` (`--background`, `--foreground`, `--primary`, `--radius`, `--chart-*`, etc.) in `app/globals.css`, then mapped into Tailwind color/radius tokens in `tailwind.config.ts`.
- **Component variant pattern:** `class-variance-authority` (`cva`) used for component variants (confirmed in button/badge primitives).
- **System convention:** shadcn config in [`components.json`](/Users/yonyusuff/CursorProjects/pro360/components.json) points Tailwind + CSS variable setup (`cssVariables: true`, `style: new-york`).

## 2) Where UI components live
- **Primary primitives:** `components/ui/`
- **Feature/page composition:** `app/` (route-level pages using primitives)
- **Shared utilities/behavior:** `lib/` (e.g., utility helpers, toasts, domain helpers)

## 3) Existing component primitives (discovered in `components/ui`)
- `button`, `input`, `textarea`, `select`, `dropdown-menu`, `checkbox`
- `table`, `card`, `badge`, `tabs`, `dialog`, `sheet`
- `tooltip`, `popover`, `calendar`, `date-picker`, `slider`, `switch`
- `scroll-area`, `command`, `field`, `input-group`, `phone-input`
- `system-toaster`, `view-mode-toggle`, `icon`, `chart`, `clickable`

## 4) Exact design-system “source value” files (8)
These are the highest-signal files that define tokens, variants, spacing/radius patterns, and baseline visual behavior:

1. [`tailwind.config.ts`](/Users/yonyusuff/CursorProjects/pro360/tailwind.config.ts)
2. [`app/globals.css`](/Users/yonyusuff/CursorProjects/pro360/app/globals.css)
3. [`components.json`](/Users/yonyusuff/CursorProjects/pro360/components.json)
4. [`components/ui/button.tsx`](/Users/yonyusuff/CursorProjects/pro360/components/ui/button.tsx)
5. [`components/ui/input.tsx`](/Users/yonyusuff/CursorProjects/pro360/components/ui/input.tsx)
6. [`components/ui/card.tsx`](/Users/yonyusuff/CursorProjects/pro360/components/ui/card.tsx)
7. [`components/ui/badge.tsx`](/Users/yonyusuff/CursorProjects/pro360/components/ui/badge.tsx)
8. [`components/ui/table.tsx`](/Users/yonyusuff/CursorProjects/pro360/components/ui/table.tsx)

## Key design-related folders
- `app/`
- `components/ui/`
- `lib/`
