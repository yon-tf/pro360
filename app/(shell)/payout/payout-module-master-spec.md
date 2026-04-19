# Payout Module Master Spec

## Purpose

The Payout module enables Clinical Ops to review, fix, and approve professional payouts without using spreadsheets or leaving the payout workflow.

It is designed around a finance-safe workflow:

**Page 0 → Generate → Review TFP → Review Hotline → Fix → Approve**

The module must make payout calculations:

- transparent
- auditable
- operationally efficient
- safe to approve

---

## Core UX Principles

### 1. Page 0 is a decision surface
Before generating payout, Clinical Ops should already be able to assess:

- estimated payout
- estimated professionals affected
- activity records detected
- pending issues
- high-level activity counts

This helps Ops sanity-check the payout run before generating the draft.

### 2. System processes are not user steps
Activity detection and payout calculation are system actions, not user-facing wizard steps.

They are represented as a loading state after clicking **Generate payout**.

### 3. Review happens in one primary screen
The payout review table is the main working surface.

Clinical Ops should not need to leave the module to review payout calculations.

### 4. The table is the summary
The table gives a per-professional overview.

Recommended table columns:

- Professional
- Status
- Sessions
- Chat hrs
- Gigs
- Claims
- Adjustments
- Total payout

### 5. The drawer is the receipt
Clicking a row opens a drawer with a receipt-style payout breakdown.

The drawer must show all payout line items by fee type.

### 6. The modal is the audit trail
From the drawer, users can open an activity audit modal to inspect contributing records without navigating to other modules.

### 7. Fix is a workflow state, not a separate page
Issue resolution happens inside the review screen using:

- row highlighting
- status indicators
- show issues only filter
- drawer-level actions

### 8. Approval appears when payout is ready
The approval section appears once blocking issues are resolved.

---

## Module Flow Map

### Page 0 — Payout Overview
Purpose:
- show current cycle readiness
- show estimates
- allow generate action

Spec file:
- `01_payout_page0_overview.md`

### Generate — System Loading State
Purpose:
- represent activity detection + payout calculation
- build trust in automation

Spec file:
- `02_generate_loading.md`

### Step 1 — Review TFP Sheet
Purpose:
- let Clinical Ops validate payout summary by professional

Spec file:
- `03_review_table.md`

### Step 2 — Review Hotline Ops Sheet
Purpose:
- validate hotline shifts and operational records

Spec file:
- `03_review_table.md`

### Drawer — Professional Receipt
Purpose:
- show payout line items by fee type
- show status, confidence, and payout subtotals

Spec file:
- `04_drawer_receipt.md`

### Secondary Drawer — Activity Audit
Purpose:
- list the underlying sessions, claims, gigs, or other records contributing to payout

Spec file:
- `05_activity_drawer.md`

### Step 3 — Fix Issues
Purpose:
- help Clinical Ops identify and resolve payout problems

Spec file:
- `06_fix_issues.md`

### Step 4 — Approve Payout
Purpose:
- confirm final payout state
- approve, export, or trigger payment

Spec file:
- `07_approve_payout.md`

---

## Interaction Hierarchy

### Primary flow
Page 0 → Generate payout → Loading state → Review TFP table → Review Hotline Ops sheet → Exceptions → Approve
The loading state is a required transition between Page 0 and Review.
The Review screen must not appear immediately after clicking Generate payout.

### Secondary interactions
Review table row click → Drawer

Drawer action click → Activity secondary drawer

### Approval dependency
Approval should only be enabled when blocking issues are resolved.

---

## Payout Table Summary Bar

A summary panel should appear above the payout table and show:

- Professionals
- Activity records
- Total payout
- Issues detected
- Confidence

This helps Ops detect anomalies before reviewing rows.

---

## Status Model

Recommended row statuses:

- **OK** — no issues
- **Review** — issue detected but can be resolved
- **Blocked** — must be resolved before approval

Rows with issues should be visually highlighted.

---

## Drawer Requirements

The drawer behaves like a payout receipt.

It should include:

- professional name
- payout period
- total payout
- status
- confidence

Then a line-item breakdown grouped by fee type, such as:

- Appointment conducted fee
- Assessment 1:1 conducted fee
- Supervision fee
- Event / join type fee
- Claim fee
- Language fee
- Quarter incentive
- TFP workshop fee
- Manual adjustment

Each section should support an action such as:

- View sessions
- View event
- View claim attachment
- View chat logs

These actions open the activity audit drawer.

---

## Confidence Level

Confidence should help Clinical Ops understand how safe the payout run is to approve.

Suggested levels:

- **High** — no issues or manual changes
- **Medium** — some issues resolved or minor manual changes
- **Low** — significant manual overrides or unresolved risk signals

Confidence should appear:
- above the review table
- inside the drawer
- in the approval section

---

## Build Order Recommendation

Build the module in this order:

1. Page 0 — Payout Overview
2. Generate — Loading State
3. Review TFP Table
4. Review Hotline Ops Sheet
5. Drawer — Receipt
6. Activity Audit Modal
7. Fix Issues State
8. Approve Payout Section

This order follows dependency and visual importance.

---

## Prompting Strategy for Cursor

### Use the master spec when:
- planning implementation
- checking consistency
- understanding module flow
- sequencing phases

### Use individual spec files when:
- implementing a specific screen
- refining one component
- adjusting one interaction
- fixing layout or spacing

### Keep prompts scoped
Always tell Cursor:

- which files to use
- not to search the rest of the repo
- whether the task is planning, implementation, or refinement

---

## Suggested Prompt Templates

### 1. Planning prompt

Use ONLY:

- `app/(shell)/payout/payout-module-master-spec.md`
- `design-system/DESIGN.md`
- `design-system/component-contracts.md`

Task:
Plan the payout module implementation in buildable phases.
Do not write code.
Do not search the rest of the repo.

### 2. Build prompt

Use ONLY:

- the relevant payout step file
- `design-system/DESIGN.md`
- `design-system/component-contracts.md`

Task:
Implement this screen using the existing design system and component patterns.
Do not search the rest of the repo.

### 3. Polish prompt

Use ONLY:
- the relevant payout step file

Task:
Refine layout, spacing, and information hierarchy only.
Do not change logic.
Do not modify other components.

---

## Final Rule

**Master spec for orientation.  
Individual spec for execution.**
