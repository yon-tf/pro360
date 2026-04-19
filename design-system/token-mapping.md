# Token Mapping

Sources inspected:
- `tailwind.config.ts`
- `app/globals.css`
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/select.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/card.tsx`
- `components/ui/badge.tsx`
- `components/ui/tabs.tsx`
- `components/ui/table.tsx`
- `components/ui/dialog.tsx`
- `components/ui/sheet.tsx`

## color.bg.*
- `color.bg.canvas` -> `hsl(var(--background))` -> `bg-background`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/input.tsx`, `components/ui/button.tsx`, `components/ui/tabs.tsx`, `components/ui/sheet.tsx`
- `color.bg.surface` -> `hsl(var(--card))` -> `bg-card`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/card.tsx`, `components/ui/dialog.tsx`
- `color.bg.popover` -> `hsl(var(--popover))` -> `bg-popover`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`
- `color.bg.muted` -> `hsl(var(--muted))` -> `bg-muted`, `hover:bg-muted/50`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/tabs.tsx`, `components/ui/table.tsx`
- `color.bg.overlaySoft` -> `rgba(0, 0, 0, 0.4)` -> `bg-black/40`
  - Files: `components/ui/dialog.tsx`
- `color.bg.overlayStrong` -> `rgba(0, 0, 0, 0.8)` -> `bg-black/80`
  - Files: `components/ui/sheet.tsx`

## color.text.*
- `color.text.primary` -> `hsl(var(--foreground))` -> `text-foreground`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/table.tsx`, `components/ui/badge.tsx`, `components/ui/button.tsx`
- `color.text.muted` -> `hsl(var(--muted-foreground))` -> `text-muted-foreground`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/input.tsx`, `components/ui/card.tsx`, `components/ui/table.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- `color.text.onPrimary` -> `hsl(var(--primary-foreground))` -> `text-primary-foreground`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/button.tsx`, `components/ui/badge.tsx`
- `color.text.onSecondary` -> `hsl(var(--secondary-foreground))` -> `text-secondary-foreground`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/button.tsx`, `components/ui/badge.tsx`
- `color.text.onCard` -> `hsl(var(--card-foreground))` -> `text-card-foreground`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/card.tsx`
- `color.text.onPopover` -> `hsl(var(--popover-foreground))` -> `text-popover-foreground`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`

## color.border.*
- `color.border.default` -> `hsl(var(--border))` -> `border-border`, `border-b`, `border-t`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/badge.tsx`, `components/ui/table.tsx`
- `color.border.input` -> `hsl(var(--input))` -> `border-input`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/input.tsx`, `components/ui/button.tsx`, `components/ui/select.tsx`
- `color.border.focusRing` -> `hsl(var(--ring))` -> `focus:ring-ring`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/select.tsx`, `components/ui/badge.tsx`, `components/ui/tabs.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`

## color.action.*
- `color.action.primary` -> `hsl(var(--primary))` -> `bg-primary`, `text-primary`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/button.tsx`, `components/ui/badge.tsx`
- `color.action.secondary` -> `hsl(var(--secondary))` -> `bg-secondary`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/button.tsx`, `components/ui/badge.tsx`, `components/ui/sheet.tsx`
- `color.action.accent` -> `hsl(var(--accent))` -> `focus:bg-accent`, `data-[state=open]:bg-accent`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/dialog.tsx`

