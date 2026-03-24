# DESIGN.md — PRO360 Design Intent

This is the intent layer. Read it before any UI work.
It answers WHY — the personality, rules, and principles behind every visual decision.
For WHAT values to use, see `tokens.json`. For WHERE they map, see `token-mapping.md`.
For HOW components behave, see `component-contracts.md`.

---

## Personality

PRO360 is a B2B operational platform for professional services teams.
The visual language should feel:

- **Confident, not loud.** CTAs and interactive elements earn attention through
  placement and weight, not color saturation.
- **Dense but breathable.** Operational data (tables, lists, payouts) needs
  high information density. Whitespace is used deliberately, not decoratively.
- **Professional, not corporate.** Restrained chrome, dark sidebar, clean cards.
  Closer to Linear or Stripe than to a legacy enterprise tool.
- **Trustworthy at a glance.** Status, state, and hierarchy must be immediately
  legible without tooltips or hover-reveal.

---

## Color Intent

### Brand vs. Primary
Two distinct roles — do not conflate them:

| Role | Value | Use |
|---|---|---|
| Brand | `#00BFA2` (`--brand`) | Logo, brand identity marks only |
| Primary | `#004FB6` (`--primary`) | CTAs, active nav, focus rings, links |

Never use brand teal for interactive UI elements. It is for identity, not action.

### Sidebar
The sidebar uses `#1F2240` — a dark navy intentionally separated from the
content surface. Active nav items use a primary-blue left indicator bar
(`3px`, `border-radius: 1px`) not a filled background. Hover is a soft
`rgba(0, 79, 182, 0.06)` — barely visible, not competing with content.

### Surface hierarchy
Three surface levels, each with a semantic role:

| Level | Token | Usage |
|---|---|---|
| Canvas | `color.bg.canvas` (`--background`) | Page background |
| Surface | `color.bg.surface` (`--card`) | Cards, panels, content containers |
| Popover | `color.bg.popover` (`--popover`) | Dropdowns, tooltips, floating elements |

Never use raw bg colors. Always use the semantic token for the surface level.

### Status colors
Status colors encode system meaning — do not repurpose them for decoration:

- `color.status.danger` — errors, destructive actions, critical alerts
- `color.status.success` — completed, healthy, confirmed states
- `color.status.warning` — cautionary, at-risk, pending-review states

### Dark mode
All CSS variables are dual-defined in `:root` (light) and `.dark`.
The dark surface is a deep blue-navy (`222 47% 8%` canvas, `222 47% 11%` card)
not a neutral grey. This is intentional — maintain the dark palette.

---

## Elevation & Shadow Intent

Shadows communicate layer depth, not decoration:

| Class | Token | When to use |
|---|---|---|
| `shadow-card` | `shadow.cardLight/Dark` | Cards, list items, content panels |
| `shadow-panel` | `shadow.panelLight/Dark` | Dropdowns, popovers, floating overlays |
| `shadow-sm` | `shadow.sm` | Subtle lift on buttons, inputs, badges |

**Rule:** prefer `shadow-card` over `shadow-panel` unless the element truly
floats above the page (i.e., is positioned, not in document flow).

### Glass effect
`.glass` / `.glass-dark` are available for frosted overlay surfaces
(modals, drawers over content). Use sparingly — only when the element
is intentionally floating over live content.

---

## Typography Intent

- **Typeface:** Geist (loaded via `next/font/google` as `--font-sans`).
  Fallback: Inter → ui-sans-serif → system-ui.
- **Body baseline:** `text-sm` (14px) everywhere in app UI. This is set
  globally on `body` — do not override it per-component unless the design
  requires it.
- **Headings:** `tracking-tight` on all heading levels. `font-semibold` on h2/h3.
  Use 2–4 visible hierarchy steps between levels. Never use all-caps for headings.
- **Muted text:** `color.text.muted` (`--muted-foreground`) for labels,
  captions, secondary descriptions. Not for primary content.
- **Truncation rule:** never truncate critical operational text (names,
  statuses, amounts). Reveal full content. Truncate only decorative/secondary
  text with a tooltip fallback.

---

## Spacing & Radius Intent

- **4px grid.** All spacing uses `space.*` tokens (4px base unit).
  No half-steps. No magic numbers.
- **Border radius:** `--radius: 0.875rem` is the base (xl). All other
  radius tokens are derived offsets. Cards and dialogs use `radius.xl`.
  Inputs and buttons use `radius.lg`. Badges use `radius.md`.
  Never mix radius scales on the same surface cluster.

---

## Iconography Intent

- **Icon set:** Solar (linear style) via `@iconify/react`.
  All icons imported through `components/ui/solar-icons.tsx`.
- **Default size:** `h-4 w-4` (16px). Use `h-5 w-5` only for primary
  navigation icons. Never go below `h-3 w-3` in interactive contexts.
- **Style rule:** use `linear` variants for UI chrome. Use `bold` variants
  only for emphasis states (e.g., active, selected, warning).
- **Add/create actions:** always use `solar:add-circle-linear` for consistency.
- **No raw Lucide or Heroicons** — Solar only unless a specific icon is missing.

---

## Interaction States

Every interactive element must define all of these:

| State | Intent |
|---|---|
| default | Resting — visible but not demanding attention |
| hover | Soft feedback — `hover:bg-muted/50` or opacity shift |
| active/pressed | Slight depth reduction or fill shift |
| focus-visible | `ring-2 ring-ring ring-offset-2` — keyboard users must see it |
| disabled | `opacity-50 cursor-not-allowed` — not hidden, clearly inactive |
| loading | Skeleton or spinner — never a blank surface |
| empty | Action-oriented copy, not "No data available" |
| error | Cause + recovery path, not "Error 500" |

Focus rings use `color.border.focusRing` (`--ring`), which is the primary blue.
This is intentional — focus visibility must meet WCAG AA contrast.

---

## Component Composition Rules

- Build with **composable primitives** from `components/ui/` first.
  Only create feature-specific components when genuinely necessary.
- **Variants via `cva`.** Never ad-hoc className strings for variant logic.
- **No hardcoded widths** unless the design explicitly demands a fixed size.
- **Controlled forms.** Always expose `value`, `defaultValue`, `onChange`.
- Split a component when it exceeds ~250 lines or mixes layout with logic.

---

## What This Is Not

- This file does not list token values — see `tokens.json`.
- This file does not describe component APIs — see `component-contracts.md`.
- This file does not describe CSS variable mappings — see `token-mapping.md`.
- This file is not updated by the agent during implementation. It is updated
  only when design intent changes.
