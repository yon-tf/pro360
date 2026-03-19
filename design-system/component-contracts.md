# Component Contracts (shadcn-backed)

Confirmed shadcn/ui is present via:
- `components.json` (`$schema: https://ui.shadcn.com/schema.json`)
- `components/ui/*` primitive set
- `lib/utils.ts` `cn()` utility (`clsx` + `tailwind-merge`)

## Contracts

### Button
- Underlying shadcn component: `Button` (`cva` variants)
- File: `components/ui/button.tsx`
- Contract:
  - variants: `default | destructive | outline | secondary | ghost | link`
  - sizes: `default | sm | lg | icon`
  - states: `hover | focus-visible | disabled`

### Input
- Underlying shadcn component: `Input`
- File: `components/ui/input.tsx`
- Contract:
  - type: native input `type`
  - states: `placeholder | focus-visible | disabled`

### Select/Dropdown
- Underlying shadcn components: `Select`, `DropdownMenu`
- Files: `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`
- Contract:
  - trigger/content/item composition
  - states: `open | focus | disabled`

### Card
- Underlying shadcn component: `Card`
- File: `components/ui/card.tsx`
- Contract:
  - slots: `Card | CardHeader | CardTitle | CardDescription | CardContent | CardFooter`

### Badge/Chip
- Underlying shadcn component: `Badge` (`cva` variants)
- File: `components/ui/badge.tsx`
- Contract:
  - variants: `default | secondary | destructive | success | warning | outline`

### Tabs
- Underlying shadcn component: `Tabs`
- File: `components/ui/tabs.tsx`
- Contract:
  - parts: `Tabs | TabsList | TabsTrigger | TabsContent`
  - states: `active | focus | disabled`

### Table (basic)
- Underlying shadcn component: `Table`
- File: `components/ui/table.tsx`
- Contract:
  - parts: `Table | TableHeader | TableBody | TableFooter | TableRow | TableHead | TableCell | TableCaption`
  - states: `hover row | selected row`

### Modal/Dialog
- Underlying shadcn components: `Dialog`, `Sheet`
- Files: `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- Contract:
  - open/close primitives
  - parts: trigger/content/header/footer/title/description

### Alert/Toast (basic)
- Underlying shadcn-connected component: system toaster wrapper
- File: `components/ui/system-toaster.tsx`
- Contract:
  - toast intent/status (`success | warning | error` via app-level API)
  - placement/lifecycle controlled by toaster provider

## Mapping
- `Button` -> `components/ui/button.tsx`
- `Input` -> `components/ui/input.tsx`
- `Select/Dropdown` -> `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`
- `Card` -> `components/ui/card.tsx`
- `Badge/Chip` -> `components/ui/badge.tsx`
- `Tabs` -> `components/ui/tabs.tsx`
- `Table` -> `components/ui/table.tsx`
- `Modal/Dialog` -> `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- `Alert/Toast` -> `components/ui/system-toaster.tsx`
