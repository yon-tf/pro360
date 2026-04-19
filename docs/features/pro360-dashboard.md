# Feature: Pro360 Dashboard
> Tier: 2 | Created: 2026-03-20 | Status: implementation

---

## Phase 1 — Discovery

### Problem & goal
- Provide a single operational view of professional performance, quality, and risk signals.
- Make it easy to spot issues, drill into details, and coordinate actions.
- Include platform automation signals where they already exist, especially rule-engine-triggered quality flags.

### Personas / primary user
- Primary user: Clinical Ops (e.g., Sarah Lee)
- Secondary user: Team lead / Pod lead

### User flow (high‑level)
1. Land on Pro360 dashboard.
2. Review top KPIs and attention rows.
3. Drill into professionals, clients, or appointments.

### Screens & routes
- Route: `/pro360` and `/pro360/[id]`
  - Screen: Pro360 Overview
  - Purpose: High‑level operational health and attention signals.

### Scope — What This Is Not
<!-- Add explicit exclusions when scope is defined -->

### Risks & open questions
- Confirm KPI definitions (SLA, chat hours, response time).
- Confirm which filters are global vs. per‑section.

### Success Criteria
<!-- Add observable, verifiable criteria when feature is scoped -->

---

## Phase 2 — Architecture & IA

### IA / navigation map
- Ops sidebar → Pro360

### Interaction model (states + transitions)
- Loading: show skeleton cards and charts.
- Empty: no professionals / no appointments / no alerts.
- Error: data fetch failed (show retry).

### Data requirements
- Entity: Professional
  - Fields: id, name, avatar, responseRate24h, avgServiceResponseHours, clientChatHours, totalAppointments, aiRatingAvg, clientRatingAvg, activationCount
  - Source: professionals API
- Entity: Appointment
  - Fields: type, scheduledAt, professionalDisplay, clientDisplay, category, status, quality.flags, quality.ruleHits
  - Source: appointments API
- Entity: Chat metrics
  - Fields: totalChatHours, slaPerformance, avgResponseTimeHrs
  - Source: chat analytics API
- Entity: Automation / rule signals
  - Fields: rule hit counts derived from appointment quality metadata
  - Source: appointments API + rule engine definitions

### Component map
- Reusable components: KpiCard, DonutKpiCard, GaugeKpiCard, ChatResponseHealthCard
- New components: TrendBadge, AttentionRow, SeverityBadge (optional)

### Cross-Feature Dependencies
- Rule Engine: quality flags and rule hit signals surface on the dashboard
- Appointments: appointment data feeds KPI row and attention rows
- Chat: chat metrics feed the response health card
- Reference: docs/modules/DEPENDENCY_MAP.md

---

## Phase 3 — Interface plan

### Screen layout plan
- Screen: Pro360 Overview
  - Sections: KPI row, charts, attention rows, drill‑downs
  - Attention rows should continue to surface rule-engine hits alongside other operational flags when data exists

### Token / design system impact
- New tokens: none expected
- Component variants: KpiCard (default/compact)

### Implementation order
1. KPI row + chart sections
2. Attention rows + drill‑downs
3. Rule-engine aligned quality signals and filters where the data already exists

---

## Phase 4 — Implementation Log
> Maintained by: Claude Code | Append-only — never edit existing entries

### 2026-03-20 KPI chart refinements
**Decision:** Enabled Tailwind scanning for `features/` so Pro360 dashboard card styles render, and refined KPI chart sizing.
**Files changed:** `features/pro360/components/ChatResponseHealthCard.tsx`, `features/pro360/components/GaugeKpiCard.tsx`, `features/pro360/components/DonutKpiCard.tsx`, `tailwind.config.ts`
**Next:** Document the rule-signal data contract and dependency expectations for later alignment.

### 2026-04-19 Design-system pass 1: badge semantics and dashboard palette
**Issue:** Shared `Badge` primitive and PRO360 dashboard had repeated status/color meaning expressed through scattered raw emerald/amber/navy literals and local overrides.
**Decision:** Kept shared change narrow. Moved `Badge` success/warning variants onto semantic token-backed styles, moved `SeverityBadge` onto shared warning/destructive/secondary variants, and centralized repeated dashboard chart/status colors behind page-local `PRO360_DASHBOARD_COLORS`.
**Alternatives rejected:** Creating new shared chart API; normalizing PRO360 detail hero card in same pass; widening `Badge` with domain-specific props.
**Reason:** Shared semantics were stable for badge status meaning, but dashboard chart palette still belongs to feature layer until reuse proves otherwise.
**Owner:** design-system + PRO360
**Status:** accepted

### 2026-04-19 Deferred items from design-system pass 1
**Issue:** Some literal values remain in payout, appointments, detail-page hero styling, and dense dashboard typography.
**Decision:** Deferred those cases instead of forcing token purity in same pass.
**Alternatives rejected:** Repo-wide hardcoded cleanup; primitive API growth for single-screen needs.
**Reason:** These cases are either local exceptions, not yet stable enough for promotion, or would increase regression risk.
**Owner:** respective feature surfaces
**Status:** deferred

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
