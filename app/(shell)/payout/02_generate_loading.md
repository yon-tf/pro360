# Generate Payout — Required System Processing State

After Clinical Ops clicks **Generate payout**, the system enters a required processing state before the Review screen is shown.

This state is not optional.

Its purpose is to communicate that the system is:

- detecting payout activity
- applying fee and rule logic
- calculating payout totals
- generating the payout draft

Users should never jump directly from Page 0 to Review without seeing this intermediate system state.

---

## Flow

Page 0 → Generate loading state → Review payout table

---

## UI Behavior

Immediately after clicking **Generate payout**:

- the button becomes disabled
- the button enters a loading state
- the page transitions into the payout generation screen

---

## Loading UI

The loading screen should feel polished and system-driven.

Example:

Generating payout draft…

✓ Detecting activity records  
✓ Applying payout rules  
✓ Calculating payout totals  
✓ Generating review table  

The processing UI should reassure the user that payout generation is in progress.

---

## Completion Behavior

When processing completes successfully:

- the loading state exits automatically
- the user is taken to the Review screen
- the payout run is now in Draft state

---

## Error Handling

If payout generation fails:

- show an inline error state
- explain that the draft could not be generated
- provide a retry action

Example:

Payout draft could not be generated. Please try again.

[ Retry generation ]