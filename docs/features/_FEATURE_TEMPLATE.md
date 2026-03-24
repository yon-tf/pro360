# Feature: [Feature Name]
> Tier: [0 / 1 / 2] | Created: [YYYY-MM-DD] | Status: [discovery / architecture / interface / implementation / finetune / complete]

---

## Phase 1 — Discovery
> Populated by: Claude Web `think-product` | Required for: Tier 1, Tier 2

### Problem & Goal
[What problem does this solve? Be specific.
Not "users need X" — "Users who do Y currently have to Z, which causes W."]

### Users
[Who specifically. Role, context, what they're trying to accomplish.
Not generic personas — real use case descriptions.]

### User Flow
[Steps the user takes to accomplish the goal. Happy path only here.]

1. [Step]
2. [Step]
3. [Step]

### Screens & Routes
| Screen | Route | Purpose |
|---|---|---|
| [name] | /[route] | [what the user does here] |

### Scope — What This Is Not
[Explicit exclusions. Forces clarity. Prevents scope creep.]

### Risks & Open Questions
- [ ] [Question that must be answered before design starts]
- [ ] [Dependency or constraint that needs resolving]

### Success Criteria
[How do we know this is done? Specific and observable.
Not "users love it" — something you can verify.]

---

## Phase 2 — Architecture & IA
> Populated by: Claude Web `think-system` | Required for: Tier 2

### User's Mental Model
[How does the user think about this?
What do they call it? What groupings make intuitive sense?
This is NOT the data model — it's how the user perceives the system.]

### System Model
[What the backend actually tracks. Show the gap from the mental model.]

### Design Implication
[How the mental model drives layout and IA decisions.]

### Navigation
[Where does this live? Primary nav / secondary / contextual.]

### Information Hierarchy
[What's most important? What's secondary? What's on-demand?]

### Data Requirements
| Entity | Fields needed | Source |
|---|---|---|
| [entity] | [fields] | [API / mock / local] |

### Component Map
| UI element | Component | Status |
|---|---|---|
| [element] | [component name] | existing / extend / new |

### Cross-Feature Dependencies
[Which modules does this interact with?
Reference docs/modules/DEPENDENCY_MAP.md]

---

## Phase 3 — Interface Plan
> Populated by: Claude Web `think-design` | Required for: Tier 1, Tier 2

### Interaction Pattern
**Form type (if applicable):** [Wizard / Single-page / Progressive disclosure]
**Rationale:** [One sentence — why this pattern for this feature]

### Screens

#### [Screen Name]
**Route:** `/[route]`
**Purpose:** [What the user accomplishes here in one sentence]

**States:**

| State | What the user sees | Notes |
|---|---|---|
| Default | [description] | |
| Empty | [description — include CTA] | |
| Loading | [skeleton / spinner / optimistic] | |
| Error | [human-readable message + recovery] | |
| Success | [confirmation — how, how long, where] | |
| Edge cases | [long text, max items, no permissions] | |

**Key interactions:**
- [User action] → [System response]
- [User action] → [System response]

**Microcopy:**
- CTA: "[exact label]"
- Empty state: "[exact message]"
- Error: "[exact message]"
- [Other copy that matters]

**Component mapping:**
- [UI element] → [component] ([variant])

---

## Phase 4 — Implementation Log
> Maintained by: Claude Code | Append-only — never edit existing entries

### [YYYY-MM-DD] Feature scaffolded
**Decision:** Created feature doc
**Phase:** Pre-discovery
**Next:** Populate Phases 1–3 before implementing

---

## Phase 5 — Debug & Finetune
> Maintained by: Antigravity QA + Claude Code | Append-only

<!-- QA findings and debug entries appended here -->
<!-- Format:
### [YYYY-MM-DD] [Issue or polish item]
**Found by:** [Review / Antigravity QA / user feedback]
**Fix:** [What was done]
**Files changed:** [list]
**Status:** [resolved / in progress / deferred]
-->
