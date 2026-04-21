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

Status colors must never be the sole indicator of meaning. Always pair
with a label, icon, or text. Color-blind users rely on the secondary signal.

### Chart / data-viz palette
Chart colors use `--chart-1` through `--chart-5`. Dashboard semantic
meanings are centralized in `PRO360_DASHBOARD_COLORS` (see `token-mapping.md`).
Never introduce new chart colors inline — extend the dashboard palette constant.

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

## Borders & Separation

Use visual separation to signal grouping and hierarchy — not to decorate.
Choose the right tool:

| Technique | When to use |
|---|---|
| Shadow (`shadow-card`) | Cards and panels that float on canvas |
| Background shift (`bg-muted`) | Alternating rows, sidebar sections, grouped items |
| Divider (`border-b border-border`) | Logical separation within a surface (header/body/footer) |
| No separator | Adjacent items at the same level — rely on spacing |

**Rule:** never use both a border and a shadow on the same surface — pick one.
Never use a border to create separation where spacing alone is sufficient.

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
- **Numeric data:** use `font-mono` (`ui-monospace`) for financial amounts,
  IDs, and codes. Tabular alignment matters in operational contexts.

### Type scale usage

DS token scale covers `typography.size.nano` (8px) through `typography.size.lg` (18px).
Heading sizes above `lg` fall outside the token scale — use Tailwind utilities directly
(`text-xl`, `text-2xl`) and do not add tokens for one-off heading sizes.

| Use | DS token / class | Weight |
|---|---|---|
| Page title | `text-xl` / `text-2xl` (Tailwind) | `font-semibold` |
| Section heading | `typography.size.lg` → `text-lg` | `font-semibold` |
| Card title | `typography.size.sm` → `text-sm` | `font-medium` |
| Body / labels | `typography.size.sm` → `text-sm` | `font-normal` |
| Metadata / captions | `typography.size.xs` → `text-xs` | `font-normal` |
| Fine print / timestamps | `typography.size.xsplus` → `text-[13px]` | `font-normal` |
| Badge text | `typography.size.xs` → `text-xs` | `font-medium` |

**Tracking tokens** (`typography.tracking.*`) are for uppercase label text only:

| Token | Value | Use |
|---|---|---|
| `tracking.label` | `0.12em` | Default uppercase nav/section labels |
| `tracking.labelmd` | `0.16em` | Compact sidebar section headers |
| `tracking.labellg` | `0.18em` | Table column headers |
| `tracking.labelxl` | `0.20em` | Large display labels, KPI captions |

Never apply tracking tokens to body or heading text — only uppercase label contexts.

---

## Spacing & Radius Intent

- **4px grid.** All spacing uses `space.*` tokens (4px base unit).
  No half-steps. No magic numbers.
- **Border radius:** `--radius: 0.875rem` is the base (xl). All other
  radius tokens are derived offsets. Cards and dialogs use `radius.xl`.
  Inputs and buttons use `radius.lg`. Badges use `radius.md`.
  Never mix radius scales on the same surface cluster.

### Spatial rhythm

Token scale runs `space.0` (0px) → `space.24` (96px) in 4px steps.
Use consistent internal padding within a surface level:

| Context | Padding token |
|---|---|
| Card body | `space.6` (24px) |
| Dialog / sheet | `space.6` (24px) |
| Page section gap | `space.8`–`space.10` (32–40px) |
| Table cell | `space.3` v / `space.4` h |
| Form field | `space.2` v / `space.3` h |
| Sidebar item | `space.2` v / `space.3` h |
| Badge | `space.1` v / `space.2` h |
| Icon gap from label | `space.2` (8px) |

---

## Layout & Grid Intent

PRO360 is a desktop-first operational tool. Layouts prioritize information
density over responsiveness — but must not break at common viewport widths.

### Shell structure
- **Sidebar:** fixed, `w-[240px]`, dark navy, never collapses automatically
- **Content area:** fluid, fills remaining width, max readable line length
  capped at `max-w-screen-2xl` for full-bleed layouts
- **Top bar:** sticky, `h-14`, surface background, separates page chrome from content

### Content layout patterns

| Pattern | When to use |
|---|---|
| Full-width table | Data lists, payouts, appointment grids |
| 2-column (sidebar + detail) | Profile pages, rule editors, detail drawers |
| Card grid (`grid-cols-2/3/4`) | KPI dashboards, metric overviews |
| Single-column form | Wizards, onboarding, settings |

