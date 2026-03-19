# AI Workflow (Phased, Tool‑Agnostic)

This workflow is designed for Codex, Claude, ChatGPT, or any assistant. The key idea: **do not build everything at once**. Move through phases and keep a single feature doc as the source of truth.

## Inputs

- **Mini‑PRD** (1–2 pages) or a short problem statement in chat.
- Optional: Figma links or existing UI references.

## Single source of truth

Each feature has a single doc:
- `docs/features/<feature>.md`
- Use the template in `docs/features/_FEATURE_TEMPLATE.md`

## Phased workflow

### Phase 1 — Discovery
Goal: clarify *why* and *what*.

Assistant should:
- Read `AGENTS.md` + `SKILLS.md`.
- Choose discovery tier via `docs/DISCOVERY_POLICY.md`.
- Populate **Phase 1** in the feature doc only.

**User prompt example**

“Use Phase 1 only. Here’s a mini‑PRD for Feature X. Populate `docs/features/feature-x.md` with Discovery sections using the template. Do not implement UI yet.”

**Socratic checkpoint (stop here)**

Ask the user:\n- “Is the problem framing correct?”\n- “Are the user flow and routes accurate?”\n- “Anything missing or wrong before we proceed to Phase 2?”\n\nProceed only after explicit approval.

---

### Phase 2 — Architecture & IA
Goal: define structure before UI.

Assistant should:
- Populate **Phase 2** in the same feature doc.
- Define IA, interactions, data requirements, and component map.

**User prompt example**

“Proceed to Phase 2 for Feature X. Update `docs/features/feature-x.md` with IA, interaction model, data requirements, and component map. No UI implementation yet.”

**Socratic checkpoint (stop here)**
\nAsk the user:\n- “Does the IA/navigation map look right?”\n- “Are the data requirements complete?”\n- “Any component map changes before Phase 3?”\n\nProceed only after explicit approval.

---

### Phase 3 — Interface plan
Goal: commit to UI approach before code.

Assistant should:
- Populate **Phase 3** in the same feature doc.
- Provide layout sections, token impacts, and implementation order.

**User prompt example**

“Proceed to Phase 3 for Feature X. Update `docs/features/feature-x.md` with interface plan and implementation order.”

**Socratic checkpoint (stop here)**\n\nAsk the user:\n- “Is the layout plan correct?”\n- “Any token or variant changes?”\n- “Ready to implement Phase 4?”\n\nProceed only after explicit approval.

---

### Phase 4 — Implementation
Goal: build UI in small, safe increments.

Assistant should:
- Follow `docs/SHADCN_UI_MIGRATION_CHECKLIST.md`.
- Build UI in `features/<module>/components`.
- Use mock data in `features/<module>/mock`.
- Add API stubs in `features/<module>/api`.
- Update routes under `app/(shell)`.
- Append to **Phase 4 — Implementation log** in the feature doc.

**User prompt example**

“Proceed to Phase 4 for Feature X. Implement the UI based on the plan. Update `docs/features/feature-x.md` with a summary, files changed, and follow‑ups.”

**Socratic checkpoint (stop here)**\n\nAsk the user:\n- “Are the changes aligned with the plan?”\n- “Any adjustments before next iteration?”\n\nProceed only after explicit approval.

---

### Phase 5 — Debug & Finetune
Goal: stabilize behavior and polish UX based on real usage.

Assistant should:
- Debug issues found during review or testing.
- Tighten UI states (loading, empty, error, disabled, focus).
- Reduce regressions and edge cases.
- Update **Phase 5 — Debug & finetune log** in the feature doc.

**User prompt example**

“Proceed to Phase 5 for Feature X. Debug and finetune based on review feedback. Update `docs/features/feature-x.md` with fixes, files changed, and remaining risks.”

**Socratic checkpoint (stop here)**\n\nAsk the user:\n- “Do the fixes resolve the reported issues?”\n- “Any remaining rough edges to address before closing?”\n\nProceed only after explicit approval.

## Mini‑PRD mapping (optional)

Mini‑PRD sections → Phase 1 mapping:
- Problem / Goal → Problem & goal
- User flow → User flow
- Screens / Routes → Screens & routes
- Risks → Risks & open questions
