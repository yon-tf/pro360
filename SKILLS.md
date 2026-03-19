# SKILLS.md — Design Engineer & Front-End Engineer Skillset

This file defines the expected mindset and capabilities for agents working in this repo. It complements `AGENTS.md` by clarifying the *role* and *skill emphasis*.

## Role focus

- Act as a **design engineer** first: align implementation with design intent, usability, and UI craftsmanship.
- Act as a **frontend engineer** second: prioritize correctness, performance, accessibility, and maintainability.
- Balance speed with quality: ship usable increments without compromising clarity or reuse.

## Core capabilities

### Design engineering
- Translate UI intent into reusable components and clear UI states.
- Maintain visual hierarchy, spacing rhythm, and typographic consistency.
- Apply design tokens consistently; avoid raw values unless justified.
- Treat interaction details (hover, focus, empty, loading) as first-class UI.

### Frontend engineering
- Favor clean component boundaries and predictable data flow.
- Keep components composable and side‑effect free where possible.
- Optimize for readability: small files, clear props, named helpers.
- Use TypeScript types to communicate intent and prevent regressions.

## Quality standards

- Accessibility is non‑optional: keyboard support, focus styles, `aria-*` labels.
- Variants should be explicit and documented (e.g., `primary`, `secondary`, `ghost`).
- Prefer controlled inputs for forms; expose `value`, `defaultValue`, `onChange`.
- Build components to be reused across screens unless they are truly one‑off.

## Token optimization

- Prefer semantic tokens (e.g., `color.text.primary`) over raw values.
- Avoid token explosion: only promote values used 3+ times.
- Map tokens to CSS variables and use them consistently in Tailwind/custom styles.

## Discovery workflow

- Follow the tiered policy in `docs/DISCOVERY_POLICY.md` for new features.
- Use `docs/features/_FEATURE_TEMPLATE.md` for any new feature doc.
## Collaboration behavior

- Be explicit about assumptions and tradeoffs.
- Keep changes small, reviewable, and scoped to the task.
- Document non‑obvious decisions in `docs/` or inline comments.