### Column grid
Use a 12-column implicit grid within the content area. Common column spans:

- `col-span-12` — full width (tables, page headers)
- `col-span-8` / `col-span-4` — content + aside
- `col-span-6` — equal halves (comparison, split forms)
- `col-span-3` — quarter-width KPI tiles

### Breakpoints
This app targets `lg` (1024px) and above as the primary viewport.
At `md` (768px), sidebar collapses to icon-only or mobile sheet.
Do not design for `sm` unless the feature has a stated mobile requirement.

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
- **Icon + label:** always pair icons with a visible label or aria-label.
  Icon-only buttons require `aria-label`. Tooltips alone are not sufficient
  for icon-only affordances in operational workflows.

---

## Motion & Animation Intent

Motion communicates state change — it is not decoration.
PRO360 is a data-dense tool; animation must be fast and purposeful.

### Principles
- **Immediate feedback.** Interactive state changes (hover, press) respond
  in ≤ 100ms. Users of operational tools expect tight feedback loops.
- **Short transitions.** UI transitions (open, close, expand) should be
  `150ms`–`200ms`. Never use `duration-500` or longer for UI chrome.
- **Easing.** Exits use `ease-in`, entrances use `ease-out`. Use
  `ease-in-out` only for toggles that have no clear directionality.
- **No decorative animation.** No bounces, spins, or motion that serves
  only aesthetics. Spinners are functional; they communicate loading state.

### Standard durations

| Use | Duration |
|---|---|
| Hover / focus state | `duration-100` |
| Button press | `duration-100` |
| Dropdown / popover open | `duration-150` |
| Sheet / drawer slide | `duration-200` |
| Toast enter/exit | `duration-200` |
| Page transition | None — instant navigation |

### Reduced motion
Always respect `prefers-reduced-motion`. Wrap all non-essential animations
in `motion-safe:` Tailwind variant or a `@media (prefers-reduced-motion: reduce)`
guard. Functional state changes (loading spinner, progress bar) are exempt.

---

## Interaction States

Every interactive element must define all of these:

| State | Intent |
|---|---|
| default | Resting — visible but not demanding attention |
| hover | Soft feedback — `hover:bg-muted/50` or opacity shift, `duration-100` |
| active/pressed | Slight depth reduction or fill shift |
| focus-visible | `ring-2 ring-ring ring-offset-2` — keyboard users must see it |
| disabled | `opacity-50 cursor-not-allowed` — not hidden, clearly inactive |
| loading | Skeleton or spinner — never a blank surface |
| empty | Action-oriented copy, not "No data available" |
| error | Cause + recovery path, not "Error 500" |

Focus rings use `color.border.focusRing` (`--ring`), which is the primary blue.
This is intentional — focus visibility must meet WCAG AA contrast.

### Skeleton loading
Use skeleton loaders (`animate-pulse bg-muted`) for content that has a
known layout. Use a centered spinner only when layout is unknown (e.g.,
full-page initial load). Never show an empty layout with no loading signal.

---

## Form Design Intent

Forms are high-stakes in an operational tool — errors are costly.

### Validation timing
- **On blur** for field-level validation (email format, required fields).
- **On submit** for cross-field validation (date range conflicts, conditional
  required fields).
- Never validate on keystroke — it is distracting before the user finishes typing.

### Inline error placement
Errors appear directly below the offending field, in `color.status.danger`,
`text-xs`. Never use a toast for a field-level validation error. A toast is
for system-level feedback only.

### Form layout patterns

| Pattern | When to use |
|---|---|
| Single-page form | ≤ 8 fields, no branching logic |
| Progressive disclosure | Fields revealed by prior answers |
| Multi-step wizard | Complex flows with distinct phases (e.g., payout run) |
| Side-by-side | Comparison inputs, address + billing |

### Form actions (Save/Cancel/Update)
Form actions must be predictable across modules.

