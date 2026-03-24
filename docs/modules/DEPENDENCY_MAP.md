# Dependency Map
> Last updated: [date] | Maintained by: think-system (Claude Web) + /feature (Claude Code)

## Purpose

This file prevents agents from making changes to one feature without knowing
what else they'll break. Read this before touching any cross-feature work.

---

## Module Map

| Feature | Depends On | Downstream Of | Shared Data | Notes |
|---|---|---|---|---|
| gig | professionals, team | payout | gig_id | Status: completed → triggers payout |
| payout | gig, professionals | — | gig_id, professional_id | Only triggers on gig status: completed |
| appointments | gig, professionals | payout (via gig) | gig_id | Completed appointment = billable gig |
| chat | professionals, team | — | — | |
| professionals | org, team | gig, appointments, payout, chat | professional_id | Core entity |
| team | org | professionals, chat | team_id | |
| lms | professionals | — | professional_id | |
| rules | org | professionals, gig | — | Business rules applied at org level |
| pro360 | professionals, org | — | — | |
| calendar | appointments | — | appointment_id | Read-only view of appointments |

---

## Critical Paths

Changes to these propagate far. Coordinate before touching.

**`professionals` is the most connected module.**
Any change to the professional entity affects: gig, appointments, payout, chat, lms.
Always check all five before shipping a professionals change.

**`gig.status` drives payout.**
The status field on gig is load-bearing. If the status enum changes,
payout triggers break silently. Changing gig status values requires
updating payout trigger logic in the same PR.

**`gig_id` is shared across three modules.**
gig → appointments → payout all pass gig_id. If gig_id structure changes,
all three need updates. Never treat as isolated.

---

## Shared State

State that exists in multiple places and must stay in sync:

| State | Lives In | Also Used By | Sync Method |
|---|---|---|---|
| professional profile | professionals/ | payout, chat, gig | API read |
| gig status | gig/ | payout (trigger), appointments | API read |
| org settings / rules | rules/ | professionals, gig | Context / API |

---

## Safe to Change in Isolation

These modules have no downstream dependents:

- `lms/` — nothing depends on it
- `pro360/` — nothing depends on it
- `calendar/` — read-only view, no writes

Changes here carry zero cross-feature risk.

---

## Update Protocol

When a new feature is added or a dependency is discovered:
1. Add the row to the Module Map
2. Update Critical Paths if the new dependency is load-bearing
3. Log the update in the relevant `04-implementation-log.md`

This file is only as useful as it is current.
