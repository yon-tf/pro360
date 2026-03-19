# Feature: Pro360 Dashboard

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

### Risks & open questions
- Confirm KPI definitions (SLA, chat hours, response time).
- Confirm which filters are global vs. per‑section.

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

## Phase 4 — Implementation log

### Summary
- Enabled Tailwind scanning for `features/` so Pro360 dashboard card styles render, and refined KPI chart sizing.

### Files changed
- `features/pro360/components/ChatResponseHealthCard.tsx`
- `features/pro360/components/GaugeKpiCard.tsx`
- `features/pro360/components/DonutKpiCard.tsx`
- `tailwind.config.ts`

### Follow‑ups
- 