- **Placement:** actions live at the **bottom** of the form content (footer), not at the top.
- **Alignment:** right-aligned action cluster.
- **Order:** `Cancel` / `Back` (secondary) then primary `Save` / `Update` (submit).
- **Variants:** secondary action uses `Button` `variant="outline"`; primary uses default. Avoid `variant="secondary"` for action bars (it reads like a state tag, not an action).
- **Long forms:** prefer a **sticky bottom** form footer so actions remain reachable without scrolling.
- **No header actions:** do not place `Save` / `Update` / `Approve` buttons in the page header or top chrome. Reserve header space for title, context, and lightweight utilities only.
- **Right-rail exception:** on wide desktop two-column builder screens (details rail on the right), actions may live directly under the details rail (still “bottom of the rail”), as long as the mobile/small layout naturally places them at the bottom of the page.
- **Exception:** destructive confirmations belong in a `DialogFooter` (confirm + cancel), not in the page footer.

### Labels
Always use visible labels. Never use placeholder text as the only label —
it disappears on focus. Placeholder is supplementary context only.

### Required fields
Mark optional fields, not required ones. In an operational context,
most fields are required — marking required is noise.

---

## Data Display Intent

### Tables vs. card grids
Use **tables** when:
- Data has 4+ attributes per row
- Comparison across rows is the primary task
- Actions (edit, view, approve) live per-row

Use **card grids** when:
- Data is visual (profiles, media, metrics)
- Comparison is secondary to individual inspection
- Items are heterogeneous in structure

### Table behavior
- Sticky header on scroll for tables taller than the viewport.
- Row hover: `hover:bg-muted/50` — subtle, not distracting.
- Selected row: `bg-primary/8` with a left border indicator (`border-l-2 border-primary`).
- Never zebra-stripe — use hover state instead. Stripes add visual noise
  without adding information.
- Sort indicators: up/down caret, `text-muted-foreground` when inactive.

### Empty states
Every data surface must have a designed empty state:
- Icon (relevant, not generic)
- Heading: describe the situation ("No appointments yet")
- Body: one sentence of context or guidance
- CTA: primary action to resolve the empty state

Never use "No data available" or "Nothing to show" — these are dead ends.

### Pagination vs. infinite scroll
Use **pagination** for tables where users navigate to specific pages
(financial records, audit logs). Use **infinite scroll** only for feeds
where recency matters and direct navigation does not. Default page size: 25.

---

## Feedback & Communication Intent

### Toast notifications
- **Position:** bottom-right, `z-50`
- **Duration:** 4s for success, 6s for warning/error, persist for critical errors
- **Use for:** system-level feedback (save success, export started, connection lost)
- **Never use for:** field validation errors, destructive confirmations, inline status

### Confirmation dialogs
Destructive actions (delete, archive, irreversible payout) require a
confirmation `Dialog` — not a toast, not a tooltip.
- Title: name the object being affected ("Delete appointment?")
- Body: one sentence on consequence ("This cannot be undone.")
- Actions: destructive variant confirm button + ghost cancel

### Inline alerts
Use `Alert` (`color.status.danger/warning/success`) for persistent
contextual feedback that belongs in the page layout — not floating.
Examples: missing required setup, integration error, feature deprecation.

### Loading feedback hierarchy
1. Page-level skeleton — initial content load
2. Component-level spinner or skeleton — async data refresh
3. Button loading state — form submit in progress
4. Toast — background operation completion

---

## Navigation & Wayfinding Intent

### Sidebar
- Active page: primary-blue left indicator bar (`3px` wide, `border-radius: 1px`), no filled background
- Section groupings: `typography.size.xs` + `font-semibold` + `color.text.muted` + `tracking.labelmd` uppercase
  as section labels — not decorative dividers
- Icon + label always. Never icon-only in expanded state

### Breadcrumbs
Breadcrumbs are the primary wayfinding *and* the top-bar page title in shell
screens. Keep them simple and predictable.

**Format (max 3 items):**
`Module / Entity / Action`

Rules:
- **Module** is the product area (matches sidebar label). Always present.
- **Entity** is a human-readable identifier (name, short code, or `Type · Date`).
  Avoid raw IDs unless users reliably navigate by ID.
- **Action** is the current mode/view (`Create`, `Edit`, `Needs attention`, etc).
  No generic labels like "Detail" or "Profile".
- Only non-current crumbs may be links. Current crumb is not a link.
- If a breadcrumb link would take you to a different module, it should open in a new tab
  to preserve context.
- Breadcrumbs are navigation only — **never place primary action buttons** (Save/Cancel/Approve) inside the breadcrumb/top-bar row. Actions belong to the form footer or (on wide screens) the right details rail.

