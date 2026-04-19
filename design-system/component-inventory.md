# Component Inventory

Tactical inventory for current PRO360 design-system refactor pass.

## Touched Components

| Name | Layer | Owner | Source path | Status | Token compliant | Notes |
|---|---|---|---|---|---|---|
| Badge | Primitive | design-system | `components/ui/badge.tsx` | Stable | Yes | Shared semantic status primitive for repeated status meaning |
| SeverityBadge | Pattern | attention / PRO360 | `features/attention/components/SeverityBadge.tsx` | Stable | Yes | Wraps local severity semantics onto shared `Badge` variants |
| Pro360 dashboard palette | Feature composition | PRO360 | `app/(shell)/pro360/page.tsx` | Stable | Yes, page-local helper | Centralizes repeated chart/status color meaning without widening shared chart API |

## Badge Consumer Inventory

| Component/file | Usage purpose | Current variant / overrides | Semantic meaning | Shared primitive fit | Risk note | Action |
|---|---|---|---|---|---|---|
| `features/attention/components/SeverityBadge.tsx` | Attention severity pill | `destructive`, `warning`, `secondary` | Critical / urgent / review | Yes via wrapper | Severity interpretation still domain-specific | Migrate |
| `app/(shell)/chat/page.tsx` | Visibility and status pills | `warning`, `secondary` | Timed visibility / neutral info | Yes | Already on semantic path | Keep local |
| `app/(shell)/payout/page.tsx` | Payout status pill | `success`, `secondary`, `destructive`, `outline`, `warning` | Paid / draft / blocked / not started / in progress | Yes | Pass 2 aligned repeated status semantics | Migrate |
| `app/(shell)/appointments/page.tsx` | Appointment metadata pills | `success`, `warning`, `outline`, `secondary` | Full attendance / activation state / neutral metadata | Yes for repeated status meaning | Decorative stars and other local colors still feature-owned | Migrate |
| `app/(shell)/pro360/page.tsx` | Attention counts | `secondary`, `destructive` | Total / critical count | Yes | Small typography overrides are layout-local | Keep local |
| `app/(shell)/pro360/[id]/page.tsx` | Detail status chips | Shared variants plus local classes | Active / summarized / local states | Partial | Detail screen deferred from pass 1 | Defer |

## Textarea Observation Inventory

| Component/file | Usage purpose | Shared primitive fit | Risk note | Action |
|---|---|---|---|---|
| `app/(shell)/appointments/create/page.tsx` | Notes input | Yes | No repeated override pressure found | Defer |
| `app/(shell)/team/[id]/page.tsx` | Team notes / messaging | Yes | Needs later consumer review before API change | Defer |
| `app/(shell)/professionals/[id]/profile/page.tsx` | Profile notes | Yes | Not enough evidence to change primitive yet | Defer |
| `app/(shell)/professionals/[id]/CredentialsTab.tsx` | Credentials notes | Yes | No break signal in current pass | Defer |
| `app/(shell)/professionals/ProfessionalForm.tsx` | Form free text | Yes | Existing min-height may still be acceptable | Defer |
