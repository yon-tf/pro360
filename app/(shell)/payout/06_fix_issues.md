# Step 2 — Exceptions & Reconciliation

This screen helps Clinical Ops investigate and resolve payout anomalies before approval.

The Exceptions step is a **triage workflow**, not a passive error list.

Its purpose is to help users:

- identify what is wrong
- understand why it was flagged
- investigate the payout details
- resolve or approve the exception
- unblock approval

---

## Page Structure

### 1. Exceptions Summary Bar

Displays high-level counts.

Example:

- Total exceptions: 8
- Blocking: 2
- Warnings: 4
- Resolved: 2

Helper text:

Resolve blocking issues before continuing to approval.

---

### 2. Filter Controls

Primary tabs:

- Blocking
- Warnings
- Resolved
- All

Secondary category filters:

- Delta
- Too small
- Unclaimed
- FX
- Failed payments

Optional controls:

- Search by professional
- Sort by severity
- Sort by amount impact

---

### 3. Exceptions List

Exceptions are displayed in a dense operational list.

Recommended columns:

| Issue | Professional | Reason | Severity | Status | Actions |

Example:

| Issue | Professional | Reason | Severity | Status | Actions |
|------|--------------|--------|----------|--------|---------|
| Month-over-month payout spike | Dr Sam Wong | +134% vs last month | Blocking | Open | View payout / Approve / Resolve |
| Too small payout | Dr Mei Lin | $8 below minimum | Warning | Open | View payout / Carry forward / Resolve |

---

## Exception Detail Requirements

Each exception must show enough information for Clinical Ops to understand why it was flagged.

### Delta / Spike
- Previous payout
- Current payout
- Percentage change
- Threshold used

### Too Small
- Current payout amount
- Minimum payout threshold
- Suggested handling

### Unclaimed
- Missing or unmatched claim
- Related professional or event
- Amount impact

### FX
- Source currency
- Target currency
- Rate used
- Variance from expected rate

### Failed Payments
- Payment reference
- Failure reason
- Retry state

---

## Actions

### View payout
Opens the payout receipt drawer for that professional.

### Approve exception
Marks the anomaly as accepted and valid.

### Resolve
Marks the issue as fixed after action is taken.

### Contextual actions
Depending on issue type, the UI may support:

- Carry forward payout
- Exclude claim
- Adjust claim amount
- Retry payment
- Accept FX rate

---

## Drawer Linkage

Clicking "View payout" opens the existing payout receipt drawer.

From the receipt drawer, the user can inspect fee lines and open the secondary activity drawer if needed.

The Exceptions flow should never require navigation to another module.

---

## Approval Logic

The **Continue to approval** action remains disabled while blocking issues exist.

Warnings may still allow progression, depending on business rules.

Example:

- Blocking issues > 0 → button disabled
- Blocking issues = 0 → button enabled

---

## Design Principles

### Actionability
Every exception should clearly communicate what needs to happen next.

### Financial clarity
Exception rows must show the comparison or rule that caused the flag.

### Context preservation
Users should investigate anomalies without leaving the payout workflow.

### Operational density
The list should support quick scanning across many exceptions.