Guardrails:
- Never exceed 3 crumbs. If a flow would require more, redesign the flow or rely on
  in-page navigation (tabs/sections) instead of breadcrumb depth.
- Labels must be short, scannable, and stable (no truncation of critical names).

### Page titles
Every page has a visible `h1`. It matches the active nav item label.
No page should require the URL to understand where you are.

---

## Z-Index / Stacking Intent

Define stacking explicitly — never use arbitrary z-index values.

| Layer | Value | Usage |
|---|---|---|
| Base content | `z-0` | Page content, cards |
| Sticky header / sidebar | `z-10` | Top bar, sidebar |
| Dropdowns / popovers | `z-20` | Select, dropdown menus |
| Sheets / drawers | `z-30` | Side panels over content |
| Modals / dialogs | `z-40` | Full overlays |
| Toasts / notifications | `z-50` | Always on top |

Never use `z-[9999]` or arbitrary values. If two elements conflict,
resolve by restructuring the DOM or adjusting the layer assignment here.

---

## Accessibility Commitment

WCAG 2.1 AA is the minimum bar. These are non-negotiable:

### Contrast
- Normal text: 4.5:1 minimum against its background
- Large text (18px+): 3:1 minimum
- UI components (buttons, inputs, focus rings): 3:1 against adjacent colors
- Never rely solely on color to convey meaning — always pair with text/icon

### Focus management
- All interactive elements must be keyboard-reachable
- Focus order must follow visual reading order (top-left to bottom-right)
- Modals and sheets must trap focus when open and restore on close
- Focus rings use `ring-2 ring-ring ring-offset-2` — never removed via `outline-none`
  without a custom visible replacement

### Semantic HTML
- Use `button` for actions, `a` for navigation — never swap them
- Use `aria-label` on icon-only buttons, chart containers, and status badges
  where the text label is absent
- Use `role="status"` or `aria-live="polite"` for dynamic feedback regions
  (toast container, validation messages, data refresh indicators)

### Touch targets
Minimum 44×44px touch target for all interactive elements.
Use padding to meet this without affecting visual size.

---

## Component Composition Rules

- Build with **composable primitives** from `components/ui/` first.
  Only create feature-specific components when genuinely necessary.
- **Variants via `cva`.** Never ad-hoc className strings for variant logic.
- **No hardcoded widths** unless the design explicitly demands a fixed size.
- **Controlled forms.** Always expose `value`, `defaultValue`, `onChange`.
- Split a component when it exceeds ~250 lines or mixes layout with logic.

### Layer model (see `component-contracts.md`)
1. **Primitive** — shared, generic, token-driven. Lives in `components/ui/`.
2. **Pattern** — domain-aware composition. Lives in `features/[name]/components/`.
3. **Feature composition** — page-specific assembly. Does not widen primitive APIs.

Never add domain-specific props to a primitive. If a primitive needs
to know about "severity" or "payoutStatus", the knowledge belongs in
a pattern layer component, not in the primitive.

---

## Content & Copy Intent

### Voice
Operational, direct, minimal. Not friendly-chatty, not formal-corporate.
Write like a trusted tool that gets out of the way.

### Labels
- Button labels: verb + noun ("Create appointment", "Run payout", "Export CSV")
- Not: "Submit", "OK", "Yes" — these are not operational
- Nav labels: noun only ("Appointments", "Professionals", "Payouts")

### Error messages
- State the cause, not the symptom
- Offer a recovery action
- "Couldn't load appointments. Check your connection and try again." ✓
- "Error 503" ✗
- "Something went wrong" with no path forward ✗

### Empty states
- Heading: describe the situation, not the absence ("No appointments scheduled")
- Body: one sentence of context or the next step
- CTA: primary action that resolves the empty state

### Numbers and amounts
- Financial amounts: always 2 decimal places, currency symbol, locale-formatted
- Percentages: one decimal place unless the precision is irrelevant
- Large numbers: abbreviate with unit suffix (1.2k, 4.5M) in summary contexts,
  full precision in detail views

---

## What This Is Not

- This file does not list token values — see `tokens.json`.
- This file does not describe component APIs — see `component-contracts.md`.
- This file does not describe CSS variable mappings — see `token-mapping.md`.
- This file is not updated by the agent during implementation. It is updated
  only when design intent changes.
