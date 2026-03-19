# Clinical Ops Payout Module --- Usability Testing User Flow

## Purpose

This document defines the **end-to-end user flow for the Payout Module**
from the perspective of **Clinical Operations**.\
It is designed for **usability testing and UX validation**.

The flow intentionally highlights: - **Design gaps** - **Flow gaps** -
**Edge cases** - **Operational risks**

The goal is to identify where the product may break down **before
development scales**.

------------------------------------------------------------------------

# Persona

**Clinical Operations Manager**

Responsibilities: - Ensure professionals are paid correctly - Verify
session attendance and activity records - Investigate payout anomalies -
Approve monthly payouts

Current Pain Points: - Manual spreadsheet reconciliation -
Cross-checking attendance across systems - Detecting payout anomalies
late - High operational workload during payout cycle

------------------------------------------------------------------------

# System Context

The payout engine aggregates **activity across modules**:

-   Video sessions
-   Chat activity
-   Gig activations
-   Hotline shifts
-   Claims
-   Incentives / bonuses

These feed into:

Activity Ledger → Rule Engine → Payout Engine → Payout Wizard → Payment
Processor

------------------------------------------------------------------------

# End‑to‑End Flow

Professional Activity\
↓\
Activity Ledger\
↓\
Rule Engine\
↓\
Payout Draft\
↓\
Clinical Ops Review\
↓\
Exception Resolution\
↓\
Approval\
↓\
Payment Execution

------------------------------------------------------------------------

# Step 1 --- Open Payout Dashboard

## Entry Point

Admin → Finance → Payout

## User Goal

Understand the **financial state of the platform before running
payouts**.

### UI Elements

Metrics:

-   Total payout MTD
-   Professionals paid
-   Activity events detected
-   Pending exceptions
-   Avg payout per professional

Example:

Total payout MTD: \$184,200\
Professionals paid: 112\
Activity events: 2,140\
Pending exceptions: 5

Primary CTA:

Generate payout

------------------------------------------------------------------------

## Design Gaps

Potential issues to test:

-   Is the **financial summary enough for trust before generating
    payout?**
-   Should we display **last payout run timestamp?**
-   Should we show **data freshness indicator?**
-   Does user understand **difference between detected activity vs
    payout draft?**

------------------------------------------------------------------------

# Step 2 --- Start Payout Wizard

User clicks:

Generate payout

Wizard opens.

Steps:

1.  Detect activity
2.  Draft payout
3.  Review exceptions
4.  Approve

------------------------------------------------------------------------

## Flow Gaps

Questions:

-   Can multiple payout runs exist for same period?
-   What happens if payout already exists?
-   Can users **preview activity before generating draft?**

------------------------------------------------------------------------

# Step 4 --- Activity Detection

System scans modules.

Sources:

Video sessions\
Chat hours\
Gig activations\
Hotline shifts\
Claims\
Incentives

Example detection output:

Sessions: 1200\
Chat hours: 620\
Gigs: 40\
Claims: 30

Professionals affected: 112

CTA:

Generate payout draft

------------------------------------------------------------------------

## Design Risks

Potential confusion:

-   No visibility into **which modules contributed data**
-   No **audit preview before draft generation**
-   No **confidence indicator for data completeness**

Suggested improvement:

Activity source breakdown.

------------------------------------------------------------------------

# Step 5 --- Draft Payout Table

System generates payout table.

Example:

Professional \| Sessions \| Chat \| Gigs \| Claims \| Bonus \| Total Dr
Ben \| 30 \| 20 \| 2 \| \$40 \| \$100 \| \$3240 Dr Mei \| 22 \| 15 \| 1
\| 0 \| 0 \| \$2200

Row expansion shows calculation logic.

------------------------------------------------------------------------

## Design Gaps

Important usability questions:

-   Can users easily **verify calculations?**
-   Is the **rule engine transparent enough?**
-   Should payout rows show **activity links (session list)?**

Risk:

Clinical Ops may still export to spreadsheets to verify.

------------------------------------------------------------------------

# Step 6 --- Manual Adjustments

Editable:

Manual adjustment\
Claim correction

Locked:

Rates\
Activity records

Example UI:

Claims \$40 🔒\
Manual adjustment \$0 ✏

------------------------------------------------------------------------

## Flow Gaps

Unclear behaviors:

-   Who is allowed to adjust payouts?
-   Are adjustments **logged for audit?**
-   Are adjustments **reversible?**

Missing UX:

Adjustment history panel.

------------------------------------------------------------------------

# Step 7 --- Exception Review

System flags anomalies.

Examples:

Missing attendance\
Claim exceeds limit\
Unusual payout spike\
Missing case notes

Example table:

Professional \| Flag \| Action Dr Mei \| Claim exceeds limit \| Edit

Actions:

Approve\
Edit\
Exclude\
Recalculate

------------------------------------------------------------------------

## Design Gaps

Potential issues:

-   Are exceptions prioritized by **financial impact or risk?**
-   Can users filter by **severity?**
-   Can users view **root cause quickly?**

------------------------------------------------------------------------

# Step 8 --- Approval

Final summary:

Period: March 2026\
Professionals: 112\
Total payout: \$184,200\
Exceptions resolved: 5

Buttons:

Approve payout\
Export CSV\
Send to finance

------------------------------------------------------------------------

## Risk to Validate

Do users feel confident approving?

Missing information:

-   Approval confirmation warning
-   Impact summary
-   Lock mechanism preventing edits post approval

------------------------------------------------------------------------

# Step 9 --- Payment Execution

System sends payout data to payment processor.

Integrations:

Airwallex\
Wise\
Finance system

Data transferred:

professional_id\
bank_account\
currency\
amount

------------------------------------------------------------------------

## Design Gaps

Operational concerns:

-   What happens if payment fails?
-   Can payouts be partially processed?
-   Is there retry mechanism?
-   Is reconciliation visible?

------------------------------------------------------------------------

# Post‑Payout State

Status becomes:

Paid

Visible in payout history.

Example table:

Period \| Professionals \| Total \| Exceptions \| Status Feb 2026 \| 110
\| \$178k \| 2 \| Paid

------------------------------------------------------------------------

# Key Usability Testing Tasks

Task 1 --- Generate Monthly Payout

Goal: Generate payout for March.

Observe: Navigation clarity Wizard comprehension

------------------------------------------------------------------------

Task 2 --- Investigate Exception

Scenario: Claim exceeds limit.

Observe: Detection visibility Resolution clarity

------------------------------------------------------------------------

Task 3 --- Correct Claim

Goal: Edit claim, make adjustments and approve payout.

Observe: Adjustment discoverability

------------------------------------------------------------------------

Task 4 --- Approve Payout

Goal: Approve payout confidently.

Observe: Trust in system calculations

------------------------------------------------------------------------

# Critical UX Risks

1.  Trust in automation
2.  Exception discoverability
3.  Adjustment clarity
4.  Approval confidence
5.  Audit transparency

------------------------------------------------------------------------

# Suggested Improvements

Add:

-   Activity audit view
-   Adjustment history
-   Exception severity scoring
-   Data freshness indicator
-   Payment reconciliation screen

------------------------------------------------------------------------

# Test Execution Notes

This document is structured so it can be used with:

-   UX usability interviews
-   Product validation sessions
-   AI agent simulation testing

Do not modify flows during test runs.\
Capture friction points and deviations.

------------------------------------------------------------------------