## color.status.*
- `color.status.danger` -> `hsl(var(--destructive))` -> `bg-destructive`, `text-destructive-foreground`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/button.tsx`, `components/ui/badge.tsx`
- `color.status.success` -> `hsl(var(--success))` -> `bg-[hsl(var(--success)/0.15)]`, `text-[hsl(var(--success))]`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/badge.tsx`
- `color.status.warning` -> `hsl(var(--warning))` -> `bg-[hsl(var(--warning)/0.15)]`, `text-[hsl(var(--warning))]`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/badge.tsx`

## PRO360 dashboard semantic palette

- Local helper: `PRO360_DASHBOARD_COLORS`
  - File: `app/(shell)/pro360/page.tsx`
  - Intent: centralize repeated dashboard chart/status meaning without widening shared chart API
- Mapping
  - `chatTotal` -> `var(--brand-hex)`
  - `chatTfp` -> `hsl(var(--chart-2))`
  - `chatClient` -> `hsl(var(--chart-1))`
  - `therapyTotal` / `therapyVideo` -> `hsl(var(--chart-3))`
  - `therapyFaceToFace` -> `hsl(var(--primary))`
  - `attended` -> `var(--brand-hex)`
  - `cancelled` -> `hsl(var(--warning))`
  - `noShow` -> `hsl(var(--muted-foreground))`
  - `caseNoteSubmitted` -> `hsl(var(--primary))`
  - `caseNoteMissing` -> `hsl(var(--destructive))`

## space.* (4px grid)
- `space.0` -> `0px` -> `pt-0`
  - Files: `components/ui/card.tsx`
- `space.1` -> `4px` -> `px-1`, `py-1`, `p-1`, `mt-1`, `top-4/right-4` (via `space.1` + multiples)
  - Files: `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/tabs.tsx`, `components/ui/table.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- `space.2` -> `8px` -> `gap-2`, `px-2`, `py-2`, `h-2 w-2`
  - Files: `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/sheet.tsx`
- `space.3` -> `12px` -> `px-3`, `h-3.5 w-3.5` (nearest grid token anchor)
  - Files: `components/ui/tabs.tsx`, `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`
- `space.4` -> `16px` -> `h-4 w-4`, `px-4`, `py-4`, `p-4`
  - Files: `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/select.tsx`, `components/ui/table.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- `space.5` -> `20px`
- `space.6` -> `24px` -> `p-6`, `px-6`, `pb-6`, `max-w-lg` context spacing
  - Files: `components/ui/card.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- `space.7` -> `28px`
- `space.8` -> `32px` -> `pl-8`, `pr-8`
  - Files: `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`

## radius.*
- `radius.sm` -> `calc(var(--radius) - 6px)` -> `rounded-sm`
  - Files: `tailwind.config.ts`, `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- `radius.md` -> `calc(var(--radius) - 4px)` -> `rounded-md`
  - Files: `tailwind.config.ts`, `components/ui/badge.tsx`, `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/tabs.tsx`
- `radius.lg` -> `calc(var(--radius) - 2px)` -> `rounded-lg`
  - Files: `tailwind.config.ts`, `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/select.tsx`, `components/ui/tabs.tsx`
- `radius.xl` -> `var(--radius)` -> `rounded-xl`
  - Files: `tailwind.config.ts`, `app/globals.css`, `components/ui/card.tsx`, `components/ui/dialog.tsx`

## shadow.*
- `shadow.sm` -> `shadow-sm`
  - Files: `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/badge.tsx`
- `shadow.md` -> `shadow`
  - Files: `components/ui/tabs.tsx`
- `shadow.lg` -> `shadow-lg`
  - Files: `app/globals.css`, `components/ui/sheet.tsx`
- `shadow.cardLight`/`shadow.cardDark` -> `.shadow-card` utility values
  - Files: `app/globals.css`, `components/ui/card.tsx`
- `shadow.panelLight`/`shadow.panelDark` -> `.shadow-panel` utility values
  - Files: `app/globals.css`, `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/dialog.tsx`

## typography.*
- `typography.family.sans` -> `var(--font-sans), Inter, ui-sans-serif, system-ui, sans-serif`
  - Files: `tailwind.config.ts`
- `typography.family.mono` -> `ui-monospace, monospace`
  - Files: `tailwind.config.ts`
- `typography.size.xs` -> `12px` -> `text-xs`
  - Files: `components/ui/button.tsx`, `components/ui/badge.tsx`, `components/ui/table.tsx`, `components/ui/dropdown-menu.tsx`
- `typography.size.sm` -> `14px` -> `text-sm`
  - Files: `app/globals.css`, `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/card.tsx`, `components/ui/tabs.tsx`, `components/ui/table.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- `typography.size.lg` -> `18px` -> `text-lg`
  - Files: `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- `typography.weight.medium` -> `500` -> `font-medium`
  - Files: `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx`, `components/ui/tabs.tsx`, `components/ui/table.tsx`
- `typography.weight.semibold` -> `600` -> `font-semibold`
  - Files: `app/globals.css`, `components/ui/select.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/table.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
