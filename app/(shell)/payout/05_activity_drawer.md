# Activity Audit — Secondary Drawer

The activity audit opens in a **secondary drawer layered above the payout receipt drawer**.

This allows Clinical Ops to inspect the activity records contributing to payout calculations without leaving the payout workflow.

Interaction hierarchy:

## Drawer Behavior — Extension Pattern

The activity drawer **extends the existing receipt drawer** rather than replacing it.

Layout progression:

Initial state:

```
| Payout Table | Receipt Drawer |
```

When an activity item is opened:

```
| Payout Table | Receipt Drawer | Activity Drawer |
```

Key rules:

* The **receipt drawer remains visible**
* The **activity drawer opens to the right of the receipt drawer**
* The **table remains visible in the background**
* Closing the activity drawer returns the user to the receipt drawer state

Maximum drawer depth:

```
2
```

The system must **not replace the first drawer** with the second drawer.

This pattern ensures the user retains context of:

* the professional payout
* the payout line item
* the activity records being inspected

---

# Example Use Case

Receipt drawer:

```
Appointment conducted fee  
30 sessions × $80  
Subtotal: $2400  

View sessions →
```

Clicking **View sessions** opens the secondary drawer.

---

# Secondary Drawer Layout

Title:

Sessions contributing to payout

Subtitle:

Dr Ben — Mar 2026

Table:

| Session ID | Date  | Duration | Fee Rule        |
| ---------- | ----- | -------- | --------------- |
| S-1021     | Mar 3 | 50 min   | Appointment fee |
| S-1029     | Mar 6 | 48 min   | Appointment fee |
| S-1033     | Mar 8 | 52 min   | Appointment fee |

---

# Activity Types Supported

The activity drawer should support multiple activity types depending on the payout line item.

Examples:

Sessions
Chat hours
Gigs / events
Claims
Supervision sessions

Each activity type should render an appropriate table structure.

---

# Example — Claims

| Claim ID | Date  | Type      | Amount | Status        |
| -------- | ----- | --------- | ------ | ------------- |
| C102     | Mar 8 | Transport | $180   | Exceeds limit |

Actions available:

View attachment
Approve exception
Exclude claim

---

# Activity Drawer Navigation

The activity drawer is the second-level drawer layered above the receipt drawer.

It must display a back action in the header:

Back to payout receipt

This action closes only the activity drawer and returns the user to the receipt drawer state.

The back action belongs only to the secondary drawer, not the first drawer.

## Editable Fee Cards

Payout adjustments are performed within the payout receipt drawer.

Each fee category is displayed as a card:

* Activity fees
* Chat fees
* Event fees
* Bonuses & adjustments

System-generated values appear by default.

Users may apply corrections within each card.

Example actions:

* adjust chat hour payout
* correct session count
* add manual bonus

Every adjustment requires a reason.

---

## Manual Adjustment Toggle

The manual adjustment toggle appears only for rows flagged with payout issues.

When enabled, the user may apply an additional adjustment amount and reason.

This allows reconciliation without modifying system-generated activity data.

---

## Final Payout Summary

The final payout section appears at the bottom of the drawer.

Example:

System generated total
Manual adjustments
Final payout

This section behaves like a payout receipt.

---

# Design Principles

Context preservation
Users should never lose the payout receipt context while auditing activity.

Operational speed
Clinical Ops should move between payout lines and activity records quickly.

Auditability
All payout calculations must trace back to concrete activity records.
