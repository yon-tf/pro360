# Tech Stack

> Last updated: [date]
> Decision owner: [your name]

This document explains not just what we use, but why. A new developer
should be able to read this and understand every architectural decision
without asking anyone.

---

## Framework: Next.js 14+ (App Router)

**Why Next.js over React + Vite:**
Server components let us fetch data at the component level without
prop drilling or client-side waterfalls. The App Router's nested layouts
match our shell + feature structure naturally. Vercel deployment is a
single command with zero config.

**Why App Router over Pages Router:**
Server components, streaming, and Suspense boundaries are only available
in App Router. These aren't premature optimization — they're the right
default for a data-heavy B2B dashboard.

**Route structure:**
```
app/
  (shell)/          ← authenticated, uses AppShell layout
  (marketing)/      ← public pages (if applicable)
  api/              ← API routes (minimal — prefer server actions)
```

---

## Language: TypeScript (strict)

**Why TypeScript:**
Types are documentation that doesn't go stale. In a codebase that multiple
developers touch, TypeScript prevents an entire class of runtime errors
and makes refactoring safe.

**Config:** `tsconfig.json` with `strict: true`. No `any`. No exceptions.

---

## Styling: Tailwind CSS

**Why Tailwind over CSS modules or styled-components:**
Utility classes keep styling co-located with markup. Design tokens map
directly to Tailwind classes via `tailwind.config.ts`. No context-switching
between component files and CSS files.

**Token integration:**
All design tokens from `design-system/tokens.json` are mapped to Tailwind
custom values in `tailwind.config.ts`. Never use raw Tailwind colors like
`bg-blue-500` — always use semantic token classes.

---

## Component Library: shadcn/ui

**Why shadcn/ui over Chakra, MUI, or Radix directly:**
shadcn/ui gives us components we own — copied into our repo, not installed
as a dependency. We can modify them freely without forking. Built on Radix UI
for accessibility. Styled with Tailwind so they integrate with our token system.

**Location:** `components/ui/` — all shadcn components live here, modified
to use our design tokens.

**Not using:** shadcn's default theme colors. All colors are overridden
with our design system tokens.

---

## State Management

**Server state (API data):** React Query (TanStack Query)
Handles caching, refetching, loading states, and error states. All API calls
go through React Query hooks defined in `features/[module]/api/`.

**Local UI state:** `useState` and `useReducer`
For state that lives within a single component or a small component tree.

**Shared client state:** Zustand (if needed)
Only for state that needs to be shared across distant components and can't
be lifted to a common parent without prop drilling through 3+ levels.
Current usage: [list or "none yet"]

**URL state:** `useSearchParams` (Next.js)
For filters, pagination, and any state the user should be able to bookmark
or share.

---

## Component Documentation: Storybook

**Why Storybook:**
A backend developer, new team member, or stakeholder can open Storybook
and see every component, every variant, every state — without running the
full app. It's the living contract of what exists.

**Location:** `.storybook/` (config), stories co-located with components
as `[ComponentName].stories.tsx`

**Run:** `npm run storybook` → `localhost:6006`

**Requirement:** Every component in `components/ui/` must have a story.
No exceptions. A component without a story is undocumented.

---

## Testing: Vitest + Testing Library

**What we test:**
- Utility functions in `lib/` (pure functions, easy to test)
- Complex business logic in `features/[module]/api/`
- Critical user flows (form submission, key interactions)

**What we don't test:**
- Pure UI components with no logic (Storybook covers visual verification)
- Third-party library behavior

**Run:** `npm test`

---

## Deployment: Vercel

**Why Vercel:**
First-party Next.js hosting. Preview deployments on every PR branch.
Automatic HTTPS. Edge network. Zero config.

**Preview deploys:** Every PR gets a unique preview URL automatically.
Share these instead of Figma links for design review.

**Production:** Merging to `main` auto-deploys to production.

---

## Design System Files

```
design-system/
  DESIGN.md              ← Design language intent (WHY)
  tokens.json            ← Token values (WHAT)
  component-contracts.md ← Component behavior spec (HOW)
  token-mapping.md       ← Token to CSS variable map
```

**Source of truth:** `tokens.json` and `DESIGN.md` are the source of truth.
`tailwind.config.ts` is derived from `tokens.json`. If they drift, fix
`tokens.json` — not the Tailwind config.

---

## What We Deliberately Did Not Choose

**Prisma / Drizzle ORM:** Backend developer's choice. The frontend does not
own the data layer for work projects. API contracts are tracked outside this repo.

**Redux / MobX:** Overengineered for this scale. Zustand if we need global
state, React Query for server state.

**CSS-in-JS (styled-components, Emotion):** Runtime CSS generation adds
bundle weight and breaks Tailwind's purging. Tailwind + CSS variables for everything.

**Storybook with separate design tokens:** Our tokens come from `tokens.json`
and feed into Tailwind. Storybook reads the same Tailwind config. One source,
not two.
