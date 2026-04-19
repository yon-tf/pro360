# Page 0 — Payout Readiness

The payout overview card indicates whether the billing cycle is ready for payout generation.

This screen should be simple and decisive.

It answers one question:

Is the payout ready to be generated?

---

## Layout

The card follows a three-zone layout.

Left section:
Status context

Example:
Ready for payout

The current billing cycle for Mar 1 – Mar 31, 2026 is finalized.
Ready to distribute funds to 112 professionals.

Middle section:
Primary payout amount

Example:
TOTAL TO PROCESS
$184,200

Right section:
Primary action

Generate payout

## Generate Payout Transition

Clicking **Generate payout** does not open the Review screen immediately.

Instead, the system transitions to a required intermediate loading state.

Flow:

Page 0 → Generate loading state → Review TFP table

The Generate payout button should enter a loading / disabled state immediately after click to prevent duplicate actions.
