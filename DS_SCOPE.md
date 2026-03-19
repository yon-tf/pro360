# DS_SCOPE.md — Design System Scope (v0.1)

Put this at the top of your DS workflow doc (or README):
Run bunx cursor-talk-to-figma-socket
Connect plugin in Figma (port 3055)
Run micro-write test ✅
Only then run “00 Tokens” or “01 Components” generation


## Purpose
Generate a minimal, usable design system from the current product UI and codebase:
- tokens (semantic)
- core components (web)
- component contracts
- Figma library scaffold

## Platforms
- Web: Next.js / React (primary)
- Mobile: not in scope for this iteration

## What is in scope (v0.1)
### Tokens (semantic)
- Color: bg / text / border / action / status
- Spacing scale (4px grid)
- Radius
- Shadow
- Typography (size + weight only)

### Components (build first)
1) Button
2) Input
3) Select/Dropdown
4) Card
5) Badge/Chip
6) Tabs
7) Table (basic)
8) Modal/Dialog
9) Alert/Toast (basic)

### States to support
- default, hover, pressed/active, focus, disabled, loading
- validation: error + helper text for inputs
- empty/loading/error for tables where applicable

## Out of scope (for now)
- full page templates
- advanced charts components
- complex motion/animation system
- full iconography rules (we can add later)

## Source of truth
- Tokens: generated from codebase + validated in Figma variables
- Components: code is implementation truth; Figma is the library + review surface

## Deliverables
1) `tokens.json` (semantic)
2) `DESIGN_SYSTEM_RULES.md` (naming + mapping rules)
3) `COMPONENT_CONTRACTS.md` (variants/states/props)
4) Figma file scaffold:
   - 00 Tokens
   - 01 Components (core)
   - 02 Patterns (optional later)

   ## Tooling rule
- Code artifacts are generated/maintained in repo by Codex.
- Figma file content is created/updated via Talk To Figma plugin (websocket), not via official MCP capture writes.